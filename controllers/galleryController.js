import path from 'path';
import fs from 'fs';
import Image from '../models/Image.js';
import mongoose from "mongoose";


const galleryController = {
  // อัปโหลดรูป บันทึกmetadata รูป
  uploadImage: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file' });

      const isPublic = req.body.isPublic === 'true'; // Get the isPublic value from the request body
      const doc = await Image.create({
        userId: req.user.id,
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mime: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        isPublic,
        description: req.body.description || '',
      });

      return res.json({ ok: true, imageId: doc._id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Upload failed' });
    }
  },

  // เเสดงรูปทั้งหมดของตัวเอง
  // ฉบับปรับปรุง ให้เเสดง path เต็มของรูป mapรูป กับ path เต็ม
  

  getMyGallery: async (req, res) => {
  try {
    const userId = req.user.id;

    const images = await Image.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },     // คอมเมนต์ใหม่อยู่บน
        populate: { path: 'userId', select: 'name' } // ชื่อผู้คอมเมนต์
      })
      .lean(); // ได้เป็น plain object แล้ว จะ map/แต่งเพิ่มสะดวก

    const imagesWithUrl = images.map(img => ({
      ...img,
      url: `/uploads/${userId}/${img.storedName}`,
      commentCount: (img.comments?.length) || 0
    }));

    return res.render('my-gallery', { images: imagesWithUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error loading gallery');
  }
},


  // // ดึงไฟล์ ตรวจสอบสิทว่าเป็นรูปตัวเองไหม
  // getImageFile: async (req, res) => {
  //   try {
  //     const img = await Image.findById(req.params.id);
  //     if (!img) return res.status(404).send('Not found');
  //     if (String(img.userId) !== String(req.user.id)) return res.status(403).send('Forbidden');

  //     return res.sendFile(path.resolve(img.path));
  //   } catch (err) {
  //     res.status(500).json({ message: 'Error serving file' });
  //   }
  // },




 getPublicGallery : async (req, res) => {
  try {
    const query = req.query.q || ''; // อ่านค่าจาก input name="q"
    const condition = { isPublic: true };

    if (query) {
      condition.$or = [
        { description: { $regex: query, $options: 'i' } },
        { originalName: { $regex: query, $options: 'i' } },
        { storedName:   { $regex: query, $options: 'i' } }
      ];
    }

    const images = await Image.find(condition).sort({ createdAt: -1 });
    const withUrls = images.map(img => ({
      ...img.toObject(),
      url: `/uploads/${img.userId}/${encodeURIComponent(img.storedName)}`
    }));

    res.render('public-gallery', { images: withUrls, query }); // ส่ง query กลับไปให้ input แสดงค่าเดิม
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading public gallery');
  }
},



  updateDescription :  async(req, res) =>{
    try{
         const { description } = req.body;
         const { imageId } = req.params;
         
        const text = description.trim()
        const image = await Image.findOneAndUpdate(
        { _id: imageId, userId: req.user.id },
        { description: text },
        { new: true }
      ).select("_id originalName description userId createdAt");
        if (!image) {
              return res.status(404).json({ message: "Image not found or unauthorized" });
            }

            res.status(200).json({
              ok: true,
              message: "Description updated successfully",
              image,
            });

    }catch(err){
      res.status(500).json({ message: 'Failed to toggle status' });
    }
  },

// เปลี่ยนสถานะ public/private ของรูป
  togglePublic : async (req, res) => {
  try {
    const img = await Image.findById(req.params.id);// หาเอกสารรูปตาม id
    if (!img) return res.status(404).json({ message: 'Not found' });
    if (String(img.userId) !== String(req.user.id)) 
      return res.status(403).json({ message: 'Forbidden' });

    img.isPublic = !img.isPublic; // กลับค่าบูลีนปกติ
    await img.save();
    res.json({ ok: true, newStatus: img.isPublic });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle status' });
  }
  },


  

  // ลบไฟล์ ตรวจสอบสิทธิ์เจ้าของไฟล์ก่อน
  deleteImage: async (req, res) => {
   try {
    const { imageId } = req.params;      

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ message: "Invalid image id" });
    }

    const img = await Image.findById(imageId);
    if (!img) return res.status(404).json({ message: "Image not found" });

    if (String(img.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      if (img.path && fs.existsSync(img.path)) fs.unlinkSync(img.path);
    } catch (e) {
      console.warn("Skip file delete:", e.message);
    }

    await img.deleteOne();

    return res.status(200).json({
      ok: true,
      message: "Image deleted successfully",
      imageId,                           
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Delete failed", error: err.message });
  }
},



  toggleLike : async (req, res) =>{
    try{
        const {imageId} = req.params
        const userId = req.user.id;

        const image = await Image.findById(imageId);
        if (!image){
          return res.status(404).send('Image not found');
        }
        const isLiked = image.likes.includes(userId);
        if(isLiked){
          image.likes.pull(userId);// เอาออก
        }else{
          image.likes.push(userId);
        }
        await image.save();
        res.json({ok: true,liked: !isLiked, countLikes: image.likes.length,
      });

    }catch(err){
      res.status(500).json({ message: 'Fail to toggleLike' });
    }
  },

  getLikeUser : async (req, res) => {
    try{
        const {imageId} = req.params
        const image = await Image.findById(imageId)
        .populate("likes", "name email").sort({ createdAt: -1 });

          if (!image) {
          return res.status(404).send('Image not found');
          }
          return res.json({likedUsers: image.likes,countLikes: image.likes.length}) 
    }catch(err){
          res.status(500).json({ message: 'Fail to get like' });
    }
  }


  
};

  

export default galleryController;

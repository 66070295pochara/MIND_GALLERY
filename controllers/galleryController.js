import path from 'path';
import fs from 'fs';
import Image from '../models/Image.js';

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
  

  getMyGallery : async (req, res) => {
  try {
    const images = await Image.find({ userId: req.user.id }).sort({ createdAt: -1 });//ดึงข้อมูลจากฐานข้อมูลเฉพาะรูปที่มี userId ตรงกับ ID ของผู้ใช้
  //จัดเรียงจากรูปที่อัปโหลดล่าสุด
    // สร้าง array ใหม่ที่มี url เต็มของรูป
    const imagesWithUrl = images.map(img => ({
      ...img.toObject(),// แปลงเป็น object 
      url: `/uploads/${req.user.id}/${img.storedName}` 
    }));

    res.render('my-gallery', { images: imagesWithUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading gallery');
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
    const images = await Image.find({ isPublic: true }).sort({ createdAt: -1 });// เลือกเฉพาะรูปที่สาธารณะ
    const withUrls = images.map(img => ({
      ...img.toObject(),
      url: `/uploads/${img.userId}/${encodeURIComponent(img.storedName)}`
    }));
    res.render('public-gallery', { images: withUrls });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading public gallery');
  }
},


// เปลี่ยนสถานะ public/private ของรูป
  togglePublic : async (req, res) => {
  try {
    const img = await Image.findById(req.params.id);// หาเอกสารรูปตาม id
    if (!img) return res.status(404).json({ message: 'Not found' });
    if (String(img.userId) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

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
      const img = await Image.findById(req.params.id);
      if (!img) return res.status(404).send('Not found');
      if (String(img.userId) !== String(req.user.id)) return res.status(403).send('Forbidden');

      try {
        fs.unlinkSync(img.path);
      } catch {}
      await img.deleteOne();
      return res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ message: 'Delete failed' });
    }
  },
};

export default galleryController;

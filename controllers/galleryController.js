import path from 'path';
import fs from 'fs';
import Image from '../models/Image.js';

const galleryController = {
  // อัปโหลดรูป บันทึกmetadata รูป
  uploadImage: async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file' });

      const doc = await Image.create({
        userId: req.user.id,
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mime: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });

      return res.json({ ok: true, imageId: doc._id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Upload failed' });
    }
  },

  // เเสดงรูปทั้งหมดของตัวเอง
  getMyGallery: async (req, res) => {
    try {
      const images = await Image.find({ userId: req.user.id }).sort({ createdAt: -1 });//เรียงลำดับล่าสุดก่อน
      return res.json({ ok: true, images });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching gallery' });
    }
  },

  // ดึงไฟล์ ตรวจสอบสิทว่าเป็นรูปตัวเองไหม
  getImageFile: async (req, res) => {
    try {
      const img = await Image.findById(req.params.id);
      if (!img) return res.status(404).send('Not found');
      if (String(img.userId) !== String(req.user.id)) return res.status(403).send('Forbidden');

      return res.sendFile(path.resolve(img.path));
    } catch (err) {
      res.status(500).json({ message: 'Error serving file' });
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

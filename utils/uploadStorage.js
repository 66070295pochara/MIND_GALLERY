import multer from 'multer';
import path from 'path';
import fs from 'fs';

//ใช้สร้างโฟลเดอร์เก็บไฟล์อัปโหลดของแต่ละ user
function ensureUserDir(userId) {
  const dir = path.join(process.cwd(), 'uploads', String(userId));
  fs.mkdirSync(dir, { recursive: true });//ถ้าไม่มีสร้างโฟลเดอร์
  return dir;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = ensureUserDir(req.user.id); // ต้องมี authMiddleware ก่อน
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname}`;
    cb(null, safeName);//กำหนดชื่อไฟล์
  }
});

const uploadStorage = {
  upload: multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
    fileFilter: (req, file, cb) => {
      if ( file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg') {
        cb(null, true);
      } else {
        cb(new Error('Only .png files are allowed'), false);
      }
    }
  })
};

export default uploadStorage;

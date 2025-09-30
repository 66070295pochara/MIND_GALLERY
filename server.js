import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import router from './routes/router.js';
import morgan from 'morgan';
import cors from 'cors';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';


const app = express();
const port = 3000;

dotenv.config();



// Database connection
await connectDB();

// Middlewares
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// View engine
app.set('view engine', 'ejs');

// Routes
app.use('/api', router);



import authMiddleware from './middlewares/authMiddleware.js';

app.get('/home', authMiddleware(), (req, res) => {
  res.render('home', { user: req.user });
});


app.get('/upload', (req, res) => res.render('upload'));
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));



import multer from 'multer';
import Image from './models/Image.js';

app.get('/my-gallery', authMiddleware(), async (req, res) => {
  const images = await Image.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.render('my-gallery', { images });
});


const publicUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/public',              // เก็บรูป public ไว้ที่นี่
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: 10 * 1024 * 1024 },       // 10MB
  fileFilter: (_req, file, cb) => {
    
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) cb(null, true);
    else cb(new Error('Only .png, .jpg, .jpeg'), false);
  }
});


app.post('/api/public/upload',
  authMiddleware(),                // ต้องล็อกอินก่อนถึงอัปโหลดได้
  publicUpload.single('image'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file' });
    // URL ที่ทุกคนที่ล็อกอินเห็นได้
    const url = `/public-uploads/${req.file.filename}`;
    return res.json({ ok: true, url, filename: req.file.filename });
  }
);


import fs from 'fs';
import path from 'path';

app.get('/public-gallery', authMiddleware(), (req, res) => {
  const dir = path.join(process.cwd(), 'uploads/public');
  let files = [];
  try { files = fs.readdirSync(dir).filter(n => !n.startsWith('.')); } catch {}
  // ส่งชื่อไฟล์ไปให้ EJS render เป็น <img src="/public-uploads/ไฟล์">
  res.render('public-gallery', { images: files });
});
app.use('/public-uploads', authMiddleware(), express.static('uploads/public'));
app.get('/public-upload', (req, res) => {
  res.render('public-upload');
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

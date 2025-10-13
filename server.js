import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import router from './routes/router.js';
import morgan from 'morgan';
import cors from 'cors';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import path from 'path';

import jwt from "jsonwebtoken";
const ROOT = process.cwd();

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
app.set('views', path.join(ROOT, 'views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
  const token = req.cookies?.authToken;
  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // ใส่ให้ controller ต่างๆ ใช้
    req.user = { id: payload.userId, name: payload.name, role: payload.role };
    // ใส่ให้ EJS ใช้
    res.locals.user = { _id: payload.userId, name: payload.name };
  } catch (e) {
    res.locals.user = null;
  }
  next();
});

// Routes
app.use('/api', router);




import authMiddleware from './middlewares/authMiddleware.js';
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.render("auth/login"));
app.get("/register", (req, res) => res.render("auth/register"));
app.get('/gallery/all',authMiddleware(), (req, res) => res.render('gallery/all-gallery'));
app.get("/gallery/fav",authMiddleware() ,(req, res) => res.render("gallery/fav"));
app.get('/gallery/my', authMiddleware(), (req, res) =>res.render('gallery/mind-gallery'));

app.use('/uploads', express.static(path.resolve('uploads')));





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

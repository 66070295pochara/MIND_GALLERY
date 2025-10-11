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



app.get('/login',  (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));


import multer from 'multer';
import Image from './models/Image.js';
app.use('/uploads', express.static('uploads'));





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

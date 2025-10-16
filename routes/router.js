// routes/router.js
import express from 'express';
import userRoutes from './userRoutes.js';
import galleryRoutes from './galleryRoutes.js';
import commmentRoutes from './commentRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);      // → /api/users/...
router.use('/gallery', galleryRoutes); // → /api/gallery/...
router.use('/comments', commmentRoutes); // → /api/comments/...


export default router;
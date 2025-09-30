// routes/router.js
import express from 'express';
import userRoutes from './userRoutes.js';
import galleryRoutes from './galleryRoutes.js';

const router = express.Router();

router.use('/users', userRoutes);      // → /api/users/...
router.use('/gallery', galleryRoutes); // → /api/gallery/...

export default router;

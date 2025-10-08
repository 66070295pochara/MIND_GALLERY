import express from 'express';
import uploadStorage from '../utils/uploadStorage.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import galleryController from '../controllers/galleryController.js';

const router = express.Router();


router.post('/upload',authMiddleware(),uploadStorage.upload.single('image'),galleryController.uploadImage);


router.get('/mygallery', authMiddleware(), galleryController.getMyGallery);
router.get('/public', authMiddleware(), galleryController.getPublicGallery);

// router.get('/file/:id', authMiddleware(), galleryController.getImageFile);

router.put('/toggle/:id', authMiddleware(), galleryController.togglePublic);

export default router;

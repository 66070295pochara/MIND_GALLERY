import express from 'express';
import uploadStorage from '../utils/uploadStorage.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import galleryController from '../controllers/galleryController.js';

const router = express.Router();


router.post('/upload',authMiddleware(),uploadStorage.upload.single('image'),galleryController.uploadImage);
router.get('/mygallery', authMiddleware(), galleryController.getMyGallery);
router.get('/public', authMiddleware(), galleryController.getPublicGallery);
router.put('/toggle/:id', authMiddleware(), galleryController.togglePublic);

router.put('/:imageId/description', authMiddleware(), galleryController.updateDescription);

router.post('/togglelike/:imageId',authMiddleware(), galleryController.toggleLike);
router.get('/userlike/:imageId', authMiddleware(), galleryController.getLikeUser);

router.delete('/:imageId', authMiddleware(), galleryController.deleteImage);
export default router;

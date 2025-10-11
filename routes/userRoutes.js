// routes/userRoutes.js
import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/me', authMiddleware(), userController.getMe);

router.put('/aboutme', authMiddleware(), userController.updateAboutMe);

// POST /api/users/register
router.post('/register', userController.register);

// POST /api/users/login
router.post('/login', userController.login);

// POST /api/users/logout
router.post('/logout', authMiddleware(), userController.logout);


router.delete('/me', authMiddleware(), userController.deleteMe)
export default router;

// routes/userRoutes.js
import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/users
router.get('/', authMiddleware(), userController.getAllUsers);

// GET /api/users/:id
router.get('/:id', authMiddleware(), userController.getUserById);

// POST /api/users/register
router.post('/register', userController.register);

// POST /api/users/login
router.post('/login', userController.login);

// POST /api/users/logout
router.post('/logout', authMiddleware(), userController.logout);

export default router;

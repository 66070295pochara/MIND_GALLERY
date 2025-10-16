import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import commentController from '../controllers/commentController.js';

const router = express.Router();


router.post("/:imageId", authMiddleware(), commentController.addComment);
router.get("/:imageId", authMiddleware(), commentController.getAllCommentByID);
router.put("/:commentID", authMiddleware(), commentController.updateComment);
router.delete("/:commentID", authMiddleware(), commentController.deleteCommentByID);
export default router;

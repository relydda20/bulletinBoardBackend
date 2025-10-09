// User Routes (/users)
import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.getUsers);

router.get('/:shortId/posts', userController.getUserPosts);
router.get('/:shortId/comments', userController.getUserComments);
router.put('/:shortId/password', authMiddleware, userController.changePassword);

router.get('/:shortId', userController.getUserByShortId);
router.put('/:shortId', authMiddleware, userController.updateUserProfile);
router.delete('/:shortId', authMiddleware, userController.deleteUser);

export default router;
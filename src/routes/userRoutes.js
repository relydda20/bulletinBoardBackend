// User Routes (/users)
import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import userController from '../controllers/userController.js';

const router = express.Router();

// GET /users - Get all users (public)
router.get('/', userController.getUsers);

// GET /users/:shortId - Get user profile by shortId (public)
router.get('/:shortId', userController.getUserByShortId);

// PUT /users/:shortId - Update own profile (auth only)
router.put('/:shortId', authMiddleware, userController.updateUserProfile);

// PUT /users/:shortId/password - Change own password (auth only)
router.put('/:shortId/password', authMiddleware, userController.changePassword);

// DELETE /users/:shortId - Delete own account (auth only)
router.delete('/:shortId', authMiddleware, userController.deleteUser);

// GET /users/:shortId/posts - Get all posts by user (public)
router.get('/:shortId/posts', userController.getUserPosts);

// GET /users/:shortId/comments - Get all comments by user (public)
router.get('/:shortId/comments', userController.getUserComments);

export default router;
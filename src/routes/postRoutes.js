import { Router } from 'express';
import postController from '../controllers/postController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { 
  createPostValidation, 
  updatePostValidation 
} from '../middleware/postValidation.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// GET /posts - Get all posts
router.get('/', postController.getAllPosts);

// GET /posts/:shortId - Get single post
router.get('/:shortId', postController.getPostByShortId);

// POST /posts - Create new post
router.post('/', authMiddleware, createPostValidation, validate, postController.createPost);

// PUT /posts/:shortId - Update post
router.put('/:shortId', authMiddleware, updatePostValidation, validate, postController.updatePost);

// DELETE /posts/:shortId - Delete post
router.delete('/:shortId', authMiddleware, postController.deletePost);

export default router;
import { Router } from "express";
import postController from "../controllers/postController.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  createPostValidation,
  updatePostValidation,
} from "../middleware/postValidation.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// GET /posts - Get all posts
router.get("/", postController.getAllPosts);

// GET /posts/:shortId - Get single post
router.get("/:shortId", postController.getPostByShortId);

// POST /posts - Create new post
router.post(
  "/",
  authMiddleware,
  createPostValidation,
  validate,
  postController.createPost
);

// PUT /posts/:shortId - Update post
router.put(
  "/:shortId",
  authMiddleware,
  updatePostValidation,
  validate,
  postController.updatePost
);

// DELETE /posts/:shortId - Delete post
router.delete("/:shortId", authMiddleware, postController.deletePost);

// GET /posts/:shortId/comments - Get all comments for a post (guest + auth)
// POST /posts/:shortId/comments - Create comment on post (auth only)
// PUT /posts/:shortId/comments/:commentId - Update own comment (auth only)
// DELETE /posts/:shortId/comments/:commentId - Delete own comment (auth only)
// POST /posts/:shortId/comments/:commentId/reply - Reply to comment (auth only)

export default router;

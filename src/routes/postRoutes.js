import { Router } from "express";
import postController from "../controllers/postController.js";
import commentController from "../controllers/commentController.js";
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

// Comment Routes
// GET /posts/:shortId/comments - Get all comments for a post (guest + auth)
router.get("/:shortId/comments", commentController.getCommentsByPost);

// POST /posts/:shortId/comments - Create comment on post (auth only)
router.post("/:shortId/comments", authMiddleware, commentController.createComment);

// PUT /posts/:shortId/comments/:commentId - Update own comment (auth only)
router.put("/:shortId/comments/:commentId", authMiddleware, commentController.updateComment);

// DELETE /posts/:shortId/comments/:commentId - Delete own comment (auth only)
router.delete("/:shortId/comments/:commentId", authMiddleware, commentController.deleteComment);

// POST /posts/:shortId/comments/:commentId/reply - Reply to comment (auth only)
router.post("/:shortId/comments/:commentId/reply", authMiddleware, commentController.replyToComment);

export default router;

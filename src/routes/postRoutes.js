import {Router} from "express";
import postController from "../controllers/postController.js";
import commentController from "../controllers/commentController.js";
import {validate} from "../middleware/validateMiddleware.js";
import {
  createPostValidation,
  updatePostValidation,
} from "../middleware/postValidation.js";
import {authMiddleware, checkOwnership} from "../middleware/authMiddleware.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

const router = Router();

// Post Routes
router.get("/", postController.getAllPosts);
router.get("/:shortId", postController.getPostByShortId);
router.post(
  "/",
  authMiddleware,
  createPostValidation,
  validate,
  postController.createPost
);
router.put(
  "/:shortId",
  authMiddleware,
  checkOwnership(Post),
  updatePostValidation,
  validate,
  postController.updatePost
);
router.delete(
  "/:shortId",
  authMiddleware,
  checkOwnership(Post),
  postController.deletePost
);

// Comment Routes
// GET /posts/:shortId/comments - Get all comments for a post (guest + auth)
router.get("/:shortId/comments", commentController.getCommentsByPost);

// POST /posts/:shortId/comments - Create comment on post (auth only)
router.post(
  "/:shortId/comments",
  authMiddleware,
  commentController.createComment
);

router.get(
  "/:shortId/comments/:commentId",
  commentController.getCommentById
);

// PUT /posts/:shortId/comments/:commentId - Update own comment (auth only)
router.put(
  "/:shortId/comments/:commentId",
  authMiddleware,
  checkOwnership(Comment, "commentId"),
  commentController.updateComment
);

// DELETE /posts/:shortId/comments/:commentId - Delete own comment (auth only)
router.delete(
  "/:shortId/comments/:commentId",
  authMiddleware,
  checkOwnership(Comment, "commentId"),
  commentController.deleteComment
);

// POST /posts/:shortId/comments/:commentId/reply - Reply to comment (auth only)
router.post(
  "/:shortId/comments/:commentId/reply",
  authMiddleware,
  commentController.replyToComment
);

export default router;

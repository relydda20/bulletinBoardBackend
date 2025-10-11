import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { Types } from "mongoose";

// Helper: pastikan kita punya ObjectId user (kembalikan ObjectId string)
const resolveUserObjectId = async (userIdentifier) => {
  if (!userIdentifier) return null;
  // jika sudah valid ObjectId, langsung pakai
  if (Types.ObjectId.isValid(userIdentifier)) return userIdentifier;
  // cari user dengan identifier lain (username, shortId, email, googleId)
  const user = await User.findOne({
    $or: [
      { username: userIdentifier },
      { shortId: userIdentifier },
      { email: userIdentifier },
      { googleId: userIdentifier },
    ],
  }).select("_id");
  return user ? user._id.toString() : null;
};

// GET /posts/:shortId/comments - Get all comments for a post
const getCommentsByPost = async (req, res) => {
  try {
    const { shortId } = req.params;

    const post = await Post.findOne({ shortId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ post: post._id })
      .populate("author", "username")
      .populate({
        path: "parentComment",
        populate: {
          path: "author",
          select: "username"
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /posts/:shortId/comments - Create comment on post (auth only)
const createComment = async (req, res) => {
  try {
    const { shortId } = req.params;
    const { content, parentComment } = req.body;
    const rawUserId = req.user?.id || req.user?._id || req.user;

    // Resolve user id to ObjectId
    const userId = await resolveUserObjectId(rawUserId);
    if (!userId) return res.status(400).json({ message: "Invalid or unknown user" });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findOne({ shortId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (parentComment) {
      if (!Types.ObjectId.isValid(parentComment)) {
        return res.status(400).json({ message: "Invalid parentComment id" });
      }

      const parentCommentDoc = await Comment.findById(parentComment);
      if (!parentCommentDoc) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      if (parentCommentDoc.post.toString() !== post._id.toString()) {
        return res.status(400).json({ message: "Parent comment does not belong to this post" });
      }
    }

    const comment = new Comment({
      post: post._id,
      author: userId,
      content: content.trim(),
      parentComment: parentComment || null
    });

    await comment.save();

    await comment.populate("author", "username");
    if (parentComment) {
      await comment.populate({
        path: "parentComment",
        populate: {
          path: "author",
          select: "username"
        }
      });
    }

    res.status(201).json({
      success: true,
      data: comment,
      message: "Comment created successfully"
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /posts/:shortId/comments/:commentId - Get specific comment by ID
const getCommentById = async (req, res) => {
  try {
    const { shortId, commentId } = req.params;

    const post = await Post.findOne({ shortId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      post: post._id
    })
      .populate("author", "username")
      .populate({
        path: "parentComment",
        populate: {
          path: "author",
          select: "username"
        }
      });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /posts/:shortId/comments/:commentId - Update own comment (auth only)
const updateComment = async (req, res) => {
  try {
    const { shortId, commentId } = req.params;
    const { content } = req.body;
    const rawUserId = req.user?.id || req.user?._id || req.user;

    const userId = await resolveUserObjectId(rawUserId);
    if (!userId) return res.status(400).json({ message: "Invalid or unknown user" });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findOne({ shortId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      post: post._id,
    });

    // Cek kepemilikan setelah menemukan comment
    if (!comment) {
      return res.status(404).json({ 
        message: "Comment not found" 
      });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        message: "You don't have permission to edit this comment"
      });
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate("author", "username");
    if (comment.parentComment) {
      await comment.populate({
        path: "parentComment",
        populate: {
          path: "author",
          select: "username"
        }
      });
    }

    res.json({
      success: true,
      data: comment,
      message: "Comment updated successfully"
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /posts/:shortId/comments/:commentId - Delete own comment (auth only)
const deleteComment = async (req, res) => {
  try {
    const { shortId, commentId } = req.params;
    const rawUserId = req.user?.id || req.user?._id || req.user;

    const userId = await resolveUserObjectId(rawUserId);
    if (!userId) return res.status(400).json({ message: "Invalid or unknown user" });

    const post = await Post.findOne({ shortId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      post: post._id,
    });

    // Cek kepemilikan setelah menemukan comment
    if (!comment) {
      return res.status(404).json({ 
        message: "Comment not found" 
      });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        message: "You don't have permission to delete this comment"
      });
    }

    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentComment: commentId }
      ]
    });

    res.json({
      success: true,
      message: "Comment and its replies deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /posts/:shortId/comments/:commentId/reply - Reply to comment (auth only)
const replyToComment = async (req, res) => {
  try {
    const { shortId, commentId } = req.params;
    const { content } = req.body;
    const rawUserId = req.user?.id || req.user?._id || req.user;

    const userId = await resolveUserObjectId(rawUserId);
    if (!userId) return res.status(400).json({ message: "Invalid or unknown user" });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const post = await Post.findOne({ shortId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid parent comment id" });
    }

    const parentComment = await Comment.findOne({
      _id: commentId,
      post: post._id
    });

    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const reply = new Comment({
      post: post._id,
      author: userId,
      content: content.trim(),
      parentComment: commentId
    });

    await reply.save();

    await reply.populate("author", "username");
    await reply.populate({
      path: "parentComment",
      populate: {
        path: "author",
        select: "username"
      }
    });

    res.status(201).json({
      success: true,
      data: reply,
      message: "Reply created successfully"
    });
  } catch (error) {
    console.error("Error creating reply:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  getCommentsByPost,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  replyToComment
};

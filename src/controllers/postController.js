import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

const postController = {
  // GET all posts with search and pagination
  getAllPosts: async (req, res) => {
    try {
      const {search, page = 1, perPage = 15} = req.query;

      // Build search query
      let query = {};
      if (search) {
        query = {
          $or: [
            {title: {$regex: search, $options: "i"}},
            {content: {$regex: search, $options: "i"}},
          ],
        };
      }

      // Calculate pagination
      const limit = parseInt(perPage);
      const skip = (parseInt(page) - 1) * limit;

      // Get total count for pagination
      const totalPosts = await Post.countDocuments(query);

      // Fetch posts with author population
      const posts = await Post.find(query)
        .populate("author", "username email shortId")
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .lean();

      // Get comment counts for each post
      const postsWithCommentCount = await Promise.all(
        posts.map(async (post) => {
          const commentCount = await Comment.countDocuments({post: post._id});
          return {
            ...post,
            commentCount,
          };
        })
      );

      res.status(200).json({
        success: true,
        message: "Posts retrieved successfully",
        data: postsWithCommentCount,
        pagination: {
          currentPage: parseInt(page),
          perPage: limit,
          totalPosts,
          totalPages: Math.ceil(totalPosts / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // GET single post by shortId with comments
  getPostByShortId: async (req, res) => {
    try {
      const {shortId} = req.params;
      const post = await Post.findOne({shortId}).populate("author", "username email").lean();

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Get all comments for this post
      const comments = await Comment.find({post: post._id})
        .populate("author", "username email shortId")
        .sort({createdAt: -1})
        .lean();

      // Get total comment count
      const commentCount = comments.length;

      res.status(200).json({
        success: true,
        message: "Post retrieved successfully",
        data: {
          ...post,
          commentCount,
          comments,
        },
      });
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid post ID",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // CREATE new post
  createPost: async (req, res) => {
    try {
      const postData = {
        ...req.body,
        author: req.user._id,
      };

      const newPost = await Post.create(postData);
      await newPost.populate("author", "username email");

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: newPost,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // UPDATE post by shortId
  updatePost: async (req, res) => {
    try {
      // req.resource is already validated by checkOwnership middleware
      const {shortId} = req.params;

      const updatedPost = await Post.findOneAndUpdate({shortId}, req.body, {
        new: true,
        runValidators: true,
      }).populate("author", "username email");

      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: updatedPost,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
  // DELETE post by shortId
  deletePost: async (req, res) => {
    try {
      // req.resource is already validated by checkOwnership middleware
      const post = req.resource;

      // Delete all comments associated with this post
      await Comment.deleteMany({post: post._id});

      await Post.findOneAndDelete({shortId: post.shortId});

      res.status(200).json({
        success: true,
        message: "Post and associated comments deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
};

export default postController;

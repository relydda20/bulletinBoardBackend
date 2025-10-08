import Post from '../models/Post.js';

const postController = {
  // GET all posts
  getAllPosts: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 });
      
      res.status(200).json({
        success: true,
        message: 'Posts retrieved successfully',
        count: posts.length,
        data: posts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // GET single post by shortId
  getPostByShortId: async (req, res) => {
    try {
      const { shortId } = req.params;
      const post = await Post.findOne({ shortId });
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Post retrieved successfully',
        data: post
      });
    } catch (error) {
      // Handle invalid MongoDB ObjectId
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // CREATE new post
createPost: async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author: req.user.id  // Get author from authenticated user
    };
    
    const newPost = await Post.create(postData);
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
},

  // UPDATE post by shortId
updatePost: async (req, res) => {
  try {
    const { shortId } = req.params;
    const post = await Post.findOne({ shortId });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user owns the post
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      });
    }
    
    const updatedPost = await Post.findOneAndUpdate(
      { shortId },
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
},

  // DELETE post by shortId
  deletePost: async (req, res) => {
    try {
      const { shortId } = req.params;
      const deletedPost = await Post.findOneAndDelete({ shortId });
      
      if (!deletedPost) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
        data: deletedPost
      });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid post ID'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
};

export default postController;
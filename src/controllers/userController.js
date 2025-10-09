import { get } from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

const userController = {
  getUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
        count: users.length
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: "Error fetching users",
        error: error.message
      });
    }
  },

  getUserByShortId: async (req, res) => {
    try {
      const user = await User.findOne({ shortId: req.params.shortId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching profile",
        error: error.message,
      });
    }
  },

  updateUserProfile: async (req, res) => {
    try {
      const user = await User.findOne({ shortId: req.user.id });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const { displayName, bio } = req.body;
      if (displayName) user.displayName = displayName;
      if (bio) user.bio = bio;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error updating profile",
        error: error.message,
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const user = await User.findOne({ shortId: req.user.id }).select(
        "+password"
      );
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const { currentPassword, newPassword } = req.body;
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.password = newPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error updating password",
        error: error.message,
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findOneAndDelete({ shortId: req.user.id });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User account deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error deleting account",
        error: error.message,
      });
    }
  },

  getUserPosts: async (req, res) => {
    try {
      const user = await User.findOne({ shortId: req.params.shortId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const posts = await Post.find({ author: user.shortId });

      return res.status(200).json({
        success: true,
        data: { posts },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching user's posts",
        error: error.message,
      });
    }
  },

  getUserComments: async (req, res) => {
    try {
      const user = await User.findOne({ shortId: req.params.shortId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const comments = await Comment.find({ author: user.shortId });

      return res.status(200).json({
        success: true,
        data: { comments },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching user's comments",
        error: error.message,
      });
    }
  },

};
export default userController;

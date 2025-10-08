// src/controllers/authController.js

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";

export const authController = {
  // Register new user (email + username + password)
  register: async (req, res) => {
    try {
      const { email, username, password } = req.body;

      // Check for duplicate email or username
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email or username already exists",
        });
      }

      // Hash password and create user
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        username,
        password: hashed,
      });

      // Token payload uses public-friendly shortId
      const payload = { id: user.shortId, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken({ id: user.shortId });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error registering user",
        error: error.message,
      });
    }
  },

  // Login user (email + password)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user and include password field for comparison
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Issue tokens with unified payload
      const payload = { id: user.shortId, email: user.email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken({ id: user.shortId });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: user.toJSON(),
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error logging in",
        error: error.message,
      });
    }
  },

  // Refresh access token using refresh token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken: clientRefreshToken } = req.body;

      if (!clientRefreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      const decoded = verifyRefreshToken(clientRefreshToken);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
      }

      const user = await User.findOne({ shortId: decoded.id });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const newAccessToken = generateAccessToken({
        id: user.shortId,
        email: user.email,
      });

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error refreshing token",
        error: error.message,
      });
    }
  },

  // Get current user profile (requires auth middleware to set req.user)
  getProfile: async (req, res) => {
    try {
      const user = await User.findOne({ shortId: req.user.id });
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

  // Logout (client-side token removal; server-side revoke optional)
  logout: async (_req, res) => {
    try {
      // Optional: blacklist tokens in Redis / remove persisted refresh tokens
      return res.status(200).json({
        success: true,
        message: "Logout successful. Please remove tokens from client.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error logging out",
        error: error.message,
      });
    }
  },
};

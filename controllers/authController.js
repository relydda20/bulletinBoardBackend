import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwtUtils.js';
import bcrypt from 'bcryptjs';

export const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, username, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Create new user (password will be hashed by pre-save middleware)
      const user = await User.create({ 
        email, 
        username, 
        password 
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        id: user.shortId,
        email: user.email,
        role: user.role
      });

      const refreshToken = generateRefreshToken({
        id: user.shortId
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
    const user = await User.findOne({ email }).select('+password');
    console.log('User found during login:', user);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Verify password using User model method
        const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        id: user.shortId,
        email: user.email,
        role: user.role
      });

      const refreshToken = generateRefreshToken({
        id: user.shortId
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message
      });
    }
  },

  // Refresh access token
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Get user
      const user = await User.findOne({ shortId: decoded.id });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        id: user.shortId,
        email: user.email,
        role: user.role
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error refreshing token',
        error: error.message
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findOne({ shortId: req.user.id });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: error.message
      });
    }
  },

  // Logout (client should remove tokens)
  logout: async (req, res) => {
    try {
      // In production, you might want to:
      // - Blacklist the token in Redis
      // - Remove refresh token from database
      
      res.status(200).json({
        success: true,
        message: 'Logout successful. Please remove tokens from client.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error logging out',
        error: error.message
      });
    }
  }
};
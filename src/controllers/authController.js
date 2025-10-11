// src/controllers/authController.js

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from "../utils/jwtUtils.js";

// Helper function to set token cookies
// ----------------- Cookie Helpers -----------------
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === "production";

  const baseOptions = {
    httpOnly: true,
    secure: isProd, // must be true in prod (HTTPS)
    sameSite: isProd ? "none" : "lax", // allow cross-site in prod, lax in dev
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookies = (res) => {
  const isProd = process.env.NODE_ENV === "production";

  const baseOptions = {
    httpOnly: true,
    secure: isProd, // must be true in prod (HTTPS)
    sameSite: isProd ? "none" : "lax", // match what you used in setTokenCookies
    path: "/",
  };

  res.clearCookie("accessToken", baseOptions);
  res.clearCookie("refreshToken", baseOptions);
};
export const authController = {
  register: async (req, res) => {
    try {
      const {email, username, password} = req.body;

      const existingUser = await User.findOne({
        $or: [{email}, {username}],
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email or username already exists",
        });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        username,
        password: hashed,
      });

      const payload = {id: user.shortId, email: user.email};
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken({id: user.shortId});

      // Set cookies
      setTokenCookies(res, accessToken, refreshToken);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
          // Don't send tokens in response body anymore
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

  login: async (req, res) => {
    try {
      const {emailOrUsername, password} = req.body;

      // Try to find user by email OR username
      const user = await User.findOne({
        $or: [{email: emailOrUsername}, {username: emailOrUsername}],
      }).select("+password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const payload = {id: user.shortId, email: user.email};
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken({id: user.shortId});

      // Set cookies
      setTokenCookies(res, accessToken, refreshToken);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: user.toJSON(),
          // Don't send tokens in response body anymore
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

  refreshToken: async (req, res) => {
    try {
      // Get refresh token from cookie instead of body
      const clientRefreshToken = req.cookies.refreshToken;

      if (!clientRefreshToken) {
        clearTokenCookies(res);
        return res.status(401).json({
          success: false,
          message: "Refresh token is required",
          requiresLogin: true,
        });
      }

      const decoded = verifyRefreshToken(clientRefreshToken);
      if (!decoded) {
        clearTokenCookies(res);
        return res.status(401).json({
          success: false,
          message: "Invalid or expired refresh token",
          requiresLogin: true,
        });
      }

      const user = await User.findOne({shortId: decoded.id});
      if (!user) {
        clearTokenCookies(res);
        return res.status(404).json({
          success: false,
          message: "User not found",
          requiresLogin: true,
        });
      }

      const payload = {id: user.shortId, email: user.email};
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken({id: user.shortId});

      // Set new cookies
      setTokenCookies(res, newAccessToken, newRefreshToken);

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
      });
    } catch (error) {
      clearTokenCookies(res);
      return res.status(500).json({
        success: false,
        message: "Error refreshing token",
        error: error.message,
        requiresLogin: true,
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findOne({shortId: req.user.id});
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: {user},
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching profile",
        error: error.message,
      });
    }
  },

  logout: async (_req, res) => {
    try {
      // Clear cookies
      clearTokenCookies(res);

      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error logging out",
        error: error.message,
      });
    }
  },

  googleCallback: async (req, res) => {
    try {
      console.log("Google callback - User authenticated:", req.user?.email);

      if (!req.user) {
        console.error("No user in request after Google auth");
        const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
        return res.redirect(`${frontendURL}/auth/callback?error=no_user`);
      }

      // Use shortId which is what your User model has
      const payload = {id: req.user.shortId, email: req.user.email};
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken({id: req.user.shortId});

      console.log("Generated tokens for user:", req.user.shortId);

      // Set cookies
      setTokenCookies(res, accessToken, refreshToken);

      // Redirect to frontend with success
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendURL}/auth/callback?success=true`);
    } catch (error) {
      console.error("Error in googleCallback:", error);
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendURL}/auth/callback?error=authentication_failed`);
    }
  },
};

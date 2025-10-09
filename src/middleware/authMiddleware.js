import { verifyAccessToken } from "../utils/jwtUtils.js";
import User from "../models/User.js";

// Protect routes - verify JWT token
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token); // contains shortId as id and email

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }

    // Fetch full user to get both _id and shortId
    const user = await User.findOne({ shortId: decoded.id });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach both internal and public identifiers
    req.user = {
      _id: user._id, // for internal MongoDB relations
      id: user.shortId, // for public API responses
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};
// Optional role-based authorization (future use)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (req.user.role && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

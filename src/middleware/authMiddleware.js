import {verifyAccessToken} from "../utils/jwtUtils.js";
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
    const user = await User.findOne({shortId: decoded.id});
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
// Check if logged-in user owns the resource
export const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const {shortId, id} = req.params;
      const identifier = shortId || id;

      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: "Resource identifier is required",
        });
      }

      // Find the resource by shortId or _id
      const resource = await model.findOne({
        $or: [{shortId: identifier}, {_id: identifier}],
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${model.modelName} not found`,
        });
      }

      // Check if the logged-in user is the author/owner
      if (resource.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: `You can only modify your own ${model.modelName.toLowerCase()}`,
        });
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking ownership",
        error: error.message,
      });
    }
  };
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

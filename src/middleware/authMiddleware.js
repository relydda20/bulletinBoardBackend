import {verifyAccessToken} from "../utils/jwtUtils.js";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie instead of Authorization header
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
        code: "NO_TOKEN",
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
        code: "TOKEN_EXPIRED",
      });
    }

    const user = await User.findOne({shortId: decoded.id});
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    req.user = {
      _id: user._id,
      id: user.shortId,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
      code: "AUTH_FAILED",
    });
  }
};

export const checkOwnership = (model, idParam = "shortId") => {
  return async (req, res, next) => {
    try {
      const id = req.params[idParam];

      if (!id) {
        return res.status(400).json({
          success: false,
          message: `${idParam} is required`,
        });
      }

      // Build query based on the parameter name
      const query = {};
      query[idParam === 'commentId' ? '_id' : 'shortId'] = id;

      const resource = await model.findOne(query);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${model.modelName} not found`,
        });
      }

      // Ownership check using the actual _id of the author
      if (resource.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: `You can only modify your own ${model.modelName.toLowerCase()}`,
        });
      }

      // Attach the full resource (with _id) to the request
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

// Make sure this file loads environment variables properly
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const jwtConfig = {
  accessTokenSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenExpire: process.env.JWT_EXPIRE || "15m",
  refreshTokenExpire: process.env.JWT_REFRESH_EXPIRE || "7d",
};

// Debug: Log to check if secrets are loaded (remove in production)
console.log("JWT Config loaded:", {
  hasAccessSecret: !!jwtConfig.accessTokenSecret,
  hasRefreshSecret: !!jwtConfig.refreshTokenSecret,
  accessExpire: jwtConfig.accessTokenExpire,
  refreshExpire: jwtConfig.refreshTokenExpire,
});

// Validate that secrets exist
if (!jwtConfig.accessTokenSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}

if (!jwtConfig.refreshTokenSecret) {
  throw new Error("JWT_REFRESH_SECRET environment variable is required");
}

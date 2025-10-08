import { connect, connection } from "mongoose";

/**
 * Connect to MongoDB
 * - Reads the connection string from environment variables
 * - Attempts to establish a connection
 * - Logs a masked version of the URI (so credentials aren't exposed in logs)
 * - Exits the process if the initial connection fails
 */
const connectDB = async () => {
  const { MONGO_URI } = process.env;

  try {
    // Establish connection to MongoDB
    await connect(MONGO_URI);

    // Mask credentials if present in URI before logging
    console.log(
      `✅ MongoDB Connected: ${
        MONGO_URI.includes("@")
          ? MONGO_URI.replace(/:\/\/.*@/, "://***:***@")
          : MONGO_URI
      }`
    );
  } catch (err) {
    // If the initial connection fails, log the error and exit
    // This prevents the app from running in a broken state
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 * - Listens for termination signals (SIGINT, SIGTERM)
 * - Closes the HTTP server and MongoDB connection cleanly
 * - Prevents dangling connections or corrupted state
 */
const setupGracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server and DB...`);

    // Stop accepting new requests
    server.close(async () => {
      console.log("🛑 HTTP server closed.");
      try {
        // Close MongoDB connection
        await connection.close(false);
        console.log("🛑 MongoDB connection closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err.message);
        process.exit(1);
      }
    });
  };

  // Handle Ctrl+C locally and container orchestrators (Docker/K8s)
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

export { connectDB, setupGracefulShutdown };

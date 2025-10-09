import "./loadEnv.js"; // Load environment variables from .env file
import app from "./src/app.js";
import { connectDB, setupGracefulShutdown } from "./src/config/db.js";

const PORT = process.env.PORT || 3000; // Default to 3000 if PORT not set

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Attach graceful shutdown (optional but recommended)
    setupGracefulShutdown(server);
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

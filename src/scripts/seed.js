// scripts/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  clearDatabase,
  seedDatabase,
  freshSeed,
} from "../seeders/databaseSeeder.js";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/your_database";

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error.message);
  }
};

/**
 * Main function
 */
const main = async () => {
  const command = process.argv[2];

  await connectDB();

  try {
    switch (command) {
      case "--fresh":
      case "-f":
        console.log("🚀 Running fresh seed (clear + seed)...\n");
        await freshSeed();
        break;

      case "--clear":
      case "-c":
        console.log("🚀 Clearing database...\n");
        await clearDatabase();
        break;

      case "--seed":
      case "-s":
        console.log("🚀 Seeding database...\n");
        await seedDatabase();
        break;

      default:
        console.log("📖 Usage:");
        console.log("  npm run seed -- --fresh    or -f  (Clear and seed)");
        console.log("  npm run seed -- --clear    or -c  (Clear only)");
        console.log("  npm run seed -- --seed     or -s  (Seed only)");
        console.log("\nExample:");
        console.log("  npm run seed -- --fresh");
        break;
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

// Run the script
main();

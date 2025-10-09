// seeders/databaseSeeder.js
import mongoose from "mongoose";
import {seedUsers, clearUsers} from "./userSeeder.js";
import {seedPosts, clearPosts} from "./postSeeder.js";
import {seedComments, clearComments} from "./commentSeeder.js";

/**
 * Clear all data from the database
 */
export const clearDatabase = async () => {
  try {
    console.log("🧹 Clearing database...\n");

    // Clear in order (comments first due to references)
    await clearComments();
    await clearPosts();
    await clearUsers();

    console.log("\n✨ Database cleared successfully!\n");
  } catch (error) {
    console.error("❌ Error clearing database:", error.message);
    throw error;
  }
};

/**
 * Seed all data into the database
 * Ensures all references are properly connected
 */
export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Step 1: Create users first
    const users = await seedUsers();

    // Step 2: Create posts with user references
    // Posts will be distributed among users
    const posts = await seedPosts(users);

    // Step 3: Populate author details in posts for comment seeding
    // This ensures we can access author info when creating comments
    const populatedPosts = await mongoose
      .model("Post")
      .find({_id: {$in: posts.map((p) => p._id)}})
      .populate("author", "_id username")
      .lean();

    // Step 4: Create comments with proper post and author references
    // Comments will reference existing posts and users
    // Replies can be by anyone, including the comment author
    const comments = await seedComments(users, populatedPosts);

    console.log("\n✨ Database seeded successfully!");
    console.log("📊 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - Comments: ${comments.length}`);
    console.log("\n🔗 Relationships:");
    console.log(`   ✓ All posts have valid author references (User)`);
    console.log(`   ✓ All comments have valid post references (Post)`);
    console.log(`   ✓ All comments have valid author references (User)`);
    console.log(
      `   ✓ Parent comments can be by anyone (including post author)`
    );
    console.log(`   ✓ Replies can be by anyone (including comment author)`);
    console.log(
      `   ✓ All nested comments have valid parentComment references\n`
    );

    return {users, posts, comments};
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    throw error;
  }
};

/**
 * Fresh seed: Clear database and seed new data
 * Similar to Laravel's migrate:fresh --seed
 */
export const freshSeed = async () => {
  try {
    await clearDatabase();
    await seedDatabase();
  } catch (error) {
    console.error("❌ Error in fresh seed:", error.message);
    throw error;
  }
};

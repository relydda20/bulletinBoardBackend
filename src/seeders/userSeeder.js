// seeders/userSeeder.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const users = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "password123",
    bio: "System administrator and content moderator",
  },
  {
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    bio: "Tech enthusiast and blogger",
  },
  {
    username: "janedoe",
    email: "jane@example.com",
    password: "password123",
    bio: "Frontend developer and UI designer",
  },
  {
    username: "alexsmith",
    email: "alex@example.com",
    password: "password123",
    bio: "Full-stack developer",
  },
  {
    username: "sarahwilson",
    email: "sarah@example.com",
    password: "password123",
    bio: "Data scientist and ML engineer",
  },
];

export const seedUsers = async () => {
  try {
    console.log("🌱 Seeding users...");

    // Hash passwords
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✅ Created ${createdUsers.length} users`);

    return createdUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    throw error;
  }
};

export const clearUsers = async () => {
  try {
    const result = await User.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} users`);
  } catch (error) {
    console.error("❌ Error clearing users:", error.message);
    throw error;
  }
};

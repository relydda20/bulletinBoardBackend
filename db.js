import mongoose from "mongoose";

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${MONGO_URI.includes('@') ? MONGO_URI.replace(/:\/\/.*@/, '://***:***@') : MONGO_URI}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
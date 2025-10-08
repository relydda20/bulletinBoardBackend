import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import generateShortId from "./types/shortid.js";

const userSchema = new Schema(
  {
    shortId: {
      type: String,
      default: generateShortId,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      index: true,
      // minLength: [3, "Username must be at least 3 characters long"],
      // maxLength: [20, "Username cannot exceed 20 characters"],
      // match: [
      //   /^[a-zA-Z0-9_]+$/,
      //   "Username can only contain letters, numbers, and underscores",
      // ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      // match: [
      //   /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      //   "Please enter a valid email address",
      // ],
    },
    password: {
      type: String,
      // minLength: [6, "Password must be at least 6 characters long"],
    },
    googleId: {
      type: String,
    },
    bio: {
      type: String,
      // maxLength: [200, "Bio cannot exceed 200 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

export default User;

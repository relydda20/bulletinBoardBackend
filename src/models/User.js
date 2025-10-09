import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import generateShortId from "./types/shortid.js";
import crypto from "crypto";

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
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire time (10 minutes)
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  
  // Return unhashed token
  return resetToken;
};

// Transform JSON output to exclude sensitive fields
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.emailVerificationToken;
    return ret;
  }
});

const User = model("User", userSchema);

export default User;

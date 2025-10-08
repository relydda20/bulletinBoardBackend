import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import generateShortId from './types/shortid.js'; 

const userSchema = new Schema({
    shortId: {
    type: String,
    default: generateShortId, // Function reference, bukan call
    unique: true,
    index: true
  },    
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minLength: [3, 'Username must be at least 3 characters long'],
    maxLength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't return password in queries by default
  },
  displayName: {
    type: String,
    trim: true,
    maxLength: [50, 'Display name cannot exceed 50 characters']
  },
//   avatar: {
//     type: String,
//     default: null // URL to profile picture
//   },
  bio: {
    type: String,
    maxLength: [200, 'Bio cannot exceed 200 characters'],
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

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


// Transform JSON output to exclude password
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = model('User', userSchema);

export default User;
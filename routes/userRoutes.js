import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtUtils.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = Router();

// Validation middleware
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
];

const loginValidation = [
  body('login')
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// POST /users/register - Register new user
router.post('/register', registerValidation, validate, async (req, res) => {
  try {
    const { username, email, password, displayName, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Hash password
    // const saltRounds = 12;
    // const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      displayName: displayName || username,
      bio: bio || ''
    });

    const savedUser = await newUser.save();

    // Generate JWT tokens
    const accessToken = generateAccessToken({
      id: savedUser.shortId,
      email: savedUser.email,
      role: savedUser.role
    });

    const refreshToken = generateRefreshToken({
      id: savedUser.shortId,
      email: savedUser.email
    });

    // Return response with tokens
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          shortId: savedUser.shortId,
          username: savedUser.username,
          email: savedUser.email,
          displayName: savedUser.displayName,
          bio: savedUser.bio,
          role: savedUser.role,
          createdAt: savedUser.createdAt
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// POST /users/login - User login
router.post('/login', loginValidation, validate, async (req, res) => {
  try {
    const { login, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: login },
        { email: login }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken({
      id: user.shortId,
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      id: user.shortId,
      email: user.email
    });

    // Return response with tokens
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          shortId: user.shortId,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          bio: user.bio,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// GET /users/profile - Get current user profile (protected)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ shortId: req.user.id })
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          shortId: user.shortId,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          bio: user.bio,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: error.message
    });
  }
});

export default router;
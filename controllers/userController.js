import User from '../models/User.js';

const userController = {
  // Register new user (for backward compatibility)
  register: async (req, res) => {
    try {
      const { email, username, password, displayName, bio } = req.body;

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

      // Create new user (password will be hashed by pre-save middleware)
      const newUser = new User({
        username,
        email,
        password,
        displayName: displayName || username,
        bio
      });

      await newUser.save();

      // Return user without password
      const userResponse = {
        _id: newUser._id,
        shortId: newUser.shortId,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        bio: newUser.bio,
        role: newUser.role,
        createdAt: newUser.createdAt
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: userResponse
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  },

  // Login user (for backward compatibility)
  login: async (req, res) => {
    try {
      const { login, password } = req.body;

      // Find user by email or username
      const user = await User.findOne({
        $or: [{ email: login }, { username: login }]
      }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Compare password using the model method
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Return user without password
      const userResponse = {
        _id: user._id,
        shortId: user.shortId,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: userResponse
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }
};

export default userController;
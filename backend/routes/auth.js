// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d', // Default to 1 day if not set
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user instance (password will be hashed by pre-save hook in User model)
    user = new User({
      email,
      password,
    });

    // Save user to database
    await user.save();

    // Respond with user info (excluding password) and token
    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    if (error.name === 'ValidationError') {
        // Extract validation messages
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (login)
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user by email, and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Respond with user info (excluding password) and token
    res.status(200).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user details (example protected route)
// @access  Private (requires token)
const { protect } = require('../middleware/authMiddleware'); // Assuming protect is in this file
router.get('/me', protect, async (req, res) => {
    try {
        // req.user is attached by the 'protect' middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching current user:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;

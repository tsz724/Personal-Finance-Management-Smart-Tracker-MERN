const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const {registerUser,loginUser,getUserProfile, googleAuth } = require('../controllers/authController');

const router = express.Router();

// Register a new user
router.post('/register',registerUser);

// Login user
router.post('/login', loginUser);

// Google auth
router.post('/google', googleAuth);

// Get user profile
router.get('/profile', protect, getUserProfile);

module.exports = router;


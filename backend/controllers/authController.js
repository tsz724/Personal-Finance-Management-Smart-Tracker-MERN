const User = require('../models/Users');
const jwt=require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

//register user
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const role =
            process.env.BOOTSTRAP_ADMIN_EMAIL &&
            String(email).toLowerCase() === String(process.env.BOOTSTRAP_ADMIN_EMAIL).toLowerCase()
                ? 'admin'
                : 'employee';

        const user = await User.create({
            name,
            email,
            password,
            role,
        });

        if (user) {
            const safe = await User.findById(user._id).select('-password');
            res.status(201).json({
                id: user._id,
                user: safe,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

//login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        //Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        if (user.authProvider === 'google' && !user.password) {
            return res.status(400).json({ message: 'Please sign in with Google' });
        }
        
        // Compare password
        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Incorrect email or password' });
        }

        const safe = await User.findById(user._id).select('-password');
        res.status(200).json({
            id: user._id,
            user: safe,
            token: generateToken(user._id),
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
};

// Google login/register
exports.googleAuth = async (req, res) => {
    const { credential } = req.body;

    try {
        if (!credential) {
            return res.status(400).json({ message: 'Missing Google credential' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload || {};

        if (!email) {
            return res.status(400).json({ message: 'Google account email not available' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            const role =
                process.env.BOOTSTRAP_ADMIN_EMAIL &&
                String(email).toLowerCase() === String(process.env.BOOTSTRAP_ADMIN_EMAIL).toLowerCase()
                    ? 'admin'
                    : 'employee';
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                googleId,
                authProvider: 'google',
                role,
            });
        } else {
            let needsSave = false;
            if (!user.googleId) {
                user.googleId = googleId;
                needsSave = true;
            }
            if (!user.authProvider) {
                user.authProvider = 'google';
                needsSave = true;
            }
            if (needsSave) {
                await user.save();
            }
        }

        if (user.isActive === false) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        const safeGoogle = await User.findById(user._id).select('-password');
        return res.status(200).json({
            id: user._id,
            user: safeGoogle,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Google auth error:', error);
        return res.status(500).json({ message: 'Google authentication failed' });
    }
};

//get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }   
};    

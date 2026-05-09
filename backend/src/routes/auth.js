const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate, generateToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email and password are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const existingUsername = await User.findOne({
            where: { username }
        });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            role: 'user'
        });

        const token = generateToken(user.id);

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findByCredentials(email, password);
        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
            avatar: req.user.avatar,
            bio: req.user.bio,
            createdAt: req.user.createdAt
        }
    });
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { username, bio, avatar } = req.body;

        if (username) {
            const existingUser = await User.findOne({
                where: { username }
            });
            if (existingUser && existingUser.id !== req.user.id) {
                return res.status(400).json({ error: 'Username already taken' });
            }
        }

        await req.user.update({
            ...(username && { username }),
            ...(bio !== undefined && { bio }),
            ...(avatar && { avatar })
        });

        res.json({
            message: 'Profile updated',
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
                avatar: req.user.avatar,
                bio: req.user.bio
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
router.put('/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }

        // Verify current password
        const user = await User.findByPk(req.user.id);
        const isValid = await user.validatePassword(currentPassword);
        if (!isValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

module.exports = router;

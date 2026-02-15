const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
// Simple file logger (optional, or use console)
const fs = require('fs');
const path = require('path');

const logError = (msg) => {
    try {
        fs.appendFileSync(path.join(__dirname, '../debug.log'), `[ERROR] ${new Date().toISOString()} ${msg}\n`);
    } catch (e) { console.error(e); }
};

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const { university, fullName, email, password, hostel, roomNumber } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = new User({
            university,
            fullName,
            email,
            password,
            hostel,
            roomNumber,
            role: 'student'
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                university: user.university,
                fullName: user.fullName,
                email: user.email,
                hostel: user.hostel,
                roomNumber: user.roomNumber,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        logError(`Login attempt for: ${email}`);

        const user = await User.findOne({ email });
        if (!user) {
            logError(`User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            logError(`Invalid password for: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        logError(`Login successful for: ${email}`);

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                university: user.university,
                fullName: user.fullName,
                email: user.email,
                hostel: user.hostel,
                roomNumber: user.roomNumber,
                role: user.role
            }
        });
    } catch (error) {
        logError(`Server error during login: ${error.message}`);
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login: ' + error.message });
    }
};

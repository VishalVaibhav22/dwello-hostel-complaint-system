const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Validation middleware
const validateRegister = [
    body('university').trim().notEmpty().withMessage('University is required'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('hostel').trim().notEmpty().withMessage('Hostel is required')
        .isIn(['Hostel A', 'Hostel O', 'Hostel M']).withMessage('Invalid hostel selection'),
    body('roomNumber').trim().notEmpty().withMessage('Room number is required')
];

const validateLogin = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, authController.register);

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, authController.login);

module.exports = router;

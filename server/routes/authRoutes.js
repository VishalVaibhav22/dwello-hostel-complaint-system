const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");

// Validation middleware
const validateRegister = [
  body("university").trim().notEmpty().withMessage("University is required"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 15 })
    .withMessage("Password must be between 8 and 15 characters"),
  body("hostel")
    .trim()
    .notEmpty()
    .withMessage("Hostel is required")
    .isIn(["Hostel A", "Hostel O", "Hostel M"])
    .withMessage("Invalid hostel selection"),
  body("roomNumber").trim().notEmpty().withMessage("Room number is required"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  body("role")
    .isIn(["student", "admin"])
    .withMessage("Please select a valid role"),
];

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", validateRegister, authController.register);

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, authController.login);

module.exports = router;

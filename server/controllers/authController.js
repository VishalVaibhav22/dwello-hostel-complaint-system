const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const {
      university,
      fullName,
      email,
      password,
      hostel,
      roomNumber,
      rollNumber,
    } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    if (password.length < 8 || password.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 15 characters long.",
      });
    }

    if (/\s/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must not contain whitespace.",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter.",
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one lowercase letter.",
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one digit.",
      });
    }

    if (!/[!@#$%&*()\-\+=^]/.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one special character (!@#$%&*()-+=^).",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    if (university === "Thapar Institute of Engineering and Technology") {
      if (!rollNumber) {
        return res.status(400).json({
          success: false,
          message: "Roll number is required for Thapar University students",
        });
      }

      if (!/^\d{9}$/.test(rollNumber)) {
        return res.status(400).json({
          success: false,
          message: "Roll number must be exactly 9 digits",
        });
      }

      const existingRollNumber = await User.findOne({ rollNumber });
      if (existingRollNumber) {
        return res.status(400).json({
          success: false,
          message: "This roll number is already registered.",
        });
      }
    }

    const user = new User({
      university,
      fullName,
      email: normalizedEmail,
      password,
      hostel,
      roomNumber,
      rollNumber: rollNumber || undefined,
      role: "student",
    });

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        university: user.university,
        fullName: user.fullName,
        email: user.email,
        hostel: user.hostel,
        roomNumber: user.roomNumber,
        rollNumber: user.rollNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, password, role } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const normalizedRole = String(role || "")
      .trim()
      .toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (normalizedRole !== user.role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}. Please use the ${user.role} login option.`,
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        university: user.university,
        fullName: user.fullName,
        email: user.email,
        hostel: user.hostel,
        roomNumber: user.roomNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

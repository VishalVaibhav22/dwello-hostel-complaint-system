const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const complaintController = require("../controllers/complaintController");

// @route   GET /api/complaints/my
// @desc    Get all complaints for the logged-in user
// @access  Private
router.get("/my", authMiddleware, complaintController.getMyComplaints);

// @route   GET /api/complaints/:id
// @desc    Get a single complaint by ID
// @access  Private
router.get("/:id", authMiddleware, complaintController.getComplaintById);

// @route   POST /api/complaints
// @desc    Create a new complaint (with optional images)
// @access  Private
router.post(
  "/",
  [
    authMiddleware,
    upload.array("images", 3),
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 200 })
      .withMessage("Title cannot exceed 200 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ max: 2000 })
      .withMessage("Description cannot exceed 2000 characters"),
  ],
  complaintController.createComplaint,
);

module.exports = router;

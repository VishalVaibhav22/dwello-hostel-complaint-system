const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

// @route   GET /admin/health
// @desc    Health check (no auth required)
// @access  Public
router.get("/health", adminController.getHealth);

// @route   GET /admin/complaints
// @desc    Get ALL complaints with student details
// @access  Admin only
router.get("/complaints", adminAuth, adminController.getAllComplaints);

// @route   PUT /admin/complaints/:id/status
// @desc    Update complaint status
// @access  Admin only
router.put("/complaints/:id/status", adminAuth, adminController.updateComplaintStatus);

module.exports = router;

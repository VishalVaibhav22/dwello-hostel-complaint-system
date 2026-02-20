const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

// @route   GET /admin/health
// @desc    Health check (no auth required)
// @access  Public
router.get("/health", adminController.getHealth);

// @route   GET /admin/analytics
// @desc    Get analytics data
// @access  Admin only
router.get("/analytics", adminAuth, adminController.getAnalytics);

// @route   GET /admin/complaints
// @desc    Get ALL complaints with student details
// @access  Admin only
router.get("/complaints", adminAuth, adminController.getAllComplaints);

// @route   PUT /admin/complaints/:id/status
// @desc    Update complaint status
// @access  Admin only
router.put(
  "/complaints/:id/status",
  adminAuth,
  adminController.updateComplaintStatus,
);

// @route   PUT /admin/complaints/:id/reject
// @desc    Reject a complaint with reason
// @access  Admin only
router.put(
  "/complaints/:id/reject",
  adminAuth,
  adminController.rejectComplaint,
);

// @route   GET /admin/students
// @desc    Get all students with complaint counts
// @access  Admin only
router.get("/students", adminAuth, adminController.getAllStudents);

// @route   GET /admin/students/:studentId
// @desc    Get student details with complaints
// @access  Admin only
router.get(
  "/students/:studentId",
  adminAuth,
  adminController.getStudentDetails,
);

module.exports = router;

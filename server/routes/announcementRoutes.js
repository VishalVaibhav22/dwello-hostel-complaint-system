const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const announcementController = require("../controllers/announcementController");

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Private (any authenticated user)
router.get("/", authMiddleware, announcementController.getAnnouncements);

// @route   GET /api/announcements/unseen-count
// @desc    Get count of unseen announcements for logged-in student
// @access  Private
router.get(
  "/unseen-count",
  authMiddleware,
  announcementController.getUnseenCount,
);

// @route   PUT /api/announcements/mark-seen
// @desc    Mark all announcements as seen
// @access  Private
router.put("/mark-seen", authMiddleware, announcementController.markAllSeen);

// @route   POST /api/announcements
// @desc    Create a new announcement
// @access  Admin only
router.post("/", adminAuth, announcementController.createAnnouncement);

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Admin only
router.delete("/:id", adminAuth, announcementController.deleteAnnouncement);

module.exports = router;

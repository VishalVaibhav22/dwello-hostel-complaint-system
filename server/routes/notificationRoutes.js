const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

// @route   GET /api/notifications
// @desc    Get all notifications for logged-in user
// @access  Private
router.get("/", authMiddleware, notificationController.getMyNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Private
router.put("/:id/read", authMiddleware, notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put("/read-all", authMiddleware, notificationController.markAllAsRead);

module.exports = router;

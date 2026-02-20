const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { validationResult } = require("express-validator");

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this complaint",
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint",
      error: error.message,
    });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { title, description } = req.body;

    // Collect uploaded image filenames
    const images = req.files ? req.files.map((f) => f.filename) : [];

    // Parse availability slots if provided
    let availability = [];
    if (req.body.availability) {
      try {
        availability = JSON.parse(req.body.availability);
      } catch (e) {
        // Ignore parse errors — availability is optional
      }
    }

    const complaint = new Complaint({
      title,
      description,
      userId: req.user._id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      hostel: req.user.hostel,
      roomNumber: req.user.roomNumber,
      status: "Open",
      images,
      availability,
      statusHistory: [{ status: "Open", timestamp: new Date() }],
    });

    await complaint.save();

    // Create admin notifications
    try {
      const admins = await User.find({ role: "admin" });
      const adminNotifications = admins.map((admin) => ({
        userId: admin._id,
        complaintId: complaint._id,
        complaintTitle: complaint.title,
        type: "NEW_COMPLAINT",
        studentName: req.user.fullName,
        message: `New complaint submitted by ${req.user.fullName}: ${complaint.title}`,
        read: false,
      }));

      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
      }
    } catch (notifError) {
      console.error("Error creating admin notifications:", notifError);
      // Don't fail the complaint creation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create complaint",
      error: error.message,
    });
  }
};

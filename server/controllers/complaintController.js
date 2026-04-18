const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { validationResult } = require("express-validator");
const axios = require("axios");
const {
  uploadComplaintImages,
  isImageKitConfigured,
  missingImageKitEnv,
} = require("../utils/imagekit");
const {
  DEFAULT_PRIORITY,
  predictComplaintPriority,
} = require("../utils/geminiPriority");

const VALID_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Housekeeping",
  "Internet",
  "Mess",
  "Furniture",
  "Other",
];

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000/predict";

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
    const normalizedRole = String(req.user?.role || "")
      .trim()
      .toLowerCase();

    // Block admins explicitly; allow legacy student records that may miss role.
    if (normalizedRole === "admin") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit complaints.",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { title, description } = req.body;
    const hostel = req.body.hostel || req.user.hostel;
    const roomNumber = req.body.roomNumber || req.user.roomNumber;

    if (!hostel || !roomNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Student hostel and room number are required to submit a complaint.",
      });
    }

    if (req.files?.length && !isImageKitConfigured) {
      return res.status(500).json({
        success: false,
        message: "Image uploads are not configured on the server.",
        missingEnv: missingImageKitEnv,
      });
    }

    // Upload complaint images to ImageKit and persist public URLs.
    let images = [];
    if (req.files?.length) {
      try {
        images = await uploadComplaintImages(
          req.files,
          req.user._id.toString(),
        );
      } catch (uploadError) {
        console.error("ImageKit upload failed:", uploadError.message);
        return res.status(502).json({
          success: false,
          message: "Failed to upload complaint images. Please try again.",
        });
      }
    }

    // Parse availability slots if provided
    let availability = [];
    if (req.body.availability) {
      try {
        availability = JSON.parse(req.body.availability);
      } catch (e) {
        // Ignore parse errors - availability is optional
      }
    }

    // Predict category via AI service. Never fail complaint creation on AI errors.
    let category = "Other";
    try {
      const complaintText = [title, description]
        .map((text) => String(text || "").trim())
        .filter(Boolean)
        .join(". ");
      const aiResponse = await axios.post(
        AI_SERVICE_URL,
        { text: complaintText },
        { timeout: 2500 },
      );

      const predictedCategory = aiResponse?.data?.category;
      if (VALID_CATEGORIES.includes(predictedCategory)) {
        category = predictedCategory;
      }
    } catch (aiError) {
      console.error("AI category prediction failed:", aiError.message);
      category = "Other";
    }

    // Predict priority via Gemini API. Never fail complaint creation on AI errors.
    let priority = DEFAULT_PRIORITY;
    try {
      const complaintText = [title, description]
        .map((text) => String(text || "").trim())
        .filter(Boolean)
        .join(". ");
      priority = await predictComplaintPriority(complaintText);
    } catch (priorityError) {
      console.error(
        "AI priority prediction failed:",
        priorityError?.message || priorityError,
      );
      priority = DEFAULT_PRIORITY;
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      userId: req.user._id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      hostel,
      roomNumber,
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

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Complaint validation failed",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create complaint",
      error: error.message,
    });
  }
};

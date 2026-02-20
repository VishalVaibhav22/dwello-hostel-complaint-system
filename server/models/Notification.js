const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
  },
  complaintTitle: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["NEW_COMPLAINT", "STATUS_UPDATE"],
    default: "STATUS_UPDATE",
  },
  studentName: {
    type: String,
  },
  oldStatus: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Rejected"],
  },
  newStatus: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Rejected"],
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;

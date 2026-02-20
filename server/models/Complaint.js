const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a complaint title"],
    trim: true,
    maxlength: [200, "Title cannot be more than 200 characters"],
  },
  description: {
    type: String,
    required: [true, "Please provide a complaint description"],
    trim: true,
    maxlength: [2000, "Description cannot be more than 2000 characters"],
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Rejected"],
    default: "Open",
  },
  rejectionReason: {
    type: String,
    maxlength: [200, "Rejection reason cannot exceed 200 characters"],
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rejectedAt: {
    type: Date,
  },
  hostel: {
    type: String,
    required: [true, "Hostel is required"],
    enum: {
      values: ["Hostel A", "Hostel O", "Hostel M"],
      message: "Hostel must be one of: Hostel A, Hostel O, Hostel M",
    },
    trim: true,
  },
  roomNumber: {
    type: String,
    required: [true, "Room number is required"],
    trim: true,
  },
  images: [
    {
      type: String,
    },
  ],
  availability: [
    {
      date: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
  statusHistory: [
    {
      status: {
        type: String,
        enum: ["Open", "In Progress", "Resolved", "Rejected"],
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
complaintSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;

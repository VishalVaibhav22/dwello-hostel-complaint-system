const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Initialize admin if needed
    require("./utils/seedAdmin")();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Authenticated image serving
const authMiddleware = require("./middleware/auth");
const adminAuth = require("./middleware/adminAuth");
const Complaint = require("./models/Complaint");

app.get("/uploads/complaints/:filename", async (req, res) => {
  try {
    // Accept token from header or query parameter (for <img> tags)
    const token =
      req.header("Authorization")?.replace("Bearer ", "") || req.query.token;
    if (!token) {
      return res.status(401).json({ message: "Access denied" });
    }

    const jwt = require("jsonwebtoken");
    const User = require("./models/User");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const filename = req.params.filename;

    // Admin can access all images
    if (user.role === "admin") {
      const filePath = path.join(__dirname, "uploads", "complaints", filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Image not found" });
      }
      return res.sendFile(filePath);
    }

    // Student can only access their own complaint images
    const complaint = await Complaint.findOne({
      images: filename,
      userId: user._id,
    });
    if (!complaint) {
      return res.status(403).json({ message: "Access denied" });
    }

    const filePath = path.join(__dirname, "uploads", "complaints", filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Image not found" });
    }
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "running", version: "1.0.0" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

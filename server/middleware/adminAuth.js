const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Admin Authorization Middleware
 *
 * Verifies that the user is authenticated AND has admin role.
 * This ensures only admin users can access admin-specific routes.
 *
 * Rejects with 403 if user is not an admin.
 */
const adminAuth = async (req, res, next) => {
  try {
    console.log("[AdminAuth] Verifying access");

    // Get token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("[AdminAuth] No token provided");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    console.log("[AdminAuth] Token found, verifying...");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[AdminAuth] Token verified, userId:", decoded.userId);

    // Find user by ID from token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log("[AdminAuth] User not found in database");
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    console.log(`[AdminAuth] User found: ${user.fullName}, role: ${user.role}`);

    // Check if user has admin role
    if (user.role !== "admin") {
      console.log(`[AdminAuth] User is not admin. Role: ${user.role}`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    console.log("[AdminAuth] Admin verified. Proceeding...");

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("[AdminAuth] Error:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = adminAuth;

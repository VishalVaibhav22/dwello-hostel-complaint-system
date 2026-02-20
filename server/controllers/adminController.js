const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

exports.getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin routes are operational",
  });
};

exports.getAnalytics = async (req, res) => {
  try {
    const complaints = await Complaint.find().select(
      "status createdAt updatedAt statusHistory",
    );

    const total = complaints.length;
    const open = complaints.filter((c) => c.status === "Open").length;
    const inProgress = complaints.filter(
      (c) => c.status === "In Progress",
    ).length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    const rejected = complaints.filter((c) => c.status === "Rejected").length;

    // Average resolution time (for resolved complaints with statusHistory)
    const resolvedComplaints = complaints.filter(
      (c) => c.status === "Resolved",
    );
    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((sum, c) => {
        const created = new Date(c.createdAt);
        const resolvedEntry = (c.statusHistory || [])
          .filter((h) => h.status === "Resolved")
          .pop();
        const resolvedAt = resolvedEntry
          ? new Date(resolvedEntry.timestamp)
          : new Date(c.updatedAt);
        return sum + (resolvedAt - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedComplaints.length);
    }

    // Complaints per day (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyData = [];
    for (let i = 0; i < 30; i++) {
      const day = new Date(thirtyDaysAgo);
      day.setDate(day.getDate() + i);
      const dayEnd = new Date(day);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = complaints.filter((c) => {
        const d = new Date(c.createdAt);
        return d >= day && d < dayEnd;
      }).length;

      dailyData.push({
        date: day.toISOString().slice(0, 10),
        count,
      });
    }

    // Complaints per week (last 12 weeks)
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(
      twelveWeeksAgo.getDate() - twelveWeeksAgo.getDay() - 7 * 11,
    );
    twelveWeeksAgo.setHours(0, 0, 0, 0);

    const weeklyData = [];
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(twelveWeeksAgo);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = complaints.filter((c) => {
        const d = new Date(c.createdAt);
        return d >= weekStart && d < weekEnd;
      }).length;

      weeklyData.push({
        week: `W${i + 1}`,
        start: weekStart.toISOString().slice(0, 10),
        count,
      });
    }

    // Response rate: percentage of complaints not "Open"
    const responseRate =
      total > 0
        ? Math.round(((inProgress + resolved + rejected) / total) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        statusDistribution: { open, inProgress, resolved, rejected, total },
        avgResolutionHours,
        responseRate,
        dailyTrend: dailyData,
        weeklyTrend: weeklyData,
      },
    });
  } catch (error) {
    console.error("[AdminRoutes] Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "fullName email hostel roomNumber rollNumber")
      .sort({ createdAt: -1 });

    const formattedComplaints = complaints.map((complaint) => ({
      id: complaint._id,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status,
      hostel: complaint.hostel,
      roomNumber: complaint.roomNumber,
      dateSubmitted: complaint.createdAt,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      images: complaint.images || [],
      availability: complaint.availability || [],
      statusHistory: complaint.statusHistory || [],
      rejectionReason: complaint.rejectionReason,
      rejectedBy: complaint.rejectedBy,
      rejectedAt: complaint.rejectedAt,
      student: {
        name: complaint.userId?.fullName || "Unknown",
        email: complaint.userId?.email || "",
        hostel: complaint.userId?.hostel || complaint.hostel || "N/A",
        roomNumber:
          complaint.userId?.roomNumber || complaint.roomNumber || "N/A",
        rollNumber: complaint.userId?.rollNumber || null,
      },
    }));

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      complaints: formattedComplaints,
    });
  } catch (error) {
    console.error("[AdminRoutes] Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
    });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const currentStatus = complaint.status;
    const validTransitions = {
      Open: ["In Progress"],
      "In Progress": ["Resolved"],
      Resolved: [],
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${status}". Allowed: ${validTransitions[currentStatus]?.join(", ") || "None"}`,
      });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      timestamp: new Date(),
    });
    await complaint.save();

    // Create notification for the student
    const now = new Date();
    const timeStr = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const message =
      status === "In Progress"
        ? `Your complaint "${complaint.title}" was marked In Progress at ${timeStr}`
        : `Your complaint "${complaint.title}" was Resolved on ${timeStr}`;

    await Notification.create({
      userId: complaint.userId,
      complaintId: complaint._id,
      complaintTitle: complaint.title,
      oldStatus: currentStatus,
      newStatus: status,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Complaint status updated to "${status}"`,
      complaint: {
        id: complaint._id,
        title: complaint.title,
        status: complaint.status,
        updatedAt: complaint.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update complaint status",
    });
  }
};

exports.rejectComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    if (rejectionReason.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason cannot exceed 200 characters",
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (complaint.status === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Complaint is already rejected",
      });
    }

    if (complaint.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Cannot reject a resolved complaint",
      });
    }

    complaint.status = "Rejected";
    complaint.rejectionReason = rejectionReason.trim();
    complaint.rejectedBy = req.user._id;
    complaint.rejectedAt = new Date();
    complaint.statusHistory.push({
      status: "Rejected",
      timestamp: new Date(),
    });
    await complaint.save();

    // Create notification for the student
    const now = new Date();
    const timeStr = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const message = `Your complaint "${complaint.title}" was rejected: ${rejectionReason}`;

    await Notification.create({
      userId: complaint.userId,
      complaintId: complaint._id,
      complaintTitle: complaint.title,
      oldStatus:
        complaint.statusHistory[complaint.statusHistory.length - 2]?.status,
      newStatus: "Rejected",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Complaint rejected successfully",
      complaint: {
        id: complaint._id,
        title: complaint.title,
        status: complaint.status,
        rejectionReason: complaint.rejectionReason,
        rejectedAt: complaint.rejectedAt,
      },
    });
  } catch (error) {
    console.error("Error rejecting complaint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject complaint",
    });
  }
};

// Get all students with complaint counts
exports.getAllStudents = async (req, res) => {
  try {
    const User = require("../models/User");

    // Get all students
    const students = await User.find({ role: "student" })
      .select(
        "fullName email rollNumber university hostel roomNumber createdAt",
      )
      .sort({ createdAt: -1 });

    // Get complaint counts for each student
    const studentsWithCounts = await Promise.all(
      students.map(async (student) => {
        const totalComplaints = await Complaint.countDocuments({
          userId: student._id,
        });
        const openComplaints = await Complaint.countDocuments({
          userId: student._id,
          status: "Open",
        });
        const inProgressComplaints = await Complaint.countDocuments({
          userId: student._id,
          status: "In Progress",
        });
        const resolvedComplaints = await Complaint.countDocuments({
          userId: student._id,
          status: "Resolved",
        });
        const rejectedComplaints = await Complaint.countDocuments({
          userId: student._id,
          status: "Rejected",
        });

        return {
          id: student._id,
          fullName: student.fullName,
          email: student.email,
          rollNumber: student.rollNumber || null,
          university: student.university,
          hostel: student.hostel,
          roomNumber: student.roomNumber,
          registeredAt: student.createdAt,
          complaintStats: {
            total: totalComplaints,
            open: openComplaints,
            inProgress: inProgressComplaints,
            resolved: resolvedComplaints,
            rejected: rejectedComplaints,
          },
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: studentsWithCounts.length,
      students: studentsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

// Get student details with complaints
exports.getStudentDetails = async (req, res) => {
  try {
    const User = require("../models/User");
    const { studentId } = req.params;

    const student = await User.findById(studentId).select(
      "fullName email rollNumber university hostel roomNumber createdAt",
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all complaints by this student
    const complaints = await Complaint.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .select("title status createdAt description hostel roomNumber");

    // Get complaint counts by status
    const totalComplaints = complaints.length;
    const openComplaints = complaints.filter((c) => c.status === "Open").length;
    const inProgressComplaints = complaints.filter(
      (c) => c.status === "In Progress",
    ).length;
    const resolvedComplaints = complaints.filter(
      (c) => c.status === "Resolved",
    ).length;
    const rejectedComplaints = complaints.filter(
      (c) => c.status === "Rejected",
    ).length;

    // Get recent 5 complaints
    const recentComplaints = complaints.slice(0, 5).map((c) => ({
      id: c._id,
      title: c.title,
      status: c.status,
      createdAt: c.createdAt,
      description: c.description,
      hostel: c.hostel,
      roomNumber: c.roomNumber,
    }));

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        rollNumber: student.rollNumber || null,
        university: student.university,
        hostel: student.hostel,
        roomNumber: student.roomNumber,
        registeredAt: student.createdAt,
      },
      complaintStats: {
        total: totalComplaints,
        open: openComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        rejected: rejectedComplaints,
      },
      recentComplaints,
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student details",
    });
  }
};

const Complaint = require("../models/Complaint");

exports.getHealth = (req, res) => {
    console.log("[AdminRoutes] Health check - Admin routes working");
    res.status(200).json({
        success: true,
        message: "Admin routes are operational",
    });
};

exports.getAllComplaints = async (req, res) => {
    console.log("[AdminRoutes] GET /complaints requested");
    try {
        console.log("[AdminRoutes] Fetching all complaints...");

        const complaints = await Complaint.find()
            .populate("userId", "fullName email hostel roomNumber")
            .sort({ createdAt: -1 });

        console.log(`[AdminRoutes] Found ${complaints.length} complaints`);

        const formattedComplaints = complaints.map((complaint) => ({
            id: complaint._id,
            title: complaint.title,
            description: complaint.description,
            status: complaint.status,
            hostel: complaint.hostel,
            roomNumber: complaint.roomNumber,
            dateSubmitted: complaint.createdAt,
            student: {
                name: complaint.userId?.fullName || "Unknown",
                email: complaint.userId?.email || "",
                hostel: complaint.userId?.hostel || complaint.hostel || "N/A",
                roomNumber: complaint.userId?.roomNumber || complaint.roomNumber || "N/A",
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
        await complaint.save();

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

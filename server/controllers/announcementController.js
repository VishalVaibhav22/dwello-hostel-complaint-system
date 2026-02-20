const Announcement = require("../models/Announcement");

// GET /api/announcements — all announcements (students & admin)
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

// GET /api/announcements/unseen-count — count of unseen announcements for logged-in student
exports.getUnseenCount = async (req, res) => {
  try {
    const count = await Announcement.countDocuments({
      seenBy: { $ne: req.user._id },
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error fetching unseen count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unseen count",
    });
  }
};

// PUT /api/announcements/mark-seen — mark all announcements as seen by this student
exports.markAllSeen = async (req, res) => {
  try {
    await Announcement.updateMany(
      { seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id } },
    );

    res.status(200).json({
      success: true,
      message: "All announcements marked as seen",
    });
  } catch (error) {
    console.error("Error marking announcements as seen:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark announcements as seen",
    });
  }
};

// POST /api/announcements — create announcement (admin only, handled by admin routes)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, tag } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      tag: tag || "General",
      createdBy: req.user._id,
    });

    const populated = await announcement.populate("createdBy", "fullName");

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

// DELETE /api/announcements/:id — delete announcement (admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Announcement deleted",
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};

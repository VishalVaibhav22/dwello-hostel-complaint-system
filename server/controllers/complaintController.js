const Complaint = require('../models/Complaint');
const { validationResult } = require('express-validator');

exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaints',
            error: error.message
        });
    }
};

exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        if (complaint.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this complaint'
            });
        }

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch complaint',
            error: error.message
        });
    }
};

exports.createComplaint = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { title, description } = req.body;

        const complaint = new Complaint({
            title,
            description,
            userId: req.user._id,
            userName: req.user.fullName,
            userEmail: req.user.email,
            hostel: req.user.hostel,
            roomNumber: req.user.roomNumber,
            status: 'Open'
        });

        await complaint.save();

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: complaint
        });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create complaint',
            error: error.message
        });
    }
};

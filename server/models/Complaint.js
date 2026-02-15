const mongoose = require('mongoose');

/**
 * COMPLAINT SCHEMA
 * 
 * Database: ThaparUniversity
 * Collection: complaints
 * 
 * This is the SINGLE SOURCE OF TRUTH for ALL complaints.
 * 
 * IMPORTANT DESIGN PRINCIPLES:
 * - All complaints from all hostels are stored in this single collection
 * - NO separate collections per hostel (industry standard)
 * - Hostel field is copied from student's profile at complaint creation time
 * - Admin updates modify this same document (single source of truth)
 * - Student dashboard reads from this same collection
 * - No duplicate complaint data anywhere
 */

const complaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a complaint title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a complaint description'],
        trim: true,
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    // STATUS FIELD
    // Default: "Open" when complaint is created
    // Admin can update: Open → In Progress → Resolved
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open'
    },
    // HOSTEL FIELD
    // Copied from student's profile at complaint creation time
    // Restricted to the same values as User.hostel
    hostel: {
        type: String,
        required: [true, 'Hostel is required'],
        enum: {
            values: ['Hostel A', 'Hostel O', 'Hostel M'],
            message: 'Hostel must be one of: Hostel A, Hostel O, Hostel M'
        },
        trim: true
    },
    // Room number copied from student's profile
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        trim: true
    },
    // USER REFERENCE
    // Links complaint to the student who created it
    // Uses MongoDB reference for data integrity
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Store student details for quick access (denormalization for performance)
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
complaintSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;

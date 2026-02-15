// Test script to check database state
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Complaint = require('./models/Complaint');

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[Database] Connected to ThaparUniversity database\n');

        // Get all users
        const users = await User.find();
        console.log(`[Database] Total Users: ${users.length}\n`);

        if (users.length > 0) {
            console.log('Users in database:');
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. ${user.email}`);
                console.log(`   Full Name: ${user.fullName}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Hostel: ${user.hostel || 'N/A (admin)'}`);
                console.log(`   Room: ${user.roomNumber || 'N/A (admin)'}`);
                console.log(`   Created: ${user.createdAt}`);
            });
        }

        // Get all complaints
        const complaints = await Complaint.find().populate('userId');
        console.log(`\n\n[Database] Total Complaints: ${complaints.length}\n`);

        if (complaints.length > 0) {
            console.log('Complaints in database:');
            complaints.forEach((c, index) => {
                console.log(`\n${index + 1}. ${c.title}`);
                console.log(`   Status: ${c.status}`);
                console.log(`   Hostel: ${c.hostel}`);
                console.log(`   Room: ${c.roomNumber}`);
                console.log(`   Student: ${c.userId?.fullName || 'Unknown'}`);
                console.log(`   Email: ${c.userId?.email || 'N/A'}`);
            });
        }

        console.log('\n[Database] Database check complete\n');

    } catch (error) {
        console.error('\n[Error]:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkDatabase();

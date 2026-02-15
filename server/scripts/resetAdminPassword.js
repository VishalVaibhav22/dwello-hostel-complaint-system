// Reset admin password to 000000
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function resetAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[Reset] Connected to ThaparUniversity database\n');

        // Find admin user
        const admin = await User.findOne({ email: 'vishal22.vaibhav@gmail.com' });

        if (!admin) {
            console.log('[Reset] Admin user not found!');
            return;
        }

        console.log('Found admin user:', admin.email);

        // Hash new password
        const newPassword = '000000';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password directly
        await User.updateOne(
            { _id: admin._id },
            { $set: { password: hashedPassword } }
        );

        console.log('[Reset] Admin password reset successfully!\n');

        // Verify the new password
        const updatedAdmin = await User.findById(admin._id);
        const isMatch = await bcrypt.compare(newPassword, updatedAdmin.password);

        console.log('[Reset] Password Verification:');
        console.log(`  Testing password: "${newPassword}"`);
        console.log(`  Result: ${isMatch ? 'CORRECT' : 'WRONG'}`);

        if (isMatch) {
            console.log('\n[Reset] Reset successful. You can now login with the new credentials.');
        }

    } catch (error) {
        console.error('\n[Error]:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('[Reset] Database connection closed');
        process.exit(0);
    }
}

resetAdminPassword();

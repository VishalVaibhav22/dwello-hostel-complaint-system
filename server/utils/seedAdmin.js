const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
            console.warn('Admin seeding skipped: Missing environment variables.');
            return;
        }

        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) return;

        const newAdmin = new User({
            fullName: 'System Admin',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin'
        });

        await newAdmin.save();
        console.log(`Admin user created: ${ADMIN_EMAIL}`);

    } catch (error) {
        console.error('Admin seeding failed:', error.message);
    }
};

module.exports = seedAdmin;

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/database';

/**
 * Seed default admin account
 * Username: admin
 * Password: admin
 */
async function seedAdmin() {
    try {
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });

        if (existingAdmin) {
            console.log('✅ Admin account already exists');
            return;
        }

        // Create admin account
        const hashedPassword = await bcrypt.hash('admin', 10);

        const adminUser = new User({
            username: 'admin',
            email: 'admin@aurajudge.com',
            password: hashedPassword,
            fullName: 'System Administrator',
            role: 'Admin',
            rank: 4, // ADMIN rank
            verified: true,
            emailVerified: true,
            stats: {
                problemsSolved: 0,
                points: 0,
                rank: 1
            }
        });

        await adminUser.save();
        console.log('✅ Default admin account created successfully');
        console.log('   Username: admin');
        console.log('   Password: admin');
        console.log('   ⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin account:', error);
    } finally {
        await mongoose.connection.close();
    }
}

// Run if executed directly
if (require.main === module) {
    seedAdmin();
}

export default seedAdmin;

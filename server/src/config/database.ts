import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aura-judge';

export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

export default connectDatabase;

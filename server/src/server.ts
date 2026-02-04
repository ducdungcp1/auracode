import app from './app';
import connectDatabase from './config/database';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDatabase();

        // Start Express server
        app.listen(PORT, () => {
            console.log('🚀 ========================================');
            console.log(`🚀 Aura Judge API Server`);
            console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🚀 API URL: http://localhost:${PORT}`);
            console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
            console.log('🚀 ========================================');
            console.log('📋 Available endpoints:');
            console.log('   - POST /api/auth/register');
            console.log('   - POST /api/auth/login');
            console.log('   - POST /api/auth/send-otp-email');
            console.log('   - POST /api/auth/send-otp-sms');
            console.log('   - POST /api/auth/verify-otp');
            console.log('   - POST /api/auth/refresh');
            console.log('   - GET  /api/problems');
            console.log('   - GET  /api/problems/:id');
            console.log('   - POST /api/problems (Teacher+)');
            console.log('   - POST /api/judge/submit');
            console.log('   - GET  /api/judge/submission/:id');
            console.log('   - GET  /api/judge/submissions');
            console.log('🚀 ========================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⚠️  SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();

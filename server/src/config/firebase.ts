import admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const serviceAccountPath = path.join(__dirname, '../../config/firebase-service-account.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId: process.env.FIREBASE_PROJECT_ID || 'enable-authenticator-d013e',
    });
}

const auth = admin.auth();

// Helper functions for Firebase Auth
export const firebaseAuth = {
    /**
     * Create a new user with email and password
     */
    async createUser(email: string, password: string, displayName?: string) {
        try {
            const userRecord = await auth.createUser({
                email,
                password,
                displayName,
                emailVerified: false,
            });
            return userRecord;
        } catch (error: any) {
            throw new Error(`Firebase create user error: ${error.message}`);
        }
    },

    /**
     * Send email verification OTP
     */
    async sendEmailVerification(email: string): Promise<string> {
        try {
            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // For production, you would send this via email service
            // For now, we'll return it for testing
            console.log(`📧 Email OTP for ${email}: ${otp}`);

            return otp;
        } catch (error: any) {
            throw new Error(`Send email OTP error: ${error.message}`);
        }
    },

    /**
     * Send SMS verification OTP
     */
    async sendSMSVerification(phoneNumber: string): Promise<string> {
        try {
            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // For production with Twilio, uncomment below:
            // await sendSMSViaTwilio(phoneNumber, `Your Aura Judge verification code is: ${otp}`);

            console.log(`📱 SMS OTP for ${phoneNumber}: ${otp}`);

            return otp;
        } catch (error: any) {
            throw new Error(`Send SMS OTP error: ${error.message}`);
        }
    },

    /**
     * Verify Firebase ID token
     */
    async verifyIdToken(idToken: string) {
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            return decodedToken;
        } catch (error: any) {
            throw new Error(`Token verification error: ${error.message}`);
        }
    },

    /**
     * Get user by email
     */
    async getUserByEmail(email: string) {
        try {
            const userRecord = await auth.getUserByEmail(email);
            return userRecord;
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                return null;
            }
            throw new Error(`Get user error: ${error.message}`);
        }
    },

    /**
     * Get user by phone number
     */
    async getUserByPhone(phoneNumber: string) {
        try {
            const userRecord = await auth.getUserByPhoneNumber(phoneNumber);
            return userRecord;
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                return null;
            }
            throw new Error(`Get user error: ${error.message}`);
        }
    },

    /**
     * Update user email verified status
     */
    async updateEmailVerified(uid: string, verified: boolean) {
        try {
            await auth.updateUser(uid, { emailVerified: verified });
        } catch (error: any) {
            throw new Error(`Update user error: ${error.message}`);
        }
    },

    /**
     * Delete user
     */
    async deleteUser(uid: string) {
        try {
            await auth.deleteUser(uid);
        } catch (error: any) {
            throw new Error(`Delete user error: ${error.message}`);
        }
    },
};

export { admin };
export default firebaseAuth;

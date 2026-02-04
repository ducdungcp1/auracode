import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { UserRank } from '../models/User';
import OTP from '../models/OTP';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt';
import firebaseAuth from '../config/firebase';

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;

/**
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, fullName, phone, studentId, dob, role } = req.body;

        // Validation
        if (!username || !email || !password || !fullName) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            res.status(400).json({ error: 'User with this email or username already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Determine role and rank
        const userRole = role || 'User';
        let userRank = UserRank.USER;
        if (studentId) userRank = UserRank.STUDENT;
        if (userRole === 'Teacher') userRank = UserRank.TEACHER;
        if (userRole === 'Admin') userRank = UserRank.ADMIN;

        // Create user
        const newUser = new User({
            username,
            email,
            phone,
            password: hashedPassword,
            fullName,
            studentId,
            dob: dob ? new Date(dob) : undefined,
            role: userRole,
            rank: userRank,
            verified: false,
            emailVerified: false,
            phoneVerified: false,
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
                role: newUser.role,
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
};

/**
 * Send OTP via email
 */
export const sendEmailOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Generate OTP
        const otpCode = await firebaseAuth.sendEmailVerification(email);

        // Save OTP to database
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Delete old OTPs for this email
        await OTP.deleteMany({ identifier: email, type: 'email' });

        const newOTP = new OTP({
            identifier: email,
            otp: otpCode,
            type: 'email',
            expiresAt,
        });

        await newOTP.save();

        res.status(200).json({
            message: 'OTP sent to email successfully',
            expiresIn: OTP_EXPIRY_MINUTES * 60, // in seconds
            // For development, include OTP in response
            ...(process.env.NODE_ENV === 'development' && { otp: otpCode }),
        });
    } catch (error: any) {
        console.error('Send email OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP', details: error.message });
    }
};

/**
 * Send OTP via SMS
 */
export const sendSMSOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone } = req.body;

        if (!phone) {
            res.status(400).json({ error: 'Phone number is required' });
            return;
        }

        // Check if user exists
        const user = await User.findOne({ phone });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Generate OTP
        const otpCode = await firebaseAuth.sendSMSVerification(phone);

        // Save OTP to database
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Delete old OTPs for this phone
        await OTP.deleteMany({ identifier: phone, type: 'sms' });

        const newOTP = new OTP({
            identifier: phone,
            otp: otpCode,
            type: 'sms',
            expiresAt,
        });

        await newOTP.save();

        res.status(200).json({
            message: 'OTP sent to phone successfully',
            expiresIn: OTP_EXPIRY_MINUTES * 60,
            // For development, include OTP in response
            ...(process.env.NODE_ENV === 'development' && { otp: otpCode }),
        });
    } catch (error: any) {
        console.error('Send SMS OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP', details: error.message });
    }
};

/**
 * Verify OTP and login
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier, otp, type } = req.body;

        if (!identifier || !otp || !type) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Find OTP record
        const otpRecord = await OTP.findOne({
            identifier,
            type,
            verified: false,
        }).sort({ createdAt: -1 }); // Get latest OTP

        if (!otpRecord) {
            res.status(404).json({ error: 'No OTP found or OTP already used' });
            return;
        }

        // Check expiration
        if (new Date() > otpRecord.expiresAt) {
            res.status(400).json({ error: 'OTP expired' });
            return;
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            res.status(400).json({ error: 'Invalid OTP' });
            return;
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        // Find user and update verification status
        const user = await User.findOne({
            [type === 'email' ? 'email' : 'phone']: identifier,
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Update verification status
        if (type === 'email') {
            user.emailVerified = true;
        } else {
            user.phoneVerified = true;
        }
        user.verified = user.emailVerified || user.phoneVerified;
        await user.save();

        // Generate tokens
        const tokens = generateTokenPair({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            rank: user.rank,
        });

        res.status(200).json({
            message: 'OTP verified successfully',
            tokens,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                verified: user.verified,
                emailVerified: user.emailVerified,
                phoneVerified: user.phoneVerified,
            },
        });
    } catch (error: any) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'OTP verification failed', details: error.message });
    }
};

/**
 * Login with username/password (alternative to OTP)
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        // Find user
        const user = await User.findOne({
            $or: [{ username }, { email: username }],
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate tokens
        const tokens = generateTokenPair({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            rank: user.rank,
        });

        res.status(200).json({
            message: 'Login successful',
            tokens,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                verified: user.verified,
                stats: user.stats,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token is required' });
            return;
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Generate new token pair
        const tokens = generateTokenPair({
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            rank: decoded.rank,
        });

        res.status(200).json({
            message: 'Token refreshed successfully',
            tokens,
        });
    } catch (error: any) {
        console.error('Refresh token error:', error);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
};

/**
 * Logout (client-side token removal, optionally blacklist token)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        // In a production system, you might want to blacklist the token
        // For now, we just send success response
        res.status(200).json({ message: 'Logout successful' });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

export default {
    register,
    sendEmailOTP,
    sendSMSOTP,
    verifyOTP,
    login,
    refreshToken,
    logout,
};

import express from 'express';
import {
    register,
    sendEmailOTP,
    sendSMSOTP,
    verifyOTP,
    login,
    refreshToken,
    logout,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/send-otp-email
 * @desc    Send OTP to user's email
 * @access  Public
 */
router.post('/send-otp-email', sendEmailOTP);

/**
 * @route   POST /api/auth/send-otp-sms
 * @desc    Send OTP to user's phone
 * @access  Public
 */
router.post('/send-otp-sms', sendSMSOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login user
 * @access  Public
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /api/auth/login
 * @desc    Login with username/password
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

export default router;

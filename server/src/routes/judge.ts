import express from 'express';
import { submitCode, getSubmission, getUserSubmissions } from '../controllers/judgeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/judge/submit
 * @desc    Submit code for judging
 * @access  Private
 */
router.post('/submit', authenticate, submitCode);

/**
 * @route   GET /api/judge/submission/:id
 * @desc    Get submission details
 * @access  Private
 */
router.get('/submission/:id', authenticate, getSubmission);

/**
 * @route   GET /api/judge/submissions
 * @desc    Get user's submissions
 * @access  Private
 */
router.get('/submissions', authenticate, getUserSubmissions);

export default router;

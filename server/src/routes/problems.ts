import express from 'express';
import {
    getProblems,
    getProblem,
    createProblem,
    updateProblem,
    deleteProblem,
} from '../controllers/problemController';
import { authenticate, requireRank } from '../middleware/auth';
import { UserRank } from '../models/User';

const router = express.Router();

/**
 * @route   GET /api/problems
 * @desc    Get all problems with filters
 * @access  Public
 */
router.get('/', getProblems);

/**
 * @route   GET /api/problems/:id
 * @desc    Get problem details
 * @access  Public
 */
router.get('/:id', getProblem);

/**
 * @route   POST /api/problems
 * @desc    Create new problem
 * @access  Private (Teacher/Admin)
 */
router.post('/', authenticate, requireRank(UserRank.TEACHER), createProblem);

/**
 * @route   PUT /api/problems/:id
 * @desc    Update problem
 * @access  Private (Teacher/Admin)
 */
router.put('/:id', authenticate, requireRank(UserRank.TEACHER), updateProblem);

/**
 * @route   DELETE /api/problems/:id
 * @desc    Delete problem
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireRank(UserRank.ADMIN), deleteProblem);

export default router;

import { Request, Response } from 'express';
import Submission from '../models/Submission';
import Problem from '../models/Problem';
import { judgeSubmission } from '../services/judgeService';

/**
 * Submit code for judging
 */
export const submitCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { problemId, code, language } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!problemId || !code || !language) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Check if problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        // Create submission
        const submission = new Submission({
            userId,
            problemId,
            code,
            language,
            status: 'Pending',
            totalTests: problem.testCases.length,
        });

        await submission.save();

        // Start judging asynchronously
        judgeSubmission(submission._id.toString()).catch((err) => {
            console.error('Judge error:', err);
        });

        res.status(201).json({
            message: 'Submission created successfully',
            submission: {
                id: submission._id,
                problemId: submission.problemId,
                language: submission.language,
                status: submission.status,
                submittedAt: submission.submittedAt,
            },
        });
    } catch (error: any) {
        console.error('Submit code error:', error);
        res.status(500).json({ error: 'Submission failed', details: error.message });
    }
};

/**
 * Get submission status and details
 */
export const getSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const submission = await Submission.findById(id)
            .populate('problemId', 'title difficulty')
            .populate('userId', 'username fullName');

        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }

        // Only allow user to see their own submissions
        if (submission.userId._id.toString() !== userId && req.user?.rank !== 4) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        res.status(200).json({
            submission: {
                id: submission._id,
                problem: submission.problemId,
                user: submission.userId,
                language: submission.language,
                status: submission.status,
                verdict: submission.verdict,
                testsPassed: submission.testsPassed,
                totalTests: submission.totalTests,
                runtime: submission.runtime,
                memory: submission.memory,
                submittedAt: submission.submittedAt,
                judgedAt: submission.judgedAt,
                code: submission.code, // Include code for own submissions
            },
        });
    } catch (error: any) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Failed to get submission', details: error.message });
    }
};

/**
 * Get user's submissions
 */
export const getUserSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { problemId, status, page = 1, limit = 20 } = req.query;

        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const query: any = { userId };
        if (problemId) query.problemId = problemId;
        if (status) query.status = status;

        const submissions = await Submission.find(query)
            .populate('problemId', 'title difficulty')
            .sort({ submittedAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Submission.countDocuments(query);

        res.status(200).json({
            submissions: submissions.map((sub) => ({
                id: sub._id,
                problem: sub.problemId,
                language: sub.language,
                status: sub.status,
                verdict: sub.verdict,
                runtime: sub.runtime,
                memory: sub.memory,
                submittedAt: sub.submittedAt,
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Get user submissions error:', error);
        res.status(500).json({ error: 'Failed to get submissions', details: error.message });
    }
};

export default {
    submitCode,
    getSubmission,
    getUserSubmissions,
};

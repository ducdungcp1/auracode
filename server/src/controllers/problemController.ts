import { Request, Response } from 'express';
import Problem from '../models/Problem';
import User, { UserRank } from '../models/User';

/**
 * Get all problems with filters
 */
export const getProblems = async (req: Request, res: Response): Promise<void> => {
    try {
        const { difficulty, tags, search, page = 1, limit = 20 } = req.query;

        const query: any = {};

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (tags) {
            const tagArray = (tags as string).split(',');
            query.tags = { $in: tagArray };
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const problems = await Problem.find(query)
            .select('-testCases') // Don't send test cases to client
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Problem.countDocuments(query);

        res.status(200).json({
            problems: problems.map((p) => ({
                id: p._id,
                title: p.title,
                difficulty: p.difficulty,
                tags: p.tags,
                solvedCount: p.solvedCount,
                submissionCount: p.submissionCount,
                acceptanceRate: p.acceptanceRate.toFixed(2),
                timeLimit: p.timeLimit,
                memoryLimit: p.memoryLimit,
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        console.error('Get problems error:', error);
        res.status(500).json({ error: 'Failed to get problems', details: error.message });
    }
};

/**
 * Get single problem details
 */
export const getProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const problem = await Problem.findById(id).select('-testCases'); // Don't send hidden test cases

        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        res.status(200).json({
            problem: {
                id: problem._id,
                title: problem.title,
                difficulty: problem.difficulty,
                tags: problem.tags,
                description: problem.description,
                samples: problem.samples,
                timeLimit: problem.timeLimit,
                memoryLimit: problem.memoryLimit,
                solvedCount: problem.solvedCount,
                submissionCount: problem.submissionCount,
                acceptanceRate: problem.acceptanceRate.toFixed(2),
            },
        });
    } catch (error: any) {
        console.error('Get problem error:', error);
        res.status(500).json({ error: 'Failed to get problem', details: error.message });
    }
};

/**
 * Create new problem (Teacher/Admin only)
 */
export const createProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { title, difficulty, tags, description, samples, testCases, timeLimit, memoryLimit } = req.body;

        if (!title || !difficulty || !description || !testCases || testCases.length === 0) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const problem = new Problem({
            title,
            difficulty,
            tags: tags || [],
            description,
            samples: samples || [],
            testCases,
            timeLimit: timeLimit || 2000,
            memoryLimit: memoryLimit || 256,
            createdBy: userId,
        });

        await problem.save();

        res.status(201).json({
            message: 'Problem created successfully',
            problem: {
                id: problem._id,
                title: problem.title,
                difficulty: problem.difficulty,
            },
        });
    } catch (error: any) {
        console.error('Create problem error:', error);
        res.status(500).json({ error: 'Failed to create problem', details: error.message });
    }
};

/**
 * Update problem (Teacher/Admin only)
 */
export const updateProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const problem = await Problem.findByIdAndUpdate(id, updates, { new: true });

        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        res.status(200).json({
            message: 'Problem updated successfully',
            problem: {
                id: problem._id,
                title: problem.title,
                difficulty: problem.difficulty,
            },
        });
    } catch (error: any) {
        console.error('Update problem error:', error);
        res.status(500).json({ error: 'Failed to update problem', details: error.message });
    }
};

/**
 * Delete problem (Admin only)
 */
export const deleteProblem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const problem = await Problem.findByIdAndDelete(id);

        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }

        res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error: any) {
        console.error('Delete problem error:', error);
        res.status(500).json({ error: 'Failed to delete problem', details: error.message });
    }
};

export default {
    getProblems,
    getProblem,
    createProblem,
    updateProblem,
    deleteProblem,
};

import Submission, { ISubmission, SubmissionStatus } from '../models/Submission';
import Problem from '../models/Problem';
import User from '../models/User';
import { executeCode } from './dockerExecutor';

/**
 * Judge a submission
 */
export const judgeSubmission = async (submissionId: string): Promise<void> => {
    try {
        const submission = await Submission.findById(submissionId);
        if (!submission) {
            throw new Error('Submission not found');
        }

        const problem = await Problem.findById(submission.problemId);
        if (!problem) {
            throw new Error('Problem not found');
        }

        // Update status to judging
        submission.status = 'Judging';
        await submission.save();

        const testCases = problem.testCases;
        let passed = 0;
        let totalRuntime = 0;
        let maxMemory = 0;
        let finalVerdict: SubmissionStatus = 'Accepted';

        // Run each test case
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            const result = await executeCode(
                submission.code,
                submission.language,
                testCase.input,
                problem.timeLimit,
                problem.memoryLimit
            );

            // Track maximum runtime and memory
            totalRuntime += result.runtime || 0;
            maxMemory = Math.max(maxMemory, result.memory || 0);

            // Check verdict
            if (result.verdict === 'CE') {
                finalVerdict = 'Compilation Error';
                submission.verdict = result.error || 'Compilation failed';
                break;
            } else if (result.verdict === 'TLE') {
                finalVerdict = 'Time Limit Exceeded';
                submission.verdict = `Time limit exceeded on test case ${i + 1}`;
                break;
            } else if (result.verdict === 'MLE') {
                finalVerdict = 'Memory Limit Exceeded';
                submission.verdict = `Memory limit exceeded on test case ${i + 1}`;
                break;
            } else if (result.verdict === 'RE') {
                finalVerdict = 'Runtime Error';
                submission.verdict = `Runtime error on test case ${i + 1}: ${result.error}`;
                break;
            } else if (result.verdict === 'AC') {
                // Check output correctness
                const expectedOutput = testCase.output.trim();
                const actualOutput = (result.output || '').trim();

                if (expectedOutput === actualOutput) {
                    passed++;
                } else {
                    finalVerdict = 'Wrong Answer';
                    submission.verdict = `Wrong answer on test case ${i + 1}`;
                    break;
                }
            }
        }

        // Update submission results
        submission.status = finalVerdict;
        submission.testsPassed = passed;
        submission.totalTests = testCases.length;
        submission.runtime = Math.round(totalRuntime / testCases.length); // Average runtime
        submission.memory = maxMemory;
        submission.judgedAt = new Date();

        if (finalVerdict === 'Accepted') {
            submission.verdict = 'All test cases passed';

            // Update problem statistics
            problem.solvedCount += 1;
            problem.submissionCount += 1;
            problem.acceptanceRate = (problem.solvedCount / problem.submissionCount) * 100;
            await problem.save();

            // Update user statistics
            const user = await User.findById(submission.userId);
            if (user) {
                // Check if this is first AC for this problem
                const previousAC = await Submission.findOne({
                    userId: submission.userId,
                    problemId: submission.problemId,
                    status: 'Accepted',
                    _id: { $ne: submission._id },
                });

                if (!previousAC) {
                    user.stats.problemsSolved += 1;
                    user.stats.points += getDifficultyPoints(problem.difficulty);
                    await user.save();
                }
            }
        } else {
            // Update submission count even if not accepted
            problem.submissionCount += 1;
            problem.acceptanceRate = problem.solvedCount > 0
                ? (problem.solvedCount / problem.submissionCount) * 100
                : 0;
            await problem.save();
        }

        await submission.save();

        console.log(`✅ Judged submission ${submissionId}: ${finalVerdict}`);
    } catch (error: any) {
        console.error('Judge error:', error);

        // Mark submission as error
        try {
            await Submission.findByIdAndUpdate(submissionId, {
                status: 'Runtime Error',
                verdict: `Judge system error: ${error.message}`,
                judgedAt: new Date(),
            });
        } catch { }
    }
};

/**
 * Get points based on difficulty
 */
const getDifficultyPoints = (difficulty: string): number => {
    switch (difficulty) {
        case 'Easy':
            return 10;
        case 'Medium':
            return 25;
        case 'Hard':
            return 50;
        default:
            return 10;
    }
};

export default { judgeSubmission };

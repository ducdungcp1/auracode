import mongoose, { Document, Schema } from 'mongoose';

export type SubmissionStatus =
    | 'Pending'
    | 'Judging'
    | 'Accepted'
    | 'Wrong Answer'
    | 'Time Limit Exceeded'
    | 'Memory Limit Exceeded'
    | 'Runtime Error'
    | 'Compilation Error';

export type Language = 'c' | 'cpp' | 'python' | 'java' | 'javascript' | 'typescript' | 'go' | 'rust';

export interface ISubmission extends Document {
    userId: mongoose.Types.ObjectId;
    problemId: mongoose.Types.ObjectId;
    code: string;
    language: Language;
    status: SubmissionStatus;
    verdict: string;
    testsPassed: number;
    totalTests: number;
    runtime: number; // in ms
    memory: number; // in KB
    submittedAt: Date;
    judgedAt?: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        problemId: {
            type: Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
            index: true,
        },
        code: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            enum: ['c', 'cpp', 'python', 'java', 'javascript', 'typescript', 'go', 'rust'],
            required: true,
        },
        status: {
            type: String,
            enum: [
                'Pending',
                'Judging',
                'Accepted',
                'Wrong Answer',
                'Time Limit Exceeded',
                'Memory Limit Exceeded',
                'Runtime Error',
                'Compilation Error',
            ],
            default: 'Pending',
        },
        verdict: {
            type: String,
            default: '',
        },
        testsPassed: {
            type: Number,
            default: 0,
        },
        totalTests: {
            type: Number,
            default: 0,
        },
        runtime: {
            type: Number,
            default: 0,
        },
        memory: {
            type: Number,
            default: 0,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        judgedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for queries
SubmissionSchema.index({ userId: 1, submittedAt: -1 });
SubmissionSchema.index({ problemId: 1 });
SubmissionSchema.index({ status: 1 });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
export default Submission;

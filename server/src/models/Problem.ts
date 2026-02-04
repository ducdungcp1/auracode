import mongoose, { Document, Schema } from 'mongoose';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ITestCase {
    input: string;
    output: string;
    hidden: boolean;
}

export interface ISample {
    input: string;
    output: string;
}

export interface IProblem extends Document {
    title: string;
    difficulty: Difficulty;
    tags: string[];
    description: string;
    samples: ISample[];
    testCases: ITestCase[];
    timeLimit: number; // in milliseconds
    memoryLimit: number; // in MB
    solvedCount: number;
    submissionCount: number;
    acceptanceRate: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: true,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        description: {
            type: String,
            required: true,
        },
        samples: [{
            input: { type: String, required: true },
            output: { type: String, required: true },
        }],
        testCases: [{
            input: { type: String, required: true },
            output: { type: String, required: true },
            hidden: { type: Boolean, default: false },
        }],
        timeLimit: {
            type: Number,
            default: 2000, // 2 seconds
        },
        memoryLimit: {
            type: Number,
            default: 256, // 256 MB
        },
        solvedCount: {
            type: Number,
            default: 0,
        },
        submissionCount: {
            type: Number,
            default: 0,
        },
        acceptanceRate: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ tags: 1 });
ProblemSchema.index({ createdAt: -1 });

export const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
export default Problem;

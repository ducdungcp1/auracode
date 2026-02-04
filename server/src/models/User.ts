import mongoose, { Document, Schema } from 'mongoose';

export enum UserRank {
    USER = 1,
    STUDENT = 2,
    TEACHER = 3,
    ADMIN = 4,
}

export type UserRole = 'User' | 'Student' | 'Teacher' | 'Admin';

export interface IUser extends Document {
    username: string;
    email: string;
    phone?: string;
    password: string;
    fullName: string;
    studentId?: string;
    dob?: Date;
    role: UserRole;
    rank: UserRank;
    verified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    firebaseUid?: string;
    stats: {
        problemsSolved: number;
        points: number;
        rank: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        studentId: {
            type: String,
            trim: true,
        },
        dob: {
            type: Date,
        },
        role: {
            type: String,
            enum: ['User', 'Student', 'Teacher', 'Admin'],
            default: 'User',
        },
        rank: {
            type: Number,
            default: UserRank.USER,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        phoneVerified: {
            type: Boolean,
            default: false,
        },
        firebaseUid: {
            type: String,
            sparse: true,
        },
        stats: {
            problemsSolved: {
                type: Number,
                default: 0,
            },
            points: {
                type: Number,
                default: 0,
            },
            rank: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ 'stats.points': -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;

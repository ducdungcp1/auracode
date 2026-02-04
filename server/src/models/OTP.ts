import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
    identifier: string; // email or phone
    otp: string;
    type: 'email' | 'sms';
    verified: boolean;
    expiresAt: Date;
    createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
    {
        identifier: {
            type: String,
            required: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['email', 'sms'],
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
export default OTP;

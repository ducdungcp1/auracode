import jwt, { Secret } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    rank: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: JWTPayload): TokenPair => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error: any) {
        throw new Error(`Invalid or expired access token: ${error.message}`);
    }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
        return decoded;
    } catch (error: any) {
        throw new Error(`Invalid or expired refresh token: ${error.message}`);
    }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): any => {
    return jwt.decode(token);
};

export default {
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
};

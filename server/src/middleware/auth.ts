import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../config/jwt';
import { UserRank } from '../models/User';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

/**
 * Middleware to verify JWT token from request headers
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            const decoded = verifyAccessToken(token);
            req.user = decoded;
            next();
        } catch (error: any) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
    } catch (error) {
        res.status(500).json({ error: 'Authentication error' });
        return;
    }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
};

/**
 * Middleware to check if user has minimum rank level
 */
export const requireRank = (minRank: UserRank) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (req.user.rank < minRank) {
            res.status(403).json({ error: 'Insufficient rank level' });
            return;
        }

        next();
    };
};

/**
 * Middleware for optional authentication (doesn't fail if no token)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = verifyAccessToken(token);
            req.user = decoded;
        } catch (error) {
            // Token invalid, but we continue anyway
        }
    }

    next();
};

export default {
    authenticate,
    requireRole,
    requireRank,
    optionalAuth,
};

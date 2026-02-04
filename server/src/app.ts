import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import routes
import authRoutes from './routes/auth';
import judgeRoutes from './routes/judge';
import problemRoutes from './routes/problems';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/problems', problemRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Aura Judge API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            judge: '/api/judge',
            problems: '/api/problems',
        },
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

export default app;

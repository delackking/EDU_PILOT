import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import aiRoutes from './routes/ai.js';
import teacherRoutes from './routes/teacher.js';
import parentRoutes from './routes/parent.js';
import gamificationRoutes from './routes/gamification.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5001; // process.env.PORT || 5000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

import fs from 'fs';

// ... imports ...

// Request logging middleware

// Request logging middleware
app.use((req, res, next) => {
    const logMessage = `\n📨 ${new Date().toISOString()} ${req.method} ${req.path}\nHeaders: ${JSON.stringify(req.headers['authorization'] ? { ...req.headers, authorization: 'Bearer [HIDDEN]' } : req.headers)}\n`;
    console.log(logMessage);
    fs.appendFileSync('server.log', logMessage);
    next();
});

// Static files for uploads
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'EduPilot API is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes); // Specific routes first
app.use('/api/parent', parentRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api', studentRoutes); // Generic routes last
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Route not found', path: req.path, method: req.method });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EduPilot Server running on http://localhost:${PORT}`);
    console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
});

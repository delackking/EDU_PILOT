import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

import fs from 'fs';

// Verify JWT token
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('server.log', msg + '\n');
    };

    log('🔐 Auth Middleware:');
    log(`   Header: ${authHeader ? 'Present' : 'Missing'}`);
    log(`   Token: ${token ? 'Present' : 'Missing'}`);

    if (!token) {
        log('❌ No token provided');
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            log(`❌ Token verification failed: ${err.message}`);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        log(`✅ Token verified for user: ${user.email}, Role: ${user.role}`);
        req.user = user;
        next();
    });
};

// Role-based authorization
export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

// Generate JWT token
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            school_id: user.school_id, // Added school_id
            profileId: user.profileId
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

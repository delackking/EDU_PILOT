import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role, ...profileData } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name, and role are required' });
    }

    // Validate role
    if (!['STUDENT', 'TEACHER', 'PARENT'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const insertUser = db.prepare(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
    );
    const result = insertUser.run(email, hashedPassword, name, role);
    const userId = result.lastInsertRowid;

    // Create role-specific profile
    let profileId;
    if (role === 'STUDENT') {
      const { class: studentClass, school, school_pin, preferred_language } = profileData;
      if (!studentClass || studentClass < 1 || studentClass > 8) {
        return res.status(400).json({ error: 'Valid class (1-8) required for students' });
      }

      // Verify School PIN if provided
      if (school_pin) {
        // Optional: Check if pin matches a teacher's school (omitted for flexibility)
      }

      const insertProfile = db.prepare(
        'INSERT INTO student_profiles (user_id, class, school, school_pin, preferred_language) VALUES (?, ?, ?, ?, ?)'
      );
      const profileResult = insertProfile.run(
        userId,
        studentClass,
        school || null,
        school_pin || null,
        preferred_language || 'English'
      );
      profileId = profileResult.lastInsertRowid;
    } else if (role === 'TEACHER') {
      const { school, school_pin, classes, subjects, experience_years, specialization } = profileData;

      if (!school || !school_pin) {
        return res.status(400).json({ error: 'School Name and PIN are required for teachers' });
      }

      const insertProfile = db.prepare(
        'INSERT INTO teacher_profiles (user_id, school, school_pin, classes, subjects, experience_years, specialization) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      const profileResult = insertProfile.run(
        userId,
        school,
        school_pin,
        JSON.stringify(classes || []), // Store as JSON string
        JSON.stringify(subjects || []), // Store as JSON string
        experience_years || null,
        specialization || null
      );
      profileId = profileResult.lastInsertRowid;
    } else if (role === 'PARENT') {
      const { phone, relationship } = profileData;
      const insertProfile = db.prepare(
        'INSERT INTO parent_profiles (user_id, phone, relationship) VALUES (?, ?, ?)'
      );
      const profileResult = insertProfile.run(userId, phone || null, relationship || null);
      profileId = profileResult.lastInsertRowid;
    }

    // Generate token
    const token = generateToken({ id: userId, email, role, profileId });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, name, role, profileId }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get profile ID
    let profileId;
    if (user.role === 'STUDENT') {
      const profile = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(user.id);
      profileId = profile?.id;
    } else if (user.role === 'TEACHER') {
      const profile = db.prepare('SELECT id FROM teacher_profiles WHERE user_id = ?').get(user.id);
      profileId = profile?.id;
    } else if (user.role === 'PARENT') {
      const profile = db.prepare('SELECT id FROM parent_profiles WHERE user_id = ?').get(user.id);
      profileId = profile?.id;
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      profileId
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

export default router;

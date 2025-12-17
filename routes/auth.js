import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const {
      school_id,
      school_pin,
      school_assigned_id,
      password,
      name,
      role,
      email, // Optional
      ...profileData
    } = req.body;

    // Validate required fields
    if (!school_id || !school_pin || !school_assigned_id || !password || !name || !role) {
      return res.status(400).json({ error: 'School, PIN, ID, password, name, and role are required' });
    }

    // Validate role
    if (!['STUDENT', 'TEACHER', 'PARENT'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Verify School and PIN
    const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(school_id);
    if (!school) {
      return res.status(400).json({ error: 'Invalid school selected' });
    }
    if (school.pin !== school_pin) {
      return res.status(400).json({ error: 'Invalid School PIN' });
    }

    // Check if ID exists in this school
    const existingUser = db.prepare('SELECT id FROM users WHERE school_id = ? AND school_assigned_id = ?').get(school_id, school_assigned_id);
    if (existingUser) {
      return res.status(400).json({ error: 'This ID is already registered in this school' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare role details
    let roleDetails = {};
    if (role === 'TEACHER') {
      roleDetails = {
        classes: profileData.classes || [],
        subjects: profileData.subjects || []
      };
    } else if (role === 'STUDENT') {
      roleDetails = {
        class: profileData.class,
        section: profileData.section
      };
    }

    // Insert user
    const insertUser = db.prepare(
      'INSERT INTO users (school_id, school_assigned_id, email, password, name, role, role_details) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const result = insertUser.run(
      school_id,
      school_assigned_id,
      email || null,
      hashedPassword,
      name,
      role,
      JSON.stringify(roleDetails)
    );
    const userId = result.lastInsertRowid;

    // Create role-specific profile (Legacy support / Extended details)
    let profileId;
    if (role === 'STUDENT') {
      const insertProfile = db.prepare(
        'INSERT INTO student_profiles (user_id, class, school, school_pin, preferred_language) VALUES (?, ?, ?, ?, ?)'
      );
      const profileResult = insertProfile.run(
        userId,
        profileData.class || 1,
        school.name,
        school.pin,
        profileData.preferred_language || 'English'
      );
      profileId = profileResult.lastInsertRowid;
    } else if (role === 'TEACHER') {
      const insertProfile = db.prepare(
        'INSERT INTO teacher_profiles (user_id, school, school_pin, classes, subjects, experience_years, specialization) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      const profileResult = insertProfile.run(
        userId,
        school.name,
        school.pin,
        JSON.stringify(profileData.classes || []),
        JSON.stringify(profileData.subjects || []),
        profileData.experience_years || null,
        profileData.specialization || null
      );
      profileId = profileResult.lastInsertRowid;
    } else if (role === 'PARENT') {
      const insertProfile = db.prepare(
        'INSERT INTO parent_profiles (user_id, phone, relationship) VALUES (?, ?, ?)'
      );
      const profileResult = insertProfile.run(userId, profileData.phone || null, profileData.relationship || null);
      profileId = profileResult.lastInsertRowid;
    }

    // Generate token
    const token = generateToken({ id: userId, school_id, role, profileId });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, school_id, school_assigned_id, name, role, profileId }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { school_id, school_assigned_id, password } = req.body;

    if (!school_id || !school_assigned_id || !password) {
      return res.status(400).json({ error: 'School, ID, and password are required' });
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE school_id = ? AND school_assigned_id = ?').get(school_id, school_assigned_id);
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
      school_id: user.school_id,
      role: user.role,
      profileId
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        school_id: user.school_id,
        school_assigned_id: user.school_assigned_id,
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

// Register a new School and Admin
router.post('/register-school', async (req, res) => {
  try {
    const {
      schoolName,
      schoolAddress,
      schoolPin,
      adminName,
      adminEmail,
      adminPassword
    } = req.body;

    if (!schoolName || !schoolPin || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Transaction to create school and admin
    const createSchoolTransaction = db.transaction(() => {
      // 1. Create School
      const insertSchool = db.prepare('INSERT INTO schools (name, address, pin) VALUES (?, ?, ?)');
      const schoolResult = insertSchool.run(schoolName, schoolAddress, schoolPin);
      const schoolId = schoolResult.lastInsertRowid;

      // 2. Create Admin User
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      const insertUser = db.prepare(
        'INSERT INTO users (school_id, school_assigned_id, email, password, name, role, role_details) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );

      // For admins, school_assigned_id can be "ADMIN" or similar, but unique per school. 
      // Let's use "ADMIN" for the main admin.
      const result = insertUser.run(
        schoolId,
        'ADMIN',
        adminEmail,
        hashedPassword,
        adminName,
        'ADMIN',
        JSON.stringify({ type: 'Principal' })
      );
      return { schoolId, userId: result.lastInsertRowid };
    });

    const { schoolId, userId } = createSchoolTransaction();

    // Generate token
    const token = generateToken({ id: userId, school_id: schoolId, role: 'ADMIN' });

    res.status(201).json({
      message: 'School registered successfully',
      token,
      user: { id: userId, school_id: schoolId, name: adminName, role: 'ADMIN' },
      school: { id: schoolId, name: schoolName, pin: schoolPin }
    });

  } catch (error) {
    console.error('School registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Login (Email + Password)
router.post('/login-admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify role
    if (user.role !== 'ADMIN' && user.role !== 'SCHOOL_ADMIN') {
      return res.status(403).json({ error: 'Access denied. Not an admin account.' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      school_id: user.school_id,
      role: user.role,
      email: user.email
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        school_id: user.school_id,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

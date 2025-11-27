import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'edupilot.db');

// Initialize database
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create all tables
function initializeDatabase() {
  console.log('🗄️  Initializing EduPilot Database...');

  // 1. Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('STUDENT', 'TEACHER', 'PARENT')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Student Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      class INTEGER CHECK(class >= 1 AND class <= 8) NOT NULL,
      school TEXT,
      school_pin TEXT,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      preferred_language TEXT DEFAULT 'English',
      learning_style TEXT DEFAULT 'normal',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 3. Teacher Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      school TEXT,
      school_pin TEXT,
      classes TEXT,
      subjects TEXT,
      experience_years INTEGER,
      specialization TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ... (Parent Profiles, Topics, etc. remain unchanged)

  // 16. Student Feedback (CRM)
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      feedback TEXT,
      performance_score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE
    )
  `);

  // 4. Parent Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS parent_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      phone TEXT,
      relationship TEXT CHECK(relationship IN ('Mother', 'Father', 'Guardian')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 5. Topics
  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade INTEGER CHECK(grade >= 1 AND grade <= 8) NOT NULL,
      difficulty INTEGER CHECK(difficulty >= 1 AND difficulty <= 5) DEFAULT 3,
      prerequisites TEXT DEFAULT '[]',
      theory TEXT,
      eli5 TEXT,
      story TEXT,
      examples TEXT,
      source TEXT DEFAULT 'seed',
      custom_chapter_id INTEGER,
      status TEXT DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (custom_chapter_id) REFERENCES custom_chapters(id) ON DELETE CASCADE
    )
  `);

  // 6. Questions
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      type TEXT CHECK(type IN ('MCQ', 'FILL_BLANK', 'SHORT')) NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      difficulty_level INTEGER CHECK(difficulty_level >= 1 AND difficulty_level <= 5) DEFAULT 3,
      estimated_time INTEGER DEFAULT 60,
      source TEXT DEFAULT 'seed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    )
  `);

  // 7. Mastery
  db.exec(`
    CREATE TABLE IF NOT EXISTS mastery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      topic_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('WEAK', 'DEVELOPING', 'MASTERED')) DEFAULT 'WEAK',
      score INTEGER DEFAULT 0,
      last_reviewed DATETIME,
      revision_count INTEGER DEFAULT 0,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
      UNIQUE(student_id, topic_id)
    )
  `);

  // 8. Mistake Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS mistake_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      mistake_type TEXT CHECK(mistake_type IN ('CONCEPTUAL', 'CARELESS')) DEFAULT 'CONCEPTUAL',
      time_taken INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      pattern_notes TEXT,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);

  // 9. Classes
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade INTEGER CHECK(grade >= 1 AND grade <= 8) NOT NULL,
      invite_code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE
    )
  `);

  // 10. Class Enrollments
  db.exec(`
    CREATE TABLE IF NOT EXISTS class_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
      UNIQUE(class_id, student_id)
    )
  `);

  // 11. Parent Children
  db.exec(`
    CREATE TABLE IF NOT EXISTS parent_children (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      relationship TEXT,
      FOREIGN KEY (parent_id) REFERENCES parent_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
      UNIQUE(parent_id, student_id)
    )
  `);

  // 12. Custom Chapters
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      grade INTEGER CHECK(grade >= 1 AND grade <= 8) NOT NULL,
      chapter_name TEXT NOT NULL,
      pdf_path TEXT,
      status TEXT DEFAULT 'processing',
      topics_count INTEGER DEFAULT 0,
      questions_count INTEGER DEFAULT 0,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      published_at DATETIME,
      FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE
    )
  `);

  // 13. Custom Questions
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      type TEXT CHECK(type IN ('MCQ', 'FILL_BLANK', 'LONG')) NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      FOREIGN KEY (chapter_id) REFERENCES custom_chapters(id) ON DELETE CASCADE
    )
  `);

  // 14. Rewards
  db.exec(`
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      xp_earned INTEGER NOT NULL,
      badge TEXT,
      reason TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
    )
  `);

  // 15. Emotion Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS emotion_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      topic_id INTEGER,
      emotion TEXT CHECK(emotion IN ('CONFUSED', 'FOCUSED', 'DISTRACTED', 'BORED')) NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      recommended_action TEXT,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
    )
  `);

  console.log('✅ All 15 tables created successfully!');
  console.log('📊 Database initialized at:', DB_PATH);
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
  db.close();
}

export { db, initializeDatabase };

export function getDatabase() {
  return db;
}


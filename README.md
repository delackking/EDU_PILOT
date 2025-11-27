# 🎓 EduPilot - AI-Powered Personalized Learning Ecosystem

> Transform the Indian schooling experience through intelligent, accessible, affordable technology.

**EduPilot** is a full-stack, AI-powered personalized learning platform designed for students (Classes 1–8), teachers, and parents. It combines adaptive learning, gamification, cognitive analytics, and AI tutoring to create an engaging educational experience.

![EduPilot Dashboard](./docs/screenshots/dashboard.png)

## ✨ Features

### 🧒 Student Portal
- **Personalized Dashboard** with XP, levels, and learning streaks
- **Adaptive Learning** with mastery tracking
- **Interactive Practice Mode** (MCQ, Fill-in-blanks, Long answer)
- **Multiple Learning Modes**: Theory, ELI5, Story Mode, Examples
- **Gamification**: XP system, levels, badges, and streaks
- **Subject Browser** with difficulty indicators
- **Real-time Feedback** and explanations

### 🧑‍🏫 Teacher Portal (Coming Soon)
- AI Chapter Creator (PDF upload → structured content)
- AI Worksheet Generator
- AI Homework Checker
- Class Management
- Student Analytics Dashboard
- Concept Map Builder

### 👨‍👩‍👦 Parent Portal (Coming Soon)
- Child Progress Monitoring
- Predictive Analytics
- Alert System
- Learning Recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd education-app
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Set up environment variables**
```bash
# Copy example env file
copy .env.example .env

# Edit .env and add your configuration
# - JWT_SECRET: Your secret key for JWT tokens
# - GEMINI_API_KEY: Your Google Gemini API key (for AI features)
```

5. **Initialize database and seed data**
```bash
node config/database.js
node config/seed.js
```

6. **Start the application**

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **better-sqlite3** - Fast local database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Gemini API** - AI features (planned)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Chart.js** - Data visualization (planned)

### Database
- **SQLite** - Local-first, cloud-ready database
- 15 tables with foreign key relationships
- Supports students, teachers, parents, topics, questions, mastery tracking, and more

## 📖 Usage

### For Students

1. **Sign Up**
   - Navigate to http://localhost:3000
   - Click "Sign up"
   - Fill in your details (Name, Email, Password, Class)
   - Select "Student" as your role

2. **Explore Subjects**
   - Browse Math, Science, and other subjects
   - View topics organized by difficulty
   - See your progress and mastery levels

3. **Learn Topics**
   - Click on any topic to view content
   - Switch between learning modes:
     - **Theory**: Standard explanation
     - **ELI5**: Simplified for easy understanding
     - **Story Mode**: Learn through stories
     - **Examples**: Real-life applications

4. **Practice**
   - Click "Practice" on any topic
   - Answer MCQ, fill-in-blank, or long-answer questions
   - Get immediate feedback and explanations
   - Earn XP and level up!

### For Teachers (Coming Soon)
- Create classes and generate invite codes
- Upload PDF chapters for AI processing
- Generate worksheets automatically
- Check homework with AI assistance

### For Parents (Coming Soon)
- Link child accounts
- Monitor progress
- Receive predictive analytics
- Get alerts for learning gaps

## 🗄️ Database Schema

The application uses 15 interconnected tables:

1. **users** - Core authentication
2. **student_profiles** - Student data (XP, streak, level)
3. **teacher_profiles** - Teacher metadata
4. **parent_profiles** - Parent information
5. **topics** - Curriculum content
6. **questions** - Practice questions
7. **mastery** - Student topic mastery
8. **mistake_logs** - Error pattern analysis
9. **classes** - Teacher-managed classes
10. **class_enrollments** - Student-class relationships
11. **parent_children** - Parent-child links
12. **custom_chapters** - Teacher-uploaded content
13. **custom_questions** - Custom question sets
14. **rewards** - Gamification rewards
15. **emotion_logs** - Emotional state tracking

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Student
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:subject/topics` - Get topics by subject
- `GET /api/topics/:id` - Get single topic
- `GET /api/practice/:topicId/questions` - Get practice questions
- `POST /api/practice/submit` - Submit answer and update mastery
- `GET /api/student/dashboard` - Get dashboard data

### Teacher (Coming Soon)
- `POST /api/classes/create` - Create class
- `POST /api/upload/pdf-chapter` - Upload PDF chapter
- `POST /api/worksheet/generate` - Generate worksheet
- `POST /api/homework/check` - Check homework

### Parent (Coming Soon)
- `POST /api/parent/add-child` - Link child account
- `GET /api/parent/children` - Get children list
- `GET /api/parent/child/:id` - Get child dashboard
- `GET /api/parent/predictions/:id` - Get predictions

## 🎨 Design System

EduPilot features a premium, modern design with:
- **Glassmorphism** effects
- **Gradient backgrounds** and buttons
- **Smooth animations** and transitions
- **Responsive layouts** for all devices
- **Dark theme** with vibrant accents
- **Micro-interactions** for enhanced UX

## 🔐 Security

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (Student/Teacher/Parent)
- Protected API routes
- SQL injection prevention with prepared statements

## 📊 Gamification System

- **XP (Experience Points)**: Earn 10 XP per correct answer
- **Levels**: Progress through levels as you earn XP
- **Streaks**: Maintain daily learning streaks
- **Mastery Tracking**: Topics marked as Weak/Developing/Mastered
- **Badges**: Unlock achievements (planned)
- **Leaderboards**: Compete with classmates (planned)

## 🛣️ Roadmap

### Phase 1 ✅ (Completed)
- [x] Project setup
- [x] Database initialization
- [x] Authentication system
- [x] Student dashboard
- [x] Subject browser
- [x] Topic view with multiple modes
- [x] Practice mode
- [x] Gamification (XP, levels, streaks)

### Phase 2 🚧 (In Progress)
- [ ] Google Gemini API integration
- [ ] AI Tutor with multiple modes
- [ ] Image-based doubt solver
- [ ] Voice-based AI tutor
- [ ] Learning trajectory engine

### Phase 3 📋 (Planned)
- [ ] Teacher portal
- [ ] AI chapter creator
- [ ] Worksheet generator
- [ ] Homework checker
- [ ] Parent portal
- [ ] Predictive analytics

### Phase 4 🎯 (Future)
- [ ] Offline mode
- [ ] Emotion-aware learning
- [ ] Anti-cheat system
- [ ] Leaderboards
- [ ] Reward system
- [ ] Mobile apps

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- React and Vite communities
- All contributors and testers

## 📞 Support

For support, email support@edupilot.com or open an issue in the repository.

---

**Built with ❤️ for students, teachers, and parents**

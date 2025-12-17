import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import UploadChapter from './UploadChapter';
import ChapterManagement from './ChapterManagement';
import MyStudents from '../components/MyStudents';
import StudentWholeProfile from '../components/StudentWholeProfile'; // Updated
import AttendancePanel from '../components/AttendancePanel';
import QuestionGenerator from '../components/QuestionGenerator';
import ClassManager from '../components/ClassManager'; // New
import { teacherAPI } from '../services/api';
import axios from 'axios';
import './TeacherDashboard.css';

function TeacherDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleViewStudent = (studentId) => {
        setSelectedStudent(studentId);
    };

    const closeProfile = () => {
        setSelectedStudent(null);
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <div className="teacher-dashboard">
            {/* Navigation */}
            <nav className="dashboard-nav glass-card">
                <div className="nav-brand">
                    <h2>👨‍🏫 Teacher Portal</h2>
                </div>

                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    {isMenuOpen ? '✕' : '☰'}
                </button>

                <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/teacher" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Dashboard
                    </Link>
                    <Link to="/teacher/classes" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Classes
                    </Link>
                    <Link to="/teacher/upload" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Upload Chapter
                    </Link>
                    <Link to="/teacher/chapters" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        My Chapters
                    </Link>
                    <Link to="/teacher/students" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        My Students
                    </Link>
                    <Link to="/teacher/attendance" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Attendance
                    </Link>
                    <Link to="/teacher/question-generator" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                        Question Gen
                    </Link>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm mobile-only">
                        Logout
                    </button>
                </div>

                <div className="desktop-user-actions">
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                        Logout
                    </button>
                </div>
            </nav>

            {/* Routes */}
            <Routes>
                <Route path="/" element={<TeacherHome user={user} />} />
                <Route path="/classes" element={<ClassManager />} />
                <Route path="/upload" element={<UploadChapter />} />
                <Route path="/chapters" element={<ChapterManagement />} />
                <Route path="/chapters/:id" element={<ChapterManagement />} />
                <Route
                    path="/students"
                    element={<MyStudents onViewProfile={handleViewStudent} />}
                />
                <Route path="/attendance" element={<AttendancePanel />} />
                <Route path="/question-generator" element={<QuestionGeneratorPage />} />
            </Routes>

            {/* Whole Student Profile Modal */}
            {selectedStudent && (
                <StudentWholeProfile
                    studentId={selectedStudent}
                    onClose={closeProfile}
                />
            )}
        </div>
    );
}

function TeacherHome({ user }) {
    const navigate = useNavigate();

    return (
        <div className="teacher-home container">
            <div className="welcome-section fade-in">
                <h1>Welcome back, {user?.name || 'Teacher'}! 👋</h1>
                <p className="text-secondary">Empower your students with AI-generated content</p>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions mt-lg">
                <h2>Quick Actions</h2>
                <div className="actions-grid mt-md">
                    <div
                        className="action-card glass-card hover-lift"
                        onClick={() => navigate('/teacher/upload')}
                    >
                        <div className="action-icon">📄</div>
                        <h3>Upload PDF Chapter</h3>
                        <p>Upload a textbook chapter and let AI create structured topics and questions</p>
                        <button className="btn btn-primary btn-sm mt-sm">
                            Upload Now →
                        </button>
                    </div>

                    <div
                        className="action-card glass-card hover-lift"
                        onClick={() => navigate('/teacher/chapters')}
                    >
                        <div className="action-icon">📚</div>
                        <h3>Manage Chapters</h3>
                        <p>Review, edit, and publish your AI-generated content</p>
                        <button className="btn btn-primary btn-sm mt-sm">
                            View Chapters →
                        </button>
                    </div>

                    <div
                        className="action-card glass-card hover-lift"
                        onClick={() => navigate('/teacher/students')}
                    >
                        <div className="action-icon">👥</div>
                        <h3>My Students</h3>
                        <p>View student progress and add feedback</p>
                        <button className="btn btn-primary btn-sm mt-sm">
                            Manage Class →
                        </button>
                    </div>

                    <div className="action-card glass-card hover-lift disabled">
                        <div className="action-icon">📝</div>
                        <h3>Generate Worksheet</h3>
                        <p>Create custom worksheets with AI (Coming Soon)</p>
                        <span className="badge badge-secondary mt-sm">Coming Soon</span>
                    </div>
                </div>
            </div>

            {/* Features Overview */}
            <div className="features-section mt-xl">
                <h2>How It Works</h2>
                <div className="features-grid mt-md">
                    <div className="feature-item glass-card">
                        <div className="feature-number">1</div>
                        <h3>Upload PDF</h3>
                        <p>Upload any textbook chapter in PDF format (up to 10MB)</p>
                    </div>
                    <div className="feature-item glass-card">
                        <div className="feature-number">2</div>
                        <h3>AI Processing</h3>
                        <p>AI analyzes content, extracts topics, and generates questions</p>
                    </div>
                    <div className="feature-item glass-card">
                        <div className="feature-number">3</div>
                        <h3>Review & Edit</h3>
                        <p>Review AI-generated content and make any necessary edits</p>
                    </div>
                    <div className="feature-item glass-card">
                        <div className="feature-number">4</div>
                        <h3>Publish</h3>
                        <p>Publish approved content for students to access</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuestionGeneratorPage() {
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5001/api/teacher/topics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTopics(response.data.topics);
            } catch (error) {
                console.error('Error fetching topics:', error);
            }
        };
        fetchTopics();
    }, []);

    return <QuestionGenerator topics={topics} />;
}

export default TeacherDashboard;

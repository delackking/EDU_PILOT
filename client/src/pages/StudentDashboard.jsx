import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import SubjectsBrowser from './SubjectsBrowser';
import TopicView from './TopicView';
import Practice from './Practice';
import AITutor from './AITutor';
import Leaderboard from '../components/Leaderboard';
import SpinWheel from '../components/SpinWheel';
import './StudentDashboard.css';

function StudentDashboard({ user, onLogout }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            // For now, create mock dashboard data since we haven't implemented the endpoint yet
            setDashboardData({
                xp: 1250,
                level: 5,
                streak: 7,
                nextLevelXP: 1500,
                weakSubjects: ['Math', 'Science'],
                strongSubjects: ['English'],
                recentActivity: 'Completed Fractions - Half and Quarter',
                nextRecommendedTopic: 'Area and Perimeter'
            });
            setLoading(false);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-center" style={{ height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="student-dashboard">
            {/* Navigation */}
            <nav className="dashboard-nav glass-card">
                <div className="nav-brand">
                    <h2>EduPilot</h2>
                    <span className="badge badge-primary">Student</span>
                </div>

                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    {isMenuOpen ? '✕' : '☰'}
                </button>

                <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/student" className="nav-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    <Link to="/student/subjects" className="nav-link" onClick={() => setIsMenuOpen(false)}>Subjects</Link>
                    <Link to="/student/practice" className="nav-link" onClick={() => setIsMenuOpen(false)}>Practice</Link>
                    <Link to="/student/leaderboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Leaderboard</Link>
                    <Link to="/student/ai-tutor" className="nav-link" onClick={() => setIsMenuOpen(false)}>AI Tutor</Link>

                    <div className="mobile-user-actions">
                        <span className="user-name">{user.name}</span>
                        <button className="btn btn-outline btn-sm" onClick={onLogout}>Logout</button>
                    </div>
                </div>

                <div className="desktop-user-actions">
                    <span className="user-name">{user.name}</span>
                    <button className="btn btn-outline btn-sm" onClick={onLogout}>Logout</button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="dashboard-content">
                <Routes>
                    <Route path="/" element={<DashboardHome data={dashboardData} user={user} />} />
                    <Route path="/subjects" element={<SubjectsBrowser />} />
                    <Route path="/topic/:id" element={<TopicView />} />
                    <Route path="/practice/:topicId" element={<Practice />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/ai-tutor" element={<AITutor />} />
                </Routes>
            </div>
        </div>
    );
}

function DashboardHome({ data, user }) {
    const navigate = useNavigate();
    const xpProgress = (data.xp / data.nextLevelXP) * 100;

    return (
        <div className="dashboard-home container">
            <div className="welcome-section fade-in">
                <h1>Welcome back, {user.name}! 👋</h1>
                <p className="text-secondary">Ready to continue your learning journey?</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-3 mt-lg">
                {/* XP Card */}
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--primary-gradient)' }}>
                        ⭐
                    </div>
                    <div className="stat-content">
                        <h3>{data.xp} XP</h3>
                        <p>Total Experience</p>
                        <div className="progress-bar mt-sm">
                            <div className="progress-fill" style={{ width: `${xpProgress}%` }}></div>
                        </div>
                        <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: '0.5rem' }}>
                            {data.nextLevelXP - data.xp} XP to Level {data.level + 1}
                        </p>
                    </div>
                </div>

                {/* Level Card */}
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--success-gradient)' }}>
                        🏆
                    </div>
                    <div className="stat-content">
                        <h3>Level {data.level}</h3>
                        <p>Current Level</p>
                        <div className="level-badge mt-sm">
                            <span className="badge badge-success">Rising Star</span>
                        </div>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--warning-gradient)' }}>
                        🔥
                    </div>
                    <div className="stat-content">
                        <h3>{data.streak} Days</h3>
                        <p>Learning Streak</p>
                        <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
                            Keep it up!
                        </p>
                    </div>
                </div>
            </div>

            {/* Recommended Topic */}
            <div className="grid grid-2 mt-lg">
                <div className="recommended-section">
                    <h2 className="mb-md">🎯 Recommended for You</h2>
                    <div className="recommended-card glass-card">
                        <div className="recommended-content">
                            <h3>{data.nextRecommendedTopic}</h3>
                            <p className="text-secondary">Based on your learning trajectory, this topic is perfect for you next!</p>
                            <div className="flex gap-sm mt-md">
                                <span className="badge badge-primary">Math</span>
                                <span className="badge badge-warning">Medium Difficulty</span>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/student/subjects')}
                        >
                            Start Learning →
                        </button>
                    </div>
                </div>

                <div className="spin-section">
                    <h2 className="mb-md">🎁 Daily Reward</h2>
                    <SpinWheel onReward={(reward) => console.log('Won:', reward)} />
                </div>
            </div>

            {/* Subject Performance */}
            <div className="performance-section mt-lg">
                <div className="grid grid-2">
                    {/* Strong Subjects */}
                    <div className="glass-card">
                        <h3 className="mb-md">💪 Strong Subjects</h3>
                        <div className="subject-list">
                            {data.strongSubjects.map((subject, index) => (
                                <div key={index} className="subject-item">
                                    <span>{subject}</span>
                                    <span className="badge badge-success">Mastered</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weak Subjects */}
                    <div className="glass-card">
                        <h3 className="mb-md">📚 Needs Practice</h3>
                        <div className="subject-list">
                            {data.weakSubjects.map((subject, index) => (
                                <div key={index} className="subject-item">
                                    <span>{subject}</span>
                                    <span className="badge badge-warning">Developing</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions mt-lg">
                <h2 className="mb-md">⚡ Quick Actions</h2>
                <div className="grid grid-3">
                    <button
                        className="action-card glass-card"
                        onClick={() => navigate('/student/subjects')}
                    >
                        <div className="action-icon">📖</div>
                        <h4>Browse Subjects</h4>
                        <p className="text-secondary">Explore all topics</p>
                    </button>
                    <button
                        className="action-card glass-card"
                        onClick={() => navigate('/student/practice')}
                    >
                        <div className="action-icon">✍️</div>
                        <h4>Practice Mode</h4>
                        <p className="text-secondary">Test your knowledge</p>
                    </button>
                    <button
                        className="action-card glass-card"
                        onClick={() => navigate('/student/ai-tutor')}
                    >
                        <div className="action-icon">🤖</div>
                        <h4>AI Tutor</h4>
                        <p className="text-secondary">Get instant help</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;

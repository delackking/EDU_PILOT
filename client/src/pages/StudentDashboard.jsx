import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import { studentAPI } from '../services/api';
import SpinWheel from '../components/SpinWheel';
import MyTeachers from '../components/MyTeachers';
import SubjectsBrowser from './SubjectsBrowser';
import TopicView from './TopicView';
import Practice from './Practice';


const Leaderboard = () => <div style={{ color: 'white' }}>Leaderboard (Coming Soon)</div>;
const AITutor = () => <div style={{ color: 'white' }}>AI Tutor (Coming Soon)</div>;

function DashboardHome({ data, user, error }) {
    const navigate = useNavigate();

    if (error) {
        return (
            <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        background: '#5b21b6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginTop: '20px'
                    }}
                >
                    Reload Dashboard
                </button>
            </div>
        );
    }

    if (!data) return <div style={{ color: 'white' }}>Loading data...</div>;

    const xpProgress = (data.xp / data.nextLevelXP) * 100;

    // Inline styles for DashboardHome elements
    const dashboardHomeStyles = {
        container: {
            padding: '0 40px',
            maxWidth: '1500px',
            margin: '0 auto',
            textAlign: 'center',
            paddingTop: '30px',
        },
        welcomeSection: {
            marginTop: '50px',
        },
        h1: {
            fontSize: '42px',
            fontWeight: '700',
            marginBottom: '5px',
        },
        pSecondary: {
            fontSize: '18px',
            opacity: '0.7',
            margin: '6px 0',
        },
        // Stats Wrapper (Section 1) - Increased bottom margin for separation
        statsWrapper: {
            marginTop: '60px',
            marginBottom: '60px',
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            flexWrap: 'wrap',
        },
        statCard: {
            width: '200px',
            height: '180px',
            padding: '25px 20px',
            textAlign: 'center',
            borderRadius: '18px',
            background: 'rgba(255, 255, 255, 0.08)', // Glass effect base
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 25px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        statIcon: {
            fontSize: '36px',
            marginBottom: '5px',
        },
        statValue: {
            fontSize: '32px',
            fontWeight: '700',
            marginTop: '5px',
            color: '#a78bfa', // Light purple accent
        },
        statLabel: {
            fontSize: '14px',
            opacity: '0.7',
            marginTop: '2px',
        },
        progressBar: {
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            marginTop: '10px',
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            background: 'linear-gradient(to right, #a78bfa, #5b21b6)',
            borderRadius: '4px',
            transition: 'width 0.5s ease-in-out',
        },
        smallText: {
            fontSize: '12px',
            opacity: '0.6',
            marginTop: '4px',
            display: 'block',
        },

        // Content Grid (Sections 2 & 3 layout)
        contentGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px',
            // Spacing is controlled manually below:
            // Section 2 container below stats gets marginTop: '40px'
            // Section 3 container below Section 2 uses marginBottom: '60px'
            textAlign: 'left',
        },
        sectionHeading: {
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'left',
        },
        recommendedCard: {
            padding: '30px',
            height: '100%',
            borderRadius: '18px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 25px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        },
        recommendedTitle: {
            fontSize: '22px',
            marginTop: '0',
            marginBottom: '10px',
        },
        primaryButton: {
            background: 'linear-gradient(to right, #a78bfa, #5b21b6)',
            border: 'none',
            color: 'white',
            fontWeight: '600',
            padding: '10px 20px',
            borderRadius: '10px',
            cursor: 'pointer',
            marginTop: '15px',
            transition: 'opacity 0.2s',
            alignSelf: 'flex-start',
        },
        // Subject List Styles
        subjectItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
        subjectItemLast: {
            borderBottom: 'none',
        },
        badgeSuccess: {
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: '#10b981',
            color: 'white',
        },
        badgeWarning: {
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: '#f59e0b',
            color: 'white',
        },
    };

    return (
        <div style={dashboardHomeStyles.container}>
            {/* SECTION 1: Welcome & Stats */}
            <div style={dashboardHomeStyles.welcomeSection}>
                <h1 style={dashboardHomeStyles.h1}>Welcome back, {user.name}! 👋</h1>
                <p style={dashboardHomeStyles.pSecondary}>Ready to continue your learning journey?</p>
            </div>

            <div style={dashboardHomeStyles.statsWrapper}>
                <div style={dashboardHomeStyles.statCard}>
                    <div style={dashboardHomeStyles.statIcon}>⭐</div>
                    <div style={dashboardHomeStyles.statValue}>{data.xp} XP</div>
                    <div style={dashboardHomeStyles.statLabel}>Total Experience</div>
                    <div style={dashboardHomeStyles.progressBar}>
                        <div style={{ ...dashboardHomeStyles.progressFill, width: `${xpProgress}%` }}></div>
                    </div>
                    <small style={dashboardHomeStyles.smallText}>{data.nextLevelXP - data.xp} XP to Level {data.level + 1}</small>
                </div>

                <div style={dashboardHomeStyles.statCard}>
                    <div style={dashboardHomeStyles.statIcon}>🏆</div>
                    <div style={dashboardHomeStyles.statValue}>Level {data.level}</div>
                    <div style={dashboardHomeStyles.statLabel}>Current Level</div>
                </div>

                <div style={dashboardHomeStyles.statCard}>
                    <div style={dashboardHomeStyles.statIcon}>🔥</div>
                    <div style={dashboardHomeStyles.statValue}>{data.streak} Days</div>
                    <div style={dashboardHomeStyles.statLabel}>Learning Streak</div>
                </div>
            </div>

            {/* SECTION 2: Recommended Topic and Daily Reward */}
            <div style={{ ...dashboardHomeStyles.contentGrid, marginTop: '40px' }}>
                {/* Recommended Section */}
                <div>
                    <h2 style={dashboardHomeStyles.sectionHeading}>🎯 Recommended for You</h2>
                    <div style={dashboardHomeStyles.recommendedCard}>
                        <div style={{ flexGrow: 1 }}>
                            <h3 style={dashboardHomeStyles.recommendedTitle}>{data.nextRecommendedTopic}</h3>
                            <p style={dashboardHomeStyles.pSecondary}>Based on your learning performance.</p>
                        </div>
                        <button
                            style={dashboardHomeStyles.primaryButton}
                            onClick={() => navigate('/student/subjects')}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Start Learning →
                        </button>
                    </div>
                </div>

                {/* Daily Reward Section */}
                <div className="spin-section">
                    <SpinWheel onReward={(reward) => console.log('Won:', reward)} />
                </div>
            </div>

            {/* SECTION 3: Subjects Overview (Strong & Weak) */}
            <div style={{ ...dashboardHomeStyles.contentGrid, marginBottom: '60px', marginTop: '60px' }}>
                {/* Strong Subjects */}
                <div style={dashboardHomeStyles.recommendedCard}>
                    <h3 style={dashboardHomeStyles.recommendedTitle}>💪 Strong Subjects</h3>
                    {data.strongSubjects.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                ...dashboardHomeStyles.subjectItem,
                                ...(i === data.strongSubjects.length - 1 ? dashboardHomeStyles.subjectItemLast : {})
                            }}
                        >
                            <span>{s}</span>
                            <span style={dashboardHomeStyles.badgeSuccess}>Mastered</span>
                        </div>
                    ))}
                </div>

                {/* Weak Subjects */}
                <div style={dashboardHomeStyles.recommendedCard}>
                    <h3 style={dashboardHomeStyles.recommendedTitle}>📚 Needs Practice</h3>
                    {data.weakSubjects.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                ...dashboardHomeStyles.subjectItem,
                                ...(i === data.weakSubjects.length - 1 ? dashboardHomeStyles.subjectItemLast : {})
                            }}
                        >
                            <span>{s}</span>
                            <span style={dashboardHomeStyles.badgeWarning}>Developing</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Main Component
function StudentDashboard({ user = { name: 'ansh' }, onLogout = () => console.log('Logged out') }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await studentAPI.getDashboard();
            const { profile, mastery } = response.data;

            // Calculate strong and weak subjects based on mastery
            const strongSubjects = mastery
                .filter(m => m.status === 'Mastered')
                .map(m => m.subject);

            const weakSubjects = mastery
                .filter(m => m.status === 'Developing' || m.status === 'Needs Practice')
                .map(m => m.subject);

            setDashboardData({
                xp: profile.xp || 0,
                level: profile.level || 1,
                streak: profile.streak || 0,
                nextLevelXP: (profile.level + 1) * 500, // Simple progression formula
                nextRecommendedTopic: "Algebraic Expressions", // Placeholder for now
                strongSubjects: strongSubjects.length > 0 ? strongSubjects : ["Mathematics"],
                weakSubjects: weakSubjects.length > 0 ? weakSubjects : ["Physics"]
            });
            setError(null);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            setError("Failed to load dashboard data.");
            // Fallback data
            setDashboardData({
                xp: 0,
                level: 1,
                streak: 0,
                nextLevelXP: 500,
                nextRecommendedTopic: "Introduction to Science",
                strongSubjects: [],
                weakSubjects: []
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Inline styles for the component
    const styles = {
        // Global/Page Wrapper Styles
        dashboardWrapper: {
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            fontFamily: '"Inter", sans-serif',
            background: 'radial-gradient(circle at center, #111229 0%, #060616 100%)',
            color: 'white',
        },

        // Navigation Bar Styles 
        nav: {
            width: '100%',
            maxWidth: '1500px',
            margin: '0 auto',
            padding: '12px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: '20px',
            zIndex: 100,
        },
        navBrand: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        logoTitle: {
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
        },
        badgePrimary: {
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: '600',
            backgroundColor: '#5b21b6', // Primary color
            color: 'white',
        },
        navLinks: {
            display: 'flex',
            gap: '25px',
            alignItems: 'center',
            flexGrow: 1,
            justifyContent: 'center',
            margin: '0',
            padding: '0',
            listStyle: 'none',
        },
        navLink: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            padding: '8px 15px',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
        },
        navLinkHover: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#a78bfa',
        },
        userActions: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
        },
        userName: {
            fontSize: '16px',
            fontWeight: '600',
            opacity: '0.8',
        },
        logoutButton: {
            padding: '8px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            background: 'transparent',
            border: '1px solid #a78bfa',
            color: '#a78bfa',
            transition: 'background-color 0.2s, color 0.2s',
        },
        logoutButtonHover: {
            backgroundColor: '#a78bfa',
            color: '#060616',
        },

        // Content Area Styles
        dashboardContent: {
            width: '100%',
            maxWidth: '1500px',
        }
    };

    if (loading) {
        return (
            <div style={{ ...styles.dashboardWrapper, justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: 'white' }}>Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div style={styles.dashboardWrapper}>
            {/* Navigation Bar */}
            <nav style={styles.nav}>
                <div style={styles.navBrand}>
                    <h2 style={styles.logoTitle}>EduPilot</h2>
                    <span style={styles.badgePrimary}>STUDENT</span>
                </div>

                {/* Nav Links */}
                <div style={styles.navLinks}>
                    <Link to="/student" style={styles.navLink} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Dashboard</Link>
                    <Link to="/student/subjects" style={styles.navLink} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Subjects</Link>
                    <Link to="/student/practice" style={styles.navLink} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Practice</Link>
                    <Link to="/student/leaderboard" style={styles.navLink} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Leaderboard</Link>
                    <Link to="/student/ai-tutor" style={styles.navLink} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>AI Tutor</Link>
                    <Link to="/student/teachers" style={styles.navLink} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.navLinkHover.backgroundColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>My Teachers</Link>
                </div>

                {/* User Actions */}
                <div style={styles.userActions}>
                    <span style={styles.userName}>{user.name}</span>
                    <button
                        style={styles.logoutButton}
                        onClick={onLogout}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = styles.logoutButtonHover.backgroundColor;
                            e.currentTarget.style.color = styles.logoutButtonHover.color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = styles.logoutButton.background;
                            e.currentTarget.style.color = styles.logoutButton.color;
                        }}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Dashboard Content Routing */}
            <div style={styles.dashboardContent}>
                <Routes>
                    <Route path="/" element={<DashboardHome data={dashboardData} user={user} error={error} />} />
                    <Route path="/subjects" element={<SubjectsBrowser />} />
                    <Route path="/topic/:id" element={<TopicView />} />
                    <Route path="/practice/:topicId" element={<Practice />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/ai-tutor" element={<AITutor />} />
                    <Route path="/teachers" element={<MyTeachers />} />
                </Routes>
            </div>
        </div>
    );
}

export default StudentDashboard;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ParentDashboard.css';
import ChildLinkModal from '../components/ChildLinkModal';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const ParentDashboard = () => {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchChildAnalytics(selectedChild.id);
            fetchChildAlerts(selectedChild.id);
        }
    }, [selectedChild]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/parent/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChildren(response.data.children);
            if (response.data.children.length > 0 && !selectedChild) {
                setSelectedChild(response.data.children[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setLoading(false);
        }
    };

    const fetchChildAnalytics = async (childId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/parent/child/${childId}/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const fetchChildAlerts = async (childId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/parent/child/${childId}/alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(response.data.alerts);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const handleChildLinked = () => {
        fetchDashboardData();
        setShowLinkModal(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div className="loading-screen">Loading Parent Portal...</div>;

    return (
        <div className="parent-dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar glass-panel">
                <div className="sidebar-header">
                    <h2>👪 Family Hub</h2>
                </div>

                <div className="children-list">
                    <h3>Your Children</h3>
                    {children.map(child => (
                        <div
                            key={child.id}
                            className={`child-card ${selectedChild?.id === child.id ? 'active' : ''}`}
                            onClick={() => setSelectedChild(child)}
                        >
                            <div className="child-avatar-large">
                                {child.name.charAt(0)}
                            </div>
                            <div className="child-details">
                                <h4>{child.name}</h4>
                                <span>Class {child.class}</span>
                            </div>
                        </div>
                    ))}

                    <button className="add-child-btn-sidebar" onClick={() => setShowLinkModal(true)}>
                        + Link Another Child
                    </button>
                </div>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                {selectedChild ? (
                    <>
                        <header className="main-header">
                            <div className="header-welcome">
                                <h1>Hello, Parent! 👋</h1>
                                <p>Here is how <strong>{selectedChild.name}</strong> is doing today.</p>
                            </div>
                            <div className="header-stats">
                                <div className="stat-pill">
                                    <span className="icon">🏆</span>
                                    <span className="value">{selectedChild.xp} XP</span>
                                </div>
                                <div className="stat-pill">
                                    <span className="icon">🔥</span>
                                    <span className="value">{selectedChild.streak} Day Streak</span>
                                </div>
                            </div>
                        </header>

                        {/* Analytics Grid */}
                        {analytics && (
                            <div className="analytics-grid">
                                {/* 1. Overview Cards */}
                                <div className="card glass-panel overview-card grade-card">
                                    <h3>Overall Grade</h3>
                                    <div className="big-value grade">{analytics.overallGrade}</div>
                                    <p>Based on mastery</p>
                                </div>

                                <div className="card glass-panel overview-card attendance-card">
                                    <h3>Attendance</h3>
                                    <div className="attendance-chart-wrapper">
                                        <Doughnut
                                            data={{
                                                labels: ['Present', 'Absent'],
                                                datasets: [{
                                                    data: [analytics.attendance.present, analytics.attendance.absent],
                                                    backgroundColor: ['#10b981', '#ef4444'],
                                                    borderWidth: 0
                                                }]
                                            }}
                                            options={{
                                                cutout: '70%',
                                                plugins: { legend: { display: false } }
                                            }}
                                        />
                                        <div className="attendance-center-text">
                                            {analytics.attendance.percentage}%
                                        </div>
                                    </div>
                                    <div className="attendance-labels">
                                        <span className="present">{analytics.attendance.present} Present</span>
                                        <span className="absent">{analytics.attendance.absent} Absent</span>
                                    </div>
                                </div>

                                {/* 2. AI Insights (Weak Areas) */}
                                <div className="card glass-panel ai-insights-card">
                                    <div className="card-header">
                                        <h3>🤖 AI Insights</h3>
                                        <span className="badge-ai">Smart Detect</span>
                                    </div>
                                    <div className="insights-list">
                                        {analytics.weakAreas.length > 0 ? (
                                            analytics.weakAreas.map((area, idx) => (
                                                <div key={idx} className="insight-item warning">
                                                    <div className="insight-icon">⚠️</div>
                                                    <div className="insight-content">
                                                        <h4>Needs Focus: {area.subject}</h4>
                                                        <p>Struggling with <strong>{area.name}</strong> (Score: {area.score}%)</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="insight-item success">
                                                <div className="insight-icon">✅</div>
                                                <div className="insight-content">
                                                    <h4>All Good!</h4>
                                                    <p>No weak areas detected recently.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Alerts Feed */}
                                        {alerts.map((alert, idx) => (
                                            <div key={`alert-${idx}`} className={`insight-item ${alert.type}`}>
                                                <div className="insight-icon">
                                                    {alert.type === 'critical' ? '🚨' : alert.type === 'success' ? '🎉' : 'ℹ️'}
                                                </div>
                                                <div className="insight-content">
                                                    <h4>{alert.message}</h4>
                                                    <p>{alert.action}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. Subject Performance Chart */}
                                <div className="card glass-panel subject-chart-card">
                                    <h3>Subject Performance</h3>
                                    <div className="chart-container">
                                        <Bar
                                            data={{
                                                labels: analytics.masteryBySubject.map(s => s.subject),
                                                datasets: [{
                                                    label: 'Avg Score',
                                                    data: analytics.masteryBySubject.map(s => s.avg_score),
                                                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                                                    borderRadius: 5
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' } },
                                                    x: { grid: { display: false } }
                                                },
                                                plugins: { legend: { display: false } }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* 4. Recent Activity */}
                                <div className="card glass-panel activity-card">
                                    <h3>Recent Activity</h3>
                                    <div className="activity-list">
                                        {analytics.recentActivity.map((activity, idx) => (
                                            <div key={idx} className="activity-item">
                                                <div className="activity-time">
                                                    {new Date(activity.last_reviewed).toLocaleDateString()}
                                                </div>
                                                <div className="activity-details">
                                                    <h4>{activity.subject}: {activity.topic}</h4>
                                                    <div className="activity-meta">
                                                        <span className={`status-tag ${activity.status}`}>{activity.status}</span>
                                                        <span>Score: {activity.score}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state glass-panel">
                        <h2>Welcome to the Family Hub! 🏠</h2>
                        <p>Link your child's student account to get started.</p>
                        <button className="primary-btn-large" onClick={() => setShowLinkModal(true)}>
                            Link Child Account
                        </button>
                    </div>
                )}
            </main>

            {showLinkModal && (
                <ChildLinkModal
                    onClose={() => setShowLinkModal(false)}
                    onSuccess={handleChildLinked}
                />
            )}
        </div>
    );
};

export default ParentDashboard;

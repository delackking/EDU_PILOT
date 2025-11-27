import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ParentDashboard.css';
import ChildLinkModal from '../components/ChildLinkModal';
import AnalyticsCard from '../components/AnalyticsCard';
import AlertFeed from '../components/AlertFeed';

const ParentDashboard = () => {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

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

    const handleChildLinked = () => {
        fetchDashboardData();
        setShowLinkModal(false);
    };

    if (loading) return <div className="loading">Loading Parent Portal...</div>;

    return (
        <div className="parent-dashboard">
            <header className="dashboard-header">
                <h1>Parent Portal</h1>
                <button className="add-child-btn" onClick={() => setShowLinkModal(true)}>
                    + Link Child
                </button>
            </header>

            <div className="dashboard-content">
                <aside className="children-sidebar">
                    <h3>Your Children</h3>
                    {children.length === 0 ? (
                        <p className="no-children">No children linked yet.</p>
                    ) : (
                        <ul className="children-list">
                            {children.map(child => (
                                <li
                                    key={child.id}
                                    className={`child-item ${selectedChild?.id === child.id ? 'active' : ''}`}
                                    onClick={() => setSelectedChild(child)}
                                >
                                    <div className="child-avatar">{child.name.charAt(0)}</div>
                                    <div className="child-info">
                                        <span className="child-name">{child.name}</span>
                                        <span className="child-grade">Class {child.class}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                <main className="analytics-area">
                    {selectedChild ? (
                        <>
                            <div className="child-header">
                                <h2>{selectedChild.name}'s Progress</h2>
                                <div className="quick-stats">
                                    <div className="stat-badge">⭐ Level {selectedChild.level}</div>
                                    <div className="stat-badge">🔥 {selectedChild.streak} Day Streak</div>
                                    <div className="stat-badge">🏆 {selectedChild.xp} XP</div>
                                </div>
                            </div>

                            <div className="dashboard-grid">
                                <div className="grid-item alerts-section">
                                    <h3>Recent Alerts</h3>
                                    <AlertFeed studentId={selectedChild.id} />
                                </div>
                                <div className="grid-item analytics-section">
                                    <h3>Performance Analytics</h3>
                                    <AnalyticsCard studentId={selectedChild.id} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="welcome-state">
                            <h2>Welcome to EduPilot Parent Portal!</h2>
                            <p>Link your child's account to start monitoring their progress.</p>
                            <button className="primary-btn" onClick={() => setShowLinkModal(true)}>
                                Link Child Account
                            </button>
                        </div>
                    )}
                </main>
            </div>

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

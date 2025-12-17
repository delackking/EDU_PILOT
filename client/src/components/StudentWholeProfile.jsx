import React, { useState, useEffect } from 'react';
import { schoolAPI } from '../services/api';
import './StudentWholeProfile.css';

const StudentWholeProfile = ({ studentId, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, [studentId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await schoolAPI.getStudentWholeProfile(studentId);
            setData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load student profile.');
            setLoading(false);
        }
    };

    if (!studentId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content whole-profile-modal" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                {loading ? (
                    <div className="loading-spinner">Loading Profile...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <>
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {data.profile.name.charAt(0)}
                            </div>
                            <div className="profile-info">
                                <h2>{data.profile.name}</h2>
                                <p className="text-secondary">
                                    ID: {data.profile.school_assigned_id} | Class: {data.profile.class}
                                </p>
                            </div>
                            <div className="profile-stats-mini">
                                <div className="stat-item">
                                    <span className="label">XP</span>
                                    <span className="value">{data.profile.xp}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="label">Level</span>
                                    <span className="value">{data.profile.level}</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                Overview
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
                                onClick={() => setActiveTab('attendance')}
                            >
                                Attendance
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'academics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('academics')}
                            >
                                Academics
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
                                onClick={() => setActiveTab('insights')}
                            >
                                AI Insights
                            </button>
                        </div>

                        <div className="profile-body">
                            {activeTab === 'overview' && (
                                <div className="tab-content overview-tab">
                                    <div className="card summary-card">
                                        <h3>Attendance</h3>
                                        <div className="big-stat">
                                            {data.attendance.percentage}%
                                            <span className="sub-text">Present</span>
                                        </div>
                                    </div>
                                    <div className="card summary-card">
                                        <h3>Weak Areas</h3>
                                        <ul className="list-unstyled">
                                            {data.mistakes.slice(0, 3).map((m, i) => (
                                                <li key={i} className="text-danger">
                                                    ⚠️ {m.topic}
                                                </li>
                                            ))}
                                            {data.mistakes.length === 0 && <li className="text-success">No recent mistakes!</li>}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'attendance' && (
                                <div className="tab-content attendance-tab">
                                    <h3>Attendance History</h3>
                                    <div className="attendance-grid">
                                        {data.attendance.breakdown.map((stat, i) => (
                                            <div key={i} className={`attendance-stat-box status-${stat.status.toLowerCase()}`}>
                                                <span className="count">{stat.count}</span>
                                                <span className="label">{stat.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'academics' && (
                                <div className="tab-content academics-tab">
                                    <h3>Subject Mastery</h3>
                                    <div className="mastery-list">
                                        {data.academics.map((subject, i) => (
                                            <div key={i} className="mastery-item">
                                                <div className="subject-name">{subject.subject}</div>
                                                <div className="progress-bar-container">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${(subject.avg_score / 100) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="score">{Math.round(subject.avg_score)}%</div>
                                            </div>
                                        ))}
                                        {data.academics.length === 0 && <p>No academic data available yet.</p>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'insights' && (
                                <div className="tab-content insights-tab">
                                    <h3>🧠 AI Behavioral Analysis</h3>
                                    <div className="insights-grid">
                                        <div className="insight-card">
                                            <h4>Emotional State</h4>
                                            {data.emotions.map((e, i) => (
                                                <div key={i} className="emotion-row">
                                                    <span>{e.emotion}</span>
                                                    <span className="count">{e.count} times</span>
                                                </div>
                                            ))}
                                            {data.emotions.length === 0 && <p className="text-muted">No emotion logs recorded.</p>}
                                        </div>
                                        <div className="insight-card">
                                            <h4>Recent Struggles</h4>
                                            {data.mistakes.map((m, i) => (
                                                <div key={i} className="mistake-item">
                                                    <p className="question-text">"{m.question.substring(0, 50)}..."</p>
                                                    <span className="badge badge-warning">{m.mistake_type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentWholeProfile;

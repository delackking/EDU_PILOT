import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnalyticsCard.css';

const AnalyticsCard = ({ studentId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (studentId) fetchAnalytics();
    }, [studentId]);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/parent/child/${studentId}/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading stats...</div>;
    if (!data) return null;

    return (
        <div className="analytics-card">
            <div className="analytics-section">
                <h4>Subject Mastery</h4>
                <div className="subject-bars">
                    {data.masteryBySubject.map((item, index) => (
                        <div key={index} className="subject-bar-item">
                            <div className="subject-label">
                                <span>{item.subject}</span>
                                <span>{Math.round(item.avg_score)}%</span>
                            </div>
                            <div className="progress-bg">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${item.avg_score}%`,
                                        backgroundColor: item.avg_score > 80 ? '#00b894' : item.avg_score > 50 ? '#fdcb6e' : '#ff7675'
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="analytics-row">
                <div className="analytics-box weak">
                    <h4>Needs Attention</h4>
                    {data.weakAreas.length === 0 ? (
                        <p className="empty-state">No weak areas found! 🎉</p>
                    ) : (
                        <ul>
                            {data.weakAreas.map((area, idx) => (
                                <li key={idx}>
                                    <span className="topic-name">{area.name}</span>
                                    <span className="score-badge">{area.score}%</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="analytics-box strong">
                    <h4>Strengths</h4>
                    {data.strongAreas.length === 0 ? (
                        <p className="empty-state">Keep practicing to build strengths!</p>
                    ) : (
                        <ul>
                            {data.strongAreas.map((area, idx) => (
                                <li key={idx}>
                                    <span className="topic-name">{area.name}</span>
                                    <span className="score-badge">{area.score}%</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCard;

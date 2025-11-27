import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leaderboard.css';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [type, setType] = useState('class'); // 'class' or 'global'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [type]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/gamification/leaderboard?type=${type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaderboard(response.data.leaderboard);
            setUserRank(response.data.userRank);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLoading(false);
        }
    };

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h3>🏆 Leaderboard</h3>
                <div className="leaderboard-toggles">
                    <button
                        className={`toggle-btn ${type === 'class' ? 'active' : ''}`}
                        onClick={() => setType('class')}
                    >
                        Class
                    </button>
                    <button
                        className={`toggle-btn ${type === 'global' ? 'active' : ''}`}
                        onClick={() => setType('global')}
                    >
                        Global
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading rankings...</div>
            ) : (
                <>
                    <div className="user-rank-banner">
                        <span>Your Rank:</span>
                        <span className="rank-number">#{userRank}</span>
                    </div>

                    <ul className="leaderboard-list">
                        {leaderboard.map((student, index) => (
                            <li key={student.student_id} className={`leaderboard-item rank-${index + 1}`}>
                                <div className="rank-col">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </div>
                                <div className="student-col">
                                    <span className="student-name">{student.name}</span>
                                    <span className="student-level">Lvl {student.level}</span>
                                </div>
                                <div className="xp-col">
                                    {student.xp} XP
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default Leaderboard;

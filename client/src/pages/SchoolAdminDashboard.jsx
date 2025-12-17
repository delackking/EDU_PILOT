import React, { useState, useEffect } from 'react';
import { schoolAPI } from '../services/api';
import StudentProfileModal from '../components/StudentProfileModal';
import './SchoolAdminDashboard.css';

function SchoolAdminDashboard({ user, onLogout }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Placeholder for fetching stats
        setLoading(false);
    }, []);

    return (
        <div className="school-admin-dashboard">
            <header className="dashboard-header">
                <h1>School Admin Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user?.name}</span>
                    <button onClick={onLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <main className="dashboard-content">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Students</h3>
                            <p>0</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Teachers</h3>
                            <p>0</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default SchoolAdminDashboard;

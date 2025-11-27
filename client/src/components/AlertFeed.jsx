import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AlertFeed.css';

const AlertFeed = ({ studentId }) => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (studentId) fetchAlerts();
    }, [studentId]);

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5001/api/parent/child/${studentId}/alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(response.data.alerts);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    if (alerts.length === 0) return <p className="no-alerts">No alerts right now.</p>;

    return (
        <div className="alert-feed">
            {alerts.map((alert, index) => (
                <div key={index} className={`alert-item ${alert.type}`}>
                    <div className="alert-icon">
                        {alert.type === 'critical' && '⚠️'}
                        {alert.type === 'warning' && '⏰'}
                        {alert.type === 'success' && '🎉'}
                        {alert.type === 'info' && 'ℹ️'}
                    </div>
                    <div className="alert-content">
                        <p className="alert-message">{alert.message}</p>
                        <small className="alert-action">{alert.action}</small>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AlertFeed;

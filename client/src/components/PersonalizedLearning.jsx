import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PersonalizedLearning.css';

const PersonalizedLearning = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlan();
    }, []);

    const fetchPlan = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5001/api/ai/personalized-plan', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setPlan(response.data.plan);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching plan:', err);
            setError('Could not generate your learning plan right now.');
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="ai-plan-loading">
            <div className="ai-spinner"></div>
            <p>🤖 AI is analyzing your progress...</p>
        </div>
    );

    if (error) return null; // Hide if error to not clutter dashboard

    if (!plan) return null;

    return (
        <div className="personalized-learning-container glass-panel">
            <div className="plan-header">
                <div className="header-icon">🚀</div>
                <div className="header-text">
                    <h3>Your Mission Today</h3>
                    <p>AI-Recommended Path for You</p>
                </div>
                <span className="badge-priority">Priority: {plan.priority_topic}</span>
            </div>

            <div className="plan-body">
                <div className="plan-reason">
                    <strong>Why this?</strong> {plan.reason}
                </div>

                <div className="action-steps">
                    <h4>Action Plan</h4>
                    {plan.action_plan.map((step, index) => (
                        <div key={index} className="step-item">
                            <div className="step-number">{index + 1}</div>
                            <div className="step-content">{step}</div>
                        </div>
                    ))}
                </div>

                <div className="plan-footer">
                    <button className="start-learning-btn">
                        Start {plan.recommended_resource || 'Learning'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalizedLearning;

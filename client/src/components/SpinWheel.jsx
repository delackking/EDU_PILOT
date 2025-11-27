import React, { useState } from 'react';
import axios from 'axios';
import './SpinWheel.css';

const SpinWheel = ({ onReward }) => {
    const [spinning, setSpinning] = useState(false);
    const [reward, setReward] = useState(null);
    const [rotation, setRotation] = useState(0);

    const handleSpin = async () => {
        if (spinning || reward) return;

        setSpinning(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5001/api/gamification/spin-wheel', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Calculate rotation to land on the prize (visual only for now, random spin)
            const newRotation = rotation + 1440 + Math.random() * 360;
            setRotation(newRotation);

            setTimeout(() => {
                setReward(response.data.reward);
                setSpinning(false);
                if (onReward) onReward(response.data.reward);
            }, 4000); // Wait for animation

        } catch (error) {
            console.error('Spin error:', error);
            setSpinning(false);
        }
    };

    return (
        <div className="spin-wheel-container">
            <h3>🎡 Daily Spin</h3>
            <p className="spin-subtitle">Win XP and Badges!</p>

            <div className="wheel-wrapper">
                <div className="wheel-pointer">▼</div>
                <div
                    className="wheel"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="wheel-segment seg-1">50 XP</div>
                    <div className="wheel-segment seg-2">100 XP</div>
                    <div className="wheel-segment seg-3">200 XP</div>
                    <div className="wheel-segment seg-4">Badge</div>
                    <div className="wheel-segment seg-5">Freeze</div>
                    <div className="wheel-segment seg-6">50 XP</div>
                </div>
            </div>

            {reward ? (
                <div className="reward-popup fade-in">
                    <h4>🎉 You Won!</h4>
                    <div className="reward-value">{reward.label}</div>
                    <button className="claim-btn" onClick={() => setReward(null)}>Claim Prize</button>
                </div>
            ) : (
                <button
                    className="spin-btn"
                    onClick={handleSpin}
                    disabled={spinning}
                >
                    {spinning ? 'Spinning...' : 'SPIN NOW'}
                </button>
            )}
        </div>
    );
};

export default SpinWheel;

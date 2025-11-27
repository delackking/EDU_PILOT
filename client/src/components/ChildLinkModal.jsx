import React, { useState } from 'react';
import axios from 'axios';
import './ChildLinkModal.css';

const ChildLinkModal = ({ onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [relationship, setRelationship] = useState('Mother');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/parent/link-child', {
                studentEmail: email,
                relationship
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to link child');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Link Child Account</h2>
                <p>Enter the email address your child uses for EduPilot.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Student Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="student@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Relationship</label>
                        <select
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                        >
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Guardian">Guardian</option>
                        </select>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Linking...' : 'Link Child'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChildLinkModal;

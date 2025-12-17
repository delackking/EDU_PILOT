import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css'; // Reusing existing auth styles

function SchoolSignup({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        schoolName: '',
        schoolAddress: '',
        schoolPin: '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.registerSchool(formData);
            const { token, user } = response.data;
            onLogin(user, token);
            navigate('/school/dashboard'); // Redirect to admin dashboard (to be created)
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Register Your School</h2>
                    <p>Create a digital campus for your institution</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-section">
                        <h3>🏫 School Details</h3>
                        <div className="form-group">
                            <label>School Name</label>
                            <input
                                type="text"
                                name="schoolName"
                                value={formData.schoolName}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Springfield High"
                            />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="schoolAddress"
                                value={formData.schoolAddress}
                                onChange={handleChange}
                                placeholder="City, State"
                            />
                        </div>
                        <div className="form-group">
                            <label>Create School PIN</label>
                            <input
                                type="text"
                                name="schoolPin"
                                value={formData.schoolPin}
                                onChange={handleChange}
                                required
                                placeholder="4-digit PIN for students/teachers to join"
                                maxLength="6"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>👤 Admin Details</h3>
                        <div className="form-group">
                            <label>Admin Name</label>
                            <input
                                type="text"
                                name="adminName"
                                value={formData.adminName}
                                onChange={handleChange}
                                required
                                placeholder="Principal or Admin Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input
                                type="email"
                                name="adminEmail"
                                value={formData.adminEmail}
                                onChange={handleChange}
                                required
                                placeholder="admin@school.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="adminPassword"
                                value={formData.adminPassword}
                                onChange={handleChange}
                                required
                                placeholder="Secure password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Registering...' : 'Create School'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already registered? <Link to="/school/login">Login as Admin</Link></p>
                    <p>Student or Teacher? <Link to="/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}

export default SchoolSignup;

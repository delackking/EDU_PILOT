import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, schoolAPI } from '../services/api';
import './Auth.css';

function Login({ onLogin }) {
    const [schools, setSchools] = useState([]);
    const [formData, setFormData] = useState({
        school_id: '',
        school_assigned_id: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const response = await schoolAPI.list();
            setSchools(response.data);
        } catch (err) {
            console.error('Failed to fetch schools', err);
            setError('Failed to load schools. Please refresh.');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(formData);
            onLogin(response.data.user, response.data.token);
            navigate(`/${response.data.user.role.toLowerCase()}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background"></div>
            <div className="auth-card glass-card fade-in">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome to EduPilot</h1>
                    <p className="auth-subtitle">AI-Powered Personalized Learning</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="school_id">Select School</label>
                        <select
                            id="school_id"
                            name="school_id"
                            className="input"
                            value={formData.school_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Choose Your School --</option>
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="school_assigned_id">ID (Roll No / Employee ID)</label>
                        <input
                            type="text"
                            id="school_assigned_id"
                            name="school_assigned_id"
                            className="input"
                            placeholder="e.g. STD001 or TCH001"
                            value={formData.school_assigned_id}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-link">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;

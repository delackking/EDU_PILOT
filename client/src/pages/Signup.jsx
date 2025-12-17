import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, schoolAPI } from '../services/api';
import './Auth.css';

function Signup({ onLogin }) {
    const [schools, setSchools] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        school_id: '',
        school_pin: '',
        school_assigned_id: '', // Roll No or Employee ID
        password: '',
        role: 'STUDENT',
        class: '5',
        section: 'A',
        classes: [],
        subjects: [],
        preferred_language: 'English'
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
            const response = await authAPI.signup(formData);
            onLogin(response.data.user, response.data.token);
            navigate(`/${response.data.user.role.toLowerCase()}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background"></div>
            <div className="auth-card glass-card fade-in">
                <div className="auth-header">
                    <h1 className="auth-title">Join EduPilot</h1>
                    <p className="auth-subtitle">School Learning Portal</p>
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
                                    {school.name} - {school.address}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="school_pin">School PIN</label>
                        <input
                            type="text"
                            id="school_pin"
                            name="school_pin"
                            className="input"
                            placeholder="Enter 4-digit School PIN"
                            value={formData.school_pin}
                            onChange={handleChange}
                            required
                            maxLength="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">I am a</label>
                        <select
                            id="role"
                            name="role"
                            className="input"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="PARENT">Parent</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="input"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="school_assigned_id">
                            {formData.role === 'STUDENT' ? 'Roll Number / Student ID' :
                                formData.role === 'TEACHER' ? 'Employee ID' : 'Parent ID'}
                        </label>
                        <input
                            type="text"
                            id="school_assigned_id"
                            name="school_assigned_id"
                            className="input"
                            placeholder={formData.role === 'STUDENT' ? 'e.g. STD001' : 'e.g. TCH001'}
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
                            minLength="6"
                        />
                    </div>

                    {formData.role === 'STUDENT' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="class">Class</label>
                                <select
                                    id="class"
                                    name="class"
                                    className="input"
                                    value={formData.class}
                                    onChange={handleChange}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(c => (
                                        <option key={c} value={c}>Class {c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="preferred_language">Preferred Language</label>
                                <select
                                    id="preferred_language"
                                    name="preferred_language"
                                    className="input"
                                    value={formData.preferred_language}
                                    onChange={handleChange}
                                >
                                    <option value="English">English</option>
                                    <option value="Hindi">Hindi</option>
                                    <option value="Marathi">Marathi</option>
                                    <option value="Tamil">Tamil</option>
                                    <option value="Bengali">Bengali</option>
                                    <option value="Telugu">Telugu</option>
                                </select>
                            </div>
                        </>
                    )}

                    {formData.role === 'TEACHER' && (
                        <>
                            <div className="form-group">
                                <label>Classes You Teach (Hold Ctrl/Cmd to select multiple)</label>
                                <select
                                    multiple
                                    className="input"
                                    value={formData.classes}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                        setFormData({ ...formData, classes: selected });
                                    }}
                                    style={{ height: '100px' }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(c => (
                                        <option key={c} value={c}>Class {c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Subjects You Teach (Hold Ctrl/Cmd to select multiple)</label>
                                <select
                                    multiple
                                    className="input"
                                    value={formData.subjects}
                                    onChange={(e) => {
                                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData({ ...formData, subjects: selected });
                                    }}
                                    style={{ height: '100px' }}
                                >
                                    {['Math', 'Science', 'English', 'History', 'Geography'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;

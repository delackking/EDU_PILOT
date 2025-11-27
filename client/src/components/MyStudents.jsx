import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyStudents.css';

const MyStudents = () => {
    const [students, setStudents] = useState([]);
    const [schoolInfo, setSchoolInfo] = useState({ name: '', pin: '' });
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/teacher/my-students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data.students);
            setSchoolInfo({ name: response.data.school, pin: response.data.pin });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/teacher/student-feedback', {
                studentId: selectedStudent.id,
                feedback,
                performanceScore: parseInt(score)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Feedback added successfully!');
            setSelectedStudent(null);
            setFeedback('');
            setScore(0);
        } catch (error) {
            console.error('Error adding feedback:', error);
            alert('Failed to add feedback');
        }
    };

    if (loading) return <div className="loading-spinner">Loading students...</div>;

    return (
        <div className="my-students-container">
            <div className="crm-header">
                <h2>🏫 My Students</h2>
                <div className="school-badge">
                    <span className="school-name">{schoolInfo.name}</span>
                    <span className="school-pin">PIN: {schoolInfo.pin}</span>
                </div>
            </div>

            <div className="students-grid">
                {students.map(student => (
                    <div key={student.id} className="student-card">
                        <div className="student-header">
                            <div className="avatar">{student.name.charAt(0)}</div>
                            <div>
                                <h4>{student.name}</h4>
                                <span className="class-badge">Class {student.class}</span>
                            </div>
                        </div>

                        <div className="student-stats">
                            <div className="stat">
                                <span className="label">XP</span>
                                <span className="value">{student.xp}</span>
                            </div>
                            <div className="stat">
                                <span className="label">Mastered</span>
                                <span className="value success">{student.mastered_topics}</span>
                            </div>
                            <div className="stat">
                                <span className="label">Weak</span>
                                <span className="value danger">{student.weak_topics}</span>
                            </div>
                        </div>

                        <button
                            className="feedback-btn"
                            onClick={() => setSelectedStudent(student)}
                        >
                            Add Feedback
                        </button>
                    </div>
                ))}
            </div>

            {selectedStudent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Feedback for {selectedStudent.name}</h3>
                        <form onSubmit={handleSubmitFeedback}>
                            <div className="form-group">
                                <label>Performance Score (0-100)</label>
                                <input
                                    type="number"
                                    value={score}
                                    onChange={(e) => setScore(e.target.value)}
                                    min="0" max="100"
                                />
                            </div>
                            <div className="form-group">
                                <label>Feedback / Remarks</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows="4"
                                    placeholder="Write your feedback here..."
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setSelectedStudent(null)}>Cancel</button>
                                <button type="submit" className="primary-btn">Submit Feedback</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyStudents;

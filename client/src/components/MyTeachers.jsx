import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import './MyTeachers.css';

function MyTeachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await studentAPI.getMyTeachers();
            setTeachers(response.data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading teachers...</div>;

    return (
        <div className="my-teachers-container">
            <h2>👨‍🏫 My Teachers</h2>
            <div className="teachers-grid">
                {teachers.map(teacher => (
                    <div key={teacher.id} className="teacher-card">
                        <div className="teacher-avatar">
                            {teacher.name.charAt(0)}
                        </div>
                        <div className="teacher-info">
                            <h3>{teacher.name}</h3>
                            <p className="teacher-id">ID: {teacher.school_assigned_id}</p>
                            <div className="subjects-list">
                                {teacher.subjects && JSON.parse(teacher.subjects).map((sub, i) => (
                                    <span key={i} className="subject-tag">{sub}</span>
                                ))}
                            </div>
                            <p className="classes-text">
                                Classes: {teacher.classes && JSON.parse(teacher.classes).join(', ')}
                            </p>
                        </div>
                        <button className="message-btn" disabled>
                            Message (Coming Soon)
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyTeachers;

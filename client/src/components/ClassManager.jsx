import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';
import './ClassManager.css';

const ClassManager = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showHomeworkModal, setShowHomeworkModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    // Form States
    const [newClass, setNewClass] = useState({ name: '', subject: '', grade: '' });
    const [homework, setHomework] = useState({ title: '', description: '', dueDate: '', topicId: '' });

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await teacherAPI.getClasses();
            setClasses(response.data.classes);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            setLoading(false);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await teacherAPI.createClass(newClass);
            setShowCreateModal(false);
            setNewClass({ name: '', subject: '', grade: '' });
            fetchClasses();
        } catch (error) {
            alert('Failed to create class');
        }
    };

    const handleAssignHomework = async (e) => {
        e.preventDefault();
        try {
            await teacherAPI.assignHomework(selectedClass.id, homework);
            setShowHomeworkModal(false);
            setHomework({ title: '', description: '', dueDate: '', topicId: '' });
            alert('Homework assigned successfully!');
        } catch (error) {
            alert('Failed to assign homework');
        }
    };

    const openHomeworkModal = (cls) => {
        setSelectedClass(cls);
        setShowHomeworkModal(true);
    };

    if (loading) return <div className="loading-spinner">Loading Classes...</div>;

    return (
        <div className="class-manager">
            <div className="manager-header">
                <h2>My Classes</h2>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Create Class
                </button>
            </div>

            <div className="classes-grid">
                {classes.map(cls => (
                    <div key={cls.id} className="class-card">
                        <div className="class-header">
                            <h3>{cls.name}</h3>
                            <span className="badge badge-primary">Grade {cls.grade}</span>
                        </div>
                        <p className="subject-text">{cls.subject}</p>
                        <div className="class-stats">
                            <div className="stat">
                                <span className="value">{cls.student_count}</span>
                                <span className="label">Students</span>
                            </div>
                            <div className="stat">
                                <span className="value">{cls.invite_code}</span>
                                <span className="label">Code</span>
                            </div>
                        </div>
                        <button
                            className="btn btn-outline btn-full mt-md"
                            onClick={() => openHomeworkModal(cls)}
                        >
                            Assign Homework
                        </button>
                    </div>
                ))}
                {classes.length === 0 && (
                    <div className="empty-state">
                        <p>No classes created yet. Start by creating one!</p>
                    </div>
                )}
            </div>

            {/* Create Class Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create New Class</h3>
                        <form onSubmit={handleCreateClass}>
                            <div className="form-group">
                                <label>Class Name (e.g., 5A Math)</label>
                                <input
                                    type="text"
                                    value={newClass.name}
                                    onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <select
                                    value={newClass.subject}
                                    onChange={e => setNewClass({ ...newClass, subject: e.target.value })}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Science">Science</option>
                                    <option value="English">English</option>
                                    <option value="Social Studies">Social Studies</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Grade</label>
                                <input
                                    type="number"
                                    min="1" max="8"
                                    value={newClass.grade}
                                    onChange={e => setNewClass({ ...newClass, grade: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Homework Modal */}
            {showHomeworkModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Assign Homework to {selectedClass?.name}</h3>
                        <form onSubmit={handleAssignHomework}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={homework.title}
                                    onChange={e => setHomework({ ...homework, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={homework.description}
                                    onChange={e => setHomework({ ...homework, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    value={homework.dueDate}
                                    onChange={e => setHomework({ ...homework, dueDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowHomeworkModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassManager;

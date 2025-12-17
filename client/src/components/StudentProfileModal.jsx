import React from 'react';
import '../pages/SchoolAdminDashboard.css'; // Re-using existing styles if applicable, or we can make it self-contained

const StudentProfileModal = ({ student, loading, onClose }) => {
    if (!student && !loading) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                {loading ? (
                    <div className="loading-spinner">Loading profile...</div>
                ) : (
                    <div className="student-profile-details">
                        <h2>{student.name}'s Profile</h2>
                        <div className="profile-section">
                            <h3>Academic Performance</h3>
                            <p><strong>Grade:</strong> {student.grade}</p>
                            <p><strong>Attendance:</strong> {student.attendance}%</p>
                            <p><strong>Overall GPA:</strong> {student.gpa || 'N/A'}</p>
                        </div>

                        <div className="profile-section">
                            <h3>Recent Activity</h3>
                            {student.recentActivity && student.recentActivity.length > 0 ? (
                                <ul>
                                    {student.recentActivity.map((activity, index) => (
                                        <li key={index}>{activity}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No recent activity recorded.</p>
                            )}
                        </div>

                        <div className="profile-actions">
                            <button className="btn btn-primary">Send Message</button>
                            <button className="btn btn-secondary">View Full Report</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProfileModal;

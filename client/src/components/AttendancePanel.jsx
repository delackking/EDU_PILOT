import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';
import './AttendancePanel.css';

const AttendancePanel = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, [date]);

    const fetchStudentsAndAttendance = async () => {
        try {
            setLoading(true);
            // 1. Fetch Students
            const studentsRes = await teacherAPI.getClassStudents();
            const studentList = studentsRes.data.students || [];
            setStudents(studentList);

            // 2. Fetch Existing Attendance for Date
            const attendanceRes = await teacherAPI.getAttendance(date);
            const existingRecords = attendanceRes.data.attendance || [];

            // Map existing records to state
            const attendanceMap = {};
            existingRecords.forEach(record => {
                attendanceMap[record.student_id] = record.status;
            });

            // Initialize missing records as 'PRESENT' (default) or keep existing
            const initialAttendance = {};
            studentList.forEach(s => {
                initialAttendance[s.id] = attendanceMap[s.id] || 'PRESENT';
            });
            setAttendance(initialAttendance);

        } catch (error) {
            console.error("Failed to load attendance data", error);
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId: parseInt(studentId),
                status,
                remarks: ''
            }));

            await teacherAPI.markAttendance({ date, records });
            setMessage({ type: 'success', text: 'Attendance saved successfully!' });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Failed to save attendance", error);
            setMessage({ type: 'error', text: 'Failed to save attendance' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="attendance-panel">
            <div className="attendance-header">
                <h2>📅 Class Attendance</h2>
                <div className="date-picker-container">
                    <label>Select Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="date-input"
                    />
                </div>
                <button
                    className="btn-save-attendance"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : '💾 Save Attendance'}
                </button>
            </div>

            {message && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="students-grid">
                {students.map(student => (
                    <div key={student.id} className={`student-attendance-card ${attendance[student.id]}`}>
                        <div className="student-info">
                            <div className="student-avatar">
                                {student.name.charAt(0)}
                            </div>
                            <div>
                                <h3>{student.name}</h3>
                                <span className="student-id">{student.school_assigned_id}</span>
                            </div>
                        </div>

                        <div className="attendance-controls">
                            <button
                                className={`btn-status present ${attendance[student.id] === 'PRESENT' ? 'active' : ''}`}
                                onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            >
                                Present
                            </button>
                            <button
                                className={`btn-status absent ${attendance[student.id] === 'ABSENT' ? 'active' : ''}`}
                                onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            >
                                Absent
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendancePanel;

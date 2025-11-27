import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import { authAPI } from './services/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogin = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) {
        return (
            <div className="flex flex-center" style={{ height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={
                user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/signup" element={
                user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Signup onLogin={handleLogin} />
            } />

            {/* Student Routes */}
            <Route path="/student/*" element={
                user && user.role === 'STUDENT' ?
                    <StudentDashboard user={user} onLogout={handleLogout} /> :
                    <Navigate to="/login" />
            } />

            {/* Teacher Routes */}
            <Route path="/teacher/*" element={
                user && user.role === 'TEACHER' ?
                    <TeacherDashboard user={user} onLogout={handleLogout} /> :
                    <Navigate to="/login" />
            } />

            {/* Parent Routes */}
            <Route path="/parent/*" element={
                user && user.role === 'PARENT' ?
                    <ParentDashboard user={user} onLogout={handleLogout} /> :
                    <Navigate to="/login" />
            } />

            {/* Default Route */}
            <Route path="/" element={
                user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Navigate to="/login" />
            } />
        </Routes>
    );
}

export default App;

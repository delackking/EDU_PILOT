import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import SchoolPage from './pages/SchoolPage';
import SchoolSignup from './pages/SchoolSignup';
import SchoolLogin from './pages/SchoolLogin';
import SchoolAdminDashboard from './pages/SchoolAdminDashboard';

// API (if needed later)
import { authAPI } from './services/api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check login on first load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // Login handler
    const handleLogin = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner" />
            </div>
        );
    }

    // Helper to get dashboard route based on role
    const getDashboardPath = (role) => {
        if (!role) return "/login";
        if (role === 'ADMIN' || role === 'SCHOOL_ADMIN') return "/school/dashboard";
        return `/${role.toLowerCase()}`;
    };

    return (
        <Routes>

            {/* Login */}
            <Route
                path="/login"
                element={
                    user ? <Navigate to={getDashboardPath(user.role)} /> :
                        <Login onLogin={handleLogin} />
                }
            />

            {/* Sign Up */}
            <Route
                path="/signup"
                element={
                    user ? <Navigate to={getDashboardPath(user.role)} /> :
                        <Signup onLogin={handleLogin} />
                }
            />

            {/* Student Dashboard */}
            <Route
                path="/student/*"
                element={
                    user?.role === 'STUDENT'
                        ? <StudentDashboard user={user} onLogout={handleLogout} />
                        : <Navigate to="/login" />
                }
            />

            {/* Teacher Dashboard */}
            <Route
                path="/teacher/*"
                element={
                    user?.role === 'TEACHER'
                        ? <TeacherDashboard user={user} onLogout={handleLogout} />
                        : <Navigate to="/login" />
                }
            />

            {/* Parent Dashboard */}
            <Route
                path="/parent/*"
                element={
                    user?.role === 'PARENT'
                        ? <ParentDashboard user={user} onLogout={handleLogout} />
                        : <Navigate to="/login" />
                }
            />

            {/* School Page (Shared) */}
            <Route
                path="/school"
                element={
                    user
                        ? <SchoolPage />
                        : <Navigate to="/login" />
                }
            />

            {/* School Admin Routes */}
            <Route
                path="/school/register"
                element={
                    user ? <Navigate to={getDashboardPath(user.role)} /> :
                        <SchoolSignup onLogin={handleLogin} />
                }
            />
            <Route
                path="/school/login"
                element={
                    user ? <Navigate to={getDashboardPath(user.role)} /> :
                        <SchoolLogin onLogin={handleLogin} />
                }
            />
            <Route
                path="/school/dashboard"
                element={
                    user?.role === 'ADMIN' || user?.role === 'SCHOOL_ADMIN'
                        ? <SchoolAdminDashboard user={user} onLogout={handleLogout} />
                        : <Navigate to="/school/login" />
                }
            />

            {/* Default → Auto Redirect */}
            <Route
                path="/"
                element={
                    user
                        ? <Navigate to={getDashboardPath(user.role)} />
                        : <Navigate to="/login" />
                }
            />

        </Routes>
    );
}

export default App;

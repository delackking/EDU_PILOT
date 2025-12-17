import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    verify: () => api.get('/auth/verify'),
    registerSchool: (data) => api.post('/auth/register-school', data),
    loginAdmin: (data) => api.post('/auth/login-admin', data),
};

// School API
export const schoolAPI = {
    list: () => api.get('/school/list'),
    search: (query, role) => api.get('/school/search', { params: { query, role } }),
    getStats: () => api.get('/school/stats'),
    getAnalytics: () => api.get('/school/analytics'),
    getDirectory: () => api.get('/school/directory'),
    getStudentProfile: (id) => api.get(`/school/student/${id}/full-profile`),
    getStudentWholeProfile: (id) => api.get(`/school/student/${id}/whole-profile`), // New
};

// Student API
export const studentAPI = {
    getDashboard: () => api.get('/student/dashboard'),
    getSubjects: () => api.get('/subjects'),
    getTopicsBySubject: (subject) => api.get(`/subjects/${subject}/topics`),
    getTopic: (id) => api.get(`/topics/${id}`),
    getPracticeQuestions: (topicId) => api.get(`/practice/${topicId}/questions`),
    submitAnswer: (data) => api.post('/practice/submit', data),
    getNextTopic: () => api.get('/trajectory/next-topic'),
    getMasteryOverview: () => api.get('/trajectory/mastery-overview'),
    getMyTeachers: () => api.get('/student/my-teachers'),
};

// AI API
export const aiAPI = {
    getTutorExplanation: (data) => api.post('/ai/tutor', data),
    solveImageQuestion: (formData) => api.post('/ai/image-solve', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getVoiceExplanation: (data) => api.post('/ai/voice-explain', data),
};

// Teacher API
export const teacherAPI = {
    uploadChapter: (formData) => api.post('/teacher/upload-chapter', formData),
    getChapters: () => api.get('/teacher/chapters'),
    getChapter: (id) => api.get(`/teacher/chapter/${id}`),
    deleteChapter: (id) => api.delete(`/teacher/chapter/${id}`),
    getMyStudents: () => api.get('/teacher/my-students'),
    getStudentProfile: (id) => api.get(`/teacher/student/${id}/full-profile`),
    addFeedback: (data) => api.post('/teacher/student-feedback', data),
    getClassStudents: () => api.get('/teacher/class-students'),
    markAttendance: (data) => api.post('/teacher/attendance', data),
    getAttendance: (date) => api.get(`/teacher/attendance/${date}`),
    generateQuestions: (data) => api.post('/teacher/generate-questions', data),
    saveQuestions: (data) => api.post('/teacher/save-questions', data),

    // Class Management
    getClasses: () => api.get('/teacher/classes'),
    createClass: (data) => api.post('/teacher/classes', data),
    assignHomework: (classId, data) => api.post(`/teacher/classes/${classId}/homework`, data),
};

export default api;

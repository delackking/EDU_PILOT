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
    uploadChapter: (formData) => api.post('/teacher/upload-chapter', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getChapters: () => api.get('/teacher/chapters'),
    getChapter: (id) => api.get(`/teacher/chapter/${id}`),
    updateTopic: (id, data) => api.put(`/teacher/topic/${id}`, data),
    publishChapter: (id) => api.post(`/teacher/chapter/${id}/publish`),
    deleteChapter: (id) => api.delete(`/teacher/chapter/${id}`),
};

export default api;



import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import './SubjectsBrowser.css';

function SubjectsBrowser() {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await studentAPI.getSubjects();
            // response.data is already an array of subject strings from the API
            setSubjects(response.data);
            if (response.data.length > 0) {
                loadTopics(response.data[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to load subjects:', error);
            setLoading(false);
        }
    };

    const loadTopics = async (subject) => {
        setSelectedSubject(subject);
        try {
            const response = await studentAPI.getTopicsBySubject(subject);
            setTopics(response.data);
        } catch (error) {
            console.error('Failed to load topics:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="subjects-browser container">
            <div className="browser-header fade-in">
                <h1>📚 Browse Subjects</h1>
                <p className="text-secondary">Explore topics and start learning</p>
            </div>

            {/* Subject Tabs */}
            <div className="subject-tabs mt-lg">
                {subjects.map((subject) => (
                    <button
                        key={subject}
                        className={`subject-tab ${selectedSubject === subject ? 'active' : ''}`}
                        onClick={() => loadTopics(subject)}
                    >
                        {getSubjectIcon(subject)} {subject}
                    </button>
                ))}
            </div>

            {/* Topics Grid */}
            <div className="topics-grid mt-lg">
                {topics.map((topic) => (
                    <div key={topic.id} className="topic-card glass-card">
                        <div className="topic-header">
                            <h3>{topic.name}</h3>
                            <span className="badge badge-primary">Class {topic.grade}</span>
                        </div>
                        <p className="topic-description text-secondary">
                            {(() => {
                                try {
                                    const parsed = JSON.parse(topic.content);
                                    return parsed.theory?.substring(0, 100) || parsed.description?.substring(0, 100) || 'Start learning this topic...';
                                } catch (e) {
                                    return topic.content?.substring(0, 100) || 'Start learning this topic...';
                                }
                            })()}...
                        </p>
                        <div className="topic-meta">
                            <div className="difficulty-indicator">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`difficulty-dot ${i < topic.difficulty ? 'active' : ''}`}
                                    />
                                ))}
                            </div>
                            <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                                Difficulty: {getDifficultyLabel(topic.difficulty)}
                            </span>
                        </div>
                        <div className="topic-actions mt-md">
                            <button
                                className="btn btn-primary btn-full"
                                onClick={() => navigate(`/student/topic/${topic.id}`)}
                            >
                                Learn Topic
                            </button>
                            <button
                                className="btn btn-outline btn-full mt-sm"
                                onClick={() => navigate(`/student/practice/${topic.id}`)}
                            >
                                Practice
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {topics.length === 0 && (
                <div className="empty-state">
                    <p className="text-muted">No topics available for this subject yet.</p>
                </div>
            )}
        </div>
    );
}

function getSubjectIcon(subject) {
    const icons = {
        'Math': '🔢',
        'Science': '🔬',
        'English': '📖',
        'Social Studies': '🌍',
        'History': '📜',
        'Geography': '🗺️'
    };
    return icons[subject] || '📚';
}

function getDifficultyLabel(difficulty) {
    const labels = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    return labels[difficulty - 1] || 'Medium';
}

export default SubjectsBrowser;

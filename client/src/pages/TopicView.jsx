import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import './TopicView.css';

function TopicView() {
    const { id } = useParams();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMode, setActiveMode] = useState('theory');
    const navigate = useNavigate();

    useEffect(() => {
        loadTopic();
    }, [id]);

    const loadTopic = async () => {
        try {
            const response = await studentAPI.getTopic(id);
            setTopic(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load topic:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="container mt-lg text-center">
                <h2>Topic not found</h2>
                <button className="btn btn-primary mt-md" onClick={() => navigate('/student/subjects')}>
                    Back to Subjects
                </button>
            </div>
        );
    }

    const content = JSON.parse(topic.content);

    return (
        <div className="topic-view container">
            <div className="topic-header glass-card fade-in">
                <div className="topic-title-section">
                    <h1>{topic.name}</h1>
                    <div className="topic-badges">
                        <span className="badge badge-primary">{topic.subject}</span>
                        <span className="badge badge-success">Class {topic.grade}</span>
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/student/practice/${topic.id}`)}
                >
                    Start Practice →
                </button>
            </div>

            {/* Learning Modes */}
            <div className="learning-modes mt-lg">
                <button
                    className={`mode-btn ${activeMode === 'theory' ? 'active' : ''}`}
                    onClick={() => setActiveMode('theory')}
                >
                    📖 Theory
                </button>
                <button
                    className={`mode-btn ${activeMode === 'eli5' ? 'active' : ''}`}
                    onClick={() => setActiveMode('eli5')}
                >
                    🧒 ELI5
                </button>
                <button
                    className={`mode-btn ${activeMode === 'story' ? 'active' : ''}`}
                    onClick={() => setActiveMode('story')}
                >
                    📚 Story Mode
                </button>
                <button
                    className={`mode-btn ${activeMode === 'examples' ? 'active' : ''}`}
                    onClick={() => setActiveMode('examples')}
                >
                    💡 Examples
                </button>
            </div>

            {/* Content Display */}
            <div className="topic-content glass-card mt-md">
                {activeMode === 'theory' && (
                    <div className="content-section fade-in">
                        <h2>📖 Theory</h2>
                        <p>{content.theory}</p>

                        <h3 className="mt-lg">🔑 Key Points</h3>
                        <ul className="key-points">
                            {content.keyPoints?.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeMode === 'eli5' && (
                    <div className="content-section fade-in">
                        <h2>🧒 Explain Like I'm 5</h2>
                        <p className="eli5-text">{content.simplified_explanation}</p>
                    </div>
                )}

                {activeMode === 'story' && (
                    <div className="content-section fade-in">
                        <h2>📚 Story Mode</h2>
                        <p className="story-text">{content.storyModeExplanation}</p>
                    </div>
                )}

                {activeMode === 'examples' && (
                    <div className="content-section fade-in">
                        <h2>💡 Examples</h2>
                        <div className="examples-list">
                            {content.examples?.map((example, index) => (
                                <div key={index} className="example-card">
                                    <span className="example-number">{index + 1}</span>
                                    <p>{example}</p>
                                </div>
                            ))}
                        </div>

                        <h3 className="mt-lg">🌍 Real-Life Examples</h3>
                        <div className="examples-list">
                            {content.realLifeExamples?.map((example, index) => (
                                <div key={index} className="example-card">
                                    <span className="example-number">🌟</span>
                                    <p>{example}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="topic-actions mt-lg">
                <button
                    className="btn btn-outline"
                    onClick={() => navigate('/student/subjects')}
                >
                    ← Back to Subjects
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/student/practice/${topic.id}`)}
                >
                    Practice This Topic →
                </button>
            </div>
        </div>
    );
}

export default TopicView;

import { useState } from 'react';
import { aiAPI } from '../services/api';
import './AITutor.css';

function AITutor() {
    const [topic, setTopic] = useState('');
    const [question, setQuestion] = useState('');
    const [explanationMode, setExplanationMode] = useState('normal');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        setError('');
        setResponse('');
        setLoading(true);

        try {
            const result = await aiAPI.getTutorExplanation({
                topic,
                question,
                mode: explanationMode
            });

            setResponse(result.data.explanation);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to get explanation. Make sure GROQ_API_KEY is configured.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-tutor container">
            <div className="tutor-header fade-in">
                <h1>🤖 AI Tutor</h1>
                <p className="text-secondary">Get instant help with any concept or question</p>
            </div>

            {/* Chat Mode */}
            <div className="chat-mode glass-card mt-md fade-in">
                <form onSubmit={handleAskQuestion}>
                    <div className="form-group">
                        <label htmlFor="topic">Topic</label>
                        <input
                            type="text"
                            id="topic"
                            className="input"
                            placeholder="e.g., Fractions, Photosynthesis, etc."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="question">Your Question</label>
                        <textarea
                            id="question"
                            className="input"
                            rows="4"
                            placeholder="What would you like to understand?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Explanation Style</label>
                        <div className="explanation-modes">
                            <button
                                type="button"
                                className={`explanation-mode-btn ${explanationMode === 'normal' ? 'active' : ''}`}
                                onClick={() => setExplanationMode('normal')}
                            >
                                📖 Normal
                            </button>
                            <button
                                type="button"
                                className={`explanation-mode-btn ${explanationMode === 'eli5' ? 'active' : ''}`}
                                onClick={() => setExplanationMode('eli5')}
                            >
                                🧒 ELI5
                            </button>
                            <button
                                type="button"
                                className={`explanation-mode-btn ${explanationMode === 'story' ? 'active' : ''}`}
                                onClick={() => setExplanationMode('story')}
                            >
                                📚 Story
                            </button>
                            <button
                                type="button"
                                className={`explanation-mode-btn ${explanationMode === 'analogy' ? 'active' : ''}`}
                                onClick={() => setExplanationMode('analogy')}
                            >
                                🔗 Analogy
                            </button>
                            <button
                                type="button"
                                className={`explanation-mode-btn ${explanationMode === 'step-by-step' ? 'active' : ''}`}
                                onClick={() => setExplanationMode('step-by-step')}
                            >
                                📝 Step-by-Step
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Thinking...' : 'Get Explanation'}
                    </button>
                </form>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-box mt-md">
                    <strong>⚠️ Error:</strong> {error}
                </div>
            )}

            {/* Response Display */}
            {response && (
                <div className="response-box glass-card mt-md fade-in">
                    <div className="response-header">
                        <h3>✨ AI Tutor's Explanation</h3>
                        <span className="badge badge-primary">{explanationMode}</span>
                    </div>
                    <div className="response-content">
                        {response.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-box glass-card mt-md">
                    <div className="spinner"></div>
                    <p className="text-secondary mt-sm">Generating explanation...</p>
                </div>
            )}

            {/* Tips */}
            <div className="tips-box glass-card mt-lg">
                <h3>💡 Tips for Better Results</h3>
                <ul>
                    <li>Be specific about what you want to understand</li>
                    <li>Mention the topic or chapter for better context</li>
                    <li>Try different explanation styles to find what works best for you</li>
                </ul>
            </div>
        </div>
    );
}

export default AITutor;

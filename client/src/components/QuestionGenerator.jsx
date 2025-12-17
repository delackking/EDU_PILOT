import React, { useState } from 'react';
import axios from 'axios';
import './QuestionGenerator.css';

const QuestionGenerator = ({ topics, onSave }) => {
    const [step, setStep] = useState('input'); // input, loading, review
    const [formData, setFormData] = useState({
        topicId: '',
        customTopic: '',
        count: 5,
        difficulty: 3
    });
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setError(null);
        setStep('loading');

        try {
            // Find topic name if selecting from existing topics
            let topicName = formData.customTopic;
            let content = '';

            if (formData.topicId) {
                const selectedTopic = topics.find(t => t.id === parseInt(formData.topicId));
                if (selectedTopic) {
                    topicName = selectedTopic.name;
                    // In a real app, we might fetch topic content here
                }
            }

            if (!topicName) {
                setError('Please select a topic or enter a custom one.');
                setStep('input');
                return;
            }

            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5001/api/teacher/generate-questions', {
                topic: topicName,
                content: content,
                count: formData.count,
                difficulty: formData.difficulty
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setGeneratedQuestions(response.data.questions);
                setStep('review');
            }
        } catch (err) {
            console.error('Generation error:', err);
            setError('Failed to generate questions. Please try again.');
            setStep('input');
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');

            // If it's a custom topic, we might need to create it first? 
            // For simplicity, we require selecting an existing topic ID to save to.
            if (!formData.topicId) {
                setError('Please select an existing topic to save these questions to.');
                return;
            }

            await axios.post('http://localhost:5001/api/teacher/save-questions', {
                topicId: formData.topicId,
                questions: generatedQuestions
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (onSave) onSave();
            alert('Questions saved successfully!');
            setStep('input');
            setGeneratedQuestions([]);
            setFormData({ ...formData, customTopic: '' });

        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save questions.');
        }
    };

    const handleDeleteQuestion = (index) => {
        const newQuestions = [...generatedQuestions];
        newQuestions.splice(index, 1);
        setGeneratedQuestions(newQuestions);
    };

    const handleEditQuestion = (index, field, value) => {
        const newQuestions = [...generatedQuestions];
        newQuestions[index][field] = value;
        setGeneratedQuestions(newQuestions);
    };

    return (
        <div className="question-generator-container glass-panel">
            <div className="generator-header">
                <h3>✨ AI Question Generator</h3>
                <p>Create practice questions instantly</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {step === 'input' && (
                <div className="generator-form">
                    <div className="form-group">
                        <label>Select Topic</label>
                        <select
                            value={formData.topicId}
                            onChange={(e) => setFormData({ ...formData, topicId: e.target.value, customTopic: '' })}
                        >
                            <option value="">-- Select a Topic --</option>
                            {topics && topics.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Or Enter Custom Topic</label>
                        <input
                            type="text"
                            placeholder="e.g., Photosynthesis"
                            value={formData.customTopic}
                            onChange={(e) => setFormData({ ...formData, customTopic: e.target.value, topicId: '' })}
                            disabled={!!formData.topicId}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Number of Questions: {formData.count}</label>
                            <input
                                type="range"
                                min="1" max="10"
                                value={formData.count}
                                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Difficulty: {formData.difficulty}/5</label>
                            <input
                                type="range"
                                min="1" max="5"
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <button className="generate-btn" onClick={handleGenerate}>
                        Generate Questions 🪄
                    </button>
                </div>
            )}

            {step === 'loading' && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>AI is crafting your questions...</p>
                </div>
            )}

            {step === 'review' && (
                <div className="review-section">
                    <div className="review-header">
                        <h4>Review Questions ({generatedQuestions.length})</h4>
                        <button className="back-btn" onClick={() => setStep('input')}>Back</button>
                    </div>

                    <div className="questions-list">
                        {generatedQuestions.map((q, i) => (
                            <div key={i} className="question-card">
                                <div className="card-header">
                                    <span className="q-number">Q{i + 1}</span>
                                    <span className="q-type">{q.type}</span>
                                    <button className="delete-btn" onClick={() => handleDeleteQuestion(i)}>×</button>
                                </div>

                                <textarea
                                    className="q-content-edit"
                                    value={q.content}
                                    onChange={(e) => handleEditQuestion(i, 'content', e.target.value)}
                                />

                                {q.type === 'MCQ' && (
                                    <div className="options-list">
                                        {q.options.map((opt, optIndex) => (
                                            <div key={optIndex} className={`option ${opt === q.correct_answer ? 'correct' : ''}`}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="answer-section">
                                    <strong>Answer:</strong> {q.correct_answer}
                                    <p className="explanation"><em>{q.explanation}</em></p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="save-btn" onClick={handleSave} disabled={generatedQuestions.length === 0}>
                        Approve & Save Questions ✅
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuestionGenerator;

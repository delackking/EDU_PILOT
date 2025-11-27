import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import './Practice.css';

function Practice() {
    const { topicId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadQuestions();
    }, [topicId]);

    const loadQuestions = async () => {
        try {
            const response = await studentAPI.getPracticeQuestions(topicId);
            setQuestions(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load questions:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        const question = questions[currentIndex];
        const correct = selectedAnswer === question.correct_answer;
        setIsCorrect(correct);
        setShowFeedback(true);

        if (correct) {
            setScore(score + 1);
        }

        // Submit answer to backend
        try {
            await studentAPI.submitAnswer({
                questionId: question.id,
                answer: selectedAnswer,
                topicId: topicId,
                correct: correct
            });
        } catch (error) {
            console.error('Failed to submit answer:', error);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer('');
            setShowFeedback(false);
        } else {
            setCompleted(true);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="container mt-lg text-center">
                <h2>No questions available for this topic yet.</h2>
                <button className="btn btn-primary mt-md" onClick={() => navigate('/student/subjects')}>
                    Back to Subjects
                </button>
            </div>
        );
    }

    if (completed) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="practice-complete container">
                <div className="complete-card glass-card fade-in">
                    <div className="complete-icon">
                        {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
                    </div>
                    <h1>Practice Complete!</h1>
                    <div className="score-display">
                        <div className="score-circle">
                            <span className="score-number">{percentage}%</span>
                        </div>
                        <p className="score-text">
                            You got <strong>{score}</strong> out of <strong>{questions.length}</strong> correct!
                        </p>
                    </div>
                    <div className="complete-message">
                        {percentage >= 80 && <p>🌟 Excellent work! You've mastered this topic!</p>}
                        {percentage >= 60 && percentage < 80 && <p>👏 Good job! Keep practicing to improve!</p>}
                        {percentage < 60 && <p>💪 Keep going! Practice makes perfect!</p>}
                    </div>
                    <div className="complete-actions">
                        <button className="btn btn-outline" onClick={() => window.location.reload()}>
                            Practice Again
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate('/student/subjects')}>
                            Back to Subjects
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const question = questions[currentIndex];
    const options = question.options ? JSON.parse(question.options) : null;

    return (
        <div className="practice-mode container">
            <div className="practice-header glass-card">
                <div className="progress-info">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span>Score: {score}/{questions.length}</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="question-card glass-card mt-lg fade-in">
                <div className="question-type-badge">
                    <span className="badge badge-primary">{question.type}</span>
                </div>

                <h2 className="question-text">{question.content}</h2>

                {/* MCQ Options */}
                {question.type === 'MCQ' && options && (
                    <div className="options-list mt-lg">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-btn ${selectedAnswer === option ? 'selected' : ''} ${showFeedback && option === question.correct_answer ? 'correct' : ''
                                    } ${showFeedback && selectedAnswer === option && option !== question.correct_answer ? 'incorrect' : ''
                                    }`}
                                onClick={() => !showFeedback && setSelectedAnswer(option)}
                                disabled={showFeedback}
                            >
                                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                <span className="option-text">{option}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Fill in the Blank */}
                {question.type === 'FILL_BLANK' && (
                    <div className="fill-blank-input mt-lg">
                        <input
                            type="text"
                            className="input"
                            placeholder="Type your answer here..."
                            value={selectedAnswer}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            disabled={showFeedback}
                        />
                    </div>
                )}

                {/* Long Answer */}
                {question.type === 'LONG' && (
                    <div className="long-answer-input mt-lg">
                        <textarea
                            className="input"
                            rows="5"
                            placeholder="Write your answer here..."
                            value={selectedAnswer}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            disabled={showFeedback}
                        />
                    </div>
                )}

                {/* Feedback */}
                {showFeedback && (
                    <div className={`feedback-box mt-lg ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="feedback-header">
                            {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                        </div>
                        <p className="feedback-text">{question.explanation}</p>
                        {!isCorrect && (
                            <p className="correct-answer-text">
                                <strong>Correct Answer:</strong> {question.correct_answer}
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="question-actions mt-lg">
                    {!showFeedback ? (
                        <button
                            className="btn btn-primary btn-full"
                            onClick={handleSubmit}
                            disabled={!selectedAnswer}
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary btn-full"
                            onClick={handleNext}
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question →' : 'Finish Practice'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Practice;

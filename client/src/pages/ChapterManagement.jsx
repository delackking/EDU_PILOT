import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../services/api';
import './ChapterManagement.css';

function ChapterManagement() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingTopic, setEditingTopic] = useState(null);
    const [topicData, setTopicData] = useState({});

    useEffect(() => {
        fetchChapters();
    }, []);

    useEffect(() => {
        if (id) {
            fetchChapterDetails(id);
        }
    }, [id]);

    const fetchChapters = async () => {
        try {
            const response = await teacherAPI.getChapters();
            setChapters(response.data.chapters);
            setLoading(false);
        } catch (err) {
            setError('Failed to load chapters');
            setLoading(false);
        }
    };

    const fetchChapterDetails = async (chapterId) => {
        try {
            const response = await teacherAPI.getChapter(chapterId);
            setSelectedChapter(response.data);
        } catch (err) {
            setError('Failed to load chapter details');
        }
    };

    const handlePublish = async (chapterId) => {
        if (!confirm('Are you sure you want to publish this chapter? Students will be able to access it.')) {
            return;
        }

        try {
            await teacherAPI.publishChapter(chapterId);
            alert('Chapter published successfully!');
            fetchChapters();
            if (selectedChapter?.chapter.id === chapterId) {
                fetchChapterDetails(chapterId);
            }
        } catch (err) {
            alert('Failed to publish chapter');
        }
    };

    const handleDelete = async (chapterId) => {
        if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
            return;
        }

        try {
            await teacherAPI.deleteChapter(chapterId);
            alert('Chapter deleted successfully');
            fetchChapters();
            if (selectedChapter?.chapter.id === chapterId) {
                setSelectedChapter(null);
                navigate('/teacher/chapters');
            }
        } catch (err) {
            alert('Failed to delete chapter');
        }
    };

    const handleEditTopic = (topic) => {
        setEditingTopic(topic.id);
        setTopicData({
            name: topic.name,
            theory: topic.theory,
            eli5: topic.eli5,
            story: topic.story,
            examples: topic.examples,
            difficulty: topic.difficulty
        });
    };

    const handleSaveTopic = async (topicId) => {
        try {
            await teacherAPI.updateTopic(topicId, topicData);
            alert('Topic updated successfully!');
            setEditingTopic(null);
            fetchChapterDetails(selectedChapter.chapter.id);
        } catch (err) {
            alert('Failed to update topic');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            processing: { class: 'badge-warning', text: '⏳ Processing' },
            draft: { class: 'badge-info', text: '📝 Draft' },
            published: { class: 'badge-success', text: '✅ Published' },
            failed: { class: 'badge-danger', text: '❌ Failed' }
        };
        const badge = badges[status] || badges.draft;
        return <span className={`badge ${badge.class}`}>{badge.text}</span>;
    };

    if (loading) {
        return (
            <div className="chapter-management container">
                <div className="loading-box glass-card">
                    <div className="spinner"></div>
                    <p className="text-secondary mt-sm">Loading chapters...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chapter-management container">
            <div className="management-header fade-in">
                <h1>📚 My Chapters</h1>
                <p className="text-secondary">Manage your uploaded chapters and AI-generated content</p>
            </div>

            {error && (
                <div className="error-box mt-md">
                    <strong>⚠️ Error:</strong> {error}
                </div>
            )}

            <div className="chapters-layout mt-lg">
                {/* Chapters List */}
                <div className="chapters-list">
                    <h2>Uploaded Chapters ({chapters.length})</h2>
                    {chapters.length === 0 ? (
                        <div className="empty-state glass-card mt-md">
                            <p>📭 No chapters uploaded yet</p>
                            <button
                                className="btn btn-primary btn-sm mt-sm"
                                onClick={() => navigate('/teacher/upload')}
                            >
                                Upload First Chapter
                            </button>
                        </div>
                    ) : (
                        <div className="chapters-grid mt-md">
                            {chapters.map(chapter => (
                                <div
                                    key={chapter.id}
                                    className={`chapter-card glass-card ${selectedChapter?.chapter.id === chapter.id ? 'active' : ''}`}
                                    onClick={() => navigate(`/teacher/chapters/${chapter.id}`)}
                                >
                                    <div className="chapter-card-header">
                                        <h3>{chapter.chapter_name}</h3>
                                        {getStatusBadge(chapter.status)}
                                    </div>
                                    <div className="chapter-card-meta">
                                        <span>📚 {chapter.subject}</span>
                                        <span>🎓 Class {chapter.grade}</span>
                                    </div>
                                    {chapter.status === 'draft' || chapter.status === 'published' ? (
                                        <div className="chapter-card-stats">
                                            <span>{chapter.topics_count || 0} Topics</span>
                                            <span>{chapter.questions_count || 0} Questions</span>
                                        </div>
                                    ) : null}
                                    <div className="chapter-card-date">
                                        {new Date(chapter.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chapter Details */}
                {selectedChapter && (
                    <div className="chapter-details fade-in">
                        <div className="details-header glass-card">
                            <div>
                                <h2>{selectedChapter.chapter.chapter_name}</h2>
                                <div className="details-meta">
                                    <span>📚 {selectedChapter.chapter.subject}</span>
                                    <span>🎓 Class {selectedChapter.chapter.grade}</span>
                                    {getStatusBadge(selectedChapter.chapter.status)}
                                </div>
                            </div>
                            <div className="details-actions">
                                {selectedChapter.chapter.status === 'draft' && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handlePublish(selectedChapter.chapter.id)}
                                    >
                                        ✅ Publish
                                    </button>
                                )}
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(selectedChapter.chapter.id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>

                        {/* Topics */}
                        <div className="topics-section mt-md">
                            <h3>Topics ({selectedChapter.topics.length})</h3>
                            {selectedChapter.topics.map(topic => (
                                <div key={topic.id} className="topic-card glass-card mt-md">
                                    <div className="topic-header">
                                        <h4>{topic.name}</h4>
                                        <div className="topic-actions">
                                            <span className="badge badge-secondary">
                                                Difficulty: {topic.difficulty}/5
                                            </span>
                                            {editingTopic === topic.id ? (
                                                <>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleSaveTopic(topic.id)}
                                                    >
                                                        💾 Save
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setEditingTopic(null)}
                                                    >
                                                        ❌ Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleEditTopic(topic)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {editingTopic === topic.id ? (
                                        <div className="topic-edit-form">
                                            <div className="form-group">
                                                <label>Topic Name</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={topicData.name}
                                                    onChange={(e) => setTopicData({ ...topicData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Theory</label>
                                                <textarea
                                                    className="input"
                                                    rows="4"
                                                    value={topicData.theory}
                                                    onChange={(e) => setTopicData({ ...topicData, theory: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>ELI5 (Simple Explanation)</label>
                                                <textarea
                                                    className="input"
                                                    rows="3"
                                                    value={topicData.eli5}
                                                    onChange={(e) => setTopicData({ ...topicData, eli5: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Story Mode</label>
                                                <textarea
                                                    className="input"
                                                    rows="3"
                                                    value={topicData.story}
                                                    onChange={(e) => setTopicData({ ...topicData, story: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Examples</label>
                                                <textarea
                                                    className="input"
                                                    rows="2"
                                                    value={topicData.examples}
                                                    onChange={(e) => setTopicData({ ...topicData, examples: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="topic-content">
                                            <div className="content-section">
                                                <strong>📖 Theory:</strong>
                                                <p>{topic.theory}</p>
                                            </div>
                                            <div className="content-section">
                                                <strong>🧒 ELI5:</strong>
                                                <p>{topic.eli5}</p>
                                            </div>
                                            <div className="content-section">
                                                <strong>📚 Story:</strong>
                                                <p>{topic.story}</p>
                                            </div>
                                            <div className="content-section">
                                                <strong>💡 Examples:</strong>
                                                <p>{topic.examples}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Questions */}
                                    <div className="questions-section mt-md">
                                        <h5>Practice Questions ({topic.questions.length})</h5>
                                        {topic.questions.map((q, idx) => (
                                            <div key={q.id} className="question-item mt-sm">
                                                <strong>Q{idx + 1}. ({q.type})</strong> {q.content}
                                                <div className="question-answer">
                                                    <strong>Answer:</strong> {q.correct_answer}
                                                </div>
                                                {q.explanation && (
                                                    <div className="question-explanation">
                                                        <em>{q.explanation}</em>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChapterManagement;

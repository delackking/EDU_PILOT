import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI } from '../services/api';
import './UploadChapter.css';

function UploadChapter() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [chapterName, setChapterName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const subjects = ['Math', 'Science', 'English', 'Social Studies', 'Hindi'];
    const grades = [1, 2, 3, 4, 5, 6, 7, 8];

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        if (selectedFile.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!file || !subject || !grade) {
            setError('Please fill in all required fields');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('pdf', file);
            formData.append('subject', subject);
            formData.append('grade', grade);
            formData.append('chapterName', chapterName || file.name.replace('.pdf', ''));

            const response = await teacherAPI.uploadChapter(formData);

            setSuccess(`Chapter uploaded successfully! Processing in background... (ID: ${response.data.chapterId})`);

            // Reset form
            setFile(null);
            setFileName('');
            setSubject('');
            setGrade('');
            setChapterName('');

            // Redirect to chapters page after 2 seconds
            setTimeout(() => {
                navigate('/teacher/chapters');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload chapter');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-chapter container">
            <div className="upload-header fade-in">
                <h1>📄 Upload PDF Chapter</h1>
                <p className="text-secondary">Upload a textbook chapter and let AI create structured content</p>
            </div>

            <div className="upload-form-container glass-card mt-lg fade-in">
                <form onSubmit={handleSubmit}>
                    {/* File Upload Area */}
                    <div
                        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="pdf-upload"
                            accept=".pdf"
                            onChange={handleFileInput}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="pdf-upload" className="upload-label">
                            {file ? (
                                <div className="file-selected">
                                    <div className="file-icon">📄</div>
                                    <div className="file-info">
                                        <p className="file-name">{fileName}</p>
                                        <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFile(null);
                                            setFileName('');
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="upload-placeholder">
                                    <div className="upload-icon">📁</div>
                                    <h3>Drag & Drop PDF Here</h3>
                                    <p className="text-muted">or click to browse</p>
                                    <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
                                        Maximum file size: 10MB
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Chapter Details */}
                    <div className="form-row mt-md">
                        <div className="form-group">
                            <label htmlFor="subject">Subject *</label>
                            <select
                                id="subject"
                                className="input"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="grade">Class/Grade *</label>
                            <select
                                id="grade"
                                className="input"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                required
                            >
                                <option value="">Select Grade</option>
                                {grades.map(g => (
                                    <option key={g} value={g}>Class {g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group mt-md">
                        <label htmlFor="chapterName">Chapter Name (Optional)</label>
                        <input
                            type="text"
                            id="chapterName"
                            className="input"
                            placeholder="e.g., Introduction to Algebra"
                            value={chapterName}
                            onChange={(e) => setChapterName(e.target.value)}
                        />
                        <small className="text-muted">Leave blank to use PDF filename</small>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="error-box mt-md">
                            <strong>⚠️ Error:</strong> {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-box mt-md">
                            <strong>✅ Success:</strong> {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-full mt-lg"
                        disabled={uploading || !file}
                    >
                        {uploading ? '⏳ Uploading & Processing...' : '🚀 Upload & Process'}
                    </button>
                </form>
            </div>

            {/* Info Section */}
            <div className="info-section glass-card mt-lg">
                <h3>ℹ️ What Happens Next?</h3>
                <ol className="info-list">
                    <li>Your PDF will be uploaded and processed in the background</li>
                    <li>AI will extract text and identify 3-5 main topics</li>
                    <li>For each topic, AI generates:
                        <ul>
                            <li>Theory explanation</li>
                            <li>ELI5 (simple) version</li>
                            <li>Story mode</li>
                            <li>Real-life examples</li>
                            <li>5 practice questions (MCQ, Fill-blank, Short answer)</li>
                        </ul>
                    </li>
                    <li>Chapter status will be "Draft" - you can review and edit</li>
                    <li>Once satisfied, publish it for students to access</li>
                </ol>
                <p className="text-muted mt-md">
                    <strong>Processing time:</strong> Typically 1-2 minutes depending on PDF size
                </p>
            </div>
        </div>
    );
}

export default UploadChapter;

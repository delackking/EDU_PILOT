import { useState, useEffect } from 'react';
import { schoolAPI } from '../services/api';
import './SchoolPage.css';

function SchoolPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchRole, setSearchRole] = useState('TEACHER');
    const [searchResults, setSearchResults] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await schoolAPI.getStats();
            setLeaderboard(response.data.leaderboard);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await schoolAPI.search(searchQuery, searchRole);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="school-page-container">
            <div className="school-header">
                <h1>My School</h1>
                <p>Connect with teachers and see who's topping the charts!</p>
            </div>

            <div className="school-content">
                {/* Search Section */}
                <div className="search-section glass-card">
                    <h2>Find People</h2>
                    <form onSubmit={handleSearch} className="search-form">
                        <select
                            value={searchRole}
                            onChange={(e) => setSearchRole(e.target.value)}
                            className="search-select"
                        >
                            <option value="TEACHER">Teachers</option>
                            <option value="STUDENT">Students</option>
                        </select>
                        <input
                            type="text"
                            placeholder={`Search ${searchRole.toLowerCase()}s by name...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    <div className="search-results">
                        {searchResults.length > 0 ? (
                            <div className="results-grid">
                                {searchResults.map(user => (
                                    <div key={user.id} className="user-card fade-in">
                                        <div className="user-avatar">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="user-info">
                                            <h3>{user.name}</h3>
                                            <p className="user-id">ID: {user.school_assigned_id}</p>
                                            {user.role === 'TEACHER' && (
                                                <p className="user-details">
                                                    {JSON.parse(user.role_details).subjects?.join(', ')}
                                                </p>
                                            )}
                                            {user.role === 'STUDENT' && (
                                                <p className="user-details">
                                                    Class {JSON.parse(user.role_details).class}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            searchQuery && !loading && <p className="no-results">No results found.</p>
                        )}
                    </div>
                </div>

                {/* Leaderboard Section */}
                <div className="leaderboard-section glass-card">
                    <h2>🏆 Top Students</h2>
                    {statsLoading ? (
                        <p>Loading stats...</p>
                    ) : (
                        <div className="leaderboard-list">
                            {leaderboard.map((student, index) => (
                                <div key={index} className="leaderboard-item">
                                    <div className="rank">#{index + 1}</div>
                                    <div className="student-info">
                                        <h4>{student.name}</h4>
                                        <p>Class {student.class}</p>
                                    </div>
                                    <div className="xp-badge">
                                        {student.xp} XP
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SchoolPage;

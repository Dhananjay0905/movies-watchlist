import React, { useState, useEffect } from 'react';
import './Watchlist.css';

const Watchlist = ({ user }) => {
    const [view, setView] = useState('mylist');
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [myMovies, setMyMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    useEffect(() => {
        if (view === 'mylist') fetchMyMovies();
    }, [view]);

    const fetchMyMovies = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/watchlist');
            const data = await res.json();
            setMyMovies(data);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const searchMovies = async (e) => {
        e.preventDefault();
        if (!query) return;
        try {
            const res = await fetch(`/api/search?q=${query}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                // FIX 1: Filter out movies that have NO poster
                const validMovies = data.filter(movie => movie.poster_path !== null);
                setSearchResults(validMovies);
                setView('search');
            }
        } catch (err) { console.error(err); }
    };

    // --- LOGIC TO FETCH DETAILS (Used by both Modal and Quick Add) ---
    const fetchRichDetails = async (movieId) => {
        const res = await fetch(`/api/movie/${movieId}`);
        if (!res.ok) throw new Error("Failed to fetch details");
        return await res.json();
    };

    const handleViewDetails = async (movie) => {
        if (view === 'mylist') {
            setSelectedMovie(movie);
            return;
        }
        setIsModalLoading(true);
        try {
            const richData = await fetchRichDetails(movie.id);
            setSelectedMovie(richData);
        } catch (err) {
            alert("Could not load details.");
        } finally {
            setIsModalLoading(false);
        }
    };

    // FIX 2: QUICK ADD (Fetches rich data silently then saves)
    const handleQuickAdd = async (e, basicMovieData) => {
        e.stopPropagation(); // Stop it from opening the modal

        // UI Feedback (Optional: could add a spinner on the button)
        const btn = e.target;
        const originalText = btn.innerText;
        btn.innerText = "Saving...";
        btn.disabled = true;

        try {
            // 1. We must fetch the RICH data first (Director, Actors, etc.)
            const richMovie = await fetchRichDetails(basicMovieData.id);

            // 2. Save that rich data to DB
            await addToWatchlist(richMovie);
        } catch (err) {
            console.error(err);
            alert("Failed to add movie.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    };

    const addToWatchlist = async (movie) => {
        try {
            const res = await fetch('/api/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movie)
            });
            if (res.ok) {
                alert(`Saved "${movie.title}"!`);
                setSelectedMovie(null);
            }
        } catch (err) { console.error(err); }
    };

    const markAsWatched = async (docId, revId, title) => {
        if (window.confirm(`Mark "${title}" as watched?`)) {
            try {
                const res = await fetch(`/api/watchlist/${docId}/${revId}`, { method: 'DELETE' });
                if (res.ok) {
                    setMyMovies(myMovies.filter(m => m._id !== docId));
                    setSelectedMovie(null);
                }
            } catch (err) { console.error(err); }
        }
    };

    return (
        <div className="watchlist-container">
            <header className="header">
                <h1>🎬 MovieWatchlist</h1>
                <div className="user-controls">
                    <span>{user.name}</span>
                    <button className="logout-btn" onClick={() => window.location.href = '/auth/logout'}>Logout</button>
                </div>
            </header>

            <div className="tabs">
                <button className={view === 'mylist' ? 'active' : ''} onClick={() => setView('mylist')}>My Watchlist</button>
                <button className={view === 'search' ? 'active' : ''} onClick={() => setView('search')}>Search New Movies</button>
            </div>

            {view === 'search' && (
                <div className="search-section">
                    <form onSubmit={searchMovies}>
                        <input type="text" placeholder="Search for a movie..." value={query} onChange={(e) => setQuery(e.target.value)} />
                        <button type="submit">Search</button>
                    </form>
                </div>
            )}

            {/* --- GRID --- */}
            {view === 'mylist' && isLoading ? (
                <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
            ) : (
                <div className="movies-grid">

                    {/* SEARCH RESULTS */}
                    {view === 'search' && searchResults.map(movie => (
                        <div key={movie.id} className="movie-card">
                            {/* Click Poster -> Open Modal */}
                            <div onClick={() => handleViewDetails(movie)} style={{ cursor: 'pointer' }}>
                                <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} />
                            </div>

                            <div className="card-content">
                                <h3>{movie.title}</h3>

                                {/* FIX 3: TWO BUTTONS (Add & Details) */}
                                <div className="card-actions">
                                    <button className="add-btn" onClick={(e) => handleQuickAdd(e, movie)}>
                                        + Add
                                    </button>
                                    <button className="details-btn" onClick={() => handleViewDetails(movie)}>
                                        ℹ Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* 2. FUNNY EMPTY STATE */}
                    {view === 'mylist' && !isLoading && myMovies.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🦗</div>
                            <h2>It's quiet... too quiet.</h2>
                            <p>You don't seem to have any movies here.</p>
                            <p><small>Are you actually going outside? Disgusting.</small></p>

                            <button className="cta-btn" onClick={() => setView('search')}>
                                Fix this tragedy (Search Movies)
                            </button>
                        </div>
                    )}
                    {/* WATCHLIST ITEMS */}
                    {view === 'mylist' && myMovies.map(movie => (
                        <div key={movie._id} className="movie-card" onClick={() => handleViewDetails(movie)}>
                            <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} />
                            <div className="card-content">
                                <h3>{movie.title}</h3>
                                <div className="card-actions">
                                    <button className="watched-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        markAsWatched(movie._id, movie._rev, movie.title);
                                    }}>✅ Watched</button>
                                    <button className="details-btn" onClick={() => handleViewDetails(movie)}>
                                        ℹ Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- RICH DATA MODAL (Same as before) --- */}
            {selectedMovie && (
                <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedMovie(null)}>&times;</button>

                        <img
                            className="modal-poster"
                            src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                            alt={selectedMovie.title}
                        />

                        <div className="modal-info">
                            <h2>{selectedMovie.title}</h2>
                            <p className="meta-date">Released: {selectedMovie.release_date || 'Unknown'}</p>

                            {selectedMovie.tagline && <h4 className="tagline">"{selectedMovie.tagline}"</h4>}

                            <p className="overview">{selectedMovie.overview}</p>

                            <div className="meta-row"><strong>Genre(s):</strong> <span>{selectedMovie.genres?.join(', ')}</span></div>
                            <div className="meta-row"><strong>Director:</strong> <span>{selectedMovie.director}</span></div>
                            <div className="meta-row">
                                <strong>Actors:</strong>
                                <span>
                                    {selectedMovie.actors?.join(', ')}
                                    {/* Simply add the text here */}
                                    , and many more
                                </span>
                            </div>
                            <div className="modal-actions" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                {view === 'search' ? (
                                    <button className="add-btn" onClick={() => addToWatchlist(selectedMovie)}>+ Add to Watchlist</button>
                                ) : (
                                    <button className="watched-btn" onClick={() => markAsWatched(selectedMovie._id, selectedMovie._rev, selectedMovie.title)}>✅ Mark as Watched</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Watchlist;
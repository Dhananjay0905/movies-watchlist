import React from 'react';
import './LoginPage.css';

const LoginPage = () => {

    const handleLogin = () => {
        window.location.href = "http://localhost:3000/auth/login";
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>🎬 MovieWatchlist</h1>
                {/* Updated description */}
                <p>Keep track of movies you want to see and build your personal collection.</p>

                <div className="features">
                    <span>✅ Save Movies</span>
                    {/* Removed Rate Titles */}
                    <span>✅ Secure Login</span>
                </div>

                <button onClick={handleLogin} className="login-btn">
                    Login / Sign Up with IBM Cloud
                </button>

                <p className="secure-note">
                    <small>🔒 Authentication handled securely by IBM App ID</small>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFeedClick = () => {
    navigate('/feed');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <header className="app-header">
      <div className="logo-container">
        <div className="logo-badge">M</div>
        <div className="logo-text">MiniSocial</div>
      </div>
      
      <div className="user-actions">
        {isAuthenticated ? (
          <>
            <div className="avatar">
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              title="Logout"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </>
        ) : (
          <button className="logout-btn" onClick={handleLoginClick}>
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar } from '@mui/material';
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
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={handleFeedClick}
        >
          MiniSocial
        </Typography>
        
        {isAuthenticated ? (
          <>
            <Avatar 
              sx={{ mr: 2, bgcolor: 'secondary.main' }}
              alt={user.username}
            >
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={handleLoginClick}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
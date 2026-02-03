import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Feed from './pages/Feed';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route 
        path="/feed" 
        element={
          <ProtectedRoute>
            <Navbar />
            <Feed />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}

export default App;

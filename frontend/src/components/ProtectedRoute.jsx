// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if a session exists in localStorage
  const sessionString = localStorage.getItem('mindmapSession');
  let session = null;
  if (sessionString) {
    try {
      session = JSON.parse(sessionString);
    } catch (e) {
      console.error("Failed to parse session from localStorage in ProtectedRoute", e);
      localStorage.removeItem('mindmapSession'); // Clear malformed session
    }
  }

  // If no valid session or token, redirect to the login page
  if (!session || !session.token) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the children components (the protected content)
  return children;
};

export default ProtectedRoute;
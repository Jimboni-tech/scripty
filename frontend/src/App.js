// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import MindMap from './pages/mindmap.jsx';
import MindMapDashboard from './pages/mindmapdashboard.jsx';
import Auth from './pages/auth.jsx';
import HomePage from './pages/homepage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppHeader from './components/appheader.jsx';

// Create a new component to encapsulate App's core logic and hooks
const AppContent = () => {
  const [session, setSession] = useState(null);
  const navigate = useNavigate(); // Now safe to use, as AppContent is inside <Router>
  const location = useLocation(); // Now safe to use

  // Centralized session loading from localStorage
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('mindmapSession');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession && parsedSession.token && parsedSession.user) {
          setSession(parsedSession);
        } else {
          localStorage.removeItem('mindmapSession');
          if (location.pathname !== '/') {
            navigate('/');
          }
        }
      } else {
        if (location.pathname !== '/') {
          navigate('/');
        }
      }
    } catch (e) {
      console.error("Failed to parse session from localStorage", e);
      localStorage.removeItem('mindmapSession');
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  }, [navigate, location.pathname]);

  // Centralized authentication success handler
  const handleAuthSuccess = useCallback((authData) => {
    setSession(authData);
    localStorage.setItem('mindmapSession', JSON.stringify(authData));
    navigate('/dashboard');
  }, [navigate]);

  // Centralized logout handler
  const handleLogout = useCallback(() => {
    setSession(null);
    localStorage.removeItem('mindmapSession');
    navigate('/');
  }, [navigate]);

  // Determine if the header should be shown (not on the Auth page)
  const showHeader = location.pathname !== '/';

  return (
    <>
      {showHeader && <AppHeader session={session} onLogout={handleLogout} />}

      <Routes>
        <Route path="/" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/home" element={<HomePage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <MindMapDashboard session={session} onLogout={handleLogout} /> {/* Pass session and onLogout */}
            </ProtectedRoute>
          }
        />
        <Route
          path="/mindmap/:id"
          element={
            <ProtectedRoute session={session}>
              <MindMap session={session} onLogout={handleLogout} /> {/* Pass session and onLogout */}
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent /> {/* Render the new AppContent component here */}
    </Router>
  );
}

export default App;
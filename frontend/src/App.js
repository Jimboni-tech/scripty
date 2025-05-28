import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import MindMap from './pages/mindmap.jsx';
import MindMapDashboard from './pages/mindmapdashboard.jsx';
import Auth from './pages/auth.jsx'; // Assuming Auth.jsx is in the 'pages' directory
import HomePage from './pages/homepage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  // State to hold the session data (e.g., user info, token)
  const [session, setSession] = useState(null);

  // Effect to load session from localStorage when the app starts
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem('mindmapSession');
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        // Basic validation: check if token and user exist in the parsed session
        if (parsedSession && parsedSession.token && parsedSession.user) {
          setSession(parsedSession);
        } else {
          // If the stored session is invalid, clear it
          localStorage.removeItem('mindmapSession');
        }
      }
    } catch (e) {
      console.error("Failed to parse session from localStorage", e);
      localStorage.removeItem('mindmapSession'); // Clear potentially corrupted data
    }
  }, []); // Run only once on component mount

  // ---
  // A wrapper component for the Auth route to handle navigation after login
  // ---
  const AuthRouteWrapper = () => {
    const navigate = useNavigate(); // useNavigate hook must be called inside a component within Router context

    // This function will be passed to the Auth component as 'onAuthSuccess'
    const handleAuthSuccess = useCallback((authData) => {
      // Save the authentication data to local state
      setSession(authData);
      // Persist the session data to localStorage
      localStorage.setItem('mindmapSession', JSON.stringify(authData));
      // Navigate to the dashboard after successful authentication
      navigate('/dashboard');
    }, [navigate]); // navigate is a stable function, but useCallback depends on it

    // Render the Auth component, passing the handleAuthSuccess function
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {/* Use AuthRouteWrapper here to manage navigation after login */}
        <Route path="/" element={<AuthRouteWrapper />} />
        <Route path="/home" element={<HomePage />} />

        {/* Protected Routes */}
        {/* These routes are wrapped by ProtectedRoute to ensure the user is logged in */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MindMapDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mindmap/:id"
          element={
            <ProtectedRoute>
              <MindMap />
            </ProtectedRoute>
          }
        />

        {/* Fallback for any unmatched routes - redirects to the login/auth page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
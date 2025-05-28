import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './mindmapdashboard.css'; // Create this CSS file for styling
const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5001/api';

const MindMapDashboard = () => { // Removed props: session, onLogout, onSetDashboardTitle
  const [mindMaps, setMindMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState(null); // Re-added session state
  const navigate = useNavigate();

  // On component mount, check session and load data
  useEffect(() => {
    const storedSession = localStorage.getItem('mindmapSession');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession && parsedSession.token && parsedSession.user) {
          setSession(parsedSession);
          // Fetch user's mind maps immediately after successful session load
          fetchUserMindMaps(parsedSession.token);
        } else {
          localStorage.removeItem('mindmapSession'); // Clear invalid session
          navigate('/');
        }
      } catch (e) {
        console.error("Failed to parse session from localStorage", e);
        localStorage.removeItem('mindmapSession');
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]); // No fetchUserMindMaps here, will be called inside handleLogout

  const handleLogout = () => { // Local handleLogout
    setSession(null);
    localStorage.removeItem('mindmapSession');
    navigate('/');
  };

  const fetchUserMindMaps = async (token) => { // Made async, no useCallback
    setLoading(true);
    setMessage('Fetching your mind maps...');
    try {
      const response = await fetch(`${API_BASE_URL}/mindmaps`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Session expired or unauthorized. Please log in again.');
          handleLogout(); // Use local handleLogout
          return;
        }
        throw new Error(`Error fetching mind maps: ${response.statusText}`);
      }

      const data = await response.json();
      setMindMaps(data);
      setMessage('Your mind maps loaded!');
    } catch (error) {
      console.error('Fetch mind maps error:', error);
      setMessage(`Failed to fetch mind maps: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const handleLoad = (id) => {
    navigate(`/mindmap/${id}`);
  };

  const handleNew = () => {
    navigate('/mindmap/new');
  };

  // If no session, navigate to login. ProtectedRoute should handle this, but as a fallback.
  if (!session) {
    return null; // Or a loading spinner if you want
  }

  return (
    <div className="dashboard-container">
      <h2>Your Scripts</h2>
      <button onClick={handleNew}>+ New Script</button>
      {loading ? (
        <p>Loading...</p>
      ) : mindMaps.length === 0 ? (
        <p>No mind maps found.</p>
      ) : (
        <ul>
          {mindMaps.map(map => (
            <li key={map._id}>
              <span>{map.title || 'Untitled'}</span>
              <button onClick={() => handleLoad(map._id)}>Open</button>
            </li>
          ))}
        </ul>
      )}
    
    </div>
  );
};

export default MindMapDashboard;
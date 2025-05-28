// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './homepage.css'; // Create this CSS file for styling

const HomePage = () => {
  return (
    <div className="homepage-container">
      <h1 className="homepage-title">Welcome to Your Mind Map Application!</h1>
      <p className="homepage-description">
        Organize your thoughts, plan projects, and brainstorm ideas with ease.
      </p>
      <div className="homepage-actions">
        <Link to="/dashboard" className="homepage-link">Go to Dashboard</Link>
        <Link to="/" className="homepage-link">Login / Register</Link>
      </div>
      <p className="homepage-footer">
        "The mind is not a vessel to be filled, but a fire to be kindled." - Plutarch
      </p>
    </div>
  );
};

export default HomePage;
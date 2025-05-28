// src/components/AppHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react'; // Assuming lucide-react is installed
import './appheader.css'; // We'll create this CSS file next

const AppHeader = ({ session, onLogout }) => {
  // Only render the header if a session exists (user is logged in)
  if (!session || !session.user) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/home" className="app-title">Scripty</Link>
        <nav className="main-nav">
          <Link to="/home" className="nav-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </nav>
      </div>
      <div className="header-right">
        {session.user.email && <span className="user-email">{session.user.email}</span>}
        <button onClick={onLogout} className="logout-btn" title="Log out">
          <LogOut size={18} className="logout-icon" /> Logout
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
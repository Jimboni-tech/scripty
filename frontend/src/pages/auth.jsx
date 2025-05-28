// src/components/auth.jsx
import React, { useState } from 'react';
import './auth.css'; // Create this CSS file for styling

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5001/api';

const Auth = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const endpoint = isRegister ? 'register' : 'login';
    const method = 'POST';

    try {
      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || (isRegister ? 'Registration successful!' : 'Login successful!'));
        onAuthSuccess({
          token: data.token,
          user: { email: data.email, _id: data._id }
        });
      } else {
        setMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        {message && <div className={`auth-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
        </button>
        <p className="toggle-auth">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <span onClick={() => setIsRegister(false)}>Login here</span>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span onClick={() => setIsRegister(true)}>Register here</span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default Auth;
// frontend/src/components/Auth.jsx
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './auth.css'; 

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      let authResponse;
      if (isLogin) {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
        setMessage('Signing in...');
      } else {
        authResponse = await supabase.auth.signUp({ email, password });
        setMessage('Signing up...');
      }

      const { data, error: authError } = authResponse;

      if (authError) throw authError;

      if (data.user) {
        setMessage(isLogin ? 'Logged in successfully!' : 'Signed up successfully! Check your email for verification.');
        onAuthSuccess(data.session); 
      } else if (data.user === null && !isLogin) { 
        setMessage('Signed up! Please check your email to confirm your account.');
      } else {
        throw new Error('Unexpected authentication response.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during authentication.');
      setMessage('');
      console.error('Auth Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        {message && <p className="auth-message success">{message}</p>}
        {error && <p className="auth-message error">{error}</p>}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="auth-toggle-button"
          disabled={loading}
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";  
import logo from '../assets/prime-logo.png';

function LoginSignup( { setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();  

  // Helper to get users from localStorage
  const getUsers = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : {};
  };

  // Helper to save users to localStorage
  const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('Please enter both email and password.');
      return;
    }
    const users = getUsers();
    if (isSignUp) {
      if (users[email]) {
        setMessage('Account already exists for this email.');
        return;
      }
      users[email] = password;
      saveUsers(users);
      setMessage(`Account created for ${email}!`);
      setIsSignUp(false);
    } else {
      if (!users[email]) {
        setMessage('No account found for this email.');
        return;
      }
      if (users[email] !== password) {
        setMessage('Incorrect password.');
        return;
      }
      localStorage.setItem("loggedInUser", email);
      setUser(email);
      navigate("/dashboard");
    }
    setEmail('');
    setPassword('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#23272f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: '100%',
          padding: 32,
          border: '2.5px solid #3b82f6', // blue accent
          borderRadius: 18,
          background: '#2c313a',
          color: '#f8f9fa',
          boxShadow: '0 6px 32px rgba(0,0,0,0.18)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={logo} alt="Logo" style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 16, boxShadow: '0 2px 12px rgba(59,130,246,0.12)' }} />
        </div>
        <h2 style={{ textAlign: 'center', color: '#ff0000', marginBottom: 24, fontWeight: 700 }}>
          {isSignUp ? 'Sign Up' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#f8f9fa', fontWeight: 500 }}>Email:</label>
            <input
              type="email"
              value={email}
              style={{
                width: '100%',
                padding: 10,
                marginTop: 4,
                border: '1px solid #ff0000',
                borderRadius: 8,
                background: '#23272f',
                color: '#f8f9fa',
                fontSize: 15
              }}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#f8f9fa', fontWeight: 500 }}>Password:</label>
            <input
              type="password"
              value={password}
              style={{
                width: '100%',
                padding: 10,
                marginTop: 4,
                border: '1px solid #ff0000',
                borderRadius: 8,
                background: '#23272f',
                color: '#f8f9fa',
                fontSize: 15
              }}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: 12,
              background: 'linear-gradient(90deg,#ff0000 60%,#ff4d4d 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 1,
              boxShadow: '0 2px 8px rgba(255,0,0,0.08)'
            }}
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <span style={{ color: '#f8f9fa' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            style={{
              marginLeft: 8,
              background: 'none',
              color: '#ff0000',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 600,
              fontSize: 15
            }}
            onClick={() => { setIsSignUp(!isSignUp); setMessage(''); setEmail(''); setPassword(''); }}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </div>
        {message && (
          <div style={{ marginTop: 18, color: 'green', textAlign: 'center', fontWeight: 500 }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginSignup;
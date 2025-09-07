import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";  
import logo from '../assets/prime-logo.png';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function LoginSignup({ setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isSignUp && (!firstName || !lastName)) {
      alert('Please enter your first and last name.');
      return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        try {
          await updateProfile(user, { displayName: `${firstName} ${lastName}` });
        } catch (e) {
          console.warn('Could not set displayName:', e);
        }
        try {
          await setDoc(doc(db, 'users', user.uid), {
            firstName,
            lastName,
            email,
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error('Failed saving user profile:', e);
        }
        setIsSignUp(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken(true);
        localStorage.setItem("token", token);

        setUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Authentication failed. " + error.message);
    }

    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        padding: 36,
        border: '2.5px solid #ff0000',
        borderRadius: 18,
        background: '#111',
        color: '#fff',
        boxShadow: '0 0 25px rgba(255,0,0,0.6)',
        transition: 'all 0.3s ease-in-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src={logo} alt="Logo" style={{
            width: 120,
            height: 120,
            objectFit: 'contain',
            borderRadius: 16,
            boxShadow: '0 0 20px rgba(255,0,0,0.6)'
          }} />
        </div>
        <h2 style={{
          textAlign: 'center',
          color: '#ff0000',
          marginBottom: 28,
          fontWeight: 700,
          textShadow: '0 0 8px rgba(255,0,0,0.6)'
        }}>
          {isSignUp ? 'Sign Up' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ color: '#fff', fontWeight: 500 }}>First Name:</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    marginTop: 6,
                    border: '1px solid #ff0000',
                    borderRadius: 8,
                    background: '#000',
                    color: '#fff',
                    fontSize: 15,
                    outline: 'none',
                    transition: '0.3s',
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 10px rgba(255,0,0,0.7)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
              <div>
                <label style={{ color: '#fff', fontWeight: 500 }}>Last Name:</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    marginTop: 6,
                    border: '1px solid #ff0000',
                    borderRadius: 8,
                    background: '#000',
                    color: '#fff',
                    fontSize: 15,
                    outline: 'none',
                    transition: '0.3s',
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 10px rgba(255,0,0,0.7)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
            </div>
          )}
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: '#fff', fontWeight: 500 }}>Email:</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 12,
                marginTop: 6,
                border: '1px solid #ff0000',
                borderRadius: 8,
                background: '#000',
                color: '#fff',
                fontSize: 15,
                outline: 'none',
                transition: '0.3s',
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 10px rgba(255,0,0,0.7)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: '#fff', fontWeight: 500 }}>Password:</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 12,
                marginTop: 6,
                border: '1px solid #ff0000',
                borderRadius: 8,
                background: '#000',
                color: '#fff',
                fontSize: 15,
                outline: 'none',
                transition: '0.3s',
              }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 10px rgba(255,0,0,0.7)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: 14,
              background: 'linear-gradient(90deg,#ff0000 0%,#b30000 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: 1,
              boxShadow: '0 0 12px rgba(255,0,0,0.6)',
              cursor: 'pointer',
              transition: 'all 0.3s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.background = 'linear-gradient(90deg,#fff 0%,#ff0000 100%)';
              e.target.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.background = 'linear-gradient(90deg,#ff0000 0%,#b30000 100%)';
              e.target.style.color = '#fff';
            }}
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <span style={{ color: '#fff' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setEmail(''); setPassword(''); }}
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
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;

import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";  
import logo from '../assets/prime-logo.png';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onIdTokenChanged
} from "firebase/auth";

function LoginSignup({ setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  
  const auth = getAuth();

  // 🔁 Token yenilendikçe otomatik logla (background refresh dahil)
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const freshToken = await user.getIdToken(); // refresh zorunlu değil burada
          console.log("🔁 Refreshed ID Token:", freshToken);
          // İsteyen kolayca kopyalasın diye global'e koy
          window.__ID_TOKEN__ = freshToken;
        } catch (e) {
          console.error("onIdTokenChanged error:", e);
        }
      }
    });
    return () => unsub();
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && (!firstName || !lastName))) return;

    try {
      if (isSignUp) {
        // SIGN UP
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`
        });

        // Basit profil bilgisi localStorage
        localStorage.setItem("userProfile", JSON.stringify({
          firstName,
          lastName,
          email
        }));

        setIsSignUp(false);
        alert("Account created! Please login.");
      } else {
        // LOGIN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 🔥 Her login'de TAZE token al ve console'a bas
        const token = await user.getIdToken(true);
        console.log("🔥 ID Token:", token);
        window.__ID_TOKEN__ = token;              // kolay erişim
        localStorage.setItem("token", token);     // mevcut akışı bozmayayım diye bırakıyorum

        // Daha önce kaydedilen profili oku
        const savedProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
        const [dispFirst = "", dispLast = ""] = (user.displayName || "").split(" ");

        setUser({
          email: user.email,
          firstName: savedProfile.firstName || dispFirst,
          lastName: savedProfile.lastName || dispLast
        });

        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Authentication failed. " + (error?.message || ""));
    } finally {
      // Form temizliği
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    }
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
            <>
              <div style={{ marginBottom: 18 }}>
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
                  }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
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
                  }}
                />
              </div>
            </>
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
              }}
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
              }}
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

import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth-context";
import logo from '../assets/prime-logo.png';
import {
  getAuth,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function LoginSignup() {
  const [isSignUp, setIsSignUp] = useState(false);

  // ✅ Sign Up alanları eklendi
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [resetMessage, setResetMessage] = useState("");
  const [resetMessageType, setResetMessageType] = useState(""); // 'success' | 'error'
  const navigate = useNavigate();
  const auth = getAuth();
  const { user } = useAuth();

  // 🔁 Token yenilendikçe otomatik logla (background refresh dahil)
  useEffect(() => {
    // Eğer zaten login ise formu göstermeyelim
    if (user) {
      navigate('/dashboard', { replace: true });
      return;
    }
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (!user) return;
      try {
        const freshToken = await user.getIdToken(); // refresh zorunlu değil
        console.log("🔁 Refreshed ID Token:", freshToken);
        window.__ID_TOKEN__ = freshToken;          // kolay kopyalama için
        localStorage.setItem("token", freshToken); // backend çağrıları için
      } catch (e) {
        console.error("onIdTokenChanged error:", e);
      }
    });
    return () => unsub();
  }, [auth, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      if (isSignUp) {
        // 👤 Kullanıcı oluştur
        const { user } = await createUserWithEmailAndPassword(auth, email, password);

        // 🔤 İsimleri Auth profilinde tut
        const displayName = `${firstName || ""} ${lastName || ""}`.trim();
        if (displayName) {
          await updateProfile(user, { displayName });
        }

        // 🗂 Firestore: users/{uid}
        await setDoc(doc(db, "users", user.uid), {
          firstName: firstName || "",
          lastName:  lastName  || "",
          email:     user.email || email,
          createdAt: serverTimestamp()
        }, { merge: true });

        // İstersen yerel profil sakla (opsiyonel)
        localStorage.setItem("userProfile", JSON.stringify({
          firstName: firstName || "",
          lastName:  lastName  || "",
          email:     user.email || email
        }));

        setIsSignUp(false);
        setFirstName('');
        setLastName('');
        alert("Account created! Please login.");
      } else {
        // LOGIN
        const { user } = await signInWithEmailAndPassword(auth, email, password);

        // 🔥 Taze token
        const token = await user.getIdToken(true);
        console.log("🔥 ID Token:", token);
        window.__ID_TOKEN__ = token;
        localStorage.setItem("token", token);

        // İsim/soyisim: displayName varsa parçala
        // displayName parts are optional; no need to store here

        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("Authentication failed. " + error.message);
    } finally {
      setEmail('');
      setPassword('');
    }
  };

  const handleForgotPassword = async () => {
    const mail = (email || "").trim();
    setResetMessage("");
    setResetMessageType("");
    if (!mail) {
      setResetMessage("Please enter your email above first.");
      setResetMessageType("error");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, mail);
      setResetMessage("Password reset email sent. Please check your inbox (and spam).");
      setResetMessageType("success");
    } catch (e) {
      console.error("Reset password error:", e);
      setResetMessage(e?.message || "Failed to send reset email.");
      setResetMessageType("error");
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 0'
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
          {/* Sign Up fields */}
          {isSignUp && (
            <>
              <div style={{ marginBottom: 12 }}>
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
              <div style={{ marginBottom: 12 }}>
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
            {!isSignUp && (
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  marginTop: 8,
                  background: 'none',
                  color: '#ff0000',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  fontSize: 14,
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            )}
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

        {!isSignUp && resetMessage && (
          <div
            role="status"
            style={{
              marginTop: 12,
              fontSize: 14,
              color: resetMessageType === 'success' ? '#86efac' : '#fca5a5',
            }}
          >
            {resetMessage}
          </div>
        )}

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <span style={{ color: '#fff' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setFirstName(''); setLastName(''); setEmail(''); setPassword(''); }}
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

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } finally {
      try { localStorage.removeItem('token'); } catch {}
      try { localStorage.removeItem('userProfile'); } catch {}
      try { sessionStorage.clear(); } catch {}
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, checking, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

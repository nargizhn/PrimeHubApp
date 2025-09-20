// src/components/Profile.js
// src/components/Profile.js — IMPORTS (fixed)
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Eye, EyeOff, User } from 'lucide-react';

import {
  getAuth,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
} from 'firebase/auth';

import { db, storage } from '../firebase'; // ✅ tek satırdan al
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // ✅ uploadBytes importlu


export default function UserProfilePage({ email }) {
  const [user, setUser] = useState({
    uid: '',
    firstName: '',
    lastName: '',
    email: email || '',
    profileImage: null, // render edilecek URL
    joinDate: '',
  });

  // Seçilen dosyayı ayrı sakla (persist için gerekli)
  const [selectedFile, setSelectedFile] = useState(null);

  // Inline name edit
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [busy, setBusy] = useState(false);

  // ---- Load profile (Firestore first, then Auth)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (fb) => {
      if (!fb) return;

      let firstName = '';
      let lastName = '';
      let joinDate = '';
      let photoURL = fb.photoURL || null;

      try {
        const refDoc = doc(db, 'users', fb.uid);
        const snap = await getDoc(refDoc);

        if (snap.exists()) {
          const data = snap.data();
          firstName = data.firstName || firstName;
          lastName = data.lastName || lastName;

          // Firestore’daki alan varsa onu tercih et
          const fsPhoto =
            data.photoURL || data.profileImage || data.profileImageUrl || null;
          if (fsPhoto) photoURL = fsPhoto;

          if (data.createdAt?.toDate) {
            joinDate = data.createdAt.toDate().toLocaleDateString();
          }
        } else {
          // İlk gelişte dokümanı oluştur
          await setDoc(
            refDoc,
            {
              email: fb.email || '',
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch (e) {
        console.warn('Profile load warning:', e);
      }

      // İsim yoksa displayName’den türet
      if ((!firstName || !lastName) && fb.displayName) {
        const parts = fb.displayName.split(' ');
        firstName = firstName || parts[0] || '';
        lastName = lastName || parts.slice(1).join(' ') || '';
      }

      // Join date yoksa Auth metadata kullan
      if (!joinDate) {
        joinDate = fb.metadata?.creationTime
          ? new Date(fb.metadata.creationTime).toLocaleDateString()
          : '';
      }

      const emailAddr = email || fb.email || '';

      setUser({
        uid: fb.uid,
        firstName,
        lastName,
        email: emailAddr,
        profileImage: photoURL || null,
        joinDate,
      });

      setFirst(firstName || '');
      setLast(lastName || '');
    });

    return () => unsubscribe();
  }, [email]);

  // ---- Name save
  const saveName = async () => {
    if (!user.uid) return;
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          firstName: first,
          lastName: last,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setUser((u) => ({ ...u, firstName: first, lastName: last }));
      setEditing(false);
      alert('Name updated.');
    } catch (e) {
      console.error(e);
      alert('Failed to update name.');
    }
  };

  // ---- Avatar seçimi (preview + dosyayı state'e)
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Hızlı güvenli önizleme
    const reader = new FileReader();
    reader.onload = (e) =>
      setUser((u) => ({ ...u, profileImage: e.target?.result || null }));
    reader.readAsDataURL(file);
  };

  // ---- Password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('Please sign in again.');
      return;
    }

    try {
      setBusy(true);

      const credential = EmailAuthProvider.credential(
        currentUser.email || user.email,
        passwordData.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordData.newPassword);

      alert('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error(error);
      let message = 'Failed to change password.';
      switch (error.code) {
        case 'auth/wrong-password':
          message = 'Current password is incorrect.';
          break;
        case 'auth/weak-password':
          message = 'New password is too weak.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Please try again later.';
          break;
        case 'auth/requires-recent-login':
          message = 'Please log in again and retry.';
          break;
        default:
          message = error.message || message;
      }
      alert(message);
    } finally {
      setBusy(false);
    }
  };

  // ---- Save all (name + photo upload + Firestore + Auth)
  const saveAllChanges = async () => {
    const auth = getAuth();
    const fbUser = auth.currentUser;
    if (!fbUser || !user.uid) {
      alert('Please sign in again.');
      return;
    }

    try {
      setBusy(true);

      // 1) İsim
      if (editing && (first !== user.firstName || last !== user.lastName)) {
        await saveName();
      }

      // 2) Foto (varsa)
      if (selectedFile) {
      const storageRef = ref(storage, `users/${user.uid}/avatar.jpg`);

        await uploadBytes(storageRef, selectedFile);
        const downloadURL = await getDownloadURL(storageRef);

        // Firestore’a kalıcı URL
        await setDoc(
          doc(db, 'users', user.uid),
          { photoURL: downloadURL, updatedAt: serverTimestamp() },
          { merge: true }
        );

        // Auth profilini güncelle + reload
        await updateProfile(fbUser, { photoURL: downloadURL });
        await fbUser.reload();

        // Local state
        setUser((u) => ({ ...u, profileImage: downloadURL }));
        setSelectedFile(null);
      }

      alert('All changes saved.');
    } catch (e) {
      console.error(e);
      alert('Failed to save changes.');
    } finally {
      setBusy(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#fff',
      padding: '32px 0',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    wrapper: { maxWidth: '1024px', margin: '0 auto', padding: '0 16px' },
    card: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.07)',
      overflow: 'hidden',
    },
    header: {
      background: 'linear-gradient(90deg, #000 0%, #dc2626 100%)',
      padding: '32px 24px',
      color: '#fff',
    },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 8, margin: 0 },
    content: { padding: 24 },
    profileImageContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    avatarWrapper: { position: 'relative', marginBottom: 8 },
    avatar: {
      width: 128,
      height: 128,
      borderRadius: '50%',
      backgroundColor: '#f3f4f6',
      overflow: 'hidden',
      border: '4px solid #fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
    },
    avatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(90deg, #000 0%, #dc2626 100%)',
      color: '#fff',
    },
    uploadButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#dc2626',
      color: '#fff',
      padding: 8,
      borderRadius: '50%',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'background-color 0.2s',
    },
    hiddenInput: { display: 'none' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>

          <h1 style={{
            marginBottom: 20,
            color: '#000',
            fontSize: '2rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '4px 8px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                color: 'inherit',
              }}
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
              role="button"
            >
              &larr;
            </Link>
            Profile <span style={{ color: '#dc2626' }}>Settings</span>
          </h1>

          <div style={styles.header}>
            <p style={styles.headerSubtitle}>Manage your account information and preferences</p>
          </div>

          <div style={styles.content}>
            {/* Top profile row */}
            <div style={s.topRow}>
              <div style={styles.profileImageContainer}>
                <div style={styles.avatarWrapper}>
                  <div style={styles.avatar}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" style={styles.avatarImage} />
                    ) : (
                      <div style={s.avatarPlaceholderFallback}>
                        <User size={64} />
                      </div>
                    )}
                  </div>
                  <label style={styles.uploadButton}>
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={styles.hiddenInput}
                    />
                  </label>
                </div>
                <p style={s.mail}>{user.email}</p>
              </div>

              <div>
                <div style={s.name}>
                  {(user.firstName || '') + ' ' + (user.lastName || '')}
                </div>
                <div style={s.join}>Joined: {user.joinDate || '-'}</div>
              </div>
            </div>

            {/* Editable name */}
            <div style={s.section}>
              <div style={s.label}>Full Name</div>
              {!editing ? (
                <div style={s.row}>
                  <div style={s.value}>
                    {(user.firstName || '') + ' ' + (user.lastName || '')}
                  </div>
                  <button onClick={() => setEditing(true)} style={s.outlineBtn}>
                    Edit
                  </button>
                </div>
              ) : (
                <div style={s.editGrid}>
                  <input
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    placeholder="First name"
                    style={s.input}
                    autoFocus
                  />
                  <input
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    placeholder="Last name"
                    style={s.input}
                  />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={saveName} style={s.primaryBtn}>
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setFirst(user.firstName || '');
                        setLast(user.lastName || '');
                        setEditing(false);
                      }}
                      style={s.ghostBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div style={s.section}>
              <div style={s.label}>Email Address</div>
              <input value={user.email} readOnly style={{ ...s.input, background: '#eee' }} />
            </div>

            {/* Password change */}
            <div style={{ ...s.section, ...s.innerCard }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={s.label}>Change Password</div>
                <button
                  style={s.primaryBtn}
                  onClick={() => setShowPasswordForm((v) => !v)}
                >
                  {showPasswordForm ? 'Close' : 'Open'}
                </button>
              </div>

              {showPasswordForm && (
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gap: 16,
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      marginTop: 12,
                    }}
                  >
                    {/* Current */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={s.label}>Current Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                          style={{ ...s.input, paddingRight: 40 }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((p) => ({ ...p, current: !p.current }))
                          }
                          style={eyeBtn}
                        >
                          {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={s.label}>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          style={{ ...s.input, paddingRight: 40 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                          style={eyeBtn}
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={s.label}>Confirm New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          style={{ ...s.input, paddingRight: 40 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                          style={eyeBtn}
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button
                      onClick={handlePasswordChange}
                      style={{ ...s.primaryBtn, opacity: busy ? 0.7 : 1, pointerEvents: busy ? 'none' : 'auto' }}
                    >
                      {busy ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              )}

              {!showPasswordForm && (
                <p style={{ color: '#6b7280', marginTop: 8 }}>
                  Keep your account secure with a strong password. Last changed: —
                </p>
              )}
            </div>

            {/* Save all */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 24, borderTop: '1px solid #e5e7eb', marginTop: 16 }}>
              <button
                style={s.primaryBtn}
                onClick={saveAllChanges}
                disabled={busy}
              >
                {busy ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */
const s = {
  topRow: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    paddingBottom: 12,
    borderBottom: '1px solid #eee',
    marginBottom: 16,
  },
  name: { fontSize: 20, fontWeight: 700, color: '#111827' },
  mail: { color: '#6b7280', marginTop: 4, textAlign: 'center' },
  join: {
    background: 'rgba(220,38,38,0.1)',
    color: '#dc2626',
    padding: '6px 10px',
    borderRadius: 8,
    fontWeight: 600,
    marginTop: 8,
    display: 'inline-block',
  },
  section: { marginTop: 16 },
  label: { fontWeight: 700, color: '#dc2626', marginBottom: 8 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  value: { fontSize: 16, color: '#111827' },
  editGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box',
  },
  primaryBtn: {
    background: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 6px 16px rgba(220,38,38,0.35)',
  },
  outlineBtn: {
    background: 'transparent',
    color: '#dc2626',
    border: '2px solid #dc2626',
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
  },
  ghostBtn: {
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600,
  },
  innerCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  avatarPlaceholderFallback: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(90deg, #000 0%, #dc2626 100%)',
    color: '#fff',
  },
};

// Reusable eye button style
const eyeBtn = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#dc2626',
  padding: 0,
};

import React, { useEffect, useState } from 'react';
import { Camera, Edit2, Save, X, Eye, EyeOff, User, Mail, Calendar } from 'lucide-react';
import { getAuth, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// Move ProfileField component outside to prevent recreation on every render
const ProfileField = ({ label, field, value, icon: Icon, type = "text", readOnly = false, 
  isEditing, tempData, user, onEdit, onSave, onCancel, onTempDataChange, styles }) => {
  return (
    <div style={styles.field}>
      <div style={styles.fieldHeader}>
        <div style={styles.fieldLabel}>
          <Icon size={16} color="#6b7280" />
          <span style={styles.labelText}>{label}</span>
        </div>
        {!isEditing[field] && field === 'name' && (
          <button onClick={() => onEdit(field)} style={styles.editButton}>
            <Edit2 size={16} />
          </button>
        )}
      </div>
      {isEditing[field] ? (
        <div>
          {field === 'name' ? (
            <div style={styles.nameGrid}>
              <input
                type="text"
                value={tempData.firstName !== undefined ? tempData.firstName : user.firstName}
                onChange={(e) => onTempDataChange({ ...tempData, firstName: e.target.value })}
                placeholder="First Name"
                style={styles.input}
                autoFocus
              />
              <input
                type="text"
                value={tempData.lastName !== undefined ? tempData.lastName : user.lastName}
                onChange={(e) => onTempDataChange({ ...tempData, lastName: e.target.value })}
                placeholder="Last Name"
                style={styles.input}
              />
            </div>
          ) : null}
          <div style={styles.buttonGroup}>
            <button onClick={() => onCancel(field)} style={styles.cancelButton}>
              <X size={16} />
            </button>
            <button onClick={() => onSave(field)} style={styles.saveButton}>
              <Save size={16} />
            </button>
          </div>
        </div>
      ) : (
        field === 'email' ? (
          <input
            type="email"
            value={user.email}
            style={{ ...styles.input, backgroundColor: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' }}
            readOnly
          />
        ) : (
          <p style={styles.fieldValue}>
            {field === 'name' ? `${user.firstName} ${user.lastName}` : value}
          </p>
        )
      )}
    </div>
  );
};

export default function UserProfilePage({ email }) {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: email || '',
    profileImage: null,
    joinDate: ''
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
  });

  const [tempData, setTempData] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (fb) => {
      if (!fb) return;
      let firstName = "";
      let lastName = "";
      try {
        const snap = await getDoc(doc(db, "users", fb.uid));
        if (snap.exists()) {
          const data = snap.data();
          firstName = data.firstName || firstName;
          lastName = data.lastName || lastName;
          joinDate = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : '';
        }
      } catch {}
      if ((!firstName || !lastName) && fb.displayName) {
        const parts = fb.displayName.split(" ");
        firstName = firstName || parts[0] || "";
        lastName = lastName || parts.slice(1).join(" ") || "";
      }
      const joinDate = fb.metadata?.creationTime
        ? new Date(fb.metadata.creationTime).toLocaleDateString()
        : "";
      setUser({
        uid: fb.uid,
        firstName,
        lastName,
        email: email || emailAddr,
        joinDate
      }));
    });
    return () => unsubscribe();
  }, [email]);

  const handleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
    setTempData({ ...tempData, [field]: user[field] });
  };

  const handleSave = (field) => {
    if (field === 'name') {
      setUser({ 
        ...user, 
        firstName: tempData.firstName !== undefined ? tempData.firstName : user.firstName,
        lastName: tempData.lastName !== undefined ? tempData.lastName : user.lastName
      });
    }
    setIsEditing({ ...isEditing, [field]: false });
    setTempData({ ...tempData, [field]: undefined });
  };

  const handleCancel = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    setTempData({ ...tempData, [field]: undefined });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser({ ...user, profileImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (!currentUser) return alert("Please sign in again.");
    try {
      setBusy(true);
      const cred = EmailAuthProvider.credential(
        currentUser.email || user.email,
        pwd.current
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordData.newPassword);

      alert('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      let message = 'Failed to change password.';
      switch (error.code) {
        case 'auth/wrong-password':
          message = 'Current password is incorrect.';
          break;
        case 'auth/weak-password':
          message = 'New password is too weak. Use at least 6 characters.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Please try again later.';
          break;
        case 'auth/requires-recent-login':
          message = 'Please log in again and retry changing your password.';
          break;
        default:
          message = error.message || message;
      }
      alert(message);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#fff',
      padding: '32px 0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    wrapper: {
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '0 16px'
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.07)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(90deg, #000 0%, #dc2626 100%)',
      padding: '32px 24px',
      color: '#fff'
    },
    headerTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      margin: 0
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      marginTop: '8px',
      margin: 0
    },
    content: {
      padding: '24px'
    },
    profileSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      marginBottom: '32px'
    },
    profileImageContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    avatarWrapper: {
      position: 'relative',
      marginBottom: '8px'
    },
    avatar: {
      width: '128px',
      height: '128px',
      borderRadius: '50%',
      backgroundColor: '#f3f4f6',
      overflow: 'hidden',
      border: '4px solid #fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.10)'
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(90deg, #000 0%, #dc2626 100%)',
      color: '#fff'
    },
    uploadButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#dc2626',
      color: '#fff',
      padding: '8px',
      borderRadius: '50%',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      transition: 'background-color 0.2s'
    },
    hiddenInput: {
      display: 'none'
    },
    uploadText: {
      fontSize: '14px',
      color: '#6b7280',
      textAlign: 'center'
    },
    welcomeSection: {
      flex: 1
    },
    welcomeTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '16px'
    },
    joinDate: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#dc2626'
    },
    grid: {
      display: 'grid',
      gap: '24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      marginBottom: '32px'
    },
    field: {
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      padding: '16px'
    },
    fieldHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    fieldLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    labelText: {
      fontWeight: '500',
      color: '#dc2626'
    },
    editButton: {
      color: '#dc2626',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.2s'
    },
    fieldValue: {
      color: '#111827',
      margin: 0
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    nameGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '8px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end'
    },
    cancelButton: {
      padding: '4px 12px',
      color: '#6b7280',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'color 0.2s'
    },
    saveButton: {
      padding: '4px 12px',
      backgroundColor: '#dc2626',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    passwordSection: {
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '32px'
    },
    passwordHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    passwordTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: 0
    },
    passwordButton: {
      backgroundColor: '#dc2626',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    passwordForm: {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      marginBottom: '16px'
    },
    passwordField: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    passwordLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#dc2626'
    },
    passwordInputWrapper: {
      position: 'relative'
    },
    passwordInput: {
      width: '100%',
      padding: '8px 40px 8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    eyeButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#dc2626',
      padding: '0'
    },
    updatePasswordButton: {
      backgroundColor: '#000',
      color: '#fff',
      padding: '8px 24px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      justifySelf: 'end'
    },
    passwordDescription: {
      color: '#6b7280',
      margin: 0
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb',
      marginTop: '32px'
    },
    saveAllButton: {
      backgroundColor: '#dc2626',
      color: '#fff',
      padding: '12px 32px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.headerTitle}>Profile Settings</h1>
            <p style={styles.headerSubtitle}>Manage your account information and preferences</p>
          </div>

          <div style={styles.content}>
            <div style={styles.profileSection}>
              <div style={styles.profileImageContainer}>
                <div style={styles.avatarWrapper}>
                  <div style={styles.avatar}>
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" style={styles.avatarImage} />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
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
                <p style={styles.uploadText}>Click camera icon to upload</p>
              </div>
              <div style={s.mail}>{user.email}</div>
            </div>
          </div>

          {/* Editable Name */}
          <div style={s.section}>
            <div style={s.label}>Full Name</div>
            {!editing ? (
              <div style={s.row}>
                <div style={s.value}>
                  {(user.firstName || "") + " " + (user.lastName || "")}
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
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={saveName} style={s.primaryBtn}>
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setFirst(user.firstName || "");
                      setLast(user.lastName || "");
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
            <input value={user.email} readOnly style={{ ...s.input, background: "#eee" }} />
          </div>

                    <div style={styles.passwordField}>
                      <label style={styles.passwordLabel}>Confirm New Password</label>
                      <div style={styles.passwordInputWrapper}>
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          style={styles.passwordInput}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          style={styles.eyeButton}
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handlePasswordChange} style={styles.updatePasswordButton}>
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {!showPasswordForm && (
                <p style={styles.passwordDescription}>Keep your account secure with a strong password. Last changed: Never</p>
              )}
            </div>

            <div style={styles.footer}>
              <button style={styles.saveAllButton}>Save All Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles (compact, old-school card vibe + modern touches) ---------- */
const s = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  shell: { maxWidth: 1000, margin: "0 auto", padding: 24 },
  header: {
    background: "linear-gradient(90deg, #000 0%, #dc2626 100%)",
    color: "#fff",
    borderRadius: 16,
    padding: "22px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 8px 24px rgba(220,38,38,0.35)",
    marginBottom: 18,
  },
  h1: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: 0.3 },
  sub: { opacity: 0.85, marginTop: 6 },
  join: {
    background: "rgba(255,255,255,0.12)",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 600,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 12px 28px rgba(0,0,0,0.10)",
    padding: 22,
  },
  topRow: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    paddingBottom: 12,
    borderBottom: "1px solid #eee",
    marginBottom: 16,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    overflow: "hidden",
    background: "linear-gradient(135deg,#18181b 0%,#dc2626 100%)",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 20,
    boxShadow: "0 6px 16px rgba(0,0,0,0.20)",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarPh: { width: "100%", height: "100%", display: "grid", placeItems: "center" },
  name: { fontSize: 20, fontWeight: 700, color: "#111827" },
  mail: { color: "#6b7280", marginTop: 4 },
  section: { marginTop: 16 },
  label: { fontWeight: 700, color: "#dc2626", marginBottom: 8 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  value: { fontSize: 16, color: "#111827" },
  editGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    outline: "none",
    boxSizing: "border-box",
  },
  primaryBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 6px 16px rgba(220,38,38,0.35)",
  },
  outlineBtn: {
    background: "transparent",
    color: "#dc2626",
    border: "2px solid #dc2626",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  ghostBtn: {
    background: "transparent",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
};

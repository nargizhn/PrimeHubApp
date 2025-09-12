import React, { useEffect, useState } from 'react';
import { Camera, Edit2, Save, X, Eye, EyeOff, User, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { getAuth, onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: email || '',
    profileImage: null,
    profileImageUrl: null,
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      let firstName = '';
      let lastName = '';
      let emailAddr = firebaseUser.email || '';
      let joinDate = '';

      try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          firstName = data.firstName || firstName;
          lastName = data.lastName || lastName;
          joinDate = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : '';
          
          // Load profile image URL if it exists
          if (data.profileImageUrl) {
            setUser(prev => ({ ...prev, profileImageUrl: data.profileImageUrl }));
          }
        }
      } catch (e) {
        // fallback below
      }

      if ((!firstName || !lastName) && firebaseUser.displayName) {
        const parts = firebaseUser.displayName.split(' ');
        firstName = firstName || parts[0] || '';
        lastName = lastName || parts.slice(1).join(' ') || '';
      }

      setUser((prev) => ({
        ...prev,
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

  const handleSave = async (field) => {
    if (field === 'name') {
      const newFirstName = tempData.firstName !== undefined ? tempData.firstName : user.firstName;
      const newLastName = tempData.lastName !== undefined ? tempData.lastName : user.lastName;

      setUser({
        ...user,
        firstName: newFirstName,
        lastName: newLastName
      });

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, { firstName: newFirstName, lastName: newLastName }, { merge: true });
        }
      } catch (e) {
        // Optionally surface error to user
        console.error('Failed to save name to Firestore', e);
        alert('Failed to save name changes. Please try again.');
      }
    }
    setIsEditing({ ...isEditing, [field]: false });
    setTempData({ ...tempData, [field]: undefined });
  };

  const handleSaveAll = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const newFirstName = isEditing.name && tempData.firstName !== undefined ? tempData.firstName : user.firstName;
    const newLastName = isEditing.name && tempData.lastName !== undefined ? tempData.lastName : user.lastName;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { firstName: newFirstName, lastName: newLastName }, { merge: true });
      setUser({ ...user, firstName: newFirstName, lastName: newLastName });
      setIsEditing({ ...isEditing, name: false });
      setTempData({ ...tempData, name: undefined, firstName: undefined, lastName: undefined });
      alert('Changes saved successfully.');
    } catch (e) {
      console.error('Failed to save changes', e);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleCancel = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    setTempData({ ...tempData, [field]: undefined });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('You must be signed in to upload a profile picture');
        return;
      }

      // Create a reference to the file in Firebase Storage
      const imageRef = ref(storage, `profile-images/${currentUser.uid}`);
      
      // Delete existing image if it exists
      try {
        await deleteObject(imageRef);
      } catch (error) {
        // Ignore error if file doesn't exist
      }

      // Upload the new image
      const snapshot = await uploadBytes(imageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user state with both local preview and URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser({ ...user, profileImage: e.target.result, profileImageUrl: downloadURL });
      };
      reader.readAsDataURL(file);
      
      // Save the URL to Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { profileImageUrl: downloadURL }, { merge: true });
      
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
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
    if (!currentUser) {
      alert('You must be signed in to change your password.');
      return;
    }

    try {
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
    headerContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      alignSelf: 'flex-start'
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
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
              <div>
                <h1 style={styles.headerTitle}>Profile Settings</h1>
                <p style={styles.headerSubtitle}>Manage your account information and preferences</p>
              </div>
            </div>
          </div>

          <div style={styles.content}>
            <div style={styles.profileSection}>
              <div style={styles.profileImageContainer}>
                <div style={styles.avatarWrapper}>
                  <div style={styles.avatar}>
                    {user.profileImageUrl || user.profileImage ? (
                      <img src={user.profileImageUrl || user.profileImage} alt="Profile" style={styles.avatarImage} />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        <User size={64} />
                      </div>
                    )}
                  </div>
                  <label style={{...styles.uploadButton, opacity: uploading ? 0.5 : 1, cursor: uploading ? 'not-allowed' : 'pointer'}}>
                    {uploading ? (
                      <div style={{width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                    ) : (
                      <Camera size={16} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={styles.hiddenInput}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p style={styles.uploadText}>{uploading ? 'Uploading...' : 'Click camera icon to upload'}</p>
              </div>

              <div style={styles.welcomeSection}>
                <h2 style={styles.welcomeTitle}>Welcome back, {user.firstName}!</h2>
                <div style={styles.joinDate}>
                  <Calendar size={16} />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
            </div>

            <div style={styles.grid}>
              <ProfileField 
                label="Full Name" 
                field="name" 
                value={`${user.firstName} ${user.lastName}`} 
                icon={User}
                isEditing={isEditing}
                tempData={tempData}
                user={user}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onTempDataChange={setTempData}
                styles={styles}
              />
              <ProfileField 
                label="Email Address" 
                field="email" 
                value={user.email} 
                icon={Mail} 
                type="email" 
                readOnly
                isEditing={isEditing}
                tempData={tempData}
                user={user}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onTempDataChange={setTempData}
                styles={styles}
              />
            </div>

            <div style={styles.passwordSection}>
              <div style={styles.passwordHeader}>
                <h3 style={styles.passwordTitle}>Password & Security</h3>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  style={styles.passwordButton}
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm && (
                <div>
                  <div style={styles.passwordForm}>
                    <div style={styles.passwordField}>
                      <label style={styles.passwordLabel}>Current Password</label>
                      <div style={styles.passwordInputWrapper}>
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          style={styles.passwordInput}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          style={styles.eyeButton}
                        >
                          {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={styles.passwordField}>
                      <label style={styles.passwordLabel}>New Password</label>
                      <div style={styles.passwordInputWrapper}>
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          style={styles.passwordInput}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          style={styles.eyeButton}
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
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
                <p style={styles.passwordDescription}>Keep your account secure with a strong password.</p>
              )}
            </div>

            <div style={styles.footer}>
              <button onClick={handleSaveAll} style={styles.saveAllButton}>Save All Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
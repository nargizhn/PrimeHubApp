import React, { useState } from 'react';
import { Camera, Edit2, Save, X, Eye, EyeOff, User, Mail, Phone, Calendar } from 'lucide-react';

export default function UserProfilePage() {
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    joinDate: 'January 2023',
    profileImage: null
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false
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

  const handleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
    setTempData({ ...tempData, [field]: user[field] });
  };

  const handleSave = (field) => {
    if (field === 'name') {
      setUser({ 
        ...user, 
        firstName: tempData.firstName || user.firstName,
        lastName: tempData.lastName || user.lastName
      });
    } else {
      setUser({ ...user, [field]: tempData[field] });
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

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    // In a real app, you would send this to your backend
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '32px 0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    wrapper: {
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '0 16px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    header: {
      background: 'linear-gradient(135deg, #dc2626, #000000)',
      padding: '32px 24px',
      color: 'white'
    },
    headerTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      margin: 0
    },
    headerSubtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
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
      backgroundColor: '#e5e7eb',
      overflow: 'hidden',
      border: '4px solid white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
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
      background: 'linear-gradient(135deg, #dc2626, #000000)',
      color: 'white'
    },
    uploadButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '8px',
      borderRadius: '50%',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      transition: 'background-color 0.2s'
    },
    uploadButtonHover: {
      backgroundColor: '#b91c1c'
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
      color: '#6b7280'
    },
    grid: {
      display: 'grid',
      gap: '24px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      marginBottom: '32px'
    },
    field: {
      backgroundColor: '#f9fafb',
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
      color: '#374151'
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
    editButtonHover: {
      color: '#b91c1c'
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
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#dc2626',
      boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)'
    },
    nameGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '8px'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      resize: 'none',
      rows: 3,
      outline: 'none',
      boxSizing: 'border-box'
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
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    saveButtonHover: {
      backgroundColor: '#b91c1c'
    },
    passwordSection: {
      backgroundColor: '#f9fafb',
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
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    passwordButtonHover: {
      backgroundColor: '#b91c1c'
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
      color: '#374151'
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
      color: '#9ca3af',
      padding: '0'
    },
    updatePasswordButton: {
      backgroundColor: '#000000',
      color: 'white',
      padding: '8px 24px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      justifySelf: 'end'
    },
    updatePasswordButtonHover: {
      backgroundColor: '#374151'
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
      color: 'white',
      padding: '12px 32px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    saveAllButtonHover: {
      backgroundColor: '#b91c1c'
    },
    '@media (min-width: 640px)': {
      profileSection: {
        flexDirection: 'row',
        alignItems: 'flex-start'
      }
    }
  };

  const ProfileField = ({ label, field, value, icon: Icon, type = "text" }) => {
    return (
      <div style={styles.field}>
        <div style={styles.fieldHeader}>
          <div style={styles.fieldLabel}>
            <Icon size={16} color="#6b7280" />
            <span style={styles.labelText}>{label}</span>
          </div>
          {!isEditing[field] && (
            <button
              onClick={() => handleEdit(field)}
              style={styles.editButton}
              onMouseEnter={(e) => e.target.style.color = styles.editButtonHover.color}
              onMouseLeave={(e) => e.target.style.color = styles.editButton.color}
            >
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
                  value={tempData.firstName || user.firstName}
                  onChange={(e) => setTempData({ ...tempData, firstName: e.target.value })}
                  placeholder="First Name"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.inputFocus.borderColor;
                    e.target.style.boxShadow = styles.inputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = styles.input.borderColor;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <input
                  type="text"
                  value={tempData.lastName || user.lastName}
                  onChange={(e) => setTempData({ ...tempData, lastName: e.target.value })}
                  placeholder="Last Name"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = styles.inputFocus.borderColor;
                    e.target.style.boxShadow = styles.inputFocus.boxShadow;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = styles.input.borderColor;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            ) : (
              <input
                type={type}
                value={tempData[field] || value}
                onChange={(e) => setTempData({ ...tempData, [field]: e.target.value })}
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = styles.inputFocus.borderColor;
                  e.target.style.boxShadow = styles.inputFocus.boxShadow;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = styles.input.borderColor;
                  e.target.style.boxShadow = 'none';
                }}
              />
            )}
            <div style={styles.buttonGroup}>
              <button
                onClick={() => handleCancel(field)}
                style={styles.cancelButton}
                onMouseEnter={(e) => e.target.style.color = '#374151'}
                onMouseLeave={(e) => e.target.style.color = styles.cancelButton.color}
              >
                <X size={16} />
              </button>
              <button
                onClick={() => handleSave(field)}
                style={styles.saveButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = styles.saveButtonHover.backgroundColor}
                onMouseLeave={(e) => e.target.style.backgroundColor = styles.saveButton.backgroundColor}
              >
                <Save size={16} />
              </button>
            </div>
          </div>
        ) : (
          <p style={styles.fieldValue}>
            {field === 'name' ? `${user.firstName} ${user.lastName}` : value}
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.headerTitle}>Profile Settings</h1>
            <p style={styles.headerSubtitle}>Manage your account information and preferences</p>
          </div>

          <div style={styles.content}>
            {/* Profile Picture Section */}
            <div style={window.innerWidth >= 640 ? {...styles.profileSection, flexDirection: 'row'} : styles.profileSection}>
              <div style={styles.profileImageContainer}>
                <div style={styles.avatarWrapper}>
                  <div style={styles.avatar}>
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        style={styles.avatarImage}
                      />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        <User size={64} />
                      </div>
                    )}
                  </div>
                  <label 
                    style={styles.uploadButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = styles.uploadButtonHover.backgroundColor}
                    onMouseLeave={(e) => e.target.style.backgroundColor = styles.uploadButton.backgroundColor}
                  >
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={styles.hiddenInput}
                    />
                  </label>
                </div>
                <p style={styles.uploadText}>
                  Click camera icon to upload
                </p>
              </div>

              <div style={styles.welcomeSection}>
                <h2 style={styles.welcomeTitle}>
                  Welcome back, {user.firstName}!
                </h2>
                <div style={styles.joinDate}>
                  <Calendar size={16} />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div style={styles.grid}>
              <ProfileField
                label="Full Name"
                field="name"
                value={`${user.firstName} ${user.lastName}`}
                icon={User}
              />
              <ProfileField
                label="Email Address"
                field="email"
                value={user.email}
                icon={Mail}
                type="email"
              />
              <ProfileField
                label="Phone Number"
                field="phone"
                value={user.phone}
                icon={Phone}
                type="tel"
              />
            </div>

            {/* Password Section */}
            <div style={styles.passwordSection}>
              <div style={styles.passwordHeader}>
                <h3 style={styles.passwordTitle}>Password & Security</h3>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  style={styles.passwordButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = styles.passwordButtonHover.backgroundColor}
                  onMouseLeave={(e) => e.target.style.backgroundColor = styles.passwordButton.backgroundColor}
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm && (
                <div>
                  <div style={styles.passwordForm}>
                    <div style={styles.passwordField}>
                      <label style={styles.passwordLabel}>
                        Current Password
                      </label>
                      <div style={styles.passwordInputWrapper}>
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value
                          })}
                          style={styles.passwordInput}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current
                          })}
                          style={styles.eyeButton}
                        >
                          {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={styles.passwordField}>
                      <label style={styles.passwordLabel}>
                        New Password
                      </label>
                      <div style={styles.passwordInputWrapper}>
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value
                          })}
                          style={styles.passwordInput}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new
                          })}
                          style={styles.eyeButton}
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={styles.passwordField}>
                      <label style={styles.passwordLabel}>
                        Confirm New Password
                      </label>
                      <div style={styles.passwordInputWrapper}>
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value
                          })}
                          style={styles.passwordInput}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm
                          })}
                          style={styles.eyeButton}
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button
                      onClick={handlePasswordChange}
                      style={styles.updatePasswordButton}
                      onMouseEnter={(e) => e.target.style.backgroundColor = styles.updatePasswordButtonHover.backgroundColor}
                      onMouseLeave={(e) => e.target.style.backgroundColor = styles.updatePasswordButton.backgroundColor}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {!showPasswordForm && (
                <p style={styles.passwordDescription}>
                  Keep your account secure with a strong password. Last changed: Never
                </p>
              )}
            </div>

            {/* Save All Changes Button */}
            <div style={styles.footer}>
              <button 
                style={styles.saveAllButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = styles.saveAllButtonHover.backgroundColor}
                onMouseLeave={(e) => e.target.style.backgroundColor = styles.saveAllButton.backgroundColor}
              >
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
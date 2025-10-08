import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import CustomDialog from '../common/CustomDialog';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user, signin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors[name] = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors[name] = 'Name must be at least 2 characters';
        } else {
          delete newErrors[name];
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors[name] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = 'Please enter a valid email address';
        } else {
          delete newErrors[name];
        }
        break;

      case 'currentPassword':
        if (!value.trim()) {
          newErrors[name] = 'Current password is required';
        } else {
          delete newErrors[name];
        }
        break;

      case 'newPassword':
        if (!value.trim()) {
          newErrors[name] = 'New password is required';
        } else if (value.length < 6) {
          newErrors[name] = 'Password must be at least 6 characters';
        } else {
          delete newErrors[name];
        }
        break;

      case 'confirmPassword':
        if (!value.trim()) {
          newErrors[name] = 'Please confirm your password';
        } else if (value !== passwordData.newPassword) {
          newErrors[name] = 'Passwords do not match';
        } else {
          delete newErrors[name];
        }
        break;

      default:
        delete newErrors[name];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (formType) => {
    const newErrors = {};

    if (formType === 'profile') {
      if (!profileData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!profileData.email.trim()) {
        newErrors.email = 'Email is required';
      }
    } else if (formType === 'password') {
      if (!passwordData.currentPassword.trim()) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!passwordData.newPassword.trim()) {
        newErrors.newPassword = 'New password is required';
      }
      if (!passwordData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field on change
    validateField(name, value);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field on change
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(profileData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm('profile')) {
      setDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting.',
        type: 'error'
      });
      return;
    }

    setSaving(true);

    try {
      const response = await api.put('/auth/profile', profileData);
      
      setDialog({
        isOpen: true,
        title: 'Profile Updated Successfully',
        message: 'Your profile information has been updated and saved.',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setDialog({
        isOpen: true,
        title: 'Update Failed',
        message: error.response?.data?.error || 'Failed to update profile. Please check your connection and try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(passwordData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm('password')) {
      setDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting.',
        type: 'error'
      });
      return;
    }

    setChangingPassword(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setDialog({
        isOpen: true,
        title: 'Password Changed Successfully',
        message: 'Your password has been updated successfully.',
        type: 'success'
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error('Error changing password:', error);
      setDialog({
        isOpen: true,
        title: 'Password Change Failed',
        message: error.response?.data?.error || 'Failed to change password. Please check your current password and try again.',
        type: 'error'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formSections = [
    {
      id: 'profile',
      title: 'Profile Information',
      description: 'Update your personal details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'blue',
      fields: [
        { label: 'Full Name', name: 'name', type: 'text', required: true, placeholder: 'Enter your full name' },
        { label: 'Email Address', name: 'email', type: 'email', required: true, placeholder: 'Enter your email address' },
      ]
    },
    {
      id: 'password',
      title: 'Change Password',
      description: 'Update your account password',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'green',
      fields: [
        { label: 'Current Password', name: 'currentPassword', type: 'password', required: true, placeholder: 'Enter current password' },
        { label: 'New Password', name: 'newPassword', type: 'password', required: true, placeholder: 'Enter new password' },
        { label: 'Confirm Password', name: 'confirmPassword', type: 'password', required: true, placeholder: 'Confirm new password' },
      ]
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue': return { gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600' };
      case 'green': return { gradient: 'from-green-500 to-green-600', text: 'text-green-600' };
      default: return { gradient: 'from-gray-500 to-gray-600', text: 'text-gray-600' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                <p className="text-gray-600 text-sm">Manage your account information and settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Overview Card */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 hover:shadow-md transition-all duration-300"
          style={{
            animation: 'fadeInUp 0.6s ease-out forwards'
          }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-lg font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{user?.name || 'User'}</h2>
                <p className="text-white/80 text-sm">{user?.email || 'user@example.com'}</p>
                <p className="text-white/60 text-xs">
                  Member since {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-4">
          {formSections.map((section, index) => {
            const colorClasses = getColorClasses(section.color);
            const isPasswordSection = section.id === 'password';
            const currentData = isPasswordSection ? passwordData : profileData;
            const currentErrors = errors;
            const currentTouched = touched;
            const handleChange = isPasswordSection ? handlePasswordChange : handleProfileChange;
            const handleSubmit = isPasswordSection ? handlePasswordSubmit : handleProfileSubmit;
            const isSubmitting = isPasswordSection ? changingPassword : saving;

            return (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 section-card"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Section Header */}
                <div className={`bg-gradient-to-r ${colorClasses.gradient} p-4`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm floating-animation">
                      <div className="text-white">
                        {section.icon}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                      <p className="text-white/80 text-xs">{section.description}</p>
                    </div>
                  </div>
                </div>

                {/* Section Form */}
                <form onSubmit={handleSubmit} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field, fieldIndex) => (
                      <div
                        key={field.name}
                        className={`form-field ${field.name === 'email' || field.name === 'newPassword' || field.name === 'confirmPassword' ? 'md:col-span-2' : ''}`}
                        style={{
                          animationDelay: `${(index * 100) + (fieldIndex * 50)}ms`,
                          animation: 'slideIn 0.6s ease-out forwards'
                        }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={currentData[field.name]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required={field.required}
                          minLength={field.type === 'password' && field.name === 'newPassword' ? 6 : undefined}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                            currentErrors[field.name] && currentTouched[field.name]
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300'
                          }`}
                          placeholder={field.placeholder}
                        />
                        {currentErrors[field.name] && currentTouched[field.name] && (
                          <div className="mt-1 text-sm text-red-600 animate-fadeIn">
                            {currentErrors[field.name]}
                          </div>
                        )}
                        {field.name === 'newPassword' && (
                          <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 bg-gradient-to-r ${colorClasses.gradient} text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl text-sm transform hover:scale-105`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>{isPasswordSection ? 'Changing...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{isPasswordSection ? 'Change Password' : 'Save Changes'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Dialog */}
      <CustomDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .form-field {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .form-field:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .section-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .section-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfilePage;

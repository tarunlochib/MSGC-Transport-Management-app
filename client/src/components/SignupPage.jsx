import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './common/FormInput';
import Button from './common/Button';
import Card from './common/Card';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      setCheckingAccess(true);
      const response = await fetch('/api/auth/check-signup-access');
      if (response.ok) {
        setAccessAllowed(true);
      } else {
        setAccessAllowed(false);
      }
    } catch (error) {
      setAccessAllowed(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to login
        navigate('/login', { 
          state: { 
            message: 'User created successfully! Please sign in.' 
          } 
        });
      } else {
        setErrors({ general: data.error || 'Failed to create user' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking access
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show access denied for unauthorized users
  if (!accessAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center mb-4">
                <img 
                  src="/MSGC_Transparent.png" 
                  alt="MSGC Transport" 
                  className="w-16 h-auto drop-shadow-sm"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 text-sm">
                You don't have permission to access this page.
              </p>
            </div>

            {/* Access Denied Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">
                This signup page is restricted to authorized IP addresses only.
              </p>
            </div>

            {/* Back to Login Button */}
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/login')}
              className="flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Sign In</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show signup form for authorized users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="max-w-4xl w-full animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Form */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left animate-slideDown">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>Create Account</h1>
              <p className="text-gray-600 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>Add a new user to the MSGC Transport system</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm font-medium flex items-center space-x-2 animate-shake">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                <FormInput
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  error={errors.name}
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <div className="animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
                <FormInput
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  error={errors.email}
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="animate-fadeInUp" style={{ animationDelay: '1s' }}>
                <FormInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  error={errors.password}
                  disabled={isLoading}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  }
                  onIconClick={() => setShowPassword(!showPassword)}
                />
              </div>

              {/* Confirm Password Field */}
              <div className="animate-fadeInUp" style={{ animationDelay: '1.2s' }}>
                <FormInput
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword}
                  disabled={isLoading}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  }
                  onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 animate-fadeInUp" style={{ animationDelay: '1.4s' }}>
                <Button
                  type="submit"
                  variant="success"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                  className="py-3"
                >
                  {isLoading ? 'Creating User...' : 'Create User Account'}
                </Button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center pt-2 animate-fadeInUp" style={{ animationDelay: '1.6s' }}>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Visual Content */}
          <div className="hidden lg:block animate-fadeInLeft" style={{ animationDelay: '0.8s' }}>
            <div className="text-center space-y-6">
              {/* Logo */}
              <div className="flex justify-center animate-bounce" style={{ animationDelay: '1s' }}>
                <img 
                  src="/MSGC_Transparent.png" 
                  alt="MSGC Transport" 
                  className="w-32 h-auto drop-shadow-lg"
                />
              </div>
              
              {/* Welcome Message */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-800 animate-fadeInUp" style={{ animationDelay: '1.2s' }}>Welcome to MSGC Transport</h2>
                <p className="text-gray-600 leading-relaxed animate-fadeInUp" style={{ animationDelay: '1.4s' }}>
                  Create new user accounts to manage your transportation operations efficiently. 
                  Each user gets secure access to the system with appropriate permissions.
                </p>
              </div>

              {/* Feature Icons */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-300 hover:scale-105 animate-fadeInUp" style={{ animationDelay: '1.6s' }}>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Secure Access</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-300 hover:scale-105 animate-fadeInUp" style={{ animationDelay: '1.8s' }}>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">User Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignupPage;

// Enhanced Custom CSS for animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
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
  
  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes fadeInLeft {
    from { 
      opacity: 0; 
      transform: translateX(30px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out;
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
  }
  
  .animate-slideDown {
    animation: slideDown 0.6s ease-out;
  }
  
  .animate-fadeInLeft {
    animation: fadeInLeft 0.8s ease-out forwards;
    opacity: 0;
  }
  
  .animate-shake {
    animation: shake 0.6s ease-in-out;
  }
  
  .animate-bounce {
    animation: bounce 2s infinite;
  }
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

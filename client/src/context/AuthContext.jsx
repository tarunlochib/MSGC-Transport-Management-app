import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          // Ensure we have valid user data before setting it
          if (response.data && response.data.user && typeof response.data.user === 'object') {
            setUser(response.data.user);
          } else {
            console.error('Invalid user data received:', response.data);
            logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Only logout if it's an authentication error, not a network error
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const signin = async (credentials) => {
    try {
      const response = await api.post('/auth/signin', credentials);
      
      // Validate the response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      const { user, token } = response.data;
      
      // Validate user and token data
      if (!user || typeof user !== 'object' || !token || typeof token !== 'string') {
        throw new Error('Invalid user or token data received');
      }
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      return { success: true };
    } catch (error) {
      console.error('Signin error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Sign in failed';
      
      if (error.response) {
        // Server responded with error
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid credentials';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        // Other error
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    signin,
    logout,
    isAuthenticated: !!user && typeof user === 'object'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
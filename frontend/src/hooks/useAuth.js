// hooks/useAuth.js - Authentication Hook with Real API
import { useState, useEffect, useContext, createContext } from 'react';
import { authAPI } from '@/utils/api';
import { 
  getAuthToken, 
  getUserData, 
  setAuthToken, 
  setUserData, 
  removeAuthToken, 
  removeUserData,
  isAuthenticated 
} from '@/utils/cookies';

// Create Auth Context
const AuthContext = createContext({});

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedToken = getAuthToken();
      const savedUser = getUserData();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsLoggedIn(true);
        
        // Optionally verify token is still valid
        try {
          const profile = await authAPI.getProfile(savedToken);
          if (profile) {
            setUserData(profile);
            setUser(profile);
          }
        } catch (error) {
          // Token invalid, clear auth
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (phone) => {
    try {
      const response = await authAPI.sendOTP(phone);
      return { 
        success: response.success || true, 
        message: response.message || 'کد تایید ارسال شد' 
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return { 
        success: false, 
        error: error.message || 'خطا در ارسال کد تایید' 
      };
    }
  };

  const login = async (phone, otp) => {
    try {
      setLoading(true);
      
      // Call verify OTP endpoint
      const response = await authAPI.verifyOTP(phone, otp);
      
      if (response.access_token) {
        // Save auth data
        setAuthToken(response.access_token);
        setUserData(response.user);
        
        setToken(response.access_token);
        setUser(response.user);
        setIsLoggedIn(true);

        return { success: true, user: response.user };
      } else {
        return { success: false, error: 'خطا در ورود' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'خطا در ارتباط با سرور' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // First verify OTP
      const response = await authAPI.verifyOTP(userData.phone, userData.otp);
      
      if (response.access_token) {
        // Then update profile with additional info
        await authAPI.updateProfile(response.access_token, {
          full_name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
        });
        
        // Save auth data
        const fullUser = {
          ...response.user,
          full_name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
        };
        
        setAuthToken(response.access_token);
        setUserData(fullUser);
        
        setToken(response.access_token);
        setUser(fullUser);
        setIsLoggedIn(true);

        return { success: true, user: fullUser };
      } else {
        return { success: false, error: 'خطا در ثبت‌نام' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.message || 'خطا در ارتباط با سرور' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const clearAuth = () => {
    removeAuthToken();
    removeUserData();
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateProfile = async (data) => {
    try {
      if (!token) throw new Error('No auth token');
      
      const response = await authAPI.updateProfile(token, data);
      
      if (response) {
        const updatedUser = { ...user, ...data };
        setUserData(updatedUser);
        setUser(updatedUser);
        return { success: true };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error.message || 'خطا در بروزرسانی پروفایل' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    isLoggedIn,
    isAuthenticated: isAuthenticated(),
    login,
    register,
    logout,
    sendOTP,
    updateProfile,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
// components/modals/AuthModal.jsx - Authentication Modal Component
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    firstName: '',
    lastName: '',
    email: '',
    nationalId: '',
    agreeToTerms: false
  });
  const [showOTP, setShowOTP] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, register, sendOTP } = useAuth();

  // OTP Timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      resetForm();
    }
  }, [isOpen, initialMode]);

  const resetForm = () => {
    setFormData({
      phone: '',
      otp: '',
      firstName: '',
      lastName: '',
      email: '',
      nationalId: '',
      agreeToTerms: false
    });
    setShowOTP(false);
    setOtpTimer(0);
    setErrors({});
    setLoading(false);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^09[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateNationalId = (nationalId) => {
    if (nationalId.length !== 10) return false;
    
    const digits = nationalId.split('').map(Number);
    const checkDigit = digits[9];
    const sum = digits.slice(0, 9).reduce((acc, digit, index) => acc + digit * (10 - index), 0);
    const remainder = sum % 11;
    
    return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendOTP = async () => {
    setErrors({});

    if (!validatePhone(formData.phone)) {
      setErrors({ phone: 'شماره موبایل معتبر نیست' });
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(formData.phone);
      
      if (result.success) {
        setShowOTP(true);
        setOtpTimer(120); // 2 minutes
      } else {
        setErrors({ phone: result.error });
      }
    } catch (error) {
      setErrors({ phone: 'خطا در ارسال کد تایید' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.phone || !formData.otp) {
      setErrors({ otp: 'لطفاً تمام فیلدها را پر کنید' });
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.phone, formData.otp);
      
      if (result.success) {
        onClose();
        resetForm();
      } else {
        setErrors({ otp: result.error });
      }
    } catch (error) {
      setErrors({ otp: 'خطا در ورود' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const validationErrors = {};
    
    if (!formData.firstName.trim()) {
      validationErrors.firstName = 'نام الزامی است';
    }
    
    if (!formData.lastName.trim()) {
      validationErrors.lastName = 'نام خانوادگی الزامی است';
    }
    
    if (!validateEmail(formData.email)) {
      validationErrors.email = 'ایمیل معتبر نیست';
    }
    
    if (!validateNationalId(formData.nationalId)) {
      validationErrors.nationalId = 'کد ملی معتبر نیست';
    }
    
    if (!formData.agreeToTerms) {
      validationErrors.agreeToTerms = 'پذیرش قوانین الزامی است';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const userData = {
        phone: formData.phone,
        otp: formData.otp,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        national_id: formData.nationalId
      };

      const result = await register(userData);
      
      if (result.success) {
        onClose();
        resetForm();
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'خطا در ثبت‌نام' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? 'ورود' : 'ثبت‌نام'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mode Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode('login'); resetForm(); }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              ورود
            </button>
            <button
              onClick={() => { setMode('register'); resetForm(); }}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              ثبت‌نام
            </button>
          </div>

          {/* Phone Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              شماره موبایل
            </label>
            <div className="flex space-x-2 space-x-reverse">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="09123456789"
                disabled={showOTP}
              />
              <button
                onClick={handleSendOTP}
                disabled={loading || otpTimer > 0 || !formData.phone}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {loading ? 'ارسال...' : otpTimer > 0 ? `${otpTimer}s` : 'ارسال کد'}
              </button>
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* OTP Input */}
          {showOTP && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                کد تایید
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-lg tracking-widest"
                placeholder="_ _ _ _ _ _"
                maxLength="6"
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
            </div>
          )}

          {/* Register Fields */}
          {mode === 'register' && showOTP && (
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="نام"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="نام خانوادگی"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ایمیل
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  کد ملی
                </label>
                <input
                  type="text"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="1234567890"
                  maxLength="10"
                />
                {errors.nationalId && (
                  <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>
                )}
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700 dark:text-gray-300">
                  قوانین و مقررات را مطالعه کرده و می‌پذیرم
                  <a href="/terms" className="text-blue-600 hover:underline mr-1">
                    (مشاهده قوانین)
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          {showOTP && (
            <button
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>در حال پردازش...</span>
                </div>
              ) : (
                mode === 'login' ? 'ورود' : 'ثبت‌نام'
              )}
            </button>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'login' ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟'}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  resetForm();
                }}
                className="text-blue-600 hover:underline mr-1"
              >
                {mode === 'login' ? 'ثبت‌نام کنید' : 'وارد شوید'}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <div className="px-4 text-sm text-gray-500 dark:text-gray-400">یا</div>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Social Login (Future Feature) */}
          <div className="space-y-3">
            <button
              disabled
              className="w-full flex items-center justify-center space-x-3 space-x-reverse py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors opacity-50 cursor-not-allowed"
            >
              <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
              <span className="text-gray-700 dark:text-gray-300">ورود با گوگل</span>
            </button>
            
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              ورود با شبکه‌های اجتماعی به‌زودی
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
          <div className="flex items-center justify-center space-x-4 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
            <a href="/privacy" className="hover:text-blue-600 transition-colors">
              حریم خصوصی
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-blue-600 transition-colors">
              قوانین
            </a>
            <span>•</span>
            <a href="/support" className="hover:text-blue-600 transition-colors">
              پشتیبانی
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
// components/ui/LoadingScreen.jsx - Loading Screen Component
import { useState, useEffect } from 'react';

export default function LoadingScreen({ 
  show = true, 
  message = 'در حال بارگذاری...', 
  progress = null,
  fullScreen = true,
  overlay = true,
  animated = true,
  logo = true,
  minimal = false
}) {
  const [dots, setDots] = useState('');

  // Animated dots effect
  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [animated]);

  if (!show) return null;

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Logo */}
      {logo && !minimal && (
        <div className="mb-4 fade-in">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ExonVC</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">پلتفرم سرمایه‌گذاری</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      <div className="relative">
        {minimal ? (
          // Minimal spinner
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
        ) : (
          // Enhanced spinner
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 border-r-purple-600 absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== null && (
        <div className="w-64 fade-in">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>پیشرفت</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Loading Message */}
      {message && (
        <div className="text-center fade-in">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {message}
            {animated && <span className="inline-block w-8 text-left">{dots}</span>}
          </p>
        </div>
      )}

      {/* Loading Steps (for detailed loading) */}
      {!minimal && (
        <div className="mt-4 space-y-2 fade-in">
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>اتصال به سرور</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>بارگذاری اطلاعات</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <span>آماده‌سازی رابط کاربری</span>
          </div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${overlay ? 'bg-white dark:bg-gray-900' : 'bg-transparent'}
        ${overlay ? 'bg-opacity-95 dark:bg-opacity-95' : ''}
        transition-opacity duration-300
      `}>
        <LoadingContent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <LoadingContent />
    </div>
  );
}

// Preset loading screens
export function InitialLoadingScreen() {
  return (
    <LoadingScreen 
      message="در حال راه‌اندازی پلتفرم ExonVC"
      animated={true}
      logo={true}
      minimal={false}
    />
  );
}

export function PageLoadingScreen({ message = "در حال بارگذاری صفحه" }) {
  return (
    <LoadingScreen 
      message={message}
      animated={true}
      logo={false}
      minimal={true}
      fullScreen={false}
    />
  );
}

export function DataLoadingScreen({ message = "در حال دریافت اطلاعات" }) {
  return (
    <LoadingScreen 
      message={message}
      animated={true}
      logo={false}
      minimal={false}
      fullScreen={false}
      overlay={false}
    />
  );
}

export function FormLoadingScreen({ message = "در حال ارسال اطلاعات" }) {
  return (
    <LoadingScreen 
      message={message}
      animated={true}
      logo={false}
      minimal={true}
      fullScreen={true}
      overlay={true}
    />
  );
}

// Loading skeleton components
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
      <div className="loading-shimmer h-48 rounded-lg mb-4"></div>
      <div className="space-y-3">
        <div className="loading-shimmer h-6 rounded w-3/4"></div>
        <div className="loading-shimmer h-4 rounded w-1/2"></div>
        <div className="loading-shimmer h-4 rounded w-2/3"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="loading-shimmer h-8 rounded w-24"></div>
          <div className="loading-shimmer h-8 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="loading-shimmer h-4 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="loading-shimmer h-4 rounded w-20"></div>
          <div className="loading-shimmer h-8 rounded w-32"></div>
        </div>
        <div className="loading-shimmer h-12 w-12 rounded-full"></div>
      </div>
    </div>
  );
}
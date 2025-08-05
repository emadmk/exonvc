// components/header/Header.jsx - Main Header Component
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { setTheme, getTheme } from '@/utils/cookies';

export default function Header({ onMenuClick, theme, setTheme: setAppTheme, onAuthModalOpen }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // موقتاً بدون useAuth - بعداً فعال می‌شه
  const user = null;
  const isLoggedIn = false;
  const logout = () => console.log('logout');

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setAppTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navigation = [
    { name: 'خانه', href: '/', current: router.pathname === '/' },
    { name: 'پروژه‌ها', href: '/projects', current: router.pathname === '/projects' },
    { name: 'درباره ما', href: '/about', current: router.pathname === '/about' },
    { name: 'تماس', href: '/contact', current: router.pathname === '/contact' },
  ];

  const scrollToSection = (sectionId) => {
    if (router.pathname !== '/') {
      router.push('/', undefined, { shallow: true }).then(() => {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = (href, name) => {
    if (href === '/' && router.pathname === '/') {
      // در صورت کلیک روی خانه در همان صفحه، به بالا برود
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (href.startsWith('#')) {
      // برای لینک‌های داخلی
      scrollToSection(href.substring(1));
    } else {
      router.push(href);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => handleNavClick('/', 'خانه')}
              className="flex items-center space-x-3 space-x-reverse group"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  ExonVC
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  پلتفرم سرمایه‌گذاری
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href, item.name)}
                className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400 ${
                  item.current
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.name}
              </button>
            ))}
            
            {/* Quick Links */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => scrollToSection('projects')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                پروژه‌ها
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                درباره ما
              </button>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 space-x-reverse p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.first_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium">
                    {user?.first_name || 'کاربر'}
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      پنل کاربری
                    </a>
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      پروفایل
                    </a>
                    <a href="/investments" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      سرمایه‌گذاری‌ها
                    </a>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={logout}
                      className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-3 space-x-reverse">
                <button
                  onClick={() => onAuthModalOpen?.('login')}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  ورود
                </button>
                <button
                  onClick={() => onAuthModalOpen?.('register')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  ثبت‌نام
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href, item.name)}
                  className={`block w-full text-right px-4 py-2 text-sm font-medium transition-colors ${
                    item.current
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              {!isLoggedIn && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <button
                    onClick={() => onAuthModalOpen?.('login')}
                    className="block w-full text-right px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    ورود
                  </button>
                  <button
                    onClick={() => onAuthModalOpen?.('register')}
                    className="block w-full text-right px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg mx-4"
                  >
                    ثبت‌نام
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}
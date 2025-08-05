// components/Layout.jsx - Main Layout Component
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import Sidebar from '@/components/navigation/Sidebar';
import BackToTop from '@/components/ui/BackToTop';
import { getTheme } from '@/utils/cookies';

export default function Layout({ 
  children, 
  title = 'پلتفرم سرمایه‌گذاری ExonVC',
  description = 'بهترین فرصت‌های سرمایه‌گذاری در پروژه‌های سودآور',
  keywords = 'سرمایه‌گذاری، پروژه، سود، اکسون، ExonVC',
  className = '',
  showSidebar = false,
  sidebarContent = null,
  onAuthModalOpen = null
}) {
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Set theme from cookies
    const savedTheme = getTheme();
    setTheme(savedTheme);
    
    // Apply theme to document
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${className}`}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="ExonVC" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://invest.exonvc.ir" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#1f2937" />
      </Head>

      {/* Main Layout Structure */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header 
          onMenuClick={toggleSidebar}
          theme={theme}
          setTheme={setTheme}
          onAuthModalOpen={onAuthModalOpen}
        />

        {/* Main Content Area */}
        <div className="flex flex-1">
          {/* Sidebar */}
          {showSidebar && (
            <Sidebar
              isOpen={sidebarOpen}
              onClose={closeSidebar}
              content={sidebarContent}
            />
          )}

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Back to Top Button */}
      <BackToTop />

      {/* Global Styles */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          direction: rtl;
        }
        
        body {
          font-family: 'IRANYekan', 'Vazir', sans-serif;
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        .dark ::-webkit-scrollbar-track {
          background: #374151;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}
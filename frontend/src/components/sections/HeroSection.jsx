// components/sections/HeroSection.jsx - Hero Section Component
import { useState, useEffect } from 'react';
import { ChevronDownIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function HeroSection({ onAuthModalOpen }) {
  const { isLoggedIn } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "سرمایه‌گذاری هوشمند، آینده درخشان",
      subtitle: "در پروژه‌های سودآور گروه اکسون سرمایه‌گذاری کنید و از بازدهی مطمئن بهره‌مند شوید",
      image: "/images/hero/hero-1.jpg",
      cta: "شروع سرمایه‌گذاری",
      stats: { projects: "4+", investors: "500+", profit: "18%" }
    },
    {
      title: "فرصت‌های سرمایه‌گذاری بین‌المللی",
      subtitle: "از رستوران‌های مدرن تا پروژه‌های طلا، بهترین گزینه‌ها را برای شما انتخاب کرده‌ایم",
      image: "/images/hero/hero-2.jpg",
      cta: "مشاهده پروژه‌ها",
      stats: { projects: "4", amount: "50B", return: "25%" }
    },
    {
      title: "امنیت و شفافیت در اولویت",
      subtitle: "با سیستم‌های امنیتی پیشرفته و گزارش‌دهی شفاف، سرمایه شما در امان است",
      image: "/images/hero/hero-3.jpg",
      cta: "درباره امنیت",
      stats: { security: "100%", transparency: "کامل", support: "24/7" }
    }
  ];

  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCTAClick = (slideIndex) => {
    if (slideIndex === 0) {
      if (isLoggedIn) {
        scrollToProjects();
      } else {
        onAuthModalOpen?.('register');
      }
    } else if (slideIndex === 1) {
      scrollToProjects();
    } else {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background Video/Image Slider */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-30' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Animated Particles Background */}
      <div className="absolute inset-0">
        <div className="particles">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${20 + Math.random() * 20}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Hero Content */}
          <div className="fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => handleCTAClick(currentSlide)}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="flex items-center space-x-2 space-x-reverse">
                  <span>{heroSlides[currentSlide].cta}</span>
                  <ChevronDownIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => document.getElementById('video-modal')?.classList.remove('hidden')}
                className="group flex items-center space-x-3 space-x-reverse text-white hover:text-blue-400 transition-colors duration-300"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <PlayIcon className="w-6 h-6 mr-1" />
                </div>
                <span className="text-lg font-medium">مشاهده ویدیو معرفی</span>
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
            {Object.entries(heroSlides[currentSlide].stats).map(([key, value], index) => (
              <div key={key} className="text-center slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{value}</div>
                <div className="text-gray-300 text-sm lg:text-base capitalize">
                  {key === 'projects' && 'پروژه فعال'}
                  {key === 'investors' && 'سرمایه‌گذار'}
                  {key === 'profit' && 'سود سالانه'}
                  {key === 'amount' && 'میلیارد تومان'}
                  {key === 'return' && 'بازدهی'}
                  {key === 'security' && 'امنیت'}
                  {key === 'transparency' && 'شفافیت'}
                  {key === 'support' && 'پشتیبانی'}
                </div>
              </div>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-2 space-x-reverse mb-8">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Scroll Down Indicator */}
          <div className="animate-bounce">
            <button
              onClick={scrollToProjects}
              className="text-white/70 hover:text-white transition-colors duration-300"
            >
              <ChevronDownIcon className="w-8 h-8 mx-auto" />
              <p className="text-sm mt-2">مشاهده پروژه‌ها</p>
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <div id="video-modal" className="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl mx-4">
          <button
            onClick={() => document.getElementById('video-modal')?.classList.add('hidden')}
            className="absolute -top-12 left-0 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              className="w-full h-full"
              allowFullScreen
              title="ExonVC Introduction Video"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 hidden lg:block">
        <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      <div className="absolute bottom-32 left-20 hidden lg:block">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <style jsx>{`
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float linear infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
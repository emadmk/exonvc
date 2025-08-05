// components/sections/StatsSection.jsx - Statistics Section Component
import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  BuildingOfficeIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    investors: 0,
    totalInvestment: 0,
    activeProjects: 0,
    avgReturn: 0,
    successRate: 0,
    experience: 0
  });

  const finalStats = {
    investors: 1247,
    totalInvestment: 98500000000, // 98.5 میلیارد تومان
    activeProjects: 4,
    avgReturn: 20.5,
    successRate: 96,
    experience: 12
  };

  const statsConfig = [
    {
      key: 'investors',
      icon: UsersIcon,
      title: 'سرمایه‌گذار فعال',
      value: animatedStats.investors,
      suffix: '+',
      color: 'from-blue-500 to-cyan-600',
      description: 'افراد در حال سرمایه‌گذاری'
    },
    {
      key: 'totalInvestment',
      icon: CurrencyDollarIcon,
      title: 'مجموع سرمایه‌گذاری',
      value: Math.round(animatedStats.totalInvestment / 1000000000),
      suffix: ' میلیارد تومان',
      color: 'from-green-500 to-emerald-600',
      description: 'کل مبلغ سرمایه‌گذاری شده'
    },
    {
      key: 'activeProjects',
      icon: BuildingOfficeIcon,
      title: 'پروژه فعال',
      value: animatedStats.activeProjects,
      suffix: '',
      color: 'from-purple-500 to-violet-600',
      description: 'پروژه‌های در حال اجرا'
    },
    {
      key: 'avgReturn',
      icon: ChartBarIcon,
      title: 'متوسط بازدهی سالانه',
      value: animatedStats.avgReturn.toFixed(1),
      suffix: '%',
      color: 'from-yellow-500 to-orange-600',
      description: 'درصد سود سالانه'
    },
    {
      key: 'successRate',
      icon: TrophyIcon,
      title: 'نرخ موفقیت',
      value: animatedStats.successRate,
      suffix: '%',
      color: 'from-red-500 to-pink-600',
      description: 'پروژه‌های موفق'
    },
    {
      key: 'experience',
      icon: ClockIcon,
      title: 'سال تجربه',
      value: animatedStats.experience,
      suffix: '+',
      color: 'from-indigo-500 to-purple-600',
      description: 'سابقه کاری ما'
    }
  ];

  // Intersection Observer to trigger animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Animate numbers when visible
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setAnimatedStats({
        investors: Math.round(finalStats.investors * easeOutQuart),
        totalInvestment: Math.round(finalStats.totalInvestment * easeOutQuart),
        activeProjects: Math.round(finalStats.activeProjects * easeOutQuart),
        avgReturn: finalStats.avgReturn * easeOutQuart,
        successRate: Math.round(finalStats.successRate * easeOutQuart),
        experience: Math.round(finalStats.experience * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(finalStats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <section 
      id="stats-section" 
      className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden"
    >
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-blue-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            اعداد و ارقام ExonVC
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            آمارهای واقعی که نشان‌دهنده اعتماد و موفقیت پلتفرم ما در زمینه سرمایه‌گذاری است
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {statsConfig.map((stat, index) => (
            <div
              key={stat.key}
              className={`group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>

              {/* Icon */}
              <div className={`relative w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>

              {/* Number */}
              <div className="relative text-center mb-4">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                  <span className="text-2xl">{stat.suffix}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-200 group-hover:text-white transition-colors duration-300">
                  {stat.title}
                </h3>
                <p className="text-gray-400 text-sm mt-2 group-hover:text-gray-300 transition-colors duration-300">
                  {stat.description}
                </p>
              </div>

              {/* Hover Effect Lines */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Achievement Cards */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">🏆 دستاوردهای ما</h3>
            
            {[
              {
                title: "بهترین پلتفرم سرمایه‌گذاری 2024",
                organization: "انجمن فین‌تک ایران",
                year: "1403"
              },
              {
                title: "گواهینامه امنیت سایبری",
                organization: "مرکز ملی فضای مجازی",
                year: "1403"
              },
              {
                title: "مجوز فعالیت از بانک مرکزی",
                organization: "بانک مرکزی جمهوری اسلامی ایران",
                year: "1402"
              }
            ].map((achievement, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center ml-4">
                  <TrophyIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">{achievement.title}</h4>
                  <p className="text-gray-300 text-sm">{achievement.organization} - {achievement.year}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">📈 عملکرد پلتفرم</h3>
            
            <div className="space-y-4">
              {[
                { label: 'رشد سرمایه‌گذاران', percentage: 85, color: 'bg-blue-500' },
                { label: 'افزایش سرمایه', percentage: 92, color: 'bg-green-500' },
                { label: 'تکمیل پروژه‌ها', percentage: 96, color: 'bg-purple-500' },
                { label: 'رضایت مشتریان', percentage: 88, color: 'bg-yellow-500' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.label}</span>
                    <span className="text-white font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${item.color}`}
                      style={{ 
                        width: isVisible ? `${item.percentage}%` : '0%',
                        transitionDelay: `${(index + 1) * 200}ms`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini Chart Visual */}
            <div className="mt-8 h-32 flex items-end justify-between space-x-2 space-x-reverse">
              {[65, 72, 78, 85, 92, 88, 96].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-blue-600 to-purple-600 rounded-t flex-1 transition-all duration-1000"
                  style={{ 
                    height: isVisible ? `${height}%` : '0%',
                    transitionDelay: `${index * 100}ms`
                  }}
                ></div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-300 text-sm">عملکرد 7 ماه اخیر</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">🛡️ نشانه‌های اعتماد</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: "🔒",
                title: "امنیت SSL",
                description: "رمزنگاری 256 بیتی"
              },
              {
                icon: "🏦",
                title: "مجوز بانک مرکزی",
                description: "تایید شده"
              },
              {
                icon: "🛡️",
                title: "بیمه سرمایه",
                description: "تا 1 میلیارد تومان"
              },
              {
                icon: "📱",
                title: "تایید دو مرحله‌ای",
                description: "حفاظت دوگانه"
              }
            ].map((trust, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{trust.icon}</div>
                <h4 className="text-white font-semibold mb-2">{trust.title}</h4>
                <p className="text-gray-300 text-sm">{trust.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              آماده پیوستن به جمع موفق‌ترین سرمایه‌گذاران هستید؟
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              همین حالا شروع کنید و از فرصت‌های طلایی سرمایه‌گذاری بهره‌مند شوید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                شروع سرمایه‌گذاری
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                مشاوره رایگان
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation Definitions */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
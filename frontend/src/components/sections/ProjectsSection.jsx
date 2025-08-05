// components/sections/ProjectsSection.jsx - Projects Section Component
import { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function ProjectsSection({ onProjectSelect, onAuthModalOpen }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);

  const categories = [
    { key: 'all', label: 'همه پروژه‌ها', count: 4 },
    { key: 'restaurant', label: 'رستوران', count: 2 },
    { key: 'cafe', label: 'کافه', count: 1 },
    { key: 'gold', label: 'طلا و جواهر', count: 1 }
  ];

  const sampleProjects = [
    {
      id: 1,
      title: "رستوران اکسون پلاس",
      short_description: "رستوران مدرن 200 نفره در کرمان با طراحی لوکس",
      category: "restaurant",
      target_amount: 15000000000,
      current_amount: 8500000000,
      min_investment: 10000000,
      expected_return: 18.5,
      duration_months: 24,
      risk_level: "medium",
      location: "کرمان، خیابان جمهوری",
      images: ["/images/projects/restaurant-1.jpg", "/images/projects/restaurant-2.jpg"],
      features: ["آشپزخانه صنعتی", "سالن VIP", "پارکینگ اختصاصی"],
      status: "active",
      investors_count: 156,
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      title: "کافه اکسون",
      short_description: "کافه مدرن با فضای دنج و منوی متنوع",
      category: "cafe",
      target_amount: 8000000000,
      current_amount: 6200000000,
      min_investment: 5000000,
      expected_return: 22.0,
      duration_months: 18,
      risk_level: "low",
      location: "کرمان، میدان آزادی",
      images: ["/images/projects/cafe-1.jpg", "/images/projects/cafe-2.jpg"],
      features: ["Wi-Fi رایگان", "فضای کار", "تراس باز"],
      status: "active",
      investors_count: 89,
      rating: 4.6,
      featured: false
    },
    {
      id: 3,
      title: "اکسون طلا",
      short_description: "طلافروشی مدرن با طراحی لوکس و امنیت بالا",
      category: "gold",
      target_amount: 25000000000,
      current_amount: 15800000000,
      min_investment: 20000000,
      expected_return: 15.5,
      duration_months: 36,
      risk_level: "low",
      location: "کرمان، بازار مرکزی",
      images: ["/images/projects/gold-1.jpg", "/images/projects/gold-2.jpg"],
      features: ["سیستم امنیتی پیشرفته", "طراحی لوکس", "مشاوره تخصصی"],
      status: "active",
      investors_count: 234,
      rating: 4.9,
      featured: true
    },
    {
      id: 4,
      title: "رستوران اکسون پلاس دبی",
      short_description: "شعبه بین‌المللی رستوران اکسون در دبی",
      category: "restaurant",
      target_amount: 50000000000,
      current_amount: 12000000000,
      min_investment: 50000000,
      expected_return: 25.0,
      duration_months: 30,
      risk_level: "high",
      location: "دبی، امارات متحده عربی",
      images: ["/images/projects/dubai-1.jpg", "/images/projects/dubai-2.jpg"],
      features: ["مجوز بین‌المللی", "آشپزخانه حلال", "طراحی ایرانی"],
      status: "active",
      investors_count: 67,
      rating: 4.7,
      featured: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(sampleProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProjects = projects.filter(project => 
    filter === 'all' || project.category === filter
  );

  const formatAmount = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} میلیارد`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} میلیون`;
    }
    return amount.toLocaleString();
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelText = (level) => {
    switch (level) {
      case 'low': return 'ریسک کم';
      case 'medium': return 'ریسک متوسط';
      case 'high': return 'ریسک بالا';
      default: return 'نامشخص';
    }
  };

  const toggleFavorite = (projectId) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const shareProject = (project) => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.short_description,
        url: `${window.location.origin}/projects/${project.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/projects/${project.id}`);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-700 rounded-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            پروژه‌های سرمایه‌گذاری
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            بهترین فرصت‌های سرمایه‌گذاری را انتخاب کنید و از سود مطمئن بهره‌مند شوید
          </p>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setFilter(category.key)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  filter === category.key
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600'
                }`}
              >
                {category.label}
                <span className="mr-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-sm">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Project Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Featured Badge */}
                {project.featured && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ ویژه
                  </div>
                )}

                {/* Risk Level Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${getRiskLevelColor(project.risk_level)}`}>
                  {getRiskLevelText(project.risk_level)}
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-4 space-x-reverse">
                    <button
                      onClick={() => onProjectSelect?.(project)}
                      className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(project.id)}
                      className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {favorites.includes(project.id) ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => shareProject(project)}
                      className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ShareIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                {/* Title and Rating */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{project.rating}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {project.short_description}
                </p>

                {/* Location and Duration */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <ClockIcon className="w-4 h-4" />
                    <span>{project.duration_months} ماه</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>پیشرفت جمع‌آوری</span>
                    <span>{Math.round((project.current_amount / project.target_amount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(project.current_amount / project.target_amount) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {project.expected_return}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">بازدهی سالانه</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatAmount(project.min_investment)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">حداقل سرمایه</div>
                  </div>
                </div>

                {/* Investors Count */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                    <span>{project.investors_count} سرمایه‌گذار</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatAmount(project.current_amount)} / {formatAmount(project.target_amount)} تومان
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() => onProjectSelect?.(project)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    مشاهده جزئیات
                  </button>
                  <button
                    onClick={() => onAuthModalOpen?.('login')}
                    className="flex-1 border-2 border-blue-600 text-blue-600 dark:text-blue-400 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
                  >
                    سرمایه‌گذاری
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-full font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300">
            مشاهده پروژه‌های بیشتر
          </button>
        </div>
      </div>
    </section>
  );
}
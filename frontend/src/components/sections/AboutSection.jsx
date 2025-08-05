// components/sections/AboutSection.jsx - About Section Component
import { useState } from 'react';
import { 
  CheckCircleIcon, 
  UserGroupIcon, 
  LightBulbIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function AboutSection() {
  const [activeTab, setActiveTab] = useState('story');

  const tabs = [
    { key: 'story', label: 'داستان ما', icon: LightBulbIcon },
    { key: 'mission', label: 'مأموریت', icon: ChartBarIcon },
    { key: 'team', label: 'تیم ما', icon: UserGroupIcon },
    { key: 'values', label: 'ارزش‌ها', icon: ShieldCheckIcon }
  ];

  const achievements = [
    {
      year: "1390",
      title: "تأسیس گروه اکسون",
      description: "شروع فعالیت با تمرکز بر کسب‌وکارهای محلی"
    },
    {
      year: "1395",
      title: "ورود به بازار سرمایه‌گذاری",
      description: "راه‌اندازی اولین پروژه‌های سرمایه‌گذاری"
    },
    {
      year: "1399",
      title: "توسعه پلتفرم آنلاین",
      description: "طراحی و راه‌اندازی پلتفرم دیجیتال"
    },
    {
      year: "1402",
      title: "دریافت مجوزهای لازم",
      description: "اخذ مجوز از بانک مرکزی و سازمان بورس"
    },
    {
      year: "1403",
      title: "گسترش بین‌المللی",
      description: "شروع پروژه‌های سرمایه‌گذاری خارج از کشور"
    }
  ];

  const teamMembers = [
    {
      name: "محمد رضایی",
      position: "مدیر عامل",
      experience: "15 سال تجربه در سرمایه‌گذاری",
      image: "/images/team/ceo.jpg",
      linkedin: "#"
    },
    {
      name: "سارا احمدی",
      position: "مدیر مالی",
      experience: "12 سال تجربه در حسابداری",
      image: "/images/team/cfo.jpg", 
      linkedin: "#"
    },
    {
      name: "علی محمدی",
      position: "مدیر فناوری",
      experience: "10 سال تجربه در IT",
      image: "/images/team/cto.jpg",
      linkedin: "#"
    },
    {
      name: "فاطمه کریمی",
      position: "مدیر بازاریابی",
      experience: "8 سال تجربه در دیجیتال مارکتینگ",
      image: "/images/team/cmo.jpg",
      linkedin: "#"
    }
  ];

  const values = [
    {
      icon: ShieldCheckIcon,
      title: "اعتماد و شفافیت",
      description: "ما بر پایه اعتماد متقابل و شفافیت کامل در تمام فرآیندها فعالیت می‌کنیم"
    },
    {
      icon: ChartBarIcon,
      title: "نوآوری مستمر",
      description: "همیشه در تلاش برای بهبود خدمات و ارائه راه‌حل‌های نوآورانه هستیم"
    },
    {
      icon: UserGroupIcon,
      title: "مشتری‌محوری",
      description: "موفقیت مشتریان ما، موفقیت ماست و همه تلاش‌مان در این راستاست"
    },
    {
      icon: BuildingOfficeIcon,
      title: "مسئولیت اجتماعی",
      description: "نقش خود در توسعه اقتصادی و اجتماعی کشور را جدی می‌گیریم"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'story':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                داستان تأسیس ExonVC
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                گروه اکسون در سال 1390 با هدف ایجاد بستری امن و سودآور برای سرمایه‌گذاری تأسیس شد. 
                ما با درنظرگیری نیازهای بازار ایران و با تکیه بر تجربه بیش از یک دهه در زمینه کسب‌وکار، 
                پلتفرمی را طراحی کردیم که بتواند پاسخگوی نیازهای متنوع سرمایه‌گذاران باشد.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                امروزه با بیش از 1200 سرمایه‌گذار فعال و مدیریت بیش از 98 میلیارد تومان سرمایه، 
                به یکی از معتبرترین پلتفرم‌های سرمایه‌گذاری کشور تبدیل شده‌ایم.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-blue-600"></div>
              {achievements.map((achievement, index) => (
                <div key={index} className="relative flex items-center mb-8 last:mb-0">
                  <div className="absolute right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="mr-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                        {achievement.year}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {achievement.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'mission':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                مأموریت ما
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                مأموریت ما ارائه بهترین خدمات سرمایه‌گذاری با بالاترین سطح امنیت و شفافیت است. 
                ما معتقدیم که هر فردی حق دسترسی به فرصت‌های سرمایه‌گذاری مطمئن و سودآور را دارد.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 هدف ما</h4>
                <ul className="space-y-3">
                  {[
                    "دموکراتیزه کردن سرمایه‌گذاری",
                    "ایجاد فرصت‌های برابر برای همه",
                    "حمایت از کسب‌وکارهای محلی",
                    "توسعه اقتصاد دیجیتال"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3 space-x-reverse">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🌟 چشم‌انداز</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  تبدیل شدن به پیشروترین و معتبرترین پلتفرم سرمایه‌گذاری در منطقه خاورمیانه 
                  و ایجاد اکوسیستمی که در آن همه افراد بتوانند از فرصت‌های اقتصادی بهره‌مند شوند.
                </p>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                تیم مدیریت ExonVC
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                متخصصان با تجربه‌ای که آینده سرمایه‌گذاری را می‌سازند
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
                    {member.position}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {member.experience}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'values':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ارزش‌های بنیادین ما
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                اصولی که در تمام فعالیت‌هایمان مدنظر قرار می‌دهیم
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="flex space-x-4 space-x-reverse p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            درباره ExonVC
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            بیش از یک دهه تجربه در ایجاد فرصت‌های سرمایه‌گذاری مطمئن و سودآور
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-12 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 space-x-reverse px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {renderTabContent()}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 lg:p-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              آماده همکاری با ما هستید؟
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              از مشاوره رایگان ما استفاده کنید و بهترین راه‌حل سرمایه‌گذاری را پیدا کنید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105">
                مشاوره رایگان
              </button>
              <button className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105">
                تماس با ما
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
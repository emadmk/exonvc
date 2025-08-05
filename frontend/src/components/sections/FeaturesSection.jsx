// components/sections/FeaturesSection.jsx - Features Section Component
import { 
  ShieldCheckIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  ClockIcon,
  DocumentTextIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function FeaturesSection() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: "امنیت بالا",
      description: "سیستم‌های امنیتی پیشرفته و رمزنگاری برای محافظت از سرمایه شما",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: ChartBarIcon,
      title: "بازدهی مطمئن",
      description: "سود تضمینی با نرخ‌های رقابتی و بازدهی بالا در پروژه‌های منتخب",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: UserGroupIcon,
      title: "تیم متخصص",
      description: "تیم مجرب و متخصص در زمینه سرمایه‌گذاری و مدیریت پروژه",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: ClockIcon,
      title: "پشتیبانی 24/7",
      description: "پشتیبانی کامل و مشاوره رایگان در تمام ساعات شبانه‌روز",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: DocumentTextIcon,
      title: "شفافیت کامل",
      description: "گزارش‌دهی منظم و شفاف از وضعیت پروژه‌ها و سرمایه‌گذاری‌ها",
      color: "from-teal-500 to-green-600"
    },
    {
      icon: CurrencyDollarIcon,
      title: "حداقل سرمایه کم",
      description: "شروع سرمایه‌گذاری با حداقل مبلغ 5 میلیون تومان",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: GlobeAltIcon,
      title: "پروژه‌های بین‌المللی",
      description: "دسترسی به فرصت‌های سرمایه‌گذاری در کشورهای مختلف",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: PhoneIcon,
      title: "مشاوره تخصصی",
      description: "مشاوره رایگان با کارشناسان مجرب برای انتخاب بهترین پروژه",
      color: "from-pink-500 to-rose-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            چرا ExonVC انتخاب کنید؟
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            ما بهترین خدمات سرمایه‌گذاری را با امنیت بالا و بازدهی مطمئن به شما ارائه می‌دهیم
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* Icon */}
              <div className={`relative w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="relative text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-500 rounded-2xl transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              آماده شروع سرمایه‌گذاری هستید؟
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              همین حالا ثبت‌نام کنید و از فرصت‌های طلایی سرمایه‌گذاری استفاده کنید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
                ثبت‌نام رایگان
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105">
                مشاوره رایگان
              </button>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              فرآیند سرمایه‌گذاری در ExonVC
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              در چند مرحله ساده سرمایه‌گذاری خود را شروع کنید
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "ثبت‌نام",
                description: "حساب کاربری خود را ایجاد کنید",
                icon: "👤"
              },
              {
                step: "2", 
                title: "انتخاب پروژه",
                description: "از میان پروژه‌های موجود انتخاب کنید",
                icon: "📊"
              },
              {
                step: "3",
                title: "سرمایه‌گذاری",
                description: "مبلغ مورد نظر خود را سرمایه‌گذاری کنید",
                icon: "💰"
              },
              {
                step: "4",
                title: "دریافت سود",
                description: "سود خود را به صورت ماهانه دریافت کنید",
                icon: "📈"
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {/* Connection Line */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform translate-x-4 z-0"></div>
                )}
                
                <div className="relative z-10">
                  {/* Step Number */}
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="text-4xl mb-4">{item.icon}</div>
                  
                  {/* Content */}
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
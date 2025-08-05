// components/footer/Footer.jsx - Main Footer Component
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'درباره ما', href: '/about' },
      { name: 'تیم ما', href: '/team' },
      { name: 'مأموریت', href: '/mission' },
      { name: 'تماس با ما', href: '/contact' }
    ],
    services: [
      { name: 'پروژه‌های سرمایه‌گذاری', href: '/projects' },
      { name: 'مشاوره سرمایه‌گذاری', href: '/consulting' },
      { name: 'گزارش‌های مالی', href: '/reports' },
      { name: 'پشتیبانی', href: '/support' }
    ],
    legal: [
      { name: 'قوانین و مقررات', href: '/terms' },
      { name: 'حریم خصوصی', href: '/privacy' },
      { name: 'قوانین سرمایه‌گذاری', href: '/investment-terms' },
      { name: 'شکایات', href: '/complaints' }
    ],
    resources: [
      { name: 'راهنمای سرمایه‌گذاری', href: '/guide' },
      { name: 'سؤالات متداول', href: '/faq' },
      { name: 'مرکز دانلود', href: '/downloads' },
      { name: 'وبلاگ', href: '/blog' }
    ]
  };

  const socialLinks = [
    {
      name: 'تلگرام',
      href: 'https://t.me/ExonVCInvest',
      icon: '📱',
      color: 'hover:text-blue-500'
    },
    {
      name: 'اینستاگرام',
      href: 'https://instagram.com/exonvc.ir',
      icon: '📷',
      color: 'hover:text-pink-500'
    },
    {
      name: 'واتساپ',
      href: 'https://wa.me/989131234567',
      icon: '💬',
      color: 'hover:text-green-500'
    },
    {
      name: 'لینکدین',
      href: 'https://linkedin.com/company/exonvc',
      icon: '💼',
      color: 'hover:text-blue-700'
    }
  ];

  const quickStats = [
    { label: 'سرمایه‌گذار فعال', value: '1200+' },
    { label: 'پروژه موفق', value: '45+' },
    { label: 'میلیارد تومان سرمایه', value: '98+' },
    { label: 'سال تجربه', value: '12+' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              از آخرین فرصت‌های سرمایه‌گذاری باخبر شوید
            </h3>
            <p className="text-gray-400 mb-8">
              عضو خبرنامه ExonVC شوید و اولین نفری باشید که از پروژه‌های جدید مطلع می‌شوید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="آدرس ایمیل شما"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 whitespace-nowrap">
                عضویت
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 space-x-reverse mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">ExonVC</h2>
                <p className="text-gray-400 text-sm">پلتفرم سرمایه‌گذاری</p>
              </div>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              گروه اکسون با بیش از یک دهه تجربه، بستری امن و سودآور برای سرمایه‌گذاری شما فراهم می‌کند. 
              ما به شفافیت، امنیت و موفقیت مشتریانمان متعهد هستیم.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse text-gray-400">
                <PhoneIcon className="w-5 h-5 text-blue-400" />
                <span>09131234567</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse text-gray-400">
                <EnvelopeIcon className="w-5 h-5 text-blue-400" />
                <span>info@exonvc.ir</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse text-gray-400">
                <MapPinIcon className="w-5 h-5 text-blue-400" />
                <span>کرمان، خیابان جمهوری، ساختمان اکسون</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="text-lg font-semibold mb-4">شرکت</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">خدمات</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">قوانین</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">منابع</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-3">ما را دنبال کنید</h4>
              <div className="flex space-x-4 space-x-reverse">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xl transition-all duration-300 hover:bg-gray-700 transform hover:scale-110 ${social.color}`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 sm:space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-green-400">🔒</span>
                <span className="text-sm text-gray-300">SSL محافظت شده</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-blue-400">🏦</span>
                <span className="text-sm text-gray-300">مجوز بانک مرکزی</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              © {currentYear} گروه اکسون. تمامی حقوق محفوظ است.
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <span>ساخته شده با</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>در ایران</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
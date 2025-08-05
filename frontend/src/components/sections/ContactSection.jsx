// components/sections/ContactSection.jsx - Contact Section Component
import { useState } from 'react';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: "تماس تلفنی",
      details: ["09131234567", "034-32345678"],
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: EnvelopeIcon,
      title: "ایمیل",
      details: ["info@exonvc.ir", "support@exonvc.ir"],
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: MapPinIcon,
      title: "آدرس دفتر مرکزی",
      details: ["کرمان، خیابان جمهوری", "ساختمان اکسون، طبقه 5"],
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: ClockIcon,
      title: "ساعات کاری",
      details: ["شنبه تا چهارشنبه: 8 تا 17", "پنج‌شنبه: 8 تا 13"],
      color: "from-orange-500 to-red-600"
    }
  ];

  const socialLinks = [
    {
      name: "تلگرام",
      url: "https://t.me/ExonVCInvest",
      icon: "📱",
      color: "hover:bg-blue-500"
    },
    {
      name: "اینستاگرام", 
      url: "https://instagram.com/exonvc.ir",
      icon: "📷",
      color: "hover:bg-pink-500"
    },
    {
      name: "واتساپ",
      url: "https://wa.me/989131234567",
      icon: "💬",
      color: "hover:bg-green-500"
    },
    {
      name: "لینکدین",
      url: "https://linkedin.com/company/exonvc",
      icon: "💼",
      color: "hover:bg-blue-700"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            تماس با ما
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            ما همیشه آماده پاسخگویی به سؤالات شما هستیم. با ما در ارتباط باشید
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              اطلاعات تماس
            </h3>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-lg flex items-center justify-center mb-4`}>
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {info.title}
                  </h4>
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-gray-600 dark:text-gray-300 mb-1">
                      {detail}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Social Media Links */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                شبکه‌های اجتماعی
              </h4>
              <div className="flex space-x-4 space-x-reverse">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center text-xl transition-all duration-300 transform hover:scale-110 ${social.color} hover:text-white`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                موقعیت دفتر مرکزی
              </h4>
              <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">نقشه دفتر مرکزی</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">کرمان، خیابان جمهوری</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              ارسال پیام
            </h3>

            {submitStatus === 'success' && (
              <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-6">
                پیام شما با موفقیت ارسال شد. در اسرع وقت با شما تماس خواهیم گرفت.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
                خطا در ارسال پیام. لطفاً دوباره تلاش کنید.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-300"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ایمیل *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-300"
                    placeholder="ایمیل خود را وارد کنید"
                  />
                </div>
              </div>

              {/* Phone and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    شماره تماس
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-300"
                    placeholder="09123456789"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    موضوع *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-300"
                  >
                    <option value="">انتخاب موضوع</option>
                    <option value="investment">سؤال درباره سرمایه‌گذاری</option>
                    <option value="support">پشتیبانی فنی</option>
                    <option value="partnership">همکاری</option>
                    <option value="complaint">شکایت</option>
                    <option value="suggestion">پیشنهاد</option>
                    <option value="other">سایر</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  پیام *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-300 resize-none"
                  placeholder="پیام خود را بنویسید..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 space-x-reverse"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>در حال ارسال...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    <span>ارسال پیام</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            سؤالات متداول
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "حداقل مبلغ سرمایه‌گذاری چقدر است؟",
                answer: "حداقل مبلغ سرمایه‌گذاری 5 میلیون تومان است که بسته به نوع پروژه ممکن است متفاوت باشد."
              },
              {
                question: "چگونه می‌توانم سود خود را دریافت کنم؟",
                answer: "سود شما ماهانه به حساب بانکی ثبت شده در پروفایل واریز می‌شود."
              },
              {
                question: "آیا سرمایه من بیمه است؟",
                answer: "بله، تمام سرمایه‌گذاری‌ها تا مبلغ 1 میلیارد تومان بیمه هستند."
              },
              {
                question: "چه مدارکی برای ثبت‌نام نیاز دارم؟",
                answer: "فقط کارت ملی و شماره حساب بانکی برای تأیید هویت و دریافت سود کافی است."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Chat CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <ChatBubbleLeftRightIcon className="w-6 h-6 ml-2" />
            <span className="font-semibold">گفتگوی آنلاین با مشاور</span>
            <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse mr-3"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-3">
            پاسخ فوری به سؤالات شما
          </p>
        </div>
      </div>
    </section>
  );
}
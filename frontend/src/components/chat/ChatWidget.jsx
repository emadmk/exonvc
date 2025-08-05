// components/chat/ChatWidget.jsx - AI Chat Widget Component
import { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  MinusIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const { user, isLoggedIn } = useAuth();

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      text: `سلام${isLoggedIn && user ? ` ${user.first_name}` : ''}! 👋\n\nمن دستیار هوشمند ExonVC هستم. چطور می‌تونم کمکتون کنم؟\n\n• سؤال درباره پروژه‌ها\n• راهنمای سرمایه‌گذاری\n• اطلاعات حساب کاربری\n• پشتیبانی فنی`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [isLoggedIn, user]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Unread count management
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot') {
        setUnreadCount(prev => prev + 1);
      }
    } else {
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    try {
      const botResponse = await generateBotResponse(inputValue);
      
      setTimeout(() => {
        setIsTyping(false);
        const botMessage = {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Auto speak response if enabled
        if (isSpeaking) {
          speakText(botResponse);
        }
      }, 1000 + Math.random() * 2000);
    } catch (error) {
      setIsTyping(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'متأسفم، در حال حاضر مشکلی پیش آمده. لطفاً با پشتیبانی تماس بگیرید.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const generateBotResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    
    // Simple keyword-based responses (در پروژه واقعی با GPT-4 جایگزین شود)
    if (input.includes('پروژه') || input.includes('سرمایه گذاری')) {
      return `در حال حاضر 4 پروژه فعال داریم:\n\n🏢 رستوران اکسون پلاس - بازدهی 18.5%\n☕ کافه اکسون - بازدهی 22%\n💰 اکسون طلا - بازدهی 15.5%\n🌍 رستوران دبی - بازدهی 25%\n\nکدوم پروژه رو بیشتر می‌خواید بدونید؟`;
    }
    
    if (input.includes('حساب') || input.includes('پروفایل')) {
      if (isLoggedIn) {
        return `حساب شما فعال است ✅\n\n👤 نام: ${user?.first_name} ${user?.last_name}\n📱 موبایل: ${user?.phone}\n\nبرای مشاهده جزئیات بیشتر به پنل کاربری مراجعه کنید.`;
      } else {
        return 'برای مشاهده اطلاعات حساب کاربری، لطفاً ابتدا وارد حساب خود شوید.\n\n[ورود/ثبت‌نام] را از منوی بالا انتخاب کنید.';
      }
    }
    
    if (input.includes('تماس') || input.includes('پشتیبانی')) {
      return `راه‌های تماس با ما:\n\n📞 تلفن: 09131234567\n📧 ایمیل: info@exonvc.ir\n🏢 آدرس: کرمان، خیابان جمهوری\n\n⏰ ساعات کاری: شنبه تا چهارشنبه 8 تا 17`;
    }
    
    if (input.includes('امنیت') || input.includes('ایمن')) {
      return `امنیت سرمایه شما اولویت ماست:\n\n🔒 رمزنگاری SSL 256 بیتی\n🏦 مجوز بانک مرکزی\n🛡️ بیمه سرمایه تا 1 میلیارد\n📱 تایید دو مرحله‌ای\n\nتمام تراکنش‌ها تحت نظارت سازمان بورس انجام می‌شود.`;
    }
    
    if (input.includes('سلام') || input.includes('درود')) {
      return `سلام! خوش آمدید 😊\n\nچطور می‌تونم کمکتون کنم؟ می‌تونید از من درباره:\n\n• پروژه‌های سرمایه‌گذاری\n• نحوه ثبت‌نام\n• امنیت پلتفرم\n• راه‌های تماس\n\nسؤال بپرسید.`;
    }
    
    // Default response
    return `متشکرم از پیامتون! 🙏\n\nمن هنوز در حال یادگیری هستم. برای پاسخ دقیق‌تر، لطفاً با تیم پشتیبانی ما تماس بگیرید:\n\n📞 09131234567\n📧 info@exonvc.ir\n\nیا از گزینه‌های زیر استفاده کنید:\n• درباره پروژه‌ها\n• اطلاعات حساب\n• راه‌های تماس`;
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fa-IR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking) {
      speechSynthesis.cancel();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickActions = [
    { text: 'پروژه‌های فعال', icon: '📊' },
    { text: 'نحوه سرمایه‌گذاری', icon: '💰' },
    { text: 'تماس با پشتیبانی', icon: '📞' },
    { text: 'امنیت پلتفرم', icon: '🔒' }
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={toggleChat}
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          
          {/* Online Indicator */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-24 left-6 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">دستیار ExonVC</h3>
                <p className="text-xs opacity-90">آنلاین • پاسخ فوری</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={toggleSpeech}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={isSpeaking ? 'خاموش کردن صدا' : 'روشن کردن صدا'}
              >
                {isSpeaking ? (
                  <SpeakerWaveIcon className="w-4 h-4" />
                ) : (
                  <SpeakerXMarkIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={minimizeChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-4 h-96 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(action.text)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full transition-colors"
                    >
                      {action.icon} {action.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2 space-x-reverse">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
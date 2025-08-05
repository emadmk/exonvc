# 🚀 ExonVC Investment Platform

پلتفرم سرمایه‌گذاری مدرن و حرفه‌ای ExonVC با Agent هوش مصنوعی فارسی

## 📋 ویژگی‌های کلیدی

### 🎯 Frontend (Next.js 14)
- **UI مدرن Dark Theme** با Glassmorphism
- **کاملاً Responsive** - Mobile First Design
- **RTL Support** کامل با فونت وزیر
- **انیمیشن‌های جذاب** با Framer Motion
- **OTP Authentication** با Kavenegar
- **Real-time Chat** با WebSocket
- **TailwindCSS v3** برای استایل‌دهی

### ⚡ Backend (FastAPI)
- **REST API کامل** با FastAPI
- **PostgreSQL Database** برای پایداری
- **JWT Authentication** امن
- **WebSocket** برای چت Real-time
- **Admin Panel** پیشرفته
- **OTP Integration** با Kavenegar
- **OpenAI GPT-4** برای Agent

### 🤖 Agent هوش مصنوعی
- **مشاوره تخصصی** در 4 پروژه اکسون
- **پردازش فارسی** طبیعی
- **حافظه مکالمات** هوشمند
- **جستجوی پیشرفته** چت‌ها در پنل ادمین

## 🏗️ معماری پروژه

```
invest.exonvc.ir/
├── backend/              # FastAPI Backend
│   ├── main.py          # Entry Point
│   ├── models.py        # Database Models
│   ├── auth.py          # Authentication
│   ├── admin.py         # Admin Panel APIs
│   ├── database.py      # Database Config
│   ├── requirements.txt # Python Dependencies
│   └── Dockerfile       # Backend Container
│
├── frontend/            # Next.js Frontend
│   ├── src/
│   │   ├── pages/       # Next.js Pages
│   │   ├── components/  # React Components
│   │   ├── hooks/       # Custom Hooks
│   │   ├── utils/       # Utility Functions
│   │   └── styles/      # Global Styles
│   ├── package.json     # Node Dependencies
│   └── Dockerfile       # Frontend Container
│
├── docker-compose.yml   # Multi-container Setup
├── nginx.conf          # Reverse Proxy Config
├── system_prompt.txt   # Agent AI Prompt
└── README.md          # This File
```

## 🚀 راه‌اندازی سریع

### پیش‌نیازها
- Docker & Docker Compose
- Domain: `invest.exonvc.ir` با SSL
- API Keys: OpenAI + Kavenegar

### نصب و راه‌اندازی

1. **Clone پروژه:**
```bash
git clone <repository-url>
cd invest.exonvc.ir
```

2. **تنظیم متغیرهای محیطی:**
```bash
# در فایل backend/.env
DATABASE_URL=postgresql://exonvc_user:exonvc_password@db:5432/exonvc_invest
OPENAI_API_KEY=your_openai_key
KAVENEGAR_API_KEY=your_kavenegar_key
```

3. **راه‌اندازی با Docker:**
```bash
docker-compose up -d --build
```

4. **دسترسی به سرویس‌ها:**
- Frontend: `https://invest.exonvc.ir`
- Backend API: `https://invest.exonvc.ir/api`
- Admin Panel: `https://invest.exonvc.ir/admin`

## 🗄️ دیتابیس و پروژه‌ها

### پروژه‌های پیش‌فرض
1. **رستوران اکسون پلاس** - 15 میلیارد تومان - 18.5% بازدهی
2. **کافه اکسون** - 8 میلیارد تومان - 22% بازدهی  
3. **اکسون طلا** - 25 میلیارد تومان - 15.5% بازدهی
4. **رستوران اکسون پلاس دبی** - 50 میلیارد تومان - 25% بازدهی

### Admin Panel
- **مدیریت کاربران** - وضعیت، پروفایل، سرمایه‌گذاری‌ها
- **مدیریت پروژه‌ها** - CRUD کامل، آپلود تصاویر
- **Chat Management** - جستجوی پیشرفته، دسته‌بندی
- **Analytics** - آمار کاربران، سرمایه‌گذاری‌ها
- **تنظیمات سایت** - محتوای صفحات، اطلاعات تماس

## 🔐 امنیت

### Frontend Security
- **HTTPS Only** - SSL/TLS اجباری
- **JWT Tokens** - احراز هویت ایمن
- **XSS Protection** - محافظت از حملات
- **CSRF Protection** - امنیت فرم‌ها

### Backend Security  
- **Rate Limiting** - محدودیت درخواست
- **Input Validation** - اعتبارسنجی ورودی
- **SQL Injection Prevention** - ORM امن
- **CORS Configuration** - تنظیمات امن

## 🎨 UI/UX ویژگی‌ها

### طراحی مدرن
- **Dark Theme** اختصاصی
- **Glassmorphism** Effects
- **Responsive Design** - Mobile First
- **RTL Support** کامل
- **فونت وزیر** اختصاصی

### تجربه کاربری
- **Loading States** هوشمند
- **Error Handling** دوستانه
- **Toast Notifications** زیبا
- **Skeleton Loading** برای UX بهتر
- **Progressive Web App** Ready

## 🤖 Agent هوش مصنوعی

### قابلیت‌ها
- **مشاوره تخصصی** در پروژه‌های اکسون
- **پردازش زبان فارسی** طبیعی
- **حافظه مکالمات** تا 10 پیام
- **پاسخ‌های کاربردی** و دقیق

### مدیریت در Admin Panel
- **جستجوی متنی** در چت‌ها
- **فیلتر بر اساس تاریخ** و شماره تلفن
- **دسته‌بندی خودکار** موضوعات
- **Export** داده‌ها به CSV

## 📊 آمار و آنالیتیکس

### Dashboard Metrics
- **کاربران**: کل، فعال، جدید امروز
- **سرمایه‌گذاری‌ها**: مقدار، تعداد، وضعیت
- **چت‌ها**: کل مکالمات، امروز
- **پروژه‌ها**: فعال، تکمیل شده

### نمودارهای تحلیلی
- **ثبت‌نام روزانه** کاربران
- **سرمایه‌گذاری روزانه** (مقدار + تعداد)
- **سرمایه‌گذاری بر اساس پروژه**
- **دسته‌بندی چت‌ها**

## 🔧 تنظیمات پیشرفته

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-proj-...
KAVENEGAR_API_KEY=...
JWT_SECRET_KEY=...

# Frontend
NEXT_PUBLIC_API_URL=https://invest.exonvc.ir/api
NEXT_PUBLIC_WS_URL=wss://invest.exonvc.ir/ws
```

### Docker Configuration
- **Multi-stage Build** برای optimization
- **Health Checks** برای پایداری
- **Volume Mounting** برای persistence
- **Network Isolation** برای امنیت

## 📱 Mobile Optimization

### Responsive Features
- **Touch-friendly** Interface
- **Swipe Gestures** Support
- **Mobile Navigation** Menu
- **Optimized Images** Loading
- **PWA Support** آماده

### Performance
- **Code Splitting** خودکار
- **Image Optimization** Next.js
- **Static Generation** برای سرعت
- **CDN Ready** برای توزیع

## 🚨 Monitoring & Logging

### Application Monitoring
- **Error Tracking** در Production
- **Performance Metrics** API
- **User Activity** Logging
- **Chat Analytics** Dashboard

### System Health
- **Database Connection** Monitoring
- **API Response Times** Tracking
- **Memory Usage** Alerts
- **Disk Space** Monitoring

## 🔄 Updates & Maintenance

### Automated Updates
- **Docker Image** Updates
- **Security Patches** Application
- **Dependencies** Management
- **Database Migrations** Safe

### Backup Strategy
- **Database Backups** Daily
- **Code Repository** Git
- **SSL Certificates** Renewal
- **Config Files** Versioning

## 📞 پشتیبانی

### تیم فنی
- **Backend Issues**: FastAPI + PostgreSQL
- **Frontend Issues**: Next.js + React
- **DevOps Issues**: Docker + Nginx
- **AI Issues**: OpenAI Integration

### مستندات
- **API Documentation**: Swagger UI در `/docs`
- **Component Docs**: Storybook (در صورت نیاز)
- **Database Schema**: ERD Diagrams
- **Deployment Guide**: Step-by-step

---

## 🎯 نسخه 1.0.0

**تاریخ انتشار**: آگوست 2025  
**توسعه‌دهنده**: Claude Sonnet 4  
**برای**: گروه اکسون  

### 🚀 آماده برای Production!

تمام فایل‌ها و تنظیمات برای استقرار نهایی روی `invest.exonvc.ir` آماده شده‌اند.

**فقط کافیست:**
1. فایل‌ها را در سرور کپی کنید
2. `docker-compose up -d --build` اجرا کنید  
3. از سایت لذت ببرید! 🎉
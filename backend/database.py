# database.py - Database Configuration
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://exonvc_user:exonvc_password@localhost:5432/exonvc_invest")

# For development with SQLite (uncomment if needed)
# DATABASE_URL = "sqlite:///./exonvc_invest.db"

# Create engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    create_initial_data()

def create_initial_data():
    from models import Project, AdminUser, SiteSettings
    from passlib.context import CryptContext
    from datetime import datetime, timedelta

    db = SessionLocal()
    try:
        admin_exists = db.query(AdminUser).filter(AdminUser.username == "admin").first()
        if not admin_exists:
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            hashed_password = pwd_context.hash("admin123456")
            admin = AdminUser(
                username="admin",
                email="admin@exonvc.ir",
                password_hash=hashed_password,
                full_name="مدیر سیستم",
                role="admin"
            )
            db.add(admin)

        projects_exist = db.query(Project).count()
        if projects_exist == 0:
            projects_data = [
                {
                    "title": "رستوران اکسون پلاس دبی",
                    "description": "شعبه بین‌المللی رستوران اکسون پلاس در دبی امارات...",
                    "short_description": "شعبه بین‌المللی رستوران اکسون در دبی با غذاهای ایرانی اصیل",
                    "category": "restaurant_dubai",
                    "target_amount": 50000000000,
                    "min_investment": 50000000,
                    "expected_return": 25.0,
                    "duration_months": 30,
                    "risk_level": "high",
                    "location": "دبی، امارات متحده عربی",
                    "slug": "restaurant-exon-plus-dubai",
                    "images": ["/images/projects/dubai-1.jpg", "/images/projects/dubai-2.jpg"],
                    "features": ["مجوز بین‌المللی", "آشپزخانه حلال", "طراحی ایرانی", "خدمات کیترینگ"],
                    "financial_details": {
                        "monthly_income": 2000000000,
                        "operating_costs": 1200000000,
                        "net_monthly_profit": 800000000
                    },
                    "start_date": datetime.utcnow(),
                    "end_date": datetime.utcnow() + timedelta(days=913)
                },
                {
                    "title": "رستوران اکسون پلاس",
                    "description": "رستوران مدرن اکسون پلاس با ظرفیت 200 نفر در کرمان...",
                    "short_description": "رستوران مدرن 200 نفره در کرمان با طراحی لوکس",
                    "category": "restaurant",
                    "target_amount": 15000000000,
                    "min_investment": 10000000,
                    "expected_return": 18.5,
                    "duration_months": 24,
                    "risk_level": "medium",
                    "location": "کرمان، خیابان جمهوری",
                    "slug": "restaurant-exon-plus",
                    "images": ["/images/projects/restaurant-1.jpg", "/images/projects/restaurant-2.jpg"],
                    "features": ["آشپزخانه صنعتی", "سالن VIP", "پارکینگ اختصاصی", "سیستم صوتی حرفه‌ای"],
                    "financial_details": {
                        "monthly_income": 500000000,
                        "operating_costs": 300000000,
                        "net_monthly_profit": 200000000
                    },
                    "start_date": datetime.utcnow(),
                    "end_date": datetime.utcnow() + timedelta(days=730)
                },
                {
                    "title": "کافه اکسون",
                    "description": "کافه مدرن اکسون با فضای دنج و منوی متنوع در مرکز شهر...",
                    "short_description": "کافه مدرن با فضای دنج و منوی متنوع",
                    "category": "cafe",
                    "target_amount": 8000000000,
                    "min_investment": 5000000,
                    "expected_return": 22.0,
                    "duration_months": 18,
                    "risk_level": "low",
                    "location": "کرمان، میدان آزادی",
                    "slug": "cafe-exon",
                    "images": ["/images/projects/cafe-1.jpg", "/images/projects/cafe-2.jpg"],
                    "features": ["Wi-Fi رایگان", "فضای کار", "تراس باز", "پارکینگ"],
                    "financial_details": {
                        "monthly_income": 300000000,
                        "operating_costs": 180000000,
                        "net_monthly_profit": 120000000
                    },
                    "start_date": datetime.utcnow(),
                    "end_date": datetime.utcnow() + timedelta(days=548)
                },
                {
                    "title": "اکسون طلا",
                    "description": "طلافروشی مدرن اکسون با طراحی لوکس و امنیت بالا...",
                    "short_description": "طلافروشی مدرن با طراحی لوکس و امنیت بالا",
                    "category": "gold",
                    "target_amount": 25000000000,
                    "min_investment": 20000000,
                    "expected_return": 15.5,
                    "duration_months": 36,
                    "risk_level": "low",
                    "location": "کرمان، بازار مرکزی",
                    "slug": "exon-gold",
                    "images": ["/images/projects/gold-1.jpg", "/images/projects/gold-2.jpg"],
                    "features": ["سیستم امنیتی پیشرفته", "گاوصندوق ضدسرقت", "طراحی لوکس", "مشاوره تخصصی"],
                    "financial_details": {
                        "monthly_income": 800000000,
                        "operating_costs": 450000000,
                        "net_monthly_profit": 350000000
                    },
                    "start_date": datetime.utcnow(),
                    "end_date": datetime.utcnow() + timedelta(days=1095)
                }
            ]
            for project_data in projects_data:
                project = Project(**project_data)
                db.add(project)

        settings_exist = db.query(SiteSettings).count()
        if settings_exist == 0:
            initial_settings = [
                {"key": "site_title", "value": "پلتفرم سرمایه‌گذاری ExonVC", "description": "عنوان اصلی سایت", "category": "general", "is_public": True},
                {"key": "site_description", "value": "بهترین فرصت‌های سرمایه‌گذاری در پروژه‌های سودآور", "description": "توضیحات سایت", "category": "general", "is_public": True},
                {"key": "contact_phone", "value": "09131234567", "description": "شماره تماس پشتیبانی", "category": "contact", "is_public": True},
                {"key": "contact_email", "value": "info@exonvc.ir", "description": "ایمیل پشتیبانی", "category": "contact", "is_public": True},
                {"key": "hero_title", "value": "سرمایه‌گذاری هوشمند، آینده درخشان", "description": "عنوان اصلی صفحه خانه", "category": "homepage", "is_public": True},
                {"key": "hero_subtitle", "value": "در پروژه‌های سودآور گروه اکسون سرمایه‌گذاری کنید و از بازدهی مطمئن بهره‌مند شوید", "description": "زیرعنوان صفحه خانه", "category": "homepage", "is_public": True}
            ]
            for setting_data in initial_settings:
                setting = SiteSettings(**setting_data)
                db.add(setting)

        db.commit()
    except Exception as e:
        print(f"❌ Error creating initial data: {e}")
        db.rollback()
    finally:
        db.close()

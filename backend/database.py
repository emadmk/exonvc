# database.py - Final Complete Version
import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import logging
from datetime import datetime, date
from decimal import Decimal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/exonvc_investment.db")

# Create engine with optimized settings
if DATABASE_URL.startswith("sqlite"):
    # SQLite specific configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False,
            "timeout": 30,
            "isolation_level": None
        },
        poolclass=StaticPool,
        pool_pre_ping=True,
        echo=False  # Set to True for SQL debugging
    )
else:
    # PostgreSQL/MySQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=30,
        pool_timeout=30,
        pool_recycle=3600,
        pool_pre_ping=True,
        echo=False
    )

# Create SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create metadata
metadata = MetaData()

# Database dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

# Initialize database with all tables
def init_db():
    """Initialize database with all tables and seed data"""
    try:
        # Import all models to ensure they're registered with SQLAlchemy
        from models import (
            Base, User, Project, Investment, PaymentPlan, PaymentHistory,
            UserSession, PageView, UserAction, ContentManagement,
            ProjectAnalytics, FinancialReport, Notification, SystemLog,
            ChatLog, AdminUser, SiteSettings
        )
        
        logger.info("Creating all database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
        
        # Create initial seed data
        create_seed_data()
        
        logger.info("✅ Database initialization completed")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

def create_seed_data():
    """Create initial seed data for the application"""
    db = SessionLocal()
    try:
        from models import (
            AdminUser, SiteSettings, Project, ContentManagement
        )
        
        logger.info("Creating seed data...")
        
        # 1. Create default admin user
        existing_admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
        if not existing_admin:
            import hashlib
            password_hash = hashlib.sha256("admin123".encode()).hexdigest()
            
            default_admin = AdminUser(
                username="admin",
                email="admin@exonvc.ir",
                password_hash=password_hash,
                full_name="مدیر سیستم",
                role="super_admin",
                is_active=True,
                is_superuser=True,
                permissions=["all"],
                department="IT"
            )
            db.add(default_admin)
            logger.info("✅ Default admin user created")
        
        # 2. Create default site settings
        default_settings = [
            {
                "category": "general",
                "key": "site_title",
                "value": "پلتفرم سرمایه‌گذاری ExonVC",
                "display_name": "عنوان سایت",
                "description": "عنوان اصلی سایت",
                "is_public": True
            },
            {
                "category": "general",
                "key": "site_description",
                "value": "پلتفرم هوشمند سرمایه‌گذاری در پروژه‌های سودآور",
                "display_name": "توضیحات سایت",
                "description": "توضیحات کوتاه سایت",
                "is_public": True
            },
            {
                "category": "contact",
                "key": "company_phone",
                "value": "09131234567",
                "display_name": "شماره تماس",
                "description": "شماره تماس اصلی شرکت",
                "is_public": True
            },
            {
                "category": "contact",
                "key": "company_email",
                "value": "info@exonvc.ir",
                "display_name": "ایمیل شرکت",
                "description": "ایمیل اصلی شرکت",
                "is_public": True
            },
            {
                "category": "contact",
                "key": "company_address",
                "value": "کرمان، خیابان جمهوری، ساختمان اکسون، طبقه 5",
                "display_name": "آدرس شرکت",
                "description": "آدرس دفتر مرکزی شرکت",
                "is_public": True
            },
            {
                "category": "financial",
                "key": "min_investment_amount",
                "value": "5000000",
                "value_type": "number",
                "display_name": "حداقل مبلغ سرمایه‌گذاری",
                "description": "حداقل مبلغ برای سرمایه‌گذاری (تومان)",
                "is_public": True
            },
            {
                "category": "financial",
                "key": "default_late_fee_rate",
                "value": "5.0",
                "value_type": "number",
                "display_name": "نرخ جریمه تأخیر",
                "description": "درصد جریمه تأخیر در پرداخت اقساط",
                "is_public": False
            },
            {
                "category": "api",
                "key": "openai_api_key",
                "value": "",
                "display_name": "OpenAI API Key",
                "description": "کلید API برای چت هوشمند",
                "is_public": False,
                "is_sensitive": True
            },
            {
                "category": "api",
                "key": "kavenegar_api_key",
                "value": "",
                "display_name": "Kavenegar API Key",
                "description": "کلید API برای ارسال پیامک",
                "is_public": False,
                "is_sensitive": True
            }
        ]
        
        for setting_data in default_settings:
            existing_setting = db.query(SiteSettings).filter(
                SiteSettings.key == setting_data["key"]
            ).first()
            
            if not existing_setting:
                setting = SiteSettings(**setting_data)
                db.add(setting)
        
        logger.info("✅ Default site settings created")
        
        # 3. Create sample projects (4 ExonVC projects)
        sample_projects = [
            {
                "title": "رستوران اکسون پلاس",
                "short_description": "رستوران مدرن با کیفیت بالا و محیط لوکس",
                "description": "پروژه احداث رستوران اکسون پلاس با ظرفیت 200 نفر، مجهز به آشپزخانه مدرن و دکوراسیون شیک",
                "category": "restaurant",
                "target_amount": Decimal("15000000000"),  # 15 میلیارد تومان
                "min_investment": Decimal("5000000"),     # 5 میلیون تومان
                "expected_return": 18.5,
                "duration_months": 24,
                "location": "تهران، ولیعصر",
                "status": "active",
                "is_featured": True,
                "priority": 1,
                "risk_level": "medium",
                "slug": "restaurant-exon-plus",
                "features": [
                    "آشپزخانه مجهز به تکنولوژی روز",
                    "فضای پارکینگ اختصاصی",
                    "سالن VIP و عادی",
                    "سیستم سفارش آنلاین"
                ],
                "financial_details": {
                    "construction_cost": "8000000000",
                    "equipment_cost": "4000000000",
                    "working_capital": "2000000000",
                    "marketing_budget": "1000000000"
                },
                "team_info": {
                    "project_manager": "احمد محمدی",
                    "architect": "مریم احمدی",
                    "contractor": "شرکت ساختمانی اکسون"
                }
            },
            {
                "title": "کافه اکسون",
                "short_description": "کافه مدرن با فضای دنج و کیفیت عالی",
                "description": "احداث کافه اکسون با فضای 150 متری، دکوراسیون مدرن و منوی متنوع",
                "category": "cafe",
                "target_amount": Decimal("8000000000"),   # 8 میلیارد تومان
                "min_investment": Decimal("3000000"),     # 3 میلیون تومان
                "expected_return": 22.0,
                "duration_months": 18,
                "location": "اصفهان، چهارباغ",
                "status": "active",
                "is_featured": True,
                "priority": 2,
                "risk_level": "low",
                "slug": "cafe-exon",
                "features": [
                    "فضای کار و مطالعه",
                    "Wi-Fi رایگان پرسرعت",
                    "منوی قهوه تخصصی",
                    "محیط دوستدار طبیعت"
                ],
                "financial_details": {
                    "renovation_cost": "3000000000",
                    "equipment_cost": "3000000000",
                    "initial_inventory": "1000000000",
                    "working_capital": "1000000000"
                }
            },
            {
                "title": "اکسون طلا",
                "short_description": "سرمایه‌گذاری در بازار طلا و جواهر",
                "description": "پروژه سرمایه‌گذاری در بازار طلا و جواهرات با تضمین بازدهی مطمئن",
                "category": "gold",
                "target_amount": Decimal("25000000000"),  # 25 میلیارد تومان
                "min_investment": Decimal("10000000"),    # 10 میلیون تومان
                "expected_return": 15.5,
                "duration_months": 12,
                "location": "تهران، بازار طلا",
                "status": "active",
                "is_featured": True,
                "priority": 3,
                "risk_level": "low",
                "slug": "exon-gold",
                "features": [
                    "خرید و فروش طلای آب شده",
                    "نگهداری در خزانه‌های امن",
                    "بیمه کامل سرمایه",
                    "قابلیت تحویل فیزیکی"
                ],
                "financial_details": {
                    "gold_purchase": "20000000000",
                    "storage_cost": "2000000000",
                    "insurance_cost": "1000000000",
                    "management_fee": "2000000000"
                }
            },
            {
                "title": "رستوران اکسون پلاس دبی",
                "short_description": "رستوران لوکس در قلب دبی",
                "description": "احداث رستوران اکسون پلاس در دبی با استانداردهای بین‌المللی و بازدهی عالی",
                "category": "restaurant_dubai",
                "target_amount": Decimal("50000000000"),  # 50 میلیارد تومان
                "min_investment": Decimal("20000000"),    # 20 میلیون تومان
                "expected_return": 25.0,
                "duration_months": 36,
                "location": "دبی، منطقه مارینا",
                "status": "funding",
                "is_featured": True,
                "priority": 4,
                "risk_level": "medium",
                "slug": "restaurant-exon-plus-dubai",
                "features": [
                    "موقعیت استراتژیک در مارینا",
                    "مجوزهای کامل امارات",
                    "تیم مدیریت بین‌المللی",
                    "منوی فیوژن ایرانی-عربی"
                ],
                "financial_details": {
                    "land_lease": "15000000000",
                    "construction": "20000000000",
                    "equipment": "10000000000",
                    "working_capital": "5000000000"
                }
            }
        ]
        
        for project_data in sample_projects:
            existing_project = db.query(Project).filter(
                Project.slug == project_data["slug"]
            ).first()
            
            if not existing_project:
                # Set dates
                from datetime import date, timedelta
                project_data["start_date"] = date.today()
                project_data["end_date"] = date.today() + timedelta(days=project_data["duration_months"] * 30)
                project_data["funding_deadline"] = date.today() + timedelta(days=90)
                
                project = Project(**project_data)
                db.add(project)
        
        logger.info("✅ Sample projects created")
        
        # 4. Create default content management entries
        default_content = [
            {
                "content_type": "hero_section",
                "content_key": "hero_main_title",
                "title": "سرمایه‌گذاری هوشمند، آینده درخشان",
                "content": "در پروژه‌های سودآور گروه اکسون سرمایه‌گذاری کنید و از بازدهی مطمئن بهره‌مند شوید",
                "is_active": True,
                "display_order": 1
            },
            {
                "content_type": "features",
                "content_key": "feature_security",
                "title": "امنیت بالا",
                "content": "سیستم‌های امنیتی پیشرفته و رمزنگاری برای محافظت از سرمایه شما",
                "icon": "shield-check",
                "is_active": True,
                "display_order": 1
            },
            {
                "content_type": "features",
                "content_key": "feature_return",
                "title": "بازدهی مطمئن",
                "content": "سود تضمینی با نرخ‌های رقابتی و بازدهی بالا در پروژه‌های منتخب",
                "icon": "trending-up",
                "is_active": True,
                "display_order": 2
            },
            {
                "content_type": "about",
                "content_key": "about_company",
                "title": "درباره ExonVC",
                "content": "گروه اکسون در سال 1390 با هدف ایجاد بستری امن و سودآور برای سرمایه‌گذاری تأسیس شد.",
                "rich_content": "<p>ما با درنظرگیری نیازهای بازار ایران و با تکیه بر تجربه بیش از یک دهه در زمینه کسب‌وکار، پلتفرمی را طراحی کرده‌ایم که بتواند پاسخگوی نیازهای متنوع سرمایه‌گذاران باشد.</p>",
                "is_active": True
            }
        ]
        
        for content_data in default_content:
            existing_content = db.query(ContentManagement).filter(
                ContentManagement.content_key == content_data["content_key"]
            ).first()
            
            if not existing_content:
                content = ContentManagement(**content_data)
                db.add(content)
        
        logger.info("✅ Default content created")
        
        # Commit all changes
        db.commit()
        logger.info("✅ All seed data committed successfully")
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creating seed data: {e}")
        raise
    finally:
        db.close()

def reset_database():
    """Reset database - WARNING: This will delete all data!"""
    try:
        from models import Base
        
        logger.warning("🚨 RESETTING DATABASE - ALL DATA WILL BE LOST!")
        Base.metadata.drop_all(bind=engine)
        logger.info("✅ All tables dropped")
        
        init_db()
        logger.info("✅ Database reset completed")
        
    except Exception as e:
        logger.error(f"❌ Database reset failed: {e}")
        raise

def get_database_info():
    """Get database information and statistics"""
    db = SessionLocal()
    try:
        from models import (
            User, Project, Investment, PaymentPlan, PaymentHistory,
            UserSession, PageView, UserAction, ContentManagement,
            ProjectAnalytics, FinancialReport, Notification, SystemLog,
            ChatLog, AdminUser, SiteSettings
        )
        
        info = {
            "database_url": DATABASE_URL,
            "engine_info": str(engine.url),
            "tables": {},
            "total_records": 0
        }
        
        # Count records in each table
        tables = [
            ("users", User),
            ("projects", Project),
            ("investments", Investment),
            ("payment_plans", PaymentPlan),
            ("payment_history", PaymentHistory),
            ("user_sessions", UserSession),
            ("page_views", PageView),
            ("user_actions", UserAction),
            ("content_management", ContentManagement),
            ("project_analytics", ProjectAnalytics),
            ("financial_reports", FinancialReport),
            ("notifications", Notification),
            ("system_logs", SystemLog),
            ("chat_logs", ChatLog),
            ("admin_users", AdminUser),
            ("site_settings", SiteSettings)
        ]
        
        for table_name, model in tables:
            try:
                count = db.query(model).count()
                info["tables"][table_name] = count
                info["total_records"] += count
            except Exception as e:
                info["tables"][table_name] = f"Error: {e}"
        
        return info
        
    except Exception as e:
        logger.error(f"Error getting database info: {e}")
        return {"error": str(e)}
    finally:
        db.close()

def backup_database(backup_path: str = None):
    """Create database backup"""
    try:
        if not backup_path:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = f"./data/backup_exonvc_{timestamp}.db"
        
        if DATABASE_URL.startswith("sqlite"):
            import shutil
            db_path = DATABASE_URL.replace("sqlite:///", "")
            shutil.copy2(db_path, backup_path)
            logger.info(f"✅ Database backup created: {backup_path}")
            return backup_path
        else:
            logger.warning("⚠️ Backup feature currently only supports SQLite")
            return None
            
    except Exception as e:
        logger.error(f"❌ Database backup failed: {e}")
        raise

# Health check function
def check_database_health():
    """Check database connection and health"""
    try:
        db = SessionLocal()
        
        # Test basic connectivity
        db.execute("SELECT 1")
        
        # Test table existence
        from models import User
        user_count = db.query(User).count()
        
        db.close()
        
        return {
            "status": "healthy",
            "connection": "ok",
            "user_count": user_count,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Migration utilities (for future use)
def create_migration(name: str):
    """Create a new migration file"""
    try:
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"migration_{timestamp}_{name}.py"
        
        migration_template = f'''"""
Migration: {name}
Created: {datetime.now().isoformat()}
"""

def upgrade():
    """Upgrade migration"""
    pass

def downgrade():
    """Downgrade migration"""
    pass
'''
        
        migrations_dir = "./migrations"
        os.makedirs(migrations_dir, exist_ok=True)
        
        filepath = os.path.join(migrations_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(migration_template)
        
        logger.info(f"✅ Migration created: {filepath}")
        return filepath
        
    except Exception as e:
        logger.error(f"❌ Migration creation failed: {e}")
        raise

if __name__ == "__main__":
    """Run database operations from command line"""
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "init":
            init_db()
        elif command == "reset":
            confirm = input("⚠️ This will delete ALL data! Type 'YES' to confirm: ")
            if confirm == "YES":
                reset_database()
            else:
                print("❌ Operation cancelled")
        elif command == "info":
            info = get_database_info()
            print("📊 Database Information:")
            for key, value in info.items():
                print(f"  {key}: {value}")
        elif command == "backup":
            backup_path = backup_database()
            print(f"✅ Backup created: {backup_path}")
        elif command == "health":
            health = check_database_health()
            print(f"🏥 Database Health: {health}")
        else:
            print("Available commands: init, reset, info, backup, health")
    else:
        print("Usage: python database.py [command]")
        print("Commands: init, reset, info, backup, health")

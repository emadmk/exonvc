# main.py - Final Complete Version - ExonVC Investment Platform
import os
import json
import hashlib
import time
import httpx
import random
from datetime import datetime, timedelta, date
from typing import Optional, List, Dict, Any
from decimal import Decimal
from auth import send_otp_sms
from fastapi import FastAPI, WebSocket, HTTPException, Depends, Body, Header, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc
from pydantic import BaseModel, EmailStr
import jwt

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Ensure data directory exists
os.makedirs("/app/data", exist_ok=True)

# Import database and models
from database import get_db, init_db, check_database_health, get_database_info
from models import (
    User, Project, Investment, PaymentPlan, PaymentHistory,
    UserSession, PageView, UserAction, ContentManagement,
    ProjectAnalytics, FinancialReport, Notification, SystemLog,
    ChatLog, AdminUser, SiteSettings
)

# ==================== ENVIRONMENT CONFIGURATION ====================

# App Configuration
APP_ENV = os.getenv("APP_ENV", os.getenv("ENVIRONMENT", "development"))
DEBUG = os.getenv("DEBUG", "true" if APP_ENV == "development" else "false").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Host & Port
BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")  
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8050"))  # از docker-compose

# Security Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "exonvc-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
KAVENEGAR_API_KEY = os.getenv("KAVENEGAR_API_KEY", "")

# Database Configuration (از docker-compose)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://exonvc_user:exonvc_password@db:5432/exonvc_invest")

# CORS Configuration
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "https://invest.exonvc.ir,http://localhost:3050")
ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins_str.split(",")]

# File Upload Configuration  
UPLOAD_PATH = os.getenv("UPLOAD_PATH", "/app/data/uploads")
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB
ALLOWED_EXTENSIONS = os.getenv("ALLOWED_EXTENSIONS", "jpg,jpeg,png,gif,pdf,doc,docx").split(",")

# Admin Configuration
DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@exonvc.ir")

# Development Features
AUTO_MIGRATE = os.getenv("AUTO_MIGRATE", "true" if APP_ENV == "development" else "false").lower() == "true"
SEED_SAMPLE_DATA = os.getenv("SEED_SAMPLE_DATA", "true" if APP_ENV == "development" else "false").lower() == "true"

# Print configuration summary
print("🔧 ExonVC Configuration:")
print(f"   Environment: {APP_ENV}")
print(f"   Debug Mode: {DEBUG}")
print(f"   Host:Port: {BACKEND_HOST}:{BACKEND_PORT}")
print(f"   Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'SQLite'}")
print(f"   OpenAI API: {'✅ Configured' if OPENAI_API_KEY else '❌ Missing'}")
print(f"   Kavenegar API: {'✅ Configured' if KAVENEGAR_API_KEY else '❌ Missing'}")
print(f"   CORS Origins: {ALLOWED_ORIGINS}")

# Ensure upload directory exists
os.makedirs(UPLOAD_PATH, exist_ok=True)

# ==================== FASTAPI INITIALIZATION ====================

# Initialize FastAPI
app = FastAPI(
    title="ExonVC Investment Platform",
    description="Advanced Investment Platform with Admin Panel & Analytics",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# WebSocket connections and chat memories
active_connections = {}
chat_memories = {}

# ==================== PYDANTIC MODELS ====================

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    national_code: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None

class InvestmentCreate(BaseModel):
    project_id: int
    amount: float
    payment_type: str = "lump_sum"  # lump_sum, installment
    installment_count: Optional[int] = None
    payment_frequency: Optional[str] = "monthly"

class ProjectCreate(BaseModel):
    title: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    category: str
    target_amount: float
    min_investment: float = 1000000
    max_investment: Optional[float] = None
    expected_return: Optional[float] = None
    duration_months: Optional[int] = None
    location: Optional[str] = None
    risk_level: str = "medium"
    features: Optional[List[str]] = []
    
class ContentUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    rich_content: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class NotificationCreate(BaseModel):
    user_id: Optional[int] = None
    type: str
    title: str
    message: str
    priority: str = "normal"
    channels: List[str] = ["in_app"]

# ==================== UTILITY FUNCTIONS ====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def verify_admin_token(token: str, db: Session):
    payload = verify_token(token)
    admin_id = payload.get("admin_id")
    if not admin_id:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not admin or not admin.is_active:
        raise HTTPException(status_code=403, detail="Admin access denied")
    
    return admin


def log_user_action(db: Session, user_id: Optional[int], session_id: Optional[str], 
                   action_type: str, page_url: str, additional_data: dict = None):
    """Log user action for analytics"""
    try:
        action = UserAction(
            user_id=user_id,
            session_id=session_id,
            action_type=action_type,
            page_url=page_url,
            additional_data=additional_data or {}
        )
        db.add(action)
        db.commit()
    except Exception as e:
        print(f"❌ Failed to log action: {e}")

def load_system_prompt():
    """Load AI system prompt"""
    try:
        with open("system_prompt.txt", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return """شما ایجنت فارسی سرمایه‌گذاری ExonVC هستید. شما در مورد پروژه‌های سرمایه‌گذاری اکسون صحبت می‌کنید:
1. رستوران اکسون پلاس - 15 میلیارد تومان - 18.5% بازدهی
2. کافه اکسون - 8 میلیارد تومان - 22% بازدهی  
3. اکسون طلا - 25 میلیارد تومان - 15.5% بازدهی
4. رستوران اکسون پلاس دبی - 50 میلیارد تومان - 25% بازدهی

همیشه به زبان فارسی و با احترام پاسخ دهید."""

SYSTEM_PROMPT = load_system_prompt()

# ==================== STARTUP EVENTS ====================

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    print("🚀 Starting ExonVC Investment Platform v2.0...")
    
    try:
        # Initialize database
        init_db()
        print("✅ Database initialized")
        
        # Check configuration
        if not OPENAI_API_KEY:
            print("⚠️  Warning: OPENAI_API_KEY not set - Chat functionality disabled")
        if not KAVENEGAR_API_KEY:
            print("⚠️  Warning: KAVENEGAR_API_KEY not set - SMS functionality disabled")
        
        print("✅ ExonVC Platform started successfully!")
        
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        raise

# ==================== HEALTH & SYSTEM ENDPOINTS ====================

@app.get("/api/health")
async def health_check():
    """System health check"""
    db_health = check_database_health()
    
    return {
        "status": "healthy" if db_health["status"] == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "environment": APP_ENV,
        "database": db_health,
        "services": {
            "openai": "configured" if OPENAI_API_KEY else "not_configured",
            "sms": "configured" if KAVENEGAR_API_KEY else "not_configured"
        }
    }

@app.get("/api/system/info")
async def system_info(db: Session = Depends(get_db)):
    """Get system information - Admin only"""
    try:
        db_info = get_database_info()
        
        return {
            "database": db_info,
            "environment": {
                "app_env": APP_ENV,
                "debug": DEBUG,
                "openai_configured": bool(OPENAI_API_KEY),
                "sms_configured": bool(KAVENEGAR_API_KEY),
                "jwt_configured": bool(JWT_SECRET_KEY)
            },
            "stats": {
                "active_websockets": len(active_connections),
                "chat_sessions": len(chat_memories)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PUBLIC AUTHENTICATION ====================

@app.post("/api/auth/send-otp")
async def send_otp(phone: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """Send OTP to phone number"""
    try:
        # Validate phone number
        if not phone or len(phone) < 10:
            raise HTTPException(status_code=400, detail="شماره تلفن نامعتبر است")
        
        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Check if user exists
        user = db.query(User).filter(User.phone == phone).first()
        if not user:
            user = User(
                phone=phone,
                otp_code=otp_code,
                otp_expires=datetime.utcnow() + timedelta(minutes=5)
            )
            db.add(user)
        else:
            user.otp_code = otp_code
            user.otp_expires = datetime.utcnow() + timedelta(minutes=5)
        
        db.commit()
        
        # Send SMS
        sms_sent = await send_otp_sms(phone, otp_code)
        
        return {
            "message": "کد تایید ارسال شد" if sms_sent else "کد تایید تولید شد",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در ارسال کد: {str(e)}")

@app.post("/api/auth/verify-otp")
async def verify_otp(phone: str = Body(...), otp: str = Body(...), db: Session = Depends(get_db)):
    """Verify OTP and return JWT token"""
    try:
        user = db.query(User).filter(User.phone == phone).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
        
        if user.otp_code != otp:
            raise HTTPException(status_code=400, detail="کد تایید اشتباه است")
        
        if user.otp_expires < datetime.utcnow():
            raise HTTPException(status_code=400, detail="کد تایید منقضی شده")
        
        # Generate JWT token
        token = create_access_token({"user_id": user.id, "phone": user.phone})
        
        # Clear OTP and update user
        user.otp_code = None
        user.otp_expires = None
        user.is_verified = True
        user.last_login = datetime.utcnow()
        db.commit()
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در تایید: {str(e)}")

# ==================== ADMIN AUTHENTICATION ====================

@app.post("/api/admin/login")
async def admin_login(
    username: str = Body(...),
    password: str = Body(...),
    db: Session = Depends(get_db)
):
    """Admin login"""
    try:
        admin = db.query(AdminUser).filter(AdminUser.username == username).first()
        
        if not admin or not admin.is_active:
            raise HTTPException(status_code=401, detail="نام کاربری یا رمز عبور اشتباه است")
        
        # Verify password (in production, use proper password hashing)
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if admin.password_hash != password_hash:
            # Update failed login attempts
            admin.failed_login_attempts += 1
            admin.last_failed_login = datetime.utcnow()
            db.commit()
            raise HTTPException(status_code=401, detail="نام کاربری یا رمز عبور اشتباه است")
        
        # Generate admin token
        token = create_access_token({
            "admin_id": admin.id,
            "username": admin.username,
            "role": admin.role
        })
        
        # Update login stats
        admin.last_login = datetime.utcnow()
        admin.login_count += 1
        admin.failed_login_attempts = 0
        db.commit()
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "admin": admin.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PUBLIC PROJECT ENDPOINTS ====================

@app.get("/api/projects")
async def get_projects(
    category: Optional[str] = None,
    status: str = "active",
    featured: Optional[bool] = None,
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get public projects list"""
    try:
        query = db.query(Project).filter(Project.is_active == True)
        
        if status:
            query = query.filter(Project.status == status)
        if category:
            query = query.filter(Project.category == category)
        if featured is not None:
            query = query.filter(Project.is_featured == featured)
        
        # Order by priority and creation date
        query = query.order_by(desc(Project.priority), desc(Project.created_at))
        
        total = query.count()
        projects = query.offset(offset).limit(limit).all()
        
        return {
            "projects": [project.to_dict() for project in projects],
            "total": total,
            "offset": offset,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}")
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get single project details"""
    try:
        project = db.query(Project).filter(
            Project.id == project_id,
            Project.is_active == True
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="پروژه پیدا نشد")
        
        # Log page view (if we have session tracking)
        # This would be enhanced with actual session tracking
        
        return project.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/analytics")
async def get_project_analytics(
    project_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get project analytics - public basic stats"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="پروژه پیدا نشد")
        
        # Get basic analytics for the last N days
        start_date = date.today() - timedelta(days=days)
        
        analytics = db.query(ProjectAnalytics).filter(
            ProjectAnalytics.project_id == project_id,
            ProjectAnalytics.date >= start_date
        ).all()
        
        # Calculate totals
        total_views = sum(a.total_views for a in analytics)
        total_unique_visitors = sum(a.unique_visitors for a in analytics)
        total_investments = db.query(Investment).filter(
            Investment.project_id == project_id,
            Investment.status.in_(["confirmed", "active"])
        ).count()
        
        return {
            "project_id": project_id,
            "period_days": days,
            "total_views": total_views,
            "unique_visitors": total_unique_visitors,
            "total_investments": total_investments,
            "daily_stats": [a.to_dict() for a in analytics]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== USER PROTECTED ENDPOINTS ====================

@app.get("/api/user/profile")
async def get_user_profile(token: str = Depends(security), db: Session = Depends(get_db)):
    """Get user profile"""
    try:
        payload = verify_token(token.credentials)
        user = db.query(User).filter(User.id == payload["user_id"]).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
        
        return user.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/user/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    token: str = Depends(security),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    try:
        payload = verify_token(token.credentials)
        user = db.query(User).filter(User.id == payload["user_id"]).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
        
        # Update only provided fields
        update_data = profile_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        
        return {
            "message": "پروفایل با موفقیت به‌روزرسانی شد",
            "success": True,
            "user": user.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در به‌روزرسانی: {str(e)}")

@app.post("/api/investments")
async def create_investment(
    investment_data: InvestmentCreate,
    token: str = Depends(security),
    db: Session = Depends(get_db)
):
    """Create new investment"""
    try:
        payload = verify_token(token.credentials)
        user_id = payload["user_id"]
        
        # Check if project exists and is active
        project = db.query(Project).filter(
            Project.id == investment_data.project_id,
            Project.is_active == True,
            Project.status == "active"
        ).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="پروژه پیدا نشد یا غیرفعال است")
        
        # Validate investment amount
        if investment_data.amount < project.min_investment:
            raise HTTPException(
                status_code=400, 
                detail=f"حداقل مبلغ سرمایه‌گذاری {project.min_investment:,} تومان است"
            )
        
        if project.max_investment and investment_data.amount > project.max_investment:
            raise HTTPException(
                status_code=400,
                detail=f"حداکثر مبلغ سرمایه‌گذاری {project.max_investment:,} تومان است"
            )
        
        # Create investment record
        investment = Investment(
            user_id=user_id,
            project_id=investment_data.project_id,
            amount=Decimal(str(investment_data.amount)),
            payment_type=investment_data.payment_type,
            status="pending",
            expected_return=Decimal(str(investment_data.amount * (project.expected_return or 0) / 100))
        )
        
        db.add(investment)
        db.flush()  # To get the investment ID
        
        # Create payment plan if installment
        if investment_data.payment_type == "installment" and investment_data.installment_count:
            installment_amount = Decimal(str(investment_data.amount)) / investment_data.installment_count
            
            payment_plan = PaymentPlan(
                investment_id=investment.id,
                user_id=user_id,
                total_amount=Decimal(str(investment_data.amount)),
                installment_count=investment_data.installment_count,
                installment_amount=installment_amount,
                payment_frequency=investment_data.payment_frequency or "monthly",
                start_date=date.today(),
                end_date=date.today() + timedelta(days=30 * investment_data.installment_count),
                remaining_balance=Decimal(str(investment_data.amount))
            )
            
            db.add(payment_plan)
        
        db.commit()
        
        return {
            "message": "درخواست سرمایه‌گذاری با موفقیت ثبت شد",
            "success": True,
            "investment_id": investment.id,
            "investment": investment.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"خطا در ثبت سرمایه‌گذاری: {str(e)}")

@app.get("/api/user/investments")
async def get_user_investments(
    status: Optional[str] = None,
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    token: str = Depends(security),
    db: Session = Depends(get_db)
):
    """Get user investments"""
    try:
        payload = verify_token(token.credentials)
        user_id = payload["user_id"]
        
        query = db.query(Investment).filter(Investment.user_id == user_id)
        
        if status:
            query = query.filter(Investment.status == status)
        
        query = query.order_by(desc(Investment.created_at))
        
        total = query.count()
        investments = query.offset(offset).limit(limit).all()
        
        return {
            "investments": [inv.to_dict() for inv in investments],
            "total": total,
            "offset": offset,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== CONTENT MANAGEMENT ====================

@app.get("/api/content")
async def get_content(
    content_type: Optional[str] = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """Get public content"""
    try:
        query = db.query(ContentManagement).filter(ContentManagement.is_active == is_active)
        
        if content_type:
            query = query.filter(ContentManagement.content_type == content_type)
        
        query = query.order_by(ContentManagement.display_order, ContentManagement.created_at)
        content = query.all()
        
        return {
            "content": [c.to_dict() for c in content]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings/public")
async def get_public_settings(db: Session = Depends(get_db)):
    """Get public site settings"""
    try:
        settings = db.query(SiteSettings).filter(SiteSettings.is_public == True).all()
        
        result = {}
        for setting in settings:
            result[setting.key] = setting.value
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== WEBSOCKET CHAT ====================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for chat"""
    await websocket.accept()
    
    client_id = str(id(websocket))
    active_connections[client_id] = websocket
    chat_memories[client_id] = []
    
    try:
        await websocket.send_text("🤖 سلام! من ایجنت سرمایه‌گذاری ExonVC هستم. چگونه می‌تونم کمکتون کنم؟")
        
        while True:
            data = await websocket.receive_text()
            user_message = data.strip()
            
            if not user_message:
                continue
            
            # Add user message to memory
            chat_memories[client_id].append({"role": "user", "content": user_message})
            
            # Save to database
            chat_log = ChatLog(
                user_phone="anonymous",
                session_id=client_id,
                message=user_message,
                message_type="user"
            )
            
            try:
                if OPENAI_API_KEY:
                    # Prepare messages for OpenAI
                    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
                    messages.extend(chat_memories[client_id][-10:])
                    
                    async with httpx.AsyncClient(timeout=60) as client:
                        response = await client.post(
                            "https://api.openai.com/v1/chat/completions",
                            headers={
                                "Authorization": f"Bearer {OPENAI_API_KEY}",
                                "Content-Type": "application/json"
                            },
                            json={
                                "model": "gpt-4",
                                "messages": messages,
                                "max_tokens": 1000,
                                "temperature": 0.7
                            }
                        )
                        
                        if response.status_code == 200:
                            result = response.json()
                            ai_response = result["choices"][0]["message"]["content"]
                        else:
                            ai_response = "⚠️ در حال حاضر امکان پردازش پیام وجود ندارد. لطفاً بعداً تلاش کنید."
                else:
                    ai_response = "چت هوشمند در حال حاضر غیرفعال است. برای اطلاعات بیشتر با پشتیبانی تماس بگیرید."
                
                # Add AI response to memory
                chat_memories[client_id].append({"role": "assistant", "content": ai_response})
                
                # Send response
                await websocket.send_text(ai_response)
                
                # Save complete conversation
                chat_log.response = ai_response
                chat_log.message_type = "complete"
                db.add(chat_log)
                db.commit()
                
            except Exception as e:
                error_msg = f"❌ خطا در پردازش: {str(e)}"
                await websocket.send_text(error_msg)
                print(f"Chat error: {e}")
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if client_id in active_connections:
            del active_connections[client_id]
        if client_id in chat_memories:
            del chat_memories[client_id]

# Include admin router
from admin import router as admin_router
app.include_router(admin_router)

# ==================== MAIN ENTRY POINT ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=BACKEND_HOST,
        port=BACKEND_PORT,
        reload=DEBUG,
        log_level=LOG_LEVEL.lower()
    )

# admin.py - Admin Panel API Routes
from fastapi import APIRouter, Depends, HTTPException, Body, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_, desc
from typing import Optional, List
import json
from datetime import datetime, timedelta

from database import get_db
from models import (
    User, Project, Investment, ChatLog, AdminUser, SiteSettings
)
from auth import verify_admin_token, hash_password, create_admin_token, verify_password

router = APIRouter()

# Admin Authentication
@router.post("/login")
async def admin_login(
    username: str = Body(...),
    password: str = Body(...),
    db: Session = Depends(get_db)
):
    """Admin login"""
    admin = db.query(AdminUser).filter(
        AdminUser.username == username,
        AdminUser.is_active == True
    ).first()
    
    if not admin or not verify_password(password, admin.password_hash):
        raise HTTPException(status_code=401, detail="نام کاربری یا رمز عبور اشتباه است")
    
    # Update last login
    admin.last_login = datetime.utcnow()
    db.commit()
    
    # Create token
    token = create_admin_token({
        "admin_id": admin.id,
        "username": admin.username,
        "role": admin.role
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": admin.to_dict()
    }

# Dashboard Stats
@router.get("/stats")
async def get_dashboard_stats(
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    
    # Basic counts
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_projects = db.query(Project).count()
    active_projects = db.query(Project).filter(Project.is_active == True).count()
    total_investments = db.query(Investment).count()
    pending_investments = db.query(Investment).filter(Investment.status == "pending").count()
    
    # Financial stats
    total_invested = db.query(func.sum(Investment.amount)).filter(
        Investment.status.in_(["confirmed", "completed"])
    ).scalar() or 0
    
    total_target = db.query(func.sum(Project.target_amount)).filter(
        Project.is_active == True
    ).scalar() or 0
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_month = db.query(User).filter(User.created_at >= thirty_days_ago).count()
    new_investments_month = db.query(Investment).filter(Investment.created_at >= thirty_days_ago).count()
    
    # Chat stats
    total_chats = db.query(ChatLog).filter(ChatLog.message_type == "complete").count()
    chats_today = db.query(ChatLog).filter(
        ChatLog.created_at >= datetime.utcnow().date(),
        ChatLog.message_type == "complete"
    ).count()
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "new_this_month": new_users_month
        },
        "projects": {
            "total": total_projects,
            "active": active_projects
        },
        "investments": {
            "total": total_investments,
            "pending": pending_investments,
            "new_this_month": new_investments_month,
            "total_amount": total_invested,
            "target_amount": total_target
        },
        "chats": {
            "total": total_chats,
            "today": chats_today
        }
    }

# User Management
@router.get("/users")
async def get_users(
    skip: int = Query(0),
    limit: int = Query(50),
    search: Optional[str] = Query(None),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get users with pagination and search"""
    query = db.query(User)
    
    if search:
        query = query.filter(
            or_(
                User.phone.contains(search),
                User.full_name.contains(search),
                User.email.contains(search)
            )
        )
    
    total = query.count()
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    
    return {
        "users": [user.to_dict() for user in users],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: int,
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get detailed user information"""
    user = db.query(User).options(joinedload(User.investments)).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
    
    user_data = user.to_dict()
    user_data["investments"] = [inv.to_dict() for inv in user.investments]
    
    return user_data

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    is_active: bool = Body(...),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Update user active status"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
    
    user.is_active = is_active
    db.commit()
    
    return {"message": "وضعیت کاربر به‌روزرسانی شد"}

# Project Management
@router.get("/projects")
async def get_admin_projects(
    skip: int = Query(0),
    limit: int = Query(20),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get projects for admin panel"""
    query = db.query(Project)
    
    if search:
        query = query.filter(
            or_(
                Project.title.contains(search),
                Project.description.contains(search)
            )
        )
    
    if category:
        query = query.filter(Project.category == category)
    
    total = query.count()
    projects = query.order_by(desc(Project.created_at)).offset(skip).limit(limit).all()
    
    return {
        "projects": [project.to_dict() for project in projects],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.post("/projects")
async def create_project(
    project_data: dict = Body(...),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Create new project"""
    try:
        # Generate slug from title
        import re
        slug = re.sub(r'[^\w\s-]', '', project_data['title'].lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        project_data['slug'] = slug
        
        project = Project(**project_data)
        db.add(project)
        db.commit()
        db.refresh(project)
        
        return project.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"خطا در ایجاد پروژه: {str(e)}")

@router.put("/projects/{project_id}")
async def update_project(
    project_id: int,
    project_data: dict = Body(...),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Update project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="پروژه پیدا نشد")
    
    try:
        for key, value in project_data.items():
            if hasattr(project, key):
                setattr(project, key, value)
        
        project.updated_at = datetime.utcnow()
        db.commit()
        
        return project.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"خطا در به‌روزرسانی پروژه: {str(e)}")

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: int,
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Delete project (soft delete)"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="پروژه پیدا نشد")
    
    project.is_active = False
    db.commit()
    
    return {"message": "پروژه حذف شد"}

# Investment Management
@router.get("/investments")
async def get_investments(
    skip: int = Query(0),
    limit: int = Query(50),
    status: Optional[str] = Query(None),
    project_id: Optional[int] = Query(None),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get investments with filters"""
    query = db.query(Investment).options(
        joinedload(Investment.user),
        joinedload(Investment.project)
    )
    
    if status:
        query = query.filter(Investment.status == status)
    
    if project_id:
        query = query.filter(Investment.project_id == project_id)
    
    total = query.count()
    investments = query.order_by(desc(Investment.created_at)).offset(skip).limit(limit).all()
    
    return {
        "investments": [inv.to_dict() for inv in investments],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.put("/investments/{investment_id}/status")
async def update_investment_status(
    investment_id: int,
    status: str = Body(...),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Update investment status"""
    investment = db.query(Investment).filter(Investment.id == investment_id).first()
    if not investment:
        raise HTTPException(status_code=404, detail="سرمایه‌گذاری پیدا نشد")
    
    old_status = investment.status
    investment.status = status
    
    if status == "confirmed" and old_status != "confirmed":
        investment.confirmed_at = datetime.utcnow()
        
        # Update project raised amount
        project = db.query(Project).filter(Project.id == investment.project_id).first()
        if project:
            project.raised_amount = (project.raised_amount or 0) + investment.amount
    
    db.commit()
    
    return {"message": "وضعیت سرمایه‌گذاری به‌روزرسانی شد"}

# Chat Management and Search
@router.get("/chats")
async def get_chats(
    skip: int = Query(0),
    limit: int = Query(50),
    search: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get chat logs with advanced search"""
    query = db.query(ChatLog).filter(ChatLog.message_type == "complete")
    
    # Search in message or response content
    if search:
        query = query.filter(
            or_(
                ChatLog.message.contains(search),
                ChatLog.response.contains(search)
            )
        )
    
    # Filter by phone number
    if phone:
        query = query.filter(ChatLog.user_phone.contains(phone))
    
    # Date range filter
    if date_from:
        try:
            date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            query = query.filter(ChatLog.created_at >= date_from_obj)
        except:
            pass
    
    if date_to:
        try:
            date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            query = query.filter(ChatLog.created_at <= date_to_obj)
        except:
            pass
    
    total = query.count()
    chats = query.order_by(desc(ChatLog.created_at)).offset(skip).limit(limit).all()
    
    return {
        "chats": [chat.to_dict() for chat in chats],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/chats/categories")
async def get_chat_categories(
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get chat categories for filtering"""
    
    # Simple keyword-based categorization
    categories = {
        "سرمایه‌گذاری": 0,
        "پروژه‌ها": 0,
        "سود": 0,
        "ریسک": 0,
        "مدت زمان": 0,
        "حداقل سرمایه": 0,
        "سایر": 0
    }
    
    # Count messages by category
    chats = db.query(ChatLog).filter(ChatLog.message_type == "complete").all()
    
    for chat in chats:
        message = (chat.message or "").lower()
        categorized = False
        
        if any(word in message for word in ["سرمایه", "پول", "تومان"]):
            categories["سرمایه‌گذاری"] += 1
            categorized = True
        elif any(word in message for word in ["پروژه", "رستوران", "کافه", "طلا"]):
            categories["پروژه‌ها"] += 1
            categorized = True
        elif any(word in message for word in ["سود", "بازده", "درآمد"]):
            categories["سود"] += 1
            categorized = True
        elif any(word in message for word in ["ریسک", "خطر", "ضرر"]):
            categories["ریسک"] += 1
            categorized = True
        elif any(word in message for word in ["زمان", "مدت", "ماه", "سال"]):
            categories["مدت زمان"] += 1
            categorized = True
        elif any(word in message for word in ["حداقل", "کمترین", "میلیون"]):
            categories["حداقل سرمایه"] += 1
            categorized = True
        
        if not categorized:
            categories["سایر"] += 1
    
    return categories

# Site Settings Management
@router.get("/settings")
async def get_settings(
    category: Optional[str] = Query(None),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get site settings"""
    query = db.query(SiteSettings)
    
    if category:
        query = query.filter(SiteSettings.category == category)
    
    settings = query.all()
    return [setting.to_dict() for setting in settings]

@router.put("/settings/{setting_id}")
async def update_setting(
    setting_id: int,
    value: str = Body(...),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Update site setting"""
    setting = db.query(SiteSettings).filter(SiteSettings.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="تنظیم پیدا نشد")
    
    setting.value = value
    setting.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "تنظیم به‌روزرسانی شد"}

@router.post("/settings")
async def create_setting(
    setting_data: dict = Body(...),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Create new setting"""
    setting = SiteSettings(**setting_data)
    db.add(setting)
    db.commit()
    db.refresh(setting)
    
    return setting.to_dict()

# Analytics
@router.get("/analytics/users")
async def get_user_analytics(
    days: int = Query(30),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get user registration analytics"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Daily user registrations
    daily_registrations = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(
        User.created_at >= start_date
    ).group_by(
        func.date(User.created_at)
    ).all()
    
    return {
        "daily_registrations": [
            {"date": str(reg.date), "count": reg.count}
            for reg in daily_registrations
        ]
    }

@router.get("/analytics/investments")
async def get_investment_analytics(
    days: int = Query(30),
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get investment analytics"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Daily investments
    daily_investments = db.query(
        func.date(Investment.created_at).label('date'),
        func.count(Investment.id).label('count'),
        func.sum(Investment.amount).label('total_amount')
    ).filter(
        Investment.created_at >= start_date
    ).group_by(
        func.date(Investment.created_at)
    ).all()
    
    # Investment by project
    project_investments = db.query(
        Project.title,
        func.count(Investment.id).label('count'),
        func.sum(Investment.amount).label('total_amount')
    ).join(Investment).group_by(Project.id, Project.title).all()
    
    return {
        "daily_investments": [
            {
                "date": str(inv.date),
                "count": inv.count,
                "total_amount": float(inv.total_amount or 0)
            }
            for inv in daily_investments
        ],
        "project_investments": [
            {
                "project": inv.title,
                "count": inv.count,
                "total_amount": float(inv.total_amount or 0)
            }
            for inv in project_investments
        ]
    }

# Export functionality
@router.get("/export/users")
async def export_users(
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Export users data"""
    users = db.query(User).all()
    return [user.to_dict() for user in users]

@router.get("/export/chats")
async def export_chats(
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Export chat logs"""
    chats = db.query(ChatLog).filter(ChatLog.message_type == "complete").all()
    return [chat.to_dict() for chat in chats]

@router.get("/export/investments")
async def export_investments(
    token: str = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Export investments data"""
    investments = db.query(Investment).options(
        joinedload(Investment.user),
        joinedload(Investment.project)
    ).all()
    
    return [inv.to_dict() for inv in investments]
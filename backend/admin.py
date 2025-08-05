# admin.py - Complete Admin Panel APIs - Final Version
from fastapi import APIRouter, Depends, HTTPException, Query, Body, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc, text
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta
from decimal import Decimal
from pydantic import BaseModel, EmailStr
import json
import csv
import io
import hashlib

from database import get_db
from models import (
    User, Project, Investment, PaymentPlan, PaymentHistory,
    UserSession, PageView, UserAction, ContentManagement,
    ProjectAnalytics, FinancialReport, Notification, SystemLog,
    ChatLog, AdminUser, SiteSettings
)

# Create router
router = APIRouter(prefix="/api/admin", tags=["Admin"])

# ==================== PYDANTIC MODELS ====================

class AdminStats(BaseModel):
    total_users: int
    active_users: int
    new_users_today: int
    total_projects: int
    active_projects: int
    total_investments: float
    total_returns: float
    pending_payments: float
    overdue_payments: float

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    credit_score: Optional[int] = None
    risk_level: Optional[str] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    target_amount: Optional[float] = None
    min_investment: Optional[float] = None
    max_investment: Optional[float] = None
    expected_return: Optional[float] = None
    duration_months: Optional[int] = None
    location: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    priority: Optional[int] = None
    risk_level: Optional[str] = None
    features: Optional[List[str]] = None

class ContentCreate(BaseModel):
    content_type: str
    content_key: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    rich_content: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    display_order: int = 0

class NotificationCreate(BaseModel):
    user_id: Optional[int] = None
    type: str
    category: str = "info"
    title: str
    message: str
    priority: str = "normal"
    channels: List[str] = ["in_app"]

class PaymentUpdate(BaseModel):
    status: str
    paid_amount: Optional[float] = None
    late_fee: Optional[float] = None
    notes: Optional[str] = None

# ==================== UTILITY FUNCTIONS ====================

def verify_admin_access(token_payload: dict, db: Session, required_permissions: List[str] = None):
    """Verify admin access and permissions"""
    admin_id = token_payload.get("admin_id")
    if not admin_id:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not admin or not admin.is_active:
        raise HTTPException(status_code=403, detail="Admin access denied")
    
    # Check permissions if specified
    if required_permissions and admin.role != "super_admin":
        admin_permissions = admin.permissions or []
        if not any(perm in admin_permissions for perm in required_permissions):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return admin

def log_admin_action(db: Session, admin_id: int, action: str, details: dict = None):
    """Log admin action for audit trail"""
    try:
        log = SystemLog(
            level="INFO",
            module="admin",
            action=action,
            admin_id=admin_id,
            request_data=details or {},
            timestamp=datetime.utcnow()
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Failed to log admin action: {e}")

# ==================== DASHBOARD & STATISTICS ====================

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    period: str = Query("30d", regex="^(1d|7d|30d|90d|1y)$"),
    db: Session = Depends(get_db)
):
    """Get main dashboard statistics"""
    try:
        # Calculate date range
        if period == "1d":
            start_date = date.today()
        elif period == "7d":
            start_date = date.today() - timedelta(days=7)
        elif period == "30d":
            start_date = date.today() - timedelta(days=30)
        elif period == "90d":
            start_date = date.today() - timedelta(days=90)
        else:  # 1y
            start_date = date.today() - timedelta(days=365)
        
        # Basic counts
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        new_users_today = db.query(User).filter(
            func.date(User.created_at) == date.today()
        ).count()
        
        total_projects = db.query(Project).count()
        active_projects = db.query(Project).filter(
            Project.is_active == True,
            Project.status == "active"
        ).count()
        
        # Financial statistics
        investments_query = db.query(Investment).filter(
            Investment.status.in_(["confirmed", "active", "completed"])
        )
        
        total_investments = investments_query.with_entities(
            func.sum(Investment.amount)
        ).scalar() or 0
        
        total_returns = investments_query.with_entities(
            func.sum(Investment.actual_return)
        ).scalar() or 0
        
        # Payment statistics
        pending_payments = db.query(PaymentHistory).filter(
            PaymentHistory.status == "pending"
        ).with_entities(func.sum(PaymentHistory.due_amount)).scalar() or 0
        
        overdue_payments = db.query(PaymentHistory).filter(
            PaymentHistory.status == "overdue"
        ).with_entities(func.sum(PaymentHistory.due_amount)).scalar() or 0
        
        # Recent activity (last 7 days)
        recent_investments = db.query(Investment).filter(
            Investment.created_at >= datetime.utcnow() - timedelta(days=7)
        ).count()
        
        recent_users = db.query(User).filter(
            User.created_at >= datetime.utcnow() - timedelta(days=7)
        ).count()
        
        # Online users (active in last hour)
        online_users = db.query(UserSession).filter(
            UserSession.start_time >= datetime.utcnow() - timedelta(hours=1),
            UserSession.end_time.is_(None)
        ).count()
        
        # Top performing projects
        top_projects = db.query(
            Project.id,
            Project.title,
            func.sum(Investment.amount).label("total_invested"),
            func.count(Investment.id).label("investor_count")
        ).join(Investment).filter(
            Investment.status.in_(["confirmed", "active"])
        ).group_by(Project.id, Project.title).order_by(
            desc("total_invested")
        ).limit(5).all()
        
        return {
            "period": period,
            "overview": {
                "total_users": total_users,
                "active_users": active_users,
                "new_users_today": new_users_today,
                "total_projects": total_projects,
                "active_projects": active_projects,
                "online_users": online_users
            },
            "financial": {
                "total_investments": float(total_investments),
                "total_returns": float(total_returns),
                "pending_payments": float(pending_payments),
                "overdue_payments": float(overdue_payments),
                "net_profit": float(total_returns - total_investments) if total_investments > 0 else 0
            },
            "recent_activity": {
                "new_investments": recent_investments,
                "new_users": recent_users
            },
            "top_projects": [
                {
                    "id": p.id,
                    "title": p.title,
                    "total_invested": float(p.total_invested),
                    "investor_count": p.investor_count
                }
                for p in top_projects
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/charts")
async def get_dashboard_charts(
    period: str = Query("30d"),
    db: Session = Depends(get_db)
):
    """Get chart data for dashboard"""
    try:
        # Calculate date range
        days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}.get(period, 30)
        start_date = date.today() - timedelta(days=days)
        
        # Daily investment amounts
        daily_investments = db.query(
            func.date(Investment.created_at).label("date"),
            func.sum(Investment.amount).label("amount"),
            func.count(Investment.id).label("count")
        ).filter(
            Investment.created_at >= start_date,
            Investment.status.in_(["confirmed", "active"])
        ).group_by(func.date(Investment.created_at)).all()
        
        # Daily user registrations
        daily_users = db.query(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("count")
        ).filter(
            User.created_at >= start_date
        ).group_by(func.date(User.created_at)).all()
        
        # Investment by category
        category_investments = db.query(
            Project.category,
            func.sum(Investment.amount).label("amount"),
            func.count(Investment.id).label("count")
        ).join(Investment).filter(
            Investment.status.in_(["confirmed", "active"])
        ).group_by(Project.category).all()
        
        # Device analytics
        device_stats = db.query(
            UserSession.device_type,
            func.count(UserSession.id).label("count")
        ).filter(
            UserSession.start_time >= start_date
        ).group_by(UserSession.device_type).all()
        
        return {
            "daily_investments": [
                {
                    "date": d.date.isoformat(),
                    "amount": float(d.amount),
                    "count": d.count
                }
                for d in daily_investments
            ],
            "daily_users": [
                {
                    "date": d.date.isoformat(),
                    "count": d.count
                }
                for d in daily_users
            ],
            "category_investments": [
                {
                    "category": c.category,
                    "amount": float(c.amount),
                    "count": c.count
                }
                for c in category_investments
            ],
            "device_stats": [
                {
                    "device": d.device_type or "unknown",
                    "count": d.count
                }
                for d in device_stats
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== USER MANAGEMENT ====================

@router.get("/users")
async def get_users(
    search: Optional[str] = None,
    status: Optional[str] = None,
    verified: Optional[bool] = None,
    risk_level: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(created_at|last_login|full_name|wallet_balance)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get users list with filtering and pagination"""
    try:
        query = db.query(User)
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    User.full_name.ilike(f"%{search}%"),
                    User.phone.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )
        
        if status == "active":
            query = query.filter(User.is_active == True)
        elif status == "inactive":
            query = query.filter(User.is_active == False)
        
        if verified is not None:
            query = query.filter(User.is_verified == verified)
        
        if risk_level:
            query = query.filter(User.risk_level == risk_level)
        
        # Apply sorting
        sort_column = getattr(User, sort_by)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        total = query.count()
        users = query.offset(offset).limit(limit).all()
        
        # Get additional stats for each user
        user_data = []
        for user in users:
            user_dict = user.to_dict()
            
            # Get investment stats
            investments = db.query(Investment).filter(Investment.user_id == user.id)
            user_dict["total_investments"] = float(
                investments.with_entities(func.sum(Investment.amount)).scalar() or 0
            )
            user_dict["active_investments"] = investments.filter(
                Investment.status.in_(["confirmed", "active"])
            ).count()
            
            # Get last activity
            last_session = db.query(UserSession).filter(
                UserSession.user_id == user.id
            ).order_by(desc(UserSession.start_time)).first()
            
            user_dict["last_activity"] = last_session.start_time.isoformat() if last_session else None
            
            user_data.append(user_dict)
        
        return {
            "users": user_data,
            "total": total,
            "offset": offset,
            "limit": limit,
            "filters": {
                "search": search,
                "status": status,
                "verified": verified,
                "risk_level": risk_level
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}")
async def get_user_details(user_id: int, db: Session = Depends(get_db)):
    """Get detailed user information"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
        
        # Get user investments
        investments = db.query(Investment).filter(Investment.user_id == user_id).all()
        
        # Get user sessions (last 30 days)
        sessions = db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.start_time >= datetime.utcnow() - timedelta(days=30)
        ).order_by(desc(UserSession.start_time)).limit(10).all()
        
        # Get payment history
        payment_history = db.query(PaymentHistory).join(PaymentPlan).filter(
            PaymentPlan.user_id == user_id
        ).order_by(desc(PaymentHistory.created_at)).limit(10).all()
        
        # Get chat history
        chat_history = db.query(ChatLog).filter(
            ChatLog.user_id == user_id
        ).order_by(desc(ChatLog.created_at)).limit(10).all()
        
        # Calculate stats
        total_invested = sum(float(inv.amount) for inv in investments)
        active_investments = [inv for inv in investments if inv.status in ["confirmed", "active"]]
        
        return {
            "user": user.to_dict(),
            "stats": {
                "total_investments": len(investments),
                "active_investments": len(active_investments),
                "total_invested": total_invested,
                "total_sessions": len(sessions),
                "avg_session_duration": sum(s.duration_seconds or 0 for s in sessions) / len(sessions) if sessions else 0
            },
            "investments": [inv.to_dict() for inv in investments],
            "recent_sessions": [session.to_dict() for session in sessions],
            "payment_history": [payment.to_dict() for payment in payment_history],
            "recent_chats": [chat.to_dict() for chat in chat_history]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):
    """Update user information"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
        
        # Update only provided fields
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        
        # Log admin action
        log_admin_action(db, 1, f"update_user_{user_id}", update_data)  # TODO: Get actual admin ID
        
        return {
            "message": "کاربر با موفقیت به‌روزرسانی شد",
            "user": user.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}/analytics")
async def get_user_analytics(
    user_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get user behavior analytics"""
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get page views
        page_views = db.query(PageView).filter(
            PageView.user_id == user_id,
            PageView.view_timestamp >= start_date
        ).all()
        
        # Get user actions
        actions = db.query(UserAction).filter(
            UserAction.user_id == user_id,
            UserAction.timestamp >= start_date
        ).all()
        
        # Analyze behavior patterns
        page_stats = {}
        action_stats = {}
        
        for pv in page_views:
            page = pv.page_url
            if page not in page_stats:
                page_stats[page] = {"views": 0, "total_time": 0}
            page_stats[page]["views"] += 1
            page_stats[page]["total_time"] += pv.time_spent_seconds or 0
        
        for action in actions:
            action_type = action.action_type
            action_stats[action_type] = action_stats.get(action_type, 0) + 1
        
        return {
            "user_id": user_id,
            "period_days": days,
            "page_analytics": [
                {
                    "page": page,
                    "views": stats["views"],
                    "total_time": stats["total_time"],
                    "avg_time": stats["total_time"] / stats["views"] if stats["views"] > 0 else 0
                }
                for page, stats in page_stats.items()
            ],
            "action_analytics": [
                {"action_type": action, "count": count}
                for action, count in action_stats.items()
            ],
            "summary": {
                "total_page_views": len(page_views),
                "total_actions": len(actions),
                "unique_pages": len(page_stats),
                "most_visited_page": max(page_stats.items(), key=lambda x: x[1]["views"])[0] if page_stats else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PROJECT MANAGEMENT ====================

@router.get("/projects")
async def get_admin_projects(
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get projects for admin management"""
    try:
        query = db.query(Project)
        
        if status:
            query = query.filter(Project.status == status)
        if category:
            query = query.filter(Project.category == category)
        if search:
            query = query.filter(
                or_(
                    Project.title.ilike(f"%{search}%"),
                    Project.description.ilike(f"%{search}%")
                )
            )
        
        # Sorting
        sort_column = getattr(Project, sort_by, Project.created_at)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        total = query.count()
        projects = query.offset(offset).limit(limit).all()
        
        # Add investment stats to each project
        project_data = []
        for project in projects:
            project_dict = project.to_dict()
            
            # Get investment stats
            investments = db.query(Investment).filter(Investment.project_id == project.id)
            project_dict["total_investors"] = investments.filter(
                Investment.status.in_(["confirmed", "active"])
            ).count()
            
            project_dict["total_raised"] = float(
                investments.filter(
                    Investment.status.in_(["confirmed", "active"])
                ).with_entities(func.sum(Investment.amount)).scalar() or 0
            )
            
            project_data.append(project_dict)
        
        return {
            "projects": project_data,
            "total": total,
            "offset": offset,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/projects")
async def create_project(project_data: ProjectUpdate, db: Session = Depends(get_db)):
    """Create new project"""
    try:
        # Generate slug from title
        slug = project_data.title.lower().replace(" ", "-") if project_data.title else ""
        
        project = Project(
            **project_data.dict(exclude_unset=True),
            slug=slug,
            created_at=datetime.utcnow()
        )
        
        db.add(project)
        db.commit()
        db.refresh(project)
        
        log_admin_action(db, 1, "create_project", {"project_id": project.id})
        
        return {
            "message": "پروژه با موفقیت ایجاد شد",
            "project": project.to_dict()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/projects/{project_id}")
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """Update project"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="پروژه پیدا نشد")
        
        update_data = project_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)
        
        project.updated_at = datetime.utcnow()
        db.commit()
        
        log_admin_action(db, 1, f"update_project_{project_id}", update_data)
        
        return {
            "message": "پروژه با موفقیت به‌روزرسانی شد",
            "project": project.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete project (soft delete)"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="پروژه پیدا نشد")
        
        # Check if project has active investments
        active_investments = db.query(Investment).filter(
            Investment.project_id == project_id,
            Investment.status.in_(["confirmed", "active"])
        ).count()
        
        if active_investments > 0:
            raise HTTPException(
                status_code=400,
                detail="نمی‌توان پروژه‌ای را حذف کرد که دارای سرمایه‌گذاری فعال است"
            )
        
        project.is_active = False
        project.status = "cancelled"
        project.updated_at = datetime.utcnow()
        db.commit()
        
        log_admin_action(db, 1, f"delete_project_{project_id}")
        
        return {"message": "پروژه با موفقیت حذف شد"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ==================== FINANCIAL MANAGEMENT ====================

@router.get("/financial/overview")
async def get_financial_overview(
    period: str = Query("30d"),
    db: Session = Depends(get_db)
):
    """Get financial overview"""
    try:
        days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}.get(period, 30)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Investment metrics
        investments = db.query(Investment).filter(
            Investment.created_at >= start_date,
            Investment.status.in_(["confirmed", "active", "completed"])
        )
        
        total_investments = float(investments.with_entities(func.sum(Investment.amount)).scalar() or 0)
        investment_count = investments.count()
        
        # Payment metrics
        payments = db.query(PaymentHistory).filter(
            PaymentHistory.created_at >= start_date
        )
        
        total_payments_due = float(payments.with_entities(func.sum(PaymentHistory.due_amount)).scalar() or 0)
        total_payments_received = float(
            payments.filter(PaymentHistory.status == "paid").with_entities(
                func.sum(PaymentHistory.paid_amount)
            ).scalar() or 0
        )
        
        overdue_payments = float(
            payments.filter(PaymentHistory.status == "overdue").with_entities(
                func.sum(PaymentHistory.due_amount)
            ).scalar() or 0
        )
        
        # Calculate collection rate
        collection_rate = (total_payments_received / total_payments_due * 100) if total_payments_due > 0 else 0
        
        # Project performance
        project_performance = db.query(
            Project.title,
            Project.category,
            func.sum(Investment.amount).label("total_invested"),
            func.count(Investment.id).label("investor_count")
        ).join(Investment).filter(
            Investment.status.in_(["confirmed", "active"]),
            Investment.created_at >= start_date
        ).group_by(Project.id, Project.title, Project.category).all()
        
        return {
            "period": period,
            "overview": {
                "total_investments": total_investments,
                "investment_count": investment_count,
                "avg_investment": total_investments / investment_count if investment_count > 0 else 0,
                "total_payments_due": total_payments_due,
                "total_payments_received": total_payments_received,
                "overdue_payments": overdue_payments,
                "collection_rate": collection_rate
            },
            "project_performance": [
                {
                    "title": p.title,
                    "category": p.category,
                    "total_invested": float(p.total_invested),
                    "investor_count": p.investor_count
                }
                for p in project_performance
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/financial/payments")
async def get_payment_management(
    status: Optional[str] = None,
    overdue_only: bool = False,
    user_id: Optional[int] = None,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get payment management data"""
    try:
        query = db.query(PaymentHistory).join(PaymentPlan).join(User)
        
        if status:
            query = query.filter(PaymentHistory.status == status)
        
        if overdue_only:
            query = query.filter(
                PaymentHistory.status == "overdue",
                PaymentHistory.due_date < date.today()
            )
        
        if user_id:
            query = query.filter(PaymentPlan.user_id == user_id)
        
        query = query.order_by(PaymentHistory.due_date)
        
        total = query.count()
        payments = query.offset(offset).limit(limit).all()
        
        payment_data = []
        for payment in payments:
            payment_dict = payment.to_dict()
            
            # Add user info
            user = db.query(User).filter(User.id == payment.payment_plan.user_id).first()
            payment_dict["user"] = {
                "id": user.id,
                "full_name": user.full_name,
                "phone": user.phone
            } if user else None
            
            # Add project info
            investment = db.query(Investment).filter(Investment.id == payment.investment_id).first()
            if investment and investment.project:
                payment_dict["project"] = {
                    "id": investment.project.id,
                    "title": investment.project.title
                }
            
            payment_data.append(payment_dict)
        
        return {
            "payments": payment_data,
            "total": total,
            "offset": offset,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/financial/payments/{payment_id}")
async def update_payment(
    payment_id: int,
    payment_data: PaymentUpdate,
    db: Session = Depends(get_db)
):
    """Update payment status"""
    try:
        payment = db.query(PaymentHistory).filter(PaymentHistory.id == payment_id).first()
        if not payment:
            raise HTTPException(status_code=404, detail="پرداخت پیدا نشد")
        
        # Update payment
        if payment_data.status:
            payment.status = payment_data.status
        if payment_data.paid_amount is not None:
            payment.paid_amount = Decimal(str(payment_data.paid_amount))
            payment.paid_date = date.today()
        if payment_data.late_fee is not None:
            payment.late_fee = Decimal(str(payment_data.late_fee))
        if payment_data.notes:
            payment.notes = payment_data.notes
        
        payment.updated_at = datetime.utcnow()
        
        # Update payment plan if payment is completed
        if payment_data.status == "paid":
            payment_plan = payment.payment_plan
            payment_plan.total_paid += payment.paid_amount
            payment_plan.remaining_balance = payment_plan.total_amount - payment_plan.total_paid
            
            if payment_plan.remaining_balance <= 0:
                payment_plan.status = "completed"
        
        db.commit()
        
        log_admin_action(db, 1, f"update_payment_{payment_id}", payment_data.dict())
        
        return {
            "message": "وضعیت پرداخت به‌روزرسانی شد",
            "payment": payment.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ==================== CONTENT MANAGEMENT ====================

@router.get("/content")
async def get_admin_content(
    content_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get content for admin management"""
    try:
        query = db.query(ContentManagement)
        
        if content_type:
            query = query.filter(ContentManagement.content_type == content_type)
        
        query = query.order_by(ContentManagement.content_type, ContentManagement.display_order)
        content = query.all()
        
        return {
            "content": [c.to_dict() for c in content]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/content")
async def create_content(content_data: ContentCreate, db: Session = Depends(get_db)):
    """Create new content"""
    try:
        content = ContentManagement(**content_data.dict(), created_by=1)  # TODO: Get actual admin ID
        db.add(content)
        db.commit()
        db.refresh(content)
        
        return {
            "message": "محتوا با موفقیت ایجاد شد",
            "content": content.to_dict()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/content/{content_id}")
async def update_content(
    content_id: int,
    content_data: ContentCreate,
    db: Session = Depends(get_db)
):
    """Update content"""
    try:
        content = db.query(ContentManagement).filter(ContentManagement.id == content_id).first()
        if not content:
            raise HTTPException(status_code=404, detail="محتوا پیدا نشد")
        
        update_data = content_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(content, field, value)
        
        content.updated_by = 1  # TODO: Get actual admin ID
        content.updated_at = datetime.utcnow()
        db.commit()
        
        return {
            "message": "محتوا با موفقیت به‌روزرسانی شد",
            "content": content.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ANALYTICS & REPORTS ====================

@router.get("/analytics/users")
async def get_user_analytics(
    period: str = Query("30d"),
    db: Session = Depends(get_db)
):
    """Get user analytics"""
    try:
        days = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}.get(period, 30)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # User registration trends
        daily_registrations = db.query(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("count")
        ).filter(
            User.created_at >= start_date
        ).group_by(func.date(User.created_at)).all()
        
        # User activity
        active_users = db.query(UserSession).filter(
            UserSession.start_time >= start_date
        ).with_entities(UserSession.user_id).distinct().count()
        
        # Device analytics
        device_breakdown = db.query(
            UserSession.device_type,
            func.count(UserSession.id).label("count")
        ).filter(
            UserSession.start_time >= start_date
        ).group_by(UserSession.device_type).all()
        
        # Geographic analytics
        geographic_breakdown = db.query(
            UserSession.country,
            func.count(UserSession.id).label("count")
        ).filter(
            UserSession.start_time >= start_date,
            UserSession.country.isnot(None)
        ).group_by(UserSession.country).all()
        
        return {
            "period": period,
            "daily_registrations": [
                {"date": d.date.isoformat(), "count": d.count}
                for d in daily_registrations
            ],
            "active_users": active_users,
            "device_breakdown": [
                {"device": d.device_type or "unknown", "count": d.count}
                for d in device_breakdown
            ],
            "geographic_breakdown": [
                {"country": g.country, "count": g.count}
                for g in geographic_breakdown
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/export")
async def export_analytics(
    report_type: str = Query("users", regex="^(users|investments|payments|projects)$"),
    format: str = Query("csv", regex="^(csv|json)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Export analytics data"""
    try:
        # Set default date range if not provided
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        if report_type == "users":
            data = db.query(User).filter(
                User.created_at >= start_date,
                User.created_at <= end_date
            ).all()
            
            if format == "csv":
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow(["ID", "Phone", "Full Name", "Email", "Created At", "Is Active", "Is Verified"])
                
                for user in data:
                    writer.writerow([
                        user.id, user.phone, user.full_name or "", user.email or "",
                        user.created_at.isoformat(), user.is_active, user.is_verified
                    ])
                
                output.seek(0)
                return StreamingResponse(
                    io.BytesIO(output.getvalue().encode()),
                    media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename=users_{start_date}_{end_date}.csv"}
                )
        
        # Handle other report types similarly...
        return {"message": "Export functionality implemented for users only in this version"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== NOTIFICATIONS ====================

@router.get("/notifications")
async def get_admin_notifications(
    unread_only: bool = False,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    """Get admin notifications"""
    try:
        query = db.query(Notification).filter(Notification.admin_id.isnot(None))
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        query = query.order_by(desc(Notification.created_at))
        notifications = query.limit(limit).all()
        
        return {
            "notifications": [n.to_dict() for n in notifications]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/notifications")
async def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db)
):
    """Create new notification"""
    try:
        notification = Notification(**notification_data.dict())
        db.add(notification)
        db.commit()
        
        return {
            "message": "اطلاع‌رسانی ایجاد شد",
            "notification": notification.to_dict()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ==================== SYSTEM SETTINGS ====================

@router.get("/settings")
async def get_settings(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Get system settings"""
    try:
        query = db.query(SiteSettings)
        
        if category:
            query = query.filter(SiteSettings.category == category)
        
        settings = query.order_by(SiteSettings.category, SiteSettings.display_order).all()
        
        return {
            "settings": [s.to_dict(include_sensitive=True) for s in settings]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings/{setting_id}")
async def update_setting(
    setting_id: int,
    value: str = Body(...),
    db: Session = Depends(get_db)
):
    """Update system setting"""
    try:
        setting = db.query(SiteSettings).filter(SiteSettings.id == setting_id).first()
        if not setting:
            raise HTTPException(status_code=404, detail="تنظیم پیدا نشد")
        
        setting.value = value
        setting.updated_by = 1  # TODO: Get actual admin ID
        setting.updated_at = datetime.utcnow()
        db.commit()
        
        log_admin_action(db, 1, f"update_setting_{setting.key}", {"old_value": setting.value, "new_value": value})
        
        return {
            "message": "تنظیم به‌روزرسانی شد",
            "setting": setting.to_dict(include_sensitive=True)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

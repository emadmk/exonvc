# models.py - Final Complete Version with Advanced Tables
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON, Date, DECIMAL
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from datetime import datetime
import json

Base = declarative_base()

# ==================== EXISTING CORE MODELS ====================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    email = Column(String(100))
    national_code = Column(String(10), unique=True)
    birth_date = Column(Date)
    address = Column(Text)
    profile_image = Column(String(255))
    wallet_balance = Column(DECIMAL(15,2), default=0.00)
    otp_code = Column(String(6))
    otp_expires = Column(DateTime)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login = Column(DateTime)
    
    # Credit scoring and risk assessment
    credit_score = Column(Integer, default=500)  # 300-850 scale
    risk_level = Column(String(20), default="medium")  # low, medium, high
    investment_pattern = Column(String(50), default="moderate")  # conservative, moderate, aggressive
    
    # Relationships
    investments = relationship("Investment", back_populates="user")
    payment_plans = relationship("PaymentPlan", back_populates="user")
    sessions = relationship("UserSession", back_populates="user")
    actions = relationship("UserAction", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    chat_logs = relationship("ChatLog", back_populates="user")
    
    def to_dict(self):
        return {
            "id": self.id,
            "phone": self.phone,
            "full_name": self.full_name,
            "email": self.email,
            "national_code": self.national_code,
            "birth_date": self.birth_date.isoformat() if self.birth_date else None,
            "address": self.address,
            "profile_image": self.profile_image,
            "wallet_balance": float(self.wallet_balance) if self.wallet_balance else 0.0,
            "is_verified": self.is_verified,
            "is_active": self.is_active,
            "credit_score": self.credit_score,
            "risk_level": self.risk_level,
            "investment_pattern": self.investment_pattern,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    short_description = Column(String(500))
    content = Column(Text)  # Rich content for project details
    category = Column(String(50))  # restaurant, cafe, gold, restaurant_dubai
    
    # Financial details
    target_amount = Column(DECIMAL(15,2), nullable=False)
    raised_amount = Column(DECIMAL(15,2), default=0.00)
    min_investment = Column(DECIMAL(15,2), default=1000000.00)
    max_investment = Column(DECIMAL(15,2))
    expected_return = Column(Float)  # Expected return percentage
    actual_return = Column(Float)  # Actual return achieved
    duration_months = Column(Integer)
    
    # Project status and visibility
    status = Column(String(20), default="draft")  # draft, active, funding, completed, cancelled, paused
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    priority = Column(Integer, default=0)
    
    # Dates
    start_date = Column(Date)
    end_date = Column(Date)
    funding_deadline = Column(Date)
    
    # Location and media
    location = Column(String(200))
    main_image = Column(String(255))
    gallery = Column(JSON)  # Array of image URLs
    video_url = Column(String(255))
    
    # Additional project info
    features = Column(JSON)  # Array of project features
    financial_details = Column(JSON)  # Detailed financial breakdown
    documents = Column(JSON)  # Project documents and certificates
    team_info = Column(JSON)  # Team members and their roles
    
    # SEO and marketing
    slug = Column(String(200), unique=True)
    meta_title = Column(String(200))
    meta_description = Column(String(500))
    tags = Column(JSON)  # Array of tags for categorization
    
    # Risk assessment
    risk_level = Column(String(20), default="medium")
    risk_factors = Column(JSON)  # Array of risk factors
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    investments = relationship("Investment", back_populates="project")
    analytics = relationship("ProjectAnalytics", back_populates="project")
    
    def to_dict(self):
        progress = (float(self.raised_amount) / float(self.target_amount) * 100) if self.target_amount > 0 else 0
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "short_description": self.short_description,
            "content": self.content,
            "category": self.category,
            "target_amount": float(self.target_amount) if self.target_amount else 0.0,
            "raised_amount": float(self.raised_amount) if self.raised_amount else 0.0,
            "progress": min(progress, 100),
            "min_investment": float(self.min_investment) if self.min_investment else 0.0,
            "max_investment": float(self.max_investment) if self.max_investment else None,
            "expected_return": self.expected_return,
            "actual_return": self.actual_return,
            "duration_months": self.duration_months,
            "status": self.status,
            "is_active": self.is_active,
            "is_featured": self.is_featured,
            "priority": self.priority,
            "location": self.location,
            "main_image": self.main_image,
            "gallery": self.gallery or [],
            "video_url": self.video_url,
            "features": self.features or [],
            "financial_details": self.financial_details or {},
            "documents": self.documents or [],
            "team_info": self.team_info or {},
            "slug": self.slug,
            "risk_level": self.risk_level,
            "risk_factors": self.risk_factors or [],
            "tags": self.tags or [],
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "funding_deadline": self.funding_deadline.isoformat() if self.funding_deadline else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    
    # Investment details
    amount = Column(DECIMAL(15,2), nullable=False)
    payment_type = Column(String(20), default="lump_sum")  # lump_sum, installment
    expected_return = Column(DECIMAL(15,2))
    actual_return = Column(DECIMAL(15,2), default=0.00)
    
    # Status and tracking
    status = Column(String(20), default="pending")  # pending, confirmed, active, completed, cancelled
    payment_method = Column(String(50))  # bank_transfer, card, wallet
    transaction_id = Column(String(100))
    reference_number = Column(String(100))
    
    # Dates
    invested_at = Column(DateTime, default=func.now())
    confirmed_at = Column(DateTime)
    maturity_date = Column(Date)
    
    # Additional info
    notes = Column(Text)
    risk_acknowledged = Column(Boolean, default=False)
    contract_signed = Column(Boolean, default=False)
    contract_url = Column(String(255))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="investments")
    project = relationship("Project", back_populates="investments")
    payment_plan = relationship("PaymentPlan", back_populates="investment", uselist=False)
    payment_history = relationship("PaymentHistory", back_populates="investment")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "project_id": self.project_id,
            "project_title": self.project.title if self.project else None,
            "amount": float(self.amount) if self.amount else 0.0,
            "payment_type": self.payment_type,
            "expected_return": float(self.expected_return) if self.expected_return else 0.0,
            "actual_return": float(self.actual_return) if self.actual_return else 0.0,
            "status": self.status,
            "payment_method": self.payment_method,
            "transaction_id": self.transaction_id,
            "reference_number": self.reference_number,
            "risk_acknowledged": self.risk_acknowledged,
            "contract_signed": self.contract_signed,
            "contract_url": self.contract_url,
            "invested_at": self.invested_at.isoformat() if self.invested_at else None,
            "confirmed_at": self.confirmed_at.isoformat() if self.confirmed_at else None,
            "maturity_date": self.maturity_date.isoformat() if self.maturity_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

# ==================== NEW ADVANCED MODELS ====================

class PaymentPlan(Base):
    __tablename__ = "payment_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Payment plan details
    total_amount = Column(DECIMAL(15,2), nullable=False)
    installment_count = Column(Integer, nullable=False)
    installment_amount = Column(DECIMAL(15,2), nullable=False)
    payment_frequency = Column(String(20), default="monthly")  # monthly, quarterly, annually
    
    # Dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    next_due_date = Column(Date)
    
    # Financial terms
    interest_rate = Column(Float, default=0.0)
    late_fee_rate = Column(Float, default=5.0)  # Percentage
    grace_period_days = Column(Integer, default=7)
    
    # Status
    status = Column(String(20), default="active")  # active, completed, defaulted, cancelled
    total_paid = Column(DECIMAL(15,2), default=0.00)
    remaining_balance = Column(DECIMAL(15,2))
    overdue_amount = Column(DECIMAL(15,2), default=0.00)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    investment = relationship("Investment", back_populates="payment_plan")
    user = relationship("User", back_populates="payment_plans")
    payment_history = relationship("PaymentHistory", back_populates="payment_plan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "investment_id": self.investment_id,
            "user_id": self.user_id,
            "total_amount": float(self.total_amount) if self.total_amount else 0.0,
            "installment_count": self.installment_count,
            "installment_amount": float(self.installment_amount) if self.installment_amount else 0.0,
            "payment_frequency": self.payment_frequency,
            "status": self.status,
            "total_paid": float(self.total_paid) if self.total_paid else 0.0,
            "remaining_balance": float(self.remaining_balance) if self.remaining_balance else 0.0,
            "overdue_amount": float(self.overdue_amount) if self.overdue_amount else 0.0,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "next_due_date": self.next_due_date.isoformat() if self.next_due_date else None
        }

class PaymentHistory(Base):
    __tablename__ = "payment_history"
    
    id = Column(Integer, primary_key=True, index=True)
    payment_plan_id = Column(Integer, ForeignKey("payment_plans.id"), nullable=False)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=False)
    
    # Payment details
    installment_number = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    paid_date = Column(Date)
    due_amount = Column(DECIMAL(15,2), nullable=False)
    paid_amount = Column(DECIMAL(15,2), default=0.00)
    late_fee = Column(DECIMAL(15,2), default=0.00)
    
    # Status and method
    status = Column(String(20), default="pending")  # pending, paid, overdue, partial, waived
    payment_method = Column(String(50))
    transaction_reference = Column(String(100))
    gateway_response = Column(JSON)
    
    # Additional info
    days_overdue = Column(Integer, default=0)
    notes = Column(Text)
    processed_by = Column(String(100))  # admin user who processed
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    payment_plan = relationship("PaymentPlan", back_populates="payment_history")
    investment = relationship("Investment", back_populates="payment_history")
    
    def to_dict(self):
        return {
            "id": self.id,
            "payment_plan_id": self.payment_plan_id,
            "investment_id": self.investment_id,
            "installment_number": self.installment_number,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "paid_date": self.paid_date.isoformat() if self.paid_date else None,
            "due_amount": float(self.due_amount) if self.due_amount else 0.0,
            "paid_amount": float(self.paid_amount) if self.paid_amount else 0.0,
            "late_fee": float(self.late_fee) if self.late_fee else 0.0,
            "status": self.status,
            "payment_method": self.payment_method,
            "transaction_reference": self.transaction_reference,
            "days_overdue": self.days_overdue,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String(100), unique=True, nullable=False)
    
    # Session details
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime)
    duration_seconds = Column(Integer)
    pages_visited = Column(Integer, default=0)
    actions_count = Column(Integer, default=0)
    
    # Device and browser info
    device_type = Column(String(20))  # mobile, desktop, tablet
    device_brand = Column(String(50))
    browser = Column(String(50))
    browser_version = Column(String(20))
    os = Column(String(50))
    os_version = Column(String(20))
    screen_resolution = Column(String(20))
    
    # Location and network
    ip_address = Column(String(45))
    country = Column(String(50))
    city = Column(String(100))
    timezone = Column(String(50))
    isp = Column(String(100))
    
    # Referrer and marketing
    referrer_url = Column(String(500))
    referrer_domain = Column(String(200))
    utm_source = Column(String(100))
    utm_medium = Column(String(100))
    utm_campaign = Column(String(100))
    utm_term = Column(String(100))
    utm_content = Column(String(100))
    
    # Engagement metrics
    bounce_session = Column(Boolean, default=False)
    converted = Column(Boolean, default=False)  # Did user invest during this session
    conversion_value = Column(DECIMAL(15,2), default=0.00)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    page_views = relationship("PageView", back_populates="session")
    actions = relationship("UserAction", back_populates="session")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration_seconds": self.duration_seconds,
            "pages_visited": self.pages_visited,
            "actions_count": self.actions_count,
            "device_type": self.device_type,
            "browser": self.browser,
            "os": self.os,
            "country": self.country,
            "city": self.city,
            "bounce_session": self.bounce_session,
            "converted": self.converted,
            "conversion_value": float(self.conversion_value) if self.conversion_value else 0.0
        }

class PageView(Base):
    __tablename__ = "page_views"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), ForeignKey("user_sessions.session_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Page details
    page_url = Column(String(500), nullable=False)
    page_title = Column(String(200))
    page_type = Column(String(50))  # home, project, dashboard, admin, etc.
    
    # Engagement metrics
    time_spent_seconds = Column(Integer, default=0)
    scroll_depth = Column(Float, default=0.0)  # Percentage scrolled
    clicks_count = Column(Integer, default=0)
    form_interactions = Column(Integer, default=0)
    
    # Technical details
    load_time_ms = Column(Integer)
    exit_page = Column(Boolean, default=False)
    
    # Timestamps
    view_timestamp = Column(DateTime, default=func.now())
    exit_timestamp = Column(DateTime)
    
    # Relationships
    session = relationship("UserSession", back_populates="page_views")
    user = relationship("User")
    
    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "user_id": self.user_id,
            "page_url": self.page_url,
            "page_title": self.page_title,
            "page_type": self.page_type,
            "time_spent_seconds": self.time_spent_seconds,
            "scroll_depth": self.scroll_depth,
            "clicks_count": self.clicks_count,
            "load_time_ms": self.load_time_ms,
            "view_timestamp": self.view_timestamp.isoformat() if self.view_timestamp else None
        }

class UserAction(Base):
    __tablename__ = "user_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(String(100), ForeignKey("user_sessions.session_id"))
    
    # Action details
    action_type = Column(String(50), nullable=False)  # click, form_submit, download, view_project, chat_message, etc.
    action_category = Column(String(50))  # navigation, engagement, conversion, etc.
    element_id = Column(String(100))
    element_text = Column(String(200))
    element_type = Column(String(50))  # button, link, form, etc.
    
    # Context
    page_url = Column(String(500))
    page_section = Column(String(100))  # header, hero, projects, footer, etc.
    
    # Additional data
    additional_data = Column(JSON)  # Flexible data storage for different action types
    value = Column(DECIMAL(15,2))  # For actions with monetary value
    
    # Timestamps
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="actions")
    session = relationship("UserSession", back_populates="actions")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "action_type": self.action_type,
            "action_category": self.action_category,
            "element_text": self.element_text,
            "page_url": self.page_url,
            "additional_data": self.additional_data,
            "value": float(self.value) if self.value else 0.0,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

class ContentManagement(Base):
    __tablename__ = "content_management"
    
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String(50), nullable=False)  # hero_section, about_us, faq, project_category, etc.
    content_key = Column(String(100), unique=True, nullable=False)
    
    # Content details
    title = Column(String(200))
    subtitle = Column(String(300))
    content = Column(Text)
    rich_content = Column(Text)  # HTML/Markdown content
    
    # Media
    image_url = Column(String(255))
    gallery = Column(JSON)  # Array of images
    video_url = Column(String(255))
    icon = Column(String(100))
    
    # Metadata - تغییر نام برای جلوگیری از conflict
    extra_data = Column(JSON)  # Flexible metadata storage (تغییر از metadata)
    seo_title = Column(String(200))
    seo_description = Column(String(500))
    seo_keywords = Column(JSON)
    
    # Display settings
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    language = Column(String(10), default="fa")
    
    # Versioning
    version = Column(Integer, default=1)
    parent_id = Column(Integer, ForeignKey("content_management.id"))  # For versioning
    
    # Admin tracking
    created_by = Column(Integer, ForeignKey("admin_users.id"))
    updated_by = Column(Integer, ForeignKey("admin_users.id"))
    published_by = Column(Integer, ForeignKey("admin_users.id"))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    published_at = Column(DateTime)
    
    # Relationships
    created_by_admin = relationship("AdminUser", foreign_keys=[created_by])
    updated_by_admin = relationship("AdminUser", foreign_keys=[updated_by])
    published_by_admin = relationship("AdminUser", foreign_keys=[published_by])
    
    def to_dict(self):
        return {
            "id": self.id,
            "content_type": self.content_type,
            "content_key": self.content_key,
            "title": self.title,
            "subtitle": self.subtitle,
            "content": self.content,
            "rich_content": self.rich_content,
            "image_url": self.image_url,
            "gallery": self.gallery or [],
            "video_url": self.video_url,
            "icon": self.icon,
            "extra_data": self.extra_data or {},  # تغییر از metadata
            "seo_title": self.seo_title,
            "seo_description": self.seo_description,
            "seo_keywords": self.seo_keywords or [],
            "is_active": self.is_active,
            "display_order": self.display_order,
            "language": self.language,
            "version": self.version,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ProjectAnalytics(Base):
    __tablename__ = "project_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    date = Column(Date, nullable=False)
    
    # View metrics
    total_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    returning_visitors = Column(Integer, default=0)
    
    # Engagement metrics
    avg_time_on_page = Column(Integer, default=0)  # seconds
    bounce_rate = Column(Float, default=0.0)  # percentage
    scroll_depth_avg = Column(Float, default=0.0)  # average scroll depth
    
    # Conversion metrics
    investment_inquiries = Column(Integer, default=0)
    actual_investments = Column(Integer, default=0)
    total_invested_amount = Column(DECIMAL(15,2), default=0.00)
    conversion_rate = Column(Float, default=0.0)  # percentage
    
    # Traffic sources
    direct_traffic = Column(Integer, default=0)
    social_traffic = Column(Integer, default=0)
    search_traffic = Column(Integer, default=0)
    referral_traffic = Column(Integer, default=0)
    
    # Device breakdown
    mobile_views = Column(Integer, default=0)
    desktop_views = Column(Integer, default=0)
    tablet_views = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="analytics")
    
    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "date": self.date.isoformat() if self.date else None,
            "total_views": self.total_views,
            "unique_visitors": self.unique_visitors,
            "avg_time_on_page": self.avg_time_on_page,
            "bounce_rate": self.bounce_rate,
            "investment_inquiries": self.investment_inquiries,
            "actual_investments": self.actual_investments,
            "total_invested_amount": float(self.total_invested_amount) if self.total_invested_amount else 0.0,
            "conversion_rate": self.conversion_rate,
            "mobile_views": self.mobile_views,
            "desktop_views": self.desktop_views
        }

class FinancialReport(Base):
    __tablename__ = "financial_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String(50), nullable=False)  # daily, weekly, monthly, quarterly, yearly
    report_date = Column(Date, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # Investment metrics
    total_investments = Column(DECIMAL(15,2), default=0.00)
    total_returns = Column(DECIMAL(15,2), default=0.00)
    net_profit = Column(DECIMAL(15,2), default=0.00)
    roi_percentage = Column(Float, default=0.0)
    
    # User metrics
    active_investors = Column(Integer, default=0)
    new_investors = Column(Integer, default=0)
    total_users = Column(Integer, default=0)
    
    # Payment metrics
    total_payments_due = Column(DECIMAL(15,2), default=0.00)
    total_payments_received = Column(DECIMAL(15,2), default=0.00)
    overdue_payments = Column(DECIMAL(15,2), default=0.00)
    collection_rate = Column(Float, default=0.0)  # percentage
    
    # Project metrics
    active_projects = Column(Integer, default=0)
    completed_projects = Column(Integer, default=0)
    total_projects = Column(Integer, default=0)
    
    # Detailed breakdowns (JSON)
    project_performance = Column(JSON)  # Detailed project-wise performance
    payment_breakdown = Column(JSON)  # Payment method breakdown
    geographic_breakdown = Column(JSON)  # Performance by location
    risk_analysis = Column(JSON)  # Risk metrics and analysis
    
    # Administrative
    generated_by = Column(Integer, ForeignKey("admin_users.id"))
    generated_at = Column(DateTime, default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "report_type": self.report_type,
            "report_date": self.report_date.isoformat() if self.report_date else None,
            "total_investments": float(self.total_investments) if self.total_investments else 0.0,
            "total_returns": float(self.total_returns) if self.total_returns else 0.0,
            "net_profit": float(self.net_profit) if self.net_profit else 0.0,
            "roi_percentage": self.roi_percentage,
            "active_investors": self.active_investors,
            "new_investors": self.new_investors,
            "overdue_payments": float(self.overdue_payments) if self.overdue_payments else 0.0,
            "collection_rate": self.collection_rate,
            "project_performance": self.project_performance or {},
            "generated_at": self.generated_at.isoformat() if self.generated_at else None
        }

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # NULL for admin notifications
    admin_id = Column(Integer, ForeignKey("admin_users.id"))  # For admin notifications
    
    # Notification details
    type = Column(String(50), nullable=False)  # payment_due, investment_complete, system_alert, etc.
    category = Column(String(50), default="info")  # info, warning, error, success
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    
    # Additional data
    data = Column(JSON)  # Additional structured data
    action_url = Column(String(500))  # URL for action button
    action_text = Column(String(100))  # Text for action button
    
    # Delivery settings
    channels = Column(JSON, default=["in_app"])  # in_app, email, sms, push
    delivery_status = Column(JSON)  # Status for each channel
    
    # Status
    is_read = Column(Boolean, default=False)
    is_sent = Column(Boolean, default=False)
    priority = Column(String(20), default="normal")  # low, normal, high, critical
    
    # Scheduling
    send_at = Column(DateTime)  # For scheduled notifications
    expires_at = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    read_at = Column(DateTime)
    sent_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    admin = relationship("AdminUser")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type,
            "category": self.category,
            "title": self.title,
            "message": self.message,
            "data": self.data or {},
            "action_url": self.action_url,
            "action_text": self.action_text,
            "is_read": self.is_read,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None
        }

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Log details
    level = Column(String(20), nullable=False)  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    module = Column(String(50), nullable=False)  # auth, payment, admin, etc.
    action = Column(String(100), nullable=False)
    message = Column(Text)
    
    # User context
    user_id = Column(Integer, ForeignKey("users.id"))
    admin_id = Column(Integer, ForeignKey("admin_users.id"))
    session_id = Column(String(100))
    
    # Request context
    ip_address = Column(String(45))
    user_agent = Column(Text)
    request_method = Column(String(10))
    request_url = Column(String(500))
    request_data = Column(JSON)
    response_status = Column(Integer)
    response_data = Column(JSON)
    
    # Performance
    execution_time_ms = Column(Integer)
    
    # Additional context
    extra_data = Column(JSON)
    stack_trace = Column(Text)  # For error logs
    
    timestamp = Column(DateTime, default=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "level": self.level,
            "module": self.module,
            "action": self.action,
            "message": self.message,
            "user_id": self.user_id,
            "admin_id": self.admin_id,
            "ip_address": self.ip_address,
            "request_method": self.request_method,
            "request_url": self.request_url,
            "response_status": self.response_status,
            "execution_time_ms": self.execution_time_ms,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

# ==================== EXISTING MODELS (UPDATED) ====================

class ChatLog(Base):
    __tablename__ = "chat_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_phone = Column(String(15))  # For anonymous users
    session_id = Column(String(100), nullable=False)
    
    # Message details
    message = Column(Text, nullable=False)
    response = Column(Text)
    message_type = Column(String(20), default="user")  # user, assistant, system
    
    # Context and metadata
    context = Column(JSON)  # Context like project_id, page_url, etc.
    intent = Column(String(100))  # Detected user intent
    sentiment = Column(String(20))  # positive, negative, neutral
    language = Column(String(10), default="fa")
    
    # Performance metrics
    response_time = Column(Integer)  # milliseconds
    tokens_used = Column(Integer)  # AI tokens consumed
    
    # Quality metrics
    user_rating = Column(Integer)  # 1-5 rating from user
    was_helpful = Column(Boolean)
    needs_human = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_logs")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_phone": self.user_phone,
            "session_id": self.session_id,
            "message": self.message,
            "response": self.response,
            "message_type": self.message_type,
            "context": self.context or {},
            "intent": self.intent,
            "sentiment": self.sentiment,
            "response_time": self.response_time,
            "user_rating": self.user_rating,
            "was_helpful": self.was_helpful,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    # Personal info
    full_name = Column(String(100))
    phone = Column(String(15))
    profile_image = Column(String(255))
    
    # Role and permissions
    role = Column(String(20), default="admin")  # super_admin, admin, moderator, viewer
    permissions = Column(JSON)  # Detailed permissions array
    department = Column(String(50))
    
    # Security
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(100))
    
    # Login tracking
    last_login = Column(DateTime)
    login_count = Column(Integer, default=0)
    failed_login_attempts = Column(Integer, default=0)
    last_failed_login = Column(DateTime)
    password_changed_at = Column(DateTime)
    
    # Session management
    session_token = Column(String(255))
    session_expires = Column(DateTime)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "phone": self.phone,
            "profile_image": self.profile_image,
            "role": self.role,
            "permissions": self.permissions or [],
            "department": self.department,
            "is_active": self.is_active,
            "is_superuser": self.is_superuser,
            "two_factor_enabled": self.two_factor_enabled,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "login_count": self.login_count,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class SiteSettings(Base):
    __tablename__ = "site_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), default="general")  # general, payment, email, sms, etc.
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text)
    
    # Data type and validation
    value_type = Column(String(20), default="string")  # string, number, boolean, json, array
    validation_rules = Column(JSON)  # Validation rules for the value
    default_value = Column(Text)
    
    # Display and description
    display_name = Column(String(200))
    description = Column(String(500))
    help_text = Column(Text)
    
    # Security and access
    is_public = Column(Boolean, default=False)  # Whether to expose in public API
    is_sensitive = Column(Boolean, default=False)  # For passwords, API keys, etc.
    requires_restart = Column(Boolean, default=False)  # Whether changing this requires restart
    
    # Organization
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Audit
    updated_by = Column(Integer, ForeignKey("admin_users.id"))
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def to_dict(self, include_sensitive=False):
        result = {
            "id": self.id,
            "category": self.category,
            "key": self.key,
            "value_type": self.value_type,
            "display_name": self.display_name,
            "description": self.description,
            "is_public": self.is_public,
            "display_order": self.display_order,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Only include value if not sensitive or explicitly requested
        if not self.is_sensitive or include_sensitive:
            result["value"] = self.value
            
        return result

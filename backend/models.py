# models.py - Database Models
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    email = Column(String(100))
    otp_code = Column(String(6))
    otp_expires = Column(DateTime)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    investments = relationship("Investment", back_populates="user")
    
    def to_dict(self):
        return {
            "id": self.id,
            "phone": self.phone,
            "full_name": self.full_name,
            "email": self.email,
            "is_verified": self.is_verified,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    short_description = Column(String(500))
    category = Column(String(50))  # restaurant, cafe, gold, restaurant_dubai
    target_amount = Column(Float, nullable=False)
    raised_amount = Column(Float, default=0)
    min_investment = Column(Float, default=1000000)  # Minimum investment in Toman
    expected_return = Column(Float)  # Expected return percentage
    duration_months = Column(Integer)  # Project duration in months
    risk_level = Column(String(20), default="medium")  # low, medium, high
    status = Column(String(20), default="active")  # active, completed, paused
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Project details
    location = Column(String(200))
    images = Column(JSON)  # Array of image URLs
    features = Column(JSON)  # Array of project features
    financial_details = Column(JSON)  # Financial breakdown
    
    # SEO and display
    slug = Column(String(200), unique=True)
    meta_title = Column(String(200))
    meta_description = Column(String(500))
    
    # Relationships
    investments = relationship("Investment", back_populates="project")
    
    def to_dict(self):
        progress = (self.raised_amount / self.target_amount * 100) if self.target_amount > 0 else 0
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "short_description": self.short_description,
            "category": self.category,
            "target_amount": self.target_amount,
            "raised_amount": self.raised_amount,
            "progress": min(progress, 100),
            "min_investment": self.min_investment,
            "expected_return": self.expected_return,
            "duration_months": self.duration_months,
            "risk_level": self.risk_level,
            "status": self.status,
            "location": self.location,
            "images": self.images or [],
            "features": self.features or [],
            "financial_details": self.financial_details or {},
            "slug": self.slug,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="pending")  # pending, confirmed, cancelled, completed
    payment_method = Column(String(50))
    transaction_id = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="investments")
    project = relationship("Project", back_populates="investments")
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "project_id": self.project_id,
            "project_title": self.project.title if self.project else None,
            "amount": self.amount,
            "status": self.status,
            "payment_method": self.payment_method,
            "transaction_id": self.transaction_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "confirmed_at": self.confirmed_at.isoformat() if self.confirmed_at else None
        }

class ChatLog(Base):
    __tablename__ = "chat_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_phone = Column(String(15))  # Phone number for identification
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    message = Column(Text, nullable=False)
    response = Column(Text)
    message_type = Column(String(20), default="user")  # user, assistant, complete
    session_id = Column(String(100))  # For grouping conversations
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "user_phone": self.user_phone,
            "user_id": self.user_id,
            "message": self.message,
            "response": self.response,
            "message_type": self.message_type,
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), default="admin")  # admin, moderator
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "is_active": self.is_active,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class SiteSettings(Base):
    __tablename__ = "site_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text)
    value_type = Column(String(20), default="string")  # string, number, boolean, json
    description = Column(String(500))
    category = Column(String(50), default="general")
    is_public = Column(Boolean, default=False)  # Whether to expose in public API
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "key": self.key,
            "value": self.value,
            "value_type": self.value_type,
            "description": self.description,
            "category": self.category,
            "is_public": self.is_public,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
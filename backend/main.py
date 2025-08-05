# main.py - invest.exonvc.ir Backend
import os
os.makedirs("/app/data", exist_ok=True)

import json
import hashlib
import time
import httpx
import random
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, WebSocket, HTTPException, Depends, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import jwt

from database import get_db, init_db
from models import User, Project, Investment, ChatLog
from auth import create_access_token, verify_token, send_otp_sms
from admin import router as admin_router

# Initialize FastAPI
app = FastAPI(title="ExonVC Investment Platform", version="1.0.0")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include admin router
app.include_router(admin_router, prefix="/api/admin")

# Initialize database
init_db()

# Constants
OPENAI_API_KEY = ""
KAVENEGAR_API_KEY = ""

# WebSocket connections
active_connections = {}
chat_memories = {}

# Load system prompt
def load_system_prompt():
    try:
        with open("system_prompt.txt", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return """شما ایجنت فارسی سرمایه‌گذاری ExonVC هستید. شما در مورد پروژه‌های سرمایه‌گذاری اکسون صحبت می‌کنید:
1. رستوران اکسون پلاس
2. کافه اکسون  
3. اکسون طلا
4. رستوران اکسون پلاس دبی

همیشه به زبان فارسی و با احترام پاسخ دهید."""

SYSTEM_PROMPT = load_system_prompt()

# Auth endpoints
@app.post("/api/auth/send-otp")
async def send_otp(phone: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """Send OTP to phone number"""
    try:
        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Check if user exists
        user = db.query(User).filter(User.phone == phone).first()
        if not user:
            user = User(phone=phone, otp_code=otp_code, otp_expires=datetime.utcnow() + timedelta(minutes=5))
            db.add(user)
        else:
            user.otp_code = otp_code
            user.otp_expires = datetime.utcnow() + timedelta(minutes=5)
        
        db.commit()
        
        # Send SMS via Kavenegar
        sms_sent = await send_otp_sms(phone, otp_code)
        
        if sms_sent:
            return {"message": "کد تایید ارسال شد", "success": True}
        else:
            return {"message": "خطا در ارسال پیامک", "success": False}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        
        # Clear OTP
        user.otp_code = None
        user.otp_expires = None
        user.is_verified = True
        user.last_login = datetime.utcnow()
        db.commit()
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "phone": user.phone,
                "full_name": user.full_name
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Public endpoints
@app.get("/api/projects")
async def get_projects(db: Session = Depends(get_db)):
    """Get all active projects"""
    projects = db.query(Project).filter(Project.is_active == True).all()
    return [project.to_dict() for project in projects]

@app.get("/api/projects/{project_id}")
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get single project details"""
    project = db.query(Project).filter(Project.id == project_id, Project.is_active == True).first()
    if not project:
        raise HTTPException(status_code=404, detail="پروژه پیدا نشد")
    return project.to_dict()

# Protected endpoints
security = HTTPBearer()

@app.get("/api/user/profile")
async def get_user_profile(token: str = Depends(security), db: Session = Depends(get_db)):
    """Get user profile"""
    payload = verify_token(token.credentials)
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
    
    return {
        "id": user.id,
        "phone": user.phone,
        "full_name": user.full_name,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    }

@app.put("/api/user/profile")
async def update_user_profile(
    full_name: Optional[str] = Body(None),
    email: Optional[str] = Body(None),
    token: str = Depends(security),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    payload = verify_token(token.credentials)
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="کاربر پیدا نشد")
    
    if full_name:
        user.full_name = full_name
    if email:
        user.email = email
    
    db.commit()
    return {"message": "پروفایل به‌روزرسانی شد"}

@app.post("/api/investments")
async def create_investment(
    project_id: int = Body(...),
    amount: float = Body(...),
    token: str = Depends(security),
    db: Session = Depends(get_db)
):
    """Create new investment"""
    payload = verify_token(token.credentials)
    user_id = payload["user_id"]
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id, Project.is_active == True).first()
    if not project:
        raise HTTPException(status_code=404, detail="پروژه پیدا نشد")
    
    # Create investment record
    investment = Investment(
        user_id=user_id,
        project_id=project_id,
        amount=amount,
        status="pending"
    )
    db.add(investment)
    db.commit()
    
    return {"message": "درخواست سرمایه‌گذاری ثبت شد", "investment_id": investment.id}

@app.get("/api/user/investments")
async def get_user_investments(token: str = Depends(security), db: Session = Depends(get_db)):
    """Get user investments"""
    payload = verify_token(token.credentials)
    user_id = payload["user_id"]
    
    investments = db.query(Investment).filter(Investment.user_id == user_id).all()
    return [inv.to_dict() for inv in investments]

# WebSocket for chat
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Get user info from query params or headers
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
            # Note: In real implementation, associate with authenticated user
            chat_log = ChatLog(
                user_phone="anonymous",  # Replace with actual user phone from auth
                message=user_message,
                response="",
                message_type="user"
            )
            
            # Prepare messages for OpenAI
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            messages.extend(chat_memories[client_id][-10:])  # Last 10 messages
            
            try:
                # Call OpenAI API
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
                        
                        # Add AI response to memory
                        chat_memories[client_id].append({"role": "assistant", "content": ai_response})
                        
                        # Send response
                        await websocket.send_text(ai_response)
                        
                        # Save complete conversation to database
                        from database import SessionLocal
                        db = SessionLocal()
                        try:
                            chat_log.response = ai_response
                            chat_log.message_type = "complete"
                            db.add(chat_log)
                            db.commit()
                        finally:
                            db.close()
                        
                    else:
                        await websocket.send_text("⚠️ خطا در پردازش پیام. لطفاً دوباره تلاش کنید.")
                        
            except Exception as e:
                await websocket.send_text(f"❌ خطا: {str(e)}")
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if client_id in active_connections:
            del active_connections[client_id]
        if client_id in chat_memories:
            del chat_memories[client_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8050)

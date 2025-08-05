# auth.py - Authentication utilities
import jwt
import httpx
from datetime import datetime, timedelta
from fastapi import HTTPException
from passlib.context import CryptContext

# JWT Configuration
SECRET_KEY = "exonvc-investment-platform-secret-key-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Kavenegar configuration
KAVENEGAR_API_KEY = "31596E2F363377376276647A6B515776516564706A373467477373453974486657744E6F6C3962544249633D"
KAVENEGAR_BASE_URL = "https://api.kavenegar.com/v1"

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="توکن نامعتبر")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="توکن منقضی شده")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر")

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

# قسمتی از auth.py که باید تغییر کنه

async def send_otp_sms(phone: str, otp_code: str) -> bool:
    """Send OTP via Kavenegar SMS service"""
    try:
        # Clean phone number (remove +98 if exists)
        phone = phone.replace("+98", "").replace("0", "", 1) if phone.startswith("0") else phone
        if not phone.startswith("98"):
            phone = "98" + phone
        
        # Kavenegar API endpoint
        url = f"{KAVENEGAR_BASE_URL}/{KAVENEGAR_API_KEY}/verify/lookup.json"
        
        # SMS template parameters
        data = {
            "receptor": phone,
            "token": otp_code,
            "template": "exonvc"  # این تمپلیت کار می‌کنه! ✅
        }
        
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, data=data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("return", {}).get("status") == 200:
                    print(f"✅ OTP sent successfully to {phone}")
                    return True
                else:
                    print(f"❌ Kavenegar error: {result}")
                    return False
            else:
                print(f"❌ HTTP error: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ SMS sending error: {e}")
        return False

# حذف یا کامنت کردن send_simple_sms چون کار نمی‌کنه
# async def send_simple_sms(phone: str, message: str) -> bool:
#     """این تابع با شماره فرستنده فعلی کار نمی‌کنه"""
#     pass

def create_admin_token(admin_data: dict) -> str:
    """Create JWT token for admin users"""
    data = admin_data.copy()
    data["is_admin"] = True
    return create_access_token(data)

def verify_admin_token(token: str):
    """Verify admin JWT token"""
    payload = verify_token(token)
    if not payload.get("is_admin"):
        raise HTTPException(status_code=403, detail="دسترسی ادمین مورد نیاز")
    return payload
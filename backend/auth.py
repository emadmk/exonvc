# auth.py - Authentication utilities
import jwt
import httpx  # ✅ این خط رو اضافه کن
from datetime import datetime, timedelta
from fastapi import HTTPException
from passlib.context import CryptContext

async def send_otp_sms(phone: str, otp_code: str) -> bool:
    """Send OTP via Kavenegar SMS service with ExonVC template - FIXED SCOPE"""
    
    # ✅ تعریف متغیرها داخل تابع
    KAVENEGAR_API_KEY = "31596E2F363377376276647A6B515776516564706A373467477373453974486657744E6F6C3962544249633D"
    KAVENEGAR_BASE_URL = "https://api.kavenegar.com/v1"
    
    if not KAVENEGAR_API_KEY:
        print(f"⚠️ SMS disabled - OTP for {phone}: {otp_code}")
        return True
        
    try:
        # ✅ درست Clean کردن شماره
        original_phone = phone
        
        # حذف فاصله و خط تیره
        clean_phone = phone.replace(" ", "").replace("-", "").replace("+98", "")
        
        # حذف صفر ابتدایی
        if clean_phone.startswith("0"):
            clean_phone = clean_phone[1:]  # حذف اولین کاراکتر
        
        # اضافه کردن کد کشور
        if not clean_phone.startswith("98"):
            clean_phone = "98" + clean_phone
        
        print(f"📱 Original phone: {original_phone}")
        print(f"📱 Cleaned phone: {clean_phone}")
        print(f"🔢 OTP Code: {otp_code}")
        print(f"📋 Using template: exonvc")
        
        # Kavenegar template endpoint
        url = f"{KAVENEGAR_BASE_URL}/{KAVENEGAR_API_KEY}/verify/lookup.json"
        
        # Template data
        data = {
            "receptor": clean_phone,
            "token": otp_code,
            "template": "exonvc"
        }
        
        print(f"🌐 API URL: {url}")
        print(f"📦 Sending data: {data}")
        
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, data=data)
            
            print(f"📊 HTTP Status: {response.status_code}")
            print(f"📄 Raw Response: {response.text}")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    api_status = result.get("return", {}).get("status")
                    api_message = result.get("return", {}).get("message", "")
                    
                    print(f"🔍 API Status: {api_status}")
                    print(f"💬 API Message: {api_message}")
                    
                    if api_status == 200:
                        print(f"✅ OTP sent successfully to {clean_phone}")
                        
                        # ✅ چک کردن entries برای messageid
                        entries = result.get("entries")
                        if entries:
                            print(f"📨 Message ID: {entries.get('messageid')}")
                            print(f"📤 SMS Status: {entries.get('statustext')}")
                        
                        return True
                    else:
                        print(f"❌ Kavenegar API Error {api_status}: {api_message}")
                        
                        # ✅ نمایش کدهای خطای معمول
                        error_codes = {
                            400: "پارامترهای ارسالی اشتباه",
                            401: "کلید API نامعتبر",
                            402: "اعتبار ناکافی", 
                            403: "دسترسی غیرمجاز",
                            404: "متد یافت نشد",
                            405: "متد غیرمجاز",
                            411: "گیرنده نامعتبر",
                            412: "فرستنده نامعتبر",
                            413: "پیام خالی",
                            414: "پیام طولانی",
                            415: "پارامتر نامعتبر",
                            416: "تاریخ نامعتبر",
                            417: "شناسه محلی تکراری",
                            418: "گیرنده خالی",
                            422: "داده نامعتبر"
                        }
                        
                        if api_status in error_codes:
                            print(f"💡 Error meaning: {error_codes[api_status]}")
                        
                        print(f"📋 Full response: {result}")
                        return False
                        
                except Exception as json_error:
                    print(f"❌ JSON parsing error: {json_error}")
                    print(f"📄 Response was: {response.text}")
                    return False
            else:
                print(f"❌ HTTP Error {response.status_code}")
                print(f"📄 Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ SMS sending exception: {type(e).__name__}: {e}")
        import traceback
        print("📋 Full traceback:")
        traceback.print_exc()
        return False
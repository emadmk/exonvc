import httpx
import asyncio

# از auth.py کپی کردم
KAVENEGAR_API_KEY = "31596E2F363377376276647A6B515776516564706A373467477373453974486657744E6F6C3962544249633D"

async def test_kavenegar():
    """تست مستقیم API کاوه نگار"""
    
    # 1. تست Simple SMS
    print("🔍 تست ارسال SMS ساده...")
    url = f"https://api.kavenegar.com/v1/{KAVENEGAR_API_KEY}/sms/send.json"
    
    data = {
        "receptor": "09123456789",  # شماره خودت رو بذار
        "message": "تست ExonVC",
        "sender": "10008663"  # شماره فرستنده از auth.py
    }
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, data=data)
            print(f"Status: {response.status_code}")
            result = response.json()
            print(f"Response: {result}")
            
            if response.status_code == 200:
                if result.get("return", {}).get("status") == 200:
                    print("✅ SMS ارسال شد!")
                else:
                    status = result.get("return", {}).get("status")
                    print(f"❌ خطا - کد: {status}")
                    
                    # معنی کدهای خطا
                    errors = {
                        400: "پارامترهای ارسالی اشتباه",
                        401: "حساب غیرفعال",
                        402: "عملیات ناموفق", 
                        403: "کد API اشتباه",
                        404: "متد نامعتبر",
                        405: "متد GET/POST اشتباه",
                        406: "IP غیرمجاز",
                        407: "امکان ارسال با لینک در متن وجود ندارد",
                        409: "سامانه در حال بروزرسانی",
                        411: "اعتبار کافی نیست",
                        412: "اشکال در ارسال، مدیر سامانه با شما تماس خواهد گرفت",
                        414: "حجم درخواست بیش از حد مجاز",
                        415: "اندیس پیام نامعتبر",
                        416: "تعرفه تایید نشده است",
                        417: "الگو یافت نشد - شماره ارسال از مخابرات مسدود شده", 
                        418: "تاریخ ارسال اشتباه",
                        419: "طول آرایه متن و موبایل و فرستنده هم اندازه نیست",
                        420: "استفاده از لینک در متن پیام برای شما محدود شده",
                        422: "داده ها به دلیل نامعتبر بودن قابل پردازش نیست",
                        424: "الگوی مورد نظر غیرفعال یا منقضی شده",
                        426: "استفاده از این متد نیازمند سرویس پیشرفته می‌باشد",
                        427: "استفاده از این خط نیازمند سرویس پیشرفته می‌باشد",
                        501: "فقط امکان ارسال پیام تست وجود دارد"
                    }
                    print(f"دلیل: {errors.get(status, 'خطای ناشناخته')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # 2. تست Verify Lookup (OTP) 
    print("🔍 تست ارسال OTP با تمپلیت 'exonvc'...")
    url = f"https://api.kavenegar.com/v1/{KAVENEGAR_API_KEY}/verify/lookup.json"
    
    data = {
        "receptor": "09132952622",  # شماره خودت
        "token": "123456",
        "template": "exonvc"  # تمپلیت که در کد استفاده شده
    }
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, data=data)
            print(f"Status: {response.status_code}")
            result = response.json()
            print(f"Response: {result}")
            
            if response.status_code == 200 and result.get("return", {}).get("status") != 200:
                status = result.get("return", {}).get("status")
                if status == 424:
                    print("❌ تمپلیت 'exonvc' وجود ندارد یا غیرفعال است!")
                    print("راه حل: وارد پنل کاوه نگار شوید و تمپلیت با نام 'exonvc' ایجاد کنید")
                elif status == 426:
                    print("❌ برای استفاده از verify lookup نیاز به سرویس پیشرفته دارید")
            
    except Exception as e:
        print(f"❌ Error: {e}")

# اجرا
if __name__ == "__main__":
    print("🚀 تست مستقیم کاوه نگار")
    print("="*50)
    asyncio.run(test_kavenegar())
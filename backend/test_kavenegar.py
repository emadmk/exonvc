async def send_otp_sms(phone: str, otp_code: str) -> bool:
    """Send OTP via Kavenegar SMS service - WITHOUT SENDER"""
    
    if not KAVENEGAR_API_KEY or KAVENEGAR_API_KEY == "":
        print(f"⚠️ SMS disabled - OTP for {phone}: {otp_code}")
        return True
    
    try:
        # Clean phone number
        clean_phone = phone.replace("+98", "").replace(" ", "").replace("-", "")
        if clean_phone.startswith("0"):
            clean_phone = clean_phone[1:]
        if not clean_phone.startswith("98"):
            clean_phone = "98" + clean_phone
        
        print(f"📱 Sending SMS to: {clean_phone}")
        
        # ارسال بدون شماره فرستنده
        url = f"{KAVENEGAR_BASE_URL}/{KAVENEGAR_API_KEY}/sms/send.json"
        
        message = f"کد تایید ExonVC: {otp_code}"
        
        data = {
            "receptor": clean_phone,
            "message": message
            # بدون sender - کاوه‌نگار خودش شماره پیش‌فرض رو استفاده می‌کنه
        }
        
        print(f"📦 Sending data: {data}")
        
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, data=data)
            
            print(f"📊 Status: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                status = result.get("return", {}).get("status")
                
                if status == 200:
                    print(f"✅ SMS sent successfully!")
                    return True
                else:
                    print(f"❌ API Error {status}: {result.get('return', {}).get('message', 'Unknown')}")
                    return False
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False
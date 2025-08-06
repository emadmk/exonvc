//frontend/src/pages/admin/index.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminIndex() {
  const router = useRouter()

  useEffect(() => {
    // بر اساس auth.py - بررسی JWT token
    const token = localStorage.getItem('admin_token')
    
    if (token) {
      try {
        // بررسی اعتبار token (در صورت نیاز می‌توان payload را decode کرد)
        // اما فعلاً فقط وجود token را چک می‌کنیم
        router.replace('/admin/dashboard')
      } catch (error) {
        // اگر token معتبر نبود
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        router.replace('/admin/login')
      }
    } else {
      // اگر token وجود ندارد
      router.replace('/admin/login')
    }
  }, [router])

  // صفحه loading در حین redirect
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">در حال بررسی دسترسی...</p>
      </div>
    </div>
  )
}
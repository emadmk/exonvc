//frontend/src/pages/admin/login.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // بر اساس main.py - endpoint: /api/admin/login
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // بر اساس admin.py - response structure
        localStorage.setItem('admin_token', data.access_token)
        localStorage.setItem('admin_user', JSON.stringify(data.admin))
        
        // انتقال به داشبورد
        router.push('/admin/dashboard')
      } else {
        // بر اساس FastAPI error format
        setError(data.detail || 'نام کاربری یا رمز عبور اشتباه است')
      }
    } catch (err) {
      setError('خطا در اتصال به سرور')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <Head>
        <title>ورود مدیریت - ExonVC</title>
        <meta name="robots" content="noindex" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-md w-full space-y-8">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center bg-blue-600 rounded-full shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              ورود به پنل مدیریت
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              پلتفرم سرمایه‌گذاری ExonVC
            </p>
          </div>
          
          {/* Login Form */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  نام کاربری
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="نام کاربری خود را وارد کنید"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  رمز عبور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-600 placeholder-gray-400 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-colors ${
                  loading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    در حال ورود...
                  </>
                ) : (
                  'ورود به پنل'
                )}
              </button>
            </form>
          </div>

          {/* Development Info */}
          <div className="text-center text-xs text-gray-500 bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 mb-2">اطلاعات پیش‌فرض (محیط توسعه):</p>
            <div className="flex justify-center gap-4 text-xs">
              <span>نام کاربری: <code className="text-green-400">admin</code></span>
              <span>رمز عبور: <code className="text-green-400">admin123</code></span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
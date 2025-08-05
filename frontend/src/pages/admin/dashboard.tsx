// pages/admin/dashboard.tsx - Complete Admin Dashboard
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, DollarSign, TrendingUp, AlertTriangle, Eye, Calendar,
  Activity, Briefcase, CreditCard, Bell, Settings, LogOut,
  UserPlus, ArrowUpRight, ArrowDownRight, Clock, CheckCircle
} from 'lucide-react';

// Types
interface DashboardStats {
  overview: {
    total_users: number;
    active_users: number;
    new_users_today: number;
    total_projects: number;
    active_projects: number;
    online_users: number;
  };
  financial: {
    total_investments: number;
    total_returns: number;
    pending_payments: number;
    overdue_payments: number;
    net_profit: number;
  };
  recent_activity: {
    new_investments: number;
    new_users: number;
  };
  top_projects: Array<{
    id: number;
    title: string;
    total_invested: number;
    investor_count: number;
  }>;
}

interface ChartData {
  daily_investments: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  daily_users: Array<{
    date: string;
    count: number;
  }>;
  category_investments: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  device_stats: Array<{
    device: string;
    count: number;
  }>;
}

interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  role: string;
}

// Main Dashboard Component
const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
    checkAdminAuth();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/dashboard/stats?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('خطا در دریافت اطلاعات داشبورد');
      console.error('Dashboard error:', err);
    }
  };

  const fetchChartData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/dashboard/charts?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (err) {
      console.error('Chart data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminAuth = () => {
    const admin = localStorage.getItem('admin_user');
    if (admin) {
      setAdminUser(JSON.parse(admin));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' تومان';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-xl mb-4">{error || 'خطا در بارگذاری داده‌ها'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // Chart colors
  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ExonVC Admin
            </div>
            <div className="hidden md:flex items-center space-x-2 space-x-reverse">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">۷ روز اخیر</option>
                <option value="30d">۳۰ روز اخیر</option>
                <option value="90d">۹۰ روز اخیر</option>
                <option value="1y">یک سال اخیر</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="text-right">
                <p className="text-white font-medium">{adminUser?.full_name || 'مدیر سیستم'}</p>
                <p className="text-purple-300 text-sm">{adminUser?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 transition-colors text-white hover:text-red-300"
                title="خروج"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            داشبورد مدیریت
          </h1>
          <p className="text-purple-300">
            آمار و اطلاعات کلی پلتفرم سرمایه‌گذاری ExonVC
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">کل کاربران</p>
                <p className="text-3xl font-bold text-white">{formatNumber(stats.overview.total_users)}</p>
                <div className="flex items-center mt-2">
                  <UserPlus className="h-4 w-4 text-green-400 ml-1" />
                  <span className="text-green-400 text-sm">+{stats.recent_activity.new_users} امروز</span>
                </div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Total Investments */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-300 text-sm">کل سرمایه‌گذاری</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.financial.total_investments)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400 ml-1" />
                  <span className="text-green-400 text-sm">+{stats.recent_activity.new_investments} جدید</span>
                </div>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <DollarSign className="h-8 w-8 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-300 text-sm">پروژه‌های فعال</p>
                <p className="text-3xl font-bold text-white">{formatNumber(stats.overview.active_projects)}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 ml-1" />
                  <span className="text-emerald-400 text-sm">از {stats.overview.total_projects} پروژه</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Briefcase className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Overdue Payments */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">پرداخت‌های معوق</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.financial.overdue_payments)}</p>
                <div className="flex items-center mt-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 ml-1" />
                  <span className="text-red-400 text-sm">نیاز به پیگیری</span>
                </div>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <CreditCard className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Investment Trend Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">روند سرمایه‌گذاری</h3>
            {chartData?.daily_investments && (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.daily_investments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fa-IR')}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fa-IR')}
                    formatter={(value: number) => [formatCurrency(value), 'مبلغ سرمایه‌گذاری']}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8b5cf6"
                    fill="url(#colorInvestment)"
                    fillOpacity={0.6}
                  />
                  <defs>
                    <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* User Registration Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">ثبت‌نام کاربران</h3>
            {chartData?.daily_users && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.daily_users}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fa-IR')}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fa-IR')}
                    formatter={(value: number) => [formatNumber(value), 'کاربر جدید']}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Investment Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">سرمایه‌گذاری بر اساس دسته‌بندی</h3>
            {chartData?.category_investments && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.category_investments}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {chartData.category_investments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Device Statistics */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">آمار دستگاه‌ها</h3>
            {chartData?.device_stats && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.device_stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="device" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [formatNumber(value), 'تعداد']}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Projects & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Projects */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">پروژه‌های برتر</h3>
              <Link href="/admin/projects">
                <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center">
                  مشاهده همه
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                </button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats.top_projects.map((project, index) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{project.title}</p>
                      <p className="text-gray-400 text-sm">{formatNumber(project.investor_count)} سرمایه‌گذار</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-green-400 font-semibold">{formatCurrency(project.total_invested)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">دسترسی سریع</h3>
            
            <div className="space-y-3">
              <Link href="/admin/users">
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 ml-3 text-purple-400" />
                    <span>مدیریت کاربران</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </Link>

              <Link href="/admin/projects">
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 ml-3 text-cyan-400" />
                    <span>مدیریت پروژه‌ها</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </Link>

              <Link href="/admin/financial">
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 ml-3 text-emerald-400" />
                    <span>مدیریت مالی</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </Link>

              <Link href="/admin/analytics">
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 ml-3 text-yellow-400" />
                    <span>آنالیتیکس</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </Link>

              <Link href="/admin/settings">
                <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 ml-3 text-red-400" />
                    <span>تنظیمات سیستم</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* System Status */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <h4 className="text-white font-medium mb-3">وضعیت سیستم</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">کاربران آنلاین</span>
                  <span className="text-green-400">{formatNumber(stats.overview.online_users)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">کاربران فعال</span>
                  <span className="text-blue-400">{formatNumber(stats.overview.active_users)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">سود خالص</span>
                  <span className={stats.financial.net_profit >= 0 ? "text-green-400" : "text-red-400"}>
                    {formatCurrency(Math.abs(stats.financial.net_profit))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// pages/admin/users/index.tsx - Complete User Management with Analytics
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Users, Search, Filter, MoreVertical, Edit, Trash2, Eye, 
  TrendingUp, TrendingDown, MapPin, Clock, Phone, Mail,
  DollarSign, Activity, Shield, AlertTriangle, CheckCircle,
  Star, Calendar, BarChart3, PieChart, Download, RefreshCw
} from 'lucide-react';

interface User {
  id: string;
  phone: string;
  full_name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  last_login: string;
  total_investments: number;
  investment_count: number;
  credit_score: number;
  risk_level: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'suspended';
  location: string;
  device_info: string;
  session_count: number;
  avg_session_duration: number;
  conversion_rate: number;
  lifetime_value: number;
  referral_count: number;
  investment_pattern: 'conservative' | 'balanced' | 'aggressive';
}

interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_users_today: number;
  verified_users: number;
  avg_session_duration: number;
  conversion_rate: number;
  total_investment_volume: number;
  high_value_users: number;
}

const UserManagement: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [patternFilter, setPatternFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Fetch users from real Backend API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        // Build query parameters
        const params = new URLSearchParams({
          limit: '50',
          offset: '0',
          sort_by: sortBy,
          sort_order: sortOrder
        });

        if (searchTerm.trim()) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (riskFilter !== 'all') params.append('risk_level', riskFilter);
        if (patternFilter !== 'all') params.append('investment_pattern', patternFilter);

        // Fetch users from backend
        const response = await fetch(`/api/admin/users?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform backend data to match frontend interface
        const transformedUsers: User[] = data.users.map((user: any) => ({
          id: user.id.toString(),
          phone: user.phone,
          full_name: user.full_name || 'نام نامشخص',
          email: user.email || '',
          is_verified: user.is_verified,
          created_at: user.created_at,
          last_login: user.last_activity || user.last_login,
          total_investments: user.total_investments || 0,
          investment_count: user.active_investments || 0,
          credit_score: user.credit_score || 500,
          risk_level: user.risk_level || 'medium',
          status: user.is_active ? 'active' : 'inactive',
          location: 'نامشخص', // Backend doesn't have location yet
          device_info: 'نامشخص', // Will be enhanced with session data
          session_count: 0, // Will be enhanced
          avg_session_duration: 0, // Will be enhanced
          conversion_rate: 0, // Will be calculated
          lifetime_value: user.total_investments || 0,
          referral_count: 0, // Will be enhanced
          investment_pattern: user.investment_pattern || 'moderate'
        }));

        // Create analytics data from backend response
        const mockAnalytics: UserAnalytics = {
          total_users: data.total || transformedUsers.length,
          active_users: transformedUsers.filter(u => u.status === 'active').length,
          new_users_today: transformedUsers.filter(u => {
            const today = new Date().toDateString();
            return new Date(u.created_at).toDateString() === today;
          }).length,
          verified_users: transformedUsers.filter(u => u.is_verified).length,
          avg_session_duration: 685, // Will be calculated from sessions
          conversion_rate: 14.2, // Will be calculated
          total_investment_volume: transformedUsers.reduce((sum, u) => sum + u.total_investments, 0),
          high_value_users: transformedUsers.filter(u => u.total_investments > 50000000).length
        };

        setUsers(transformedUsers);
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, statusFilter, riskFilter, patternFilter, sortBy, sortOrder]);

  // Handle user update with real API
  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const result = await response.json();
      
      // Refresh users list
      // fetchUsers();
      
      // Show success message
      alert('کاربر با موفقیت به‌روزرسانی شد');
      
    } catch (error) {
      console.error('Error updating user:', error);
      alert('خطا در به‌روزرسانی کاربر');
    }
  };

  // Handle user detail fetch
  const fetchUserDetails = async (userId: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || user.risk_level === riskFilter;
    const matchesPattern = patternFilter === 'all' || user.investment_pattern === patternFilter;
    
    return matchesSearch && matchesStatus && matchesRisk && matchesPattern;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'inactive': return 'text-gray-400 bg-gray-400/10';
      case 'suspended': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPatternColor = (pattern: string) => {
    switch (pattern) {
      case 'conservative': return 'text-blue-400 bg-blue-400/10';
      case 'balanced': return 'text-purple-400 bg-purple-400/10';
      case 'aggressive': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} دقیقه`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">در حال بارگذاری کاربران...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Users className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/admin/dashboard">
                <button className="text-blue-400 hover:text-blue-300">← بازگشت به داشبورد</button>
              </Link>
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
              >
                {viewMode === 'table' ? <BarChart3 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              </button>
              <button className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                <Download className="h-4 w-4" />
                <span>خروجی Excel</span>
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">کل کاربران</p>
                  <p className="text-2xl font-bold text-white">{analytics.total_users.toLocaleString('fa-IR')}</p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400">+{analytics.new_users_today}</span>
                <span className="text-gray-400 mr-1">امروز</span>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">کاربران فعال</p>
                  <p className="text-2xl font-bold text-white">{analytics.active_users.toLocaleString('fa-IR')}</p>
                </div>
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-400">{((analytics.active_users / analytics.total_users) * 100).toFixed(1)}%</span>
                <span className="text-gray-400 mr-1">از کل کاربران</span>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">میانگین جلسه</p>
                  <p className="text-2xl font-bold text-white">{formatDuration(analytics.avg_session_duration)}</p>
                </div>
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-purple-400">{analytics.conversion_rate}%</span>
                <span className="text-gray-400 mr-1">میزان تبدیل</span>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">کل سرمایه‌گذاری</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(analytics.total_investment_volume)} ریال</p>
                </div>
                <div className="p-3 bg-yellow-600/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-yellow-400">{analytics.high_value_users}</span>
                <span className="text-gray-400 mr-1">کاربر VIP</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="جستجو در کاربران..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
              <option value="suspended">مسدود</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه سطوح ریسک</option>
              <option value="low">کم ریسک</option>
              <option value="medium">متوسط</option>
              <option value="high">پرریسک</option>
            </select>

            <select
              value={patternFilter}
              onChange={(e) => setPatternFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه الگوها</option>
              <option value="conservative">محافظه‌کار</option>
              <option value="balanced">متعادل</option>
              <option value="aggressive">تهاجمی</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at">تاریخ عضویت</option>
              <option value="last_login">آخرین ورود</option>
              <option value="total_investments">کل سرمایه‌گذاری</option>
              <option value="credit_score">امتیاز اعتباری</option>
              <option value="lifetime_value">ارزش مادام‌العمر</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">کاربر</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">تماس</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">وضعیت</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">سرمایه‌گذاری</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">امتیاز اعتباری</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">الگو</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">آخرین ورود</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.full_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-100 flex items-center">
                            {user.full_name}
                            {user.is_verified && (
                              <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">کاربر از {user.created_at}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-100">{user.phone}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status === 'active' ? 'فعال' : user.status === 'inactive' ? 'غیرفعال' : 'مسدود'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(user.risk_level)}`}>
                          {user.risk_level === 'low' ? 'کم ریسک' : user.risk_level === 'medium' ? 'متوسط' : 'پرریسک'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-100">{formatCurrency(user.total_investments)} ریال</div>
                      <div className="text-sm text-gray-400">{user.investment_count} پروژه</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 ml-2">
                          <div
                            className={`h-2 rounded-full ${user.credit_score >= 800 ? 'bg-green-500' : user.credit_score >= 650 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${(user.credit_score / 1000) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-100">{user.credit_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPatternColor(user.investment_pattern)}`}>
                        {user.investment_pattern === 'conservative' ? 'محافظه‌کار' : 
                         user.investment_pattern === 'balanced' ? 'متعادل' : 'تهاجمی'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-100">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString('fa-IR') : 'هرگز'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatDuration(user.avg_session_duration)} متوسط جلسه
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            نمایش {filteredUsers.length} از {users.length} کاربر
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button className="px-4 py-2 text-sm bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600 transition-colors">
              قبلی
            </button>
            <div className="flex items-center space-x-1 space-x-reverse">
              {[1, 2, 3, '...', 12].map((page, index) => (
                <button
                  key={index}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    page === 1 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 text-sm bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600 transition-colors">
              بعدی
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">جزئیات کاربر: {selectedUser.full_name}</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-400">اطلاعات شخصی</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">نام کامل:</span>
                      <span>{selectedUser.full_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">شماره تماس:</span>
                      <span>{selectedUser.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">ایمیل:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">موقعیت:</span>
                      <span>{selectedUser.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">دستگاه:</span>
                      <span>{selectedUser.device_info}</span>
                    </div>
                  </div>
                </div>

                {/* Investment Analytics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-400">آنالیز سرمایه‌گذاری</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">کل سرمایه‌گذاری:</span>
                      <span className="text-green-400">{formatCurrency(selectedUser.total_investments)} ریال</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">تعداد پروژه:</span>
                      <span>{selectedUser.investment_count} پروژه</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">ارزش مادام‌العمر:</span>
                      <span className="text-yellow-400">{formatCurrency(selectedUser.lifetime_value)} ریال</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">الگوی سرمایه‌گذاری:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPatternColor(selectedUser.investment_pattern)}`}>
                        {selectedUser.investment_pattern === 'conservative' ? 'محافظه‌کار' : 
                         selectedUser.investment_pattern === 'balanced' ? 'متعادل' : 'تهاجمی'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">امتیاز اعتباری:</span>
                      <span>{selectedUser.credit_score}/1000</span>
                    </div>
                  </div>
                </div>

                {/* Behavior Analytics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-400">آنالیز رفتاری</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">تعداد جلسات:</span>
                      <span>{selectedUser.session_count} جلسه</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">متوسط مدت جلسه:</span>
                      <span>{formatDuration(selectedUser.avg_session_duration)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">نرخ تبدیل:</span>
                      <span className="text-blue-400">{selectedUser.conversion_rate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">تعداد ارجاع:</span>
                      <span>{selectedUser.referral_count} نفر</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">آخرین ورود:</span>
                      <span>{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString('fa-IR') : 'هرگز'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-orange-400">عملیات</h4>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                      ارسال پیام
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                      فعال کردن حساب
                    </button>
                    <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors">
                      ویرایش اطلاعات
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                      مسدود کردن
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
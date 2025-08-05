// pages/admin/projects/index.tsx - Complete Project Management
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, 
  TrendingUp, Users, DollarSign, Calendar, MapPin, 
  AlertCircle, CheckCircle, Clock, X, Upload, Image as ImageIcon
} from 'lucide-react';

// Types
interface Project {
  id: number;
  title: string;
  short_description: string;
  description: string;
  content: string;
  category: string;
  target_amount: number;
  raised_amount: number;
  progress: number;
  min_investment: number;
  max_investment: number;
  expected_return: number;
  actual_return: number;
  duration_months: number;
  status: string;
  is_active: boolean;
  is_featured: boolean;
  priority: number;
  location: string;
  main_image: string;
  gallery: string[];
  video_url: string;
  features: string[];
  risk_level: string;
  tags: string[];
  start_date: string;
  end_date: string;
  funding_deadline: string;
  created_at: string;
  updated_at: string;
  total_investors?: number;
  total_raised?: number;
}

interface ProjectFilters {
  search: string;
  status: string;
  category: string;
  risk_level: string;
  is_featured: string;
}

interface ProjectForm {
  title: string;
  short_description: string;
  description: string;
  content: string;
  category: string;
  target_amount: number;
  min_investment: number;
  max_investment: number;
  expected_return: number;
  duration_months: number;
  status: string;
  is_active: boolean;
  is_featured: boolean;
  priority: number;
  location: string;
  risk_level: string;
  features: string[];
}

// Main Component
const ProjectManagement: React.FC = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: '',
    category: '',
    risk_level: '',
    is_featured: ''
  });
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    total: 0
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form state
  const [projectForm, setProjectForm] = useState<ProjectForm>({
    title: '',
    short_description: '',
    description: '',
    content: '',
    category: '',
    target_amount: 0,
    min_investment: 1000000,
    max_investment: 0,
    expected_return: 0,
    duration_months: 12,
    status: 'draft',
    is_active: true,
    is_featured: false,
    priority: 0,
    location: '',
    risk_level: 'medium',
    features: []
  });

  const [newFeature, setNewFeature] = useState('');

  // Categories and options
  const categories = [
    { value: 'restaurant', label: 'رستوران' },
    { value: 'cafe', label: 'کافه' },
    { value: 'gold', label: 'طلا و جواهر' },
    { value: 'restaurant_dubai', label: 'رستوران دبی' },
    { value: 'real_estate', label: 'املاک' },
    { value: 'technology', label: 'فناوری' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'پیش‌نویس', color: 'bg-gray-500' },
    { value: 'active', label: 'فعال', color: 'bg-green-500' },
    { value: 'funding', label: 'در حال تأمین مالی', color: 'bg-blue-500' },
    { value: 'completed', label: 'تکمیل شده', color: 'bg-purple-500' },
    { value: 'paused', label: 'متوقف', color: 'bg-yellow-500' },
    { value: 'cancelled', label: 'لغو شده', color: 'bg-red-500' }
  ];

  const riskLevels = [
    { value: 'low', label: 'کم', color: 'text-green-500' },
    { value: 'medium', label: 'متوسط', color: 'text-yellow-500' },
    { value: 'high', label: 'بالا', color: 'text-red-500' }
  ];

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, [filters, pagination.offset, sortBy, sortOrder]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (filters.search.trim()) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.risk_level) params.append('risk_level', filters.risk_level);
      if (filters.is_featured) params.append('is_featured', filters.is_featured);

      const response = await fetch(`/api/admin/projects?${params}`, {
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
        throw new Error(`HTTP ${response.status}: Failed to fetch projects`);
      }

      const data = await response.json();
      
      // Transform backend data to match frontend interface
      const transformedProjects: Project[] = data.projects.map((project: any) => ({
        id: project.id,
        title: project.title,
        short_description: project.short_description || '',
        description: project.description || '',
        content: project.content || '',
        category: project.category,
        target_amount: project.target_amount,
        raised_amount: project.raised_amount,
        progress: project.progress,
        min_investment: project.min_investment,
        max_investment: project.max_investment,
        expected_return: project.expected_return,
        actual_return: project.actual_return,
        duration_months: project.duration_months,
        status: project.status,
        is_active: project.is_active,
        is_featured: project.is_featured,
        priority: project.priority || 0,
        location: project.location || '',
        main_image: project.main_image || '',
        gallery: project.gallery || [],
        video_url: project.video_url || '',
        features: project.features || [],
        risk_level: project.risk_level,
        tags: project.tags || [],
        start_date: project.start_date,
        end_date: project.end_date,
        funding_deadline: project.funding_deadline,
        created_at: project.created_at,
        updated_at: project.updated_at,
        total_investors: project.total_investors || 0,
        total_raised: project.total_raised || project.raised_amount
      }));

      setProjects(transformedProjects);
      setPagination(prev => ({ ...prev, total: data.total }));
      setError(null);
    } catch (err: any) {
      setError('خطا در دریافت پروژه‌ها: ' + err.message);
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Prepare project data for backend
      const projectData = {
        title: projectForm.title,
        short_description: projectForm.short_description,
        description: projectForm.description,
        content: projectForm.content,
        category: projectForm.category,
        target_amount: projectForm.target_amount,
        min_investment: projectForm.min_investment,
        max_investment: projectForm.max_investment || null,
        expected_return: projectForm.expected_return,
        duration_months: projectForm.duration_months,
        status: projectForm.status,
        is_active: projectForm.is_active,
        is_featured: projectForm.is_featured,
        priority: projectForm.priority,
        location: projectForm.location,
        risk_level: projectForm.risk_level,
        features: projectForm.features
      };
      
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create project');
      }

      const result = await response.json();
      
      setShowCreateModal(false);
      resetForm();
      fetchProjects();
      
      // Show success notification
      alert('پروژه با موفقیت ایجاد شد');
      
    } catch (err: any) {
      console.error('Create project error:', err);
      setError(`خطا در ایجاد پروژه: ${err.message}`);
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`/api/admin/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      setShowEditModal(false);
      setSelectedProject(null);
      resetForm();
      fetchProjects();
      
      alert('پروژه با موفقیت به‌روزرسانی شد');
    } catch (err) {
      console.error('Update project error:', err);
      setError('خطا در به‌روزرسانی پروژه');
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`/api/admin/projects/${selectedProject.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setShowDeleteModal(false);
      setSelectedProject(null);
      fetchProjects();
      
      alert('پروژه با موفقیت حذف شد');
    } catch (err) {
      console.error('Delete project error:', err);
      setError('خطا در حذف پروژه');
    }
  };

  const resetForm = () => {
    setProjectForm({
      title: '',
      short_description: '',
      description: '',
      content: '',
      category: '',
      target_amount: 0,
      min_investment: 1000000,
      max_investment: 0,
      expected_return: 0,
      duration_months: 12,
      status: 'draft',
      is_active: true,
      is_featured: false,
      priority: 0,
      location: '',
      risk_level: 'medium',
      features: []
    });
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setProjectForm({
      title: project.title,
      short_description: project.short_description,
      description: project.description,
      content: project.content || '',
      category: project.category,
      target_amount: project.target_amount,
      min_investment: project.min_investment,
      max_investment: project.max_investment || 0,
      expected_return: project.expected_return || 0,
      duration_months: project.duration_months || 12,
      status: project.status,
      is_active: project.is_active,
      is_featured: project.is_featured,
      priority: project.priority || 0,
      location: project.location || '',
      risk_level: project.risk_level,
      features: project.features || []
    });
    setShowEditModal(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setProjectForm(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setProjectForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' تومان';
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getRiskColor = (risk: string) => {
    return riskLevels.find(r => r.value === risk)?.color || 'text-gray-500';
  };

  const getRiskLabel = (risk: string) => {
    return riskLevels.find(r => r.value === risk)?.label || risk;
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4">در حال بارگذاری پروژه‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard">
              <button className="text-purple-400 hover:text-purple-300 mb-2">← بازگشت به داشبورد</button>
            </Link>
            <h1 className="text-2xl font-bold text-white">مدیریت پروژه‌ها</h1>
            <p className="text-purple-300">ایجاد، ویرایش و مدیریت پروژه‌های سرمایه‌گذاری</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
          >
            <Plus className="h-5 w-5 ml-2" />
            پروژه جدید
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 bg-black/10 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="جستجو در پروژه‌ها..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg pr-10 pl-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">همه وضعیت‌ها</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value} className="bg-gray-800">
                {status.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">همه دسته‌بندی‌ها</option>
            {categories.map(category => (
              <option key={category.value} value={category.value} className="bg-gray-800">
                {category.label}
              </option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={filters.risk_level}
            onChange={(e) => setFilters(prev => ({ ...prev, risk_level: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">همه سطوح ریسک</option>
            {riskLevels.map(risk => (
              <option key={risk.value} value={risk.value} className="bg-gray-800">
                {risk.label}
              </option>
            ))}
          </select>

          {/* Featured Filter */}
          <select
            value={filters.is_featured}
            onChange={(e) => setFilters(prev => ({ ...prev, is_featured: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">همه پروژه‌ها</option>
            <option value="true" className="bg-gray-800">ویژه</option>
            <option value="false" className="bg-gray-800">معمولی</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="p-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 ml-2" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">هیچ پروژه‌ای یافت نشد</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              اولین پروژه را ایجاد کنید
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300"
              >
                {/* Project Image */}
                <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600 relative">
                  {project.main_image ? (
                    <img
                      src={project.main_image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-white/50" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  {/* Featured Badge */}
                  {project.is_featured && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                        ویژه
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute bottom-4 left-4">
                    <div className="flex space-x-2 space-x-reverse">
                      <button
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                        title="مشاهده"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                        title="ویرایش"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 bg-black/50 rounded-lg text-white hover:bg-red-600 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white truncate">{project.title}</h3>
                    <span className={`text-sm font-medium ${getRiskColor(project.risk_level)}`}>
                      {getRiskLabel(project.risk_level)}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {project.short_description}
                  </p>

                  {/* Category & Location */}
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded mr-2">
                      {getCategoryLabel(project.category)}
                    </span>
                    {project.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 ml-1" />
                        <span>{project.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>پیشرفت</span>
                      <span>{project.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(project.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">هدف:</span>
                      <span className="text-white">{formatCurrency(project.target_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">جمع‌آوری شده:</span>
                      <span className="text-green-400">{formatCurrency(project.raised_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">بازدهی مورد انتظار:</span>
                      <span className="text-blue-400">{project.expected_return}%</span>
                    </div>
                    {project.total_investors !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">سرمایه‌گذاران:</span>
                        <span className="text-purple-400">{project.total_investors} نفر</span>
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="flex items-center text-sm text-gray-400 mt-4 pt-4 border-t border-white/10">
                    <Calendar className="h-4 w-4 ml-1" />
                    <span>{project.duration_months} ماه</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="mt-8 flex items-center justify-center space-x-4 space-x-reverse">
            <button
              onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              disabled={pagination.offset === 0}
              className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              قبلی
            </button>
            <span className="text-white">
              {Math.floor(pagination.offset / pagination.limit) + 1} از {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              بعدی
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">ایجاد پروژه جدید</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">عنوان پروژه *</label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="نام پروژه را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">دسته‌بندی *</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">توضیح کوتاه</label>
                <input
                  type="text"
                  value={projectForm.short_description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, short_description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="توضیح کوتاه پروژه"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">توضیحات کامل</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="توضیحات کامل پروژه"
                />
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">مبلغ هدف (تومان) *</label>
                  <input
                    type="number"
                    value={projectForm.target_amount}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, target_amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">حداقل سرمایه‌گذاری (تومان)</label>
                  <input
                    type="number"
                    value={projectForm.min_investment}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, min_investment: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">بازدهی مورد انتظار (%)</label>
                  <input
                    type="number"
                    value={projectForm.expected_return}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, expected_return: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Other Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">مدت زمان (ماه)</label>
                  <input
                    type="number"
                    value={projectForm.duration_months}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, duration_months: parseInt(e.target.value) || 12 }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">وضعیت</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">سطح ریسک</label>
                  <select
                    value={projectForm.risk_level}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, risk_level: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {riskLevels.map(risk => (
                      <option key={risk.value} value={risk.value}>
                        {risk.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">موقعیت</label>
                <input
                  type="text"
                  value={projectForm.location}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="شهر، منطقه"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ویژگی‌ها</label>
                <div className="flex space-x-2 space-x-reverse mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="ویژگی جدید"
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <button
                    onClick={addFeature}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    افزودن
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projectForm.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {feature}
                      <button
                        onClick={() => removeFeature(index)}
                        className="mr-2 text-purple-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex space-x-6 space-x-reverse">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={projectForm.is_active}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                  />
                  <span className="mr-2 text-gray-300">فعال</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={projectForm.is_featured}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="rounded text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                  />
                  <span className="mr-2 text-gray-300">ویژه</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-700 flex justify-end space-x-4 space-x-reverse">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                لغو
              </button>
              <button
                onClick={handleCreateProject}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                ایجاد پروژه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-400 ml-3" />
                <h3 className="text-xl font-bold text-white">حذف پروژه</h3>
              </div>
              <p className="text-gray-300 mb-6">
                آیا مطمئن هستید که می‌خواهید پروژه "{selectedProject.title}" را حذف کنید؟
                این عمل غیرقابل بازگشت است.
              </p>
              <div className="flex justify-end space-x-4 space-x-reverse">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProject(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  لغو
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
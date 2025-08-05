console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL);
const API_BASE_URL = 'https://invest.exonvc.ir';
// utils/api.js - API Configuration and Functions


// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'خطا در ارتباط با سرور');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API functions
export const authAPI = {
  // ارسال کد تایید
  sendOTP: async (phone) => {
    return apiCall('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  // تایید کد و دریافت توکن
  verifyOTP: async (phone, otp) => {
    return apiCall('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  },

  // دریافت اطلاعات کاربر
  getProfile: async (token) => {
    return apiCall('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // آپدیت پروفایل
  updateProfile: async (token, data) => {
    return apiCall('/api/user/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
};

// Projects API
export const projectsAPI = {
  // لیست پروژه‌ها
  getProjects: async () => {
    return apiCall('/api/projects');
  },

  // جزئیات پروژه
  getProject: async (id) => {
    return apiCall(`/api/projects/${id}`);
  },
};

// Investments API
export const investmentsAPI = {
  // ایجاد سرمایه‌گذاری
  createInvestment: async (token, projectId, amount) => {
    return apiCall('/api/investments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: projectId, amount }),
    });
  },

  // لیست سرمایه‌گذاری‌های کاربر
  getUserInvestments: async (token) => {
    return apiCall('/api/user/investments', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default apiCall;

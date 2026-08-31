import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPage = window.location.pathname.startsWith("/auth/");
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest && !isAuthPage) {
      // Clear auth and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    if (file) formData.append("profilePicture", file);
    return api.post("/auth/register", formData);
  },
  login: (email, password) => api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/auth/reset-password", { token, password }),
  updateProfile: (data) => api.put("/auth/profile", data)
};

// Member endpoints
export const memberAPI = {
  getProfile: () => api.get("/members/profile"),
  getMemberById: (id) => api.get(`/members/${id}`),
  listMembers: (params) => api.get("/members", { params }),
  searchMembers: (q, limit) => api.get("/members/search/query", { params: { q, limit } }),
  updateMember: (id, data, file) => {
    if (!file) return api.put(`/members/${id}`, data);

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    formData.append("profilePicture", file);
    return api.put(`/members/${id}`, formData);
  },
  updateProfile: (data, file) => {
    if (!file) return api.put("/members/profile", data);

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    formData.append("profilePicture", file);
    return api.put("/members/profile", formData);
  },
  deleteMember: (id) => api.delete(`/members/${id}`),
  getMemberStats: (id) => api.get(`/members/${id}/stats`),
  getStats: (id) => api.get(`/members/${id}/stats`)
};

// Payment endpoints
export const paymentAPI = {
  recordPayment: (data) => api.post("/payments", data),
  getMySummary: () => api.get("/payments/me/summary"),
  getMyHistory: (params) => api.get("/payments/me/history", { params }),
  simulatePayment: (data) => api.post("/payments/me/simulate", data),
  listPayments: (params) => api.get("/payments", { params }),
  getPaymentHistory: (memberId, params) => api.get(`/payments/${memberId}/history`, { params }),
  getMemberBalance: (memberId) => api.get(`/payments/${memberId}/balance`),
  getPaymentReceipt: (receiptNumber) => api.get(`/payments/receipt/${receiptNumber}`),
  updatePaymentStatus: (id, status) => api.patch(`/payments/${id}/status`, { status })
};

// Attendance endpoints
export const attendanceAPI = {
  checkIn: (data) => api.post("/attendance/check-in", data),
  recordAttendance: (data) => api.post("/attendance/record", data),
  getAttendanceHistory: (memberId, params) => api.get(`/attendance/${memberId}/history`, { params }),
  getAttendanceStats: (memberId, params) => api.get(`/attendance/${memberId}/stats`, { params }),
  getStats: (memberId, params) => api.get(`/attendance/${memberId}/stats`, { params }),
  generateReport: (params) => api.get("/attendance/report", { params }),
  getReport: (params) => api.get("/attendance/report", { params })
};

// Approval endpoints
export const approvalAPI = {
  getPendingApprovals: (params) => api.get("/approvals", { params }),
  getPending: (params) => api.get("/approvals", { params }),
  approveMember: (id, data) => api.post(`/approvals/${id}/approve`, data),
  rejectMember: (id, data) => api.post(`/approvals/${id}/reject`, data),
  requestCorrection: (id, data) => api.post(`/approvals/${id}/correct`, {
    requiredCorrections: data?.requiredCorrections || data?.reason || data
  }),
  getStats: () => api.get("/approvals/stats")
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getMemberStats: () => api.get("/admin/members/stats"),
  getFinancialStats: (year) => api.get("/admin/financial-stats", { params: { year } }),
  getAuditLogs: (params) => api.get("/admin/audit-logs", { params }),
  exportMembers: () => api.get("/admin/export/members", { responseType: "blob" })
};

// Notification endpoints
export const notificationAPI = {
  getNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// ID Card endpoints
export const idCardAPI = {
  getMyCard: () => api.get("/id-card/my-card"),
  generateCard: (memberId) => api.get(`/id-card/${memberId}/generate`),
  downloadCard: (memberId) => api.get(`/id-card/${memberId}/download`),
  verifyCard: (choirId) => api.get(`/id-card/verify/${choirId}`)
};

// Public endpoints
export const publicAPI = {
  getEvents: (params) => api.get("/public/events", { params }),
  getUpcomingEvents: () => api.get("/public/events/upcoming"),
  getEventById: (id) => api.get(`/public/events/${id}`),
  getGallery: (params) => api.get("/public/gallery", { params }),
  getBlog: (params) => api.get("/public/blog", { params }),
  getBlogPost: (slug) => api.get(`/public/blog/${slug}`),
  getAnnouncements: (limit) => api.get("/public/announcements", { params: { limit } }),
  getExecutives: () => api.get("/public/executives"),
  submitContact: (data) => api.post("/public/contact", data),
  getChurchInfo: () => api.get("/public/church-info")
};

export default api;

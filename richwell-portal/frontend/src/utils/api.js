// frontend/src/utils/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service methods
export const apiService = {
  // Generic HTTP methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),

  // Health check
  healthCheck: () => api.get('/health'),

  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  setupPassword: (data) => api.post('/auth/setup-password', data),

  // Students endpoints (Phase 3)
  getStudents: () => api.get('/students'),
  getStudent: (id) => api.get(`/students/${id}`),
  createStudent: (data) => api.post('/students', data),
  updateStudent: (id, data) => api.put(`/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/students/${id}`),

  // Programs endpoints (Phase 3)
  getPrograms: () => api.get('/programs'),
  getProgram: (id) => api.get(`/programs/${id}`),
  createProgram: (data) => api.post('/programs', data),
  updateProgram: (id, data) => api.put(`/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/programs/${id}`),

  // Subjects endpoints (Phase 3)
  getSubjects: () => api.get('/subjects'),
  getSubject: (id) => api.get(`/subjects/${id}`),
  createSubject: (data) => api.post('/subjects', data),
  updateSubject: (id, data) => api.put(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),

  // Sections endpoints (Phase 3)
  getSections: () => api.get('/sections'),
  getSection: (id) => api.get(`/sections/${id}`),
  createSection: (data) => api.post('/sections', data),
  updateSection: (id, data) => api.put(`/sections/${id}`, data),
  deleteSection: (id) => api.delete(`/sections/${id}`),

  // Professors endpoints
  getProfessors: () => api.get('/api/professors'),
  getProfessor: (id) => api.get(`/api/professors/${id}`),

  // Academic Terms endpoints (Phase 3)
  getAcademicTerms: () => api.get('/academic-terms'),
  getActiveTerm: () => api.get('/academic-terms/active'),
  createAcademicTerm: (data) => api.post('/academic-terms', data),
  updateAcademicTerm: (id, data) => api.put(`/academic-terms/${id}`, data),
  setActiveTerm: (id) => api.put(`/academic-terms/${id}/activate`),
};

export default apiService;
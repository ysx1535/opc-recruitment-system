import axios, { AxiosInstance } from 'axios';
import { User, Job, Candidate, Application, JobStats, CandidateStats, ApplicationStats } from '@/types';

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };

// ============ 认证 API ============
export const authAPI = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post<{ accessToken: string; user: User }>('/auth/register', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post<{ accessToken: string; user: User }>('/auth/login', data);
    return response.data;
  },
  me: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// ============ 职位 API ============
export const jobsAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const response = await api.get<{ jobs: Job[]; pagination: any }>('/jobs', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },
  create: async (data: Partial<Job>) => {
    const response = await api.post<Job>('/jobs', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Job>) => {
    const response = await api.put<Job>(`/jobs/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get<JobStats>('/jobs/stats');
    return response.data;
  },
};

// ============ 候选人 API ============
export const candidatesAPI = {
  getAll: async (params?: { page?: number; limit?: number; source?: string; search?: string }) => {
    const response = await api.get<{ candidates: Candidate[]; pagination: any }>('/candidates', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<Candidate>(`/candidates/${id}`);
    return response.data;
  },
  create: async (data: Partial<Candidate>) => {
    const response = await api.post<Candidate>('/candidates', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Candidate>) => {
    const response = await api.put<Candidate>(`/candidates/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get<CandidateStats>('/candidates/stats');
    return response.data;
  },
};

// ============ 申请 API ============
export const applicationsAPI = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; jobId?: string; candidateId?: string }) => {
    const response = await api.get<{ applications: Application[]; pagination: any }>('/applications', { params });
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get<Application>(`/applications/${id}`);
    return response.data;
  },
  create: async (data: { jobId: string; candidateId: string }) => {
    const response = await api.post<Application>('/applications', data);
    return response.data;
  },
  updateStatus: async (id: string, data: { status: string; notes?: string }) => {
    const response = await api.put<Application>(`/applications/${id}/status`, data);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get<ApplicationStats>('/applications/stats');
    return response.data;
  },
};

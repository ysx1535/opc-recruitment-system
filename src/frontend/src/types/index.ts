// 类型定义 - 匹配后端 DTO
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'FOUNDER' | 'ADMIN' | 'RECRUITER' | 'GUEST';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
}

export interface Job {
  id: string;
  title: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  remoteAllowed: boolean;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  posterId: string;
  poster?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    applications: number;
  };
}

export interface JobStats {
  total: number;
  published: number;
  paused: number;
  closed: number;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  experienceYears?: number;
  educationLevel?: string;
  skills: string[];
  source?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateStats {
  total: number;
  newCandidates: number;
  hired: number;
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  job?: Job;
  candidate?: Candidate;
  reviewer?: {
    id: string;
    name: string;
  };
}

export interface ApplicationStats {
  total: number;
  pending: number;
  interviewing: number;
  offer: number;
  hired: number;
  rejected: number;
  hireRate: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

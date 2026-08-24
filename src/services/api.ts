import {
  User,
  Job,
  Application,
  CandidateProfile,
  RecruiterProfile,
  InterviewSchedule,
  AIMatchBreakdown,
  NotificationItem,
  UserRole,
  CandidateResumeData,
  ResumeTemplateType,
  ATSAnalysisResult,
  ATSBulletReview,
} from '../types';

const BASE_URL = '/api';
const TOKEN_STORAGE_KEY = 'hireflow_auth_token';

// Persistent token helper
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restrictions
  }
}

// Request helper with automatic Bearer token and credentials inclusion
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token if invalid/expired
      setStoredToken(null);
    }
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Authentication
  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await request<{ user: User }>('/auth/me', {
        method: 'GET',
      });
      return data.user || null;
    } catch {
      return null;
    }
  },

  async login(credentials: { email: string; password: string }): Promise<User> {
    const data = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      setStoredToken(data.token);
    }
    return data.user;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    title?: string;
    companyName?: string;
    companyLocation?: string;
    location?: string;
    phone?: string;
  }): Promise<User> {
    const data = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (data.token) {
      setStoredToken(data.token);
    }
    return data.user;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Logout server notification error:', err);
    } finally {
      setStoredToken(null);
    }
  },

  // Jobs
  async getJobs(params?: {
    department?: string;
    type?: string;
    search?: string;
    recruiterId?: string;
    myJobs?: boolean;
  }): Promise<Job[]> {
    try {
      const query = new URLSearchParams();
      if (params?.department && params.department !== 'All') query.append('department', params.department);
      if (params?.type && params.type !== 'All') query.append('type', params.type);
      if (params?.search) query.append('search', params.search);
      if (params?.recruiterId) query.append('recruiterId', params.recruiterId);
      if (params?.myJobs) query.append('myJobs', 'true');

      const url = `/jobs${query.toString() ? `?${query.toString()}` : ''}`;
      return await request<Job[]>(url);
    } catch {
      return [];
    }
  },

  async getJobById(id: string): Promise<Job | null> {
    try {
      return await request<Job>(`/jobs/${id}`);
    } catch {
      return null;
    }
  },

  async createJob(jobData: Partial<Job>): Promise<Job> {
    return await request<Job>('/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    return await request<Job>(`/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async closeJob(id: string): Promise<Job> {
    return await request<Job>(`/jobs/${id}/close`, {
      method: 'POST',
    });
  },

  async archiveJob(id: string): Promise<Job> {
    return await request<Job>(`/jobs/${id}/archive`, {
      method: 'POST',
    });
  },

  async deleteJob(id: string): Promise<void> {
    await request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  // Applications
  async getApplications(params?: {
    jobId?: string;
    candidateId?: string;
    status?: string;
  }): Promise<Application[]> {
    try {
      const query = new URLSearchParams();
      if (params?.jobId) query.append('jobId', params.jobId);
      if (params?.candidateId) query.append('candidateId', params.candidateId);
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);

      const url = `/applications${query.toString() ? `?${query.toString()}` : ''}`;
      return await request<Application[]>(url);
    } catch {
      return [];
    }
  },

  async submitApplication(data: {
    jobId: string;
    resumeText?: string;
    coverLetter?: string;
  }): Promise<Application> {
    return await request<Application>('/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateApplicationStatus(
    id: string,
    data: { status: string; recruiterNotes?: string; interviewDate?: string; interviewType?: string }
  ): Promise<Application> {
    return await request<Application>(`/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Profile
  async getProfile(userId: string): Promise<CandidateProfile | null> {
    try {
      return await request<CandidateProfile>(`/profile/${userId}`);
    } catch {
      return null;
    }
  },

  async updateProfile(
    userId: string,
    profile: Partial<CandidateProfile> & { name?: string; title?: string; email?: string }
  ): Promise<{ user: User; profile: CandidateProfile }> {
    return await request<{ user: User; profile: CandidateProfile }>(`/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
  },

  // Recruiter Company Profile
  async getRecruiterProfile(): Promise<RecruiterProfile | null> {
    try {
      return await request<RecruiterProfile>('/recruiter/profile');
    } catch {
      return null;
    }
  },

  async updateRecruiterProfile(
    profile: Partial<RecruiterProfile>
  ): Promise<{ user: User; profile: RecruiterProfile }> {
    return await request<{ user: User; profile: RecruiterProfile }>('/recruiter/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
  },

  // Storage & File Upload (Supabase Storage)
  async uploadFile(
    file: File | Blob | string,
    bucket: 'candidate-avatars' | 'company-logos' = 'candidate-avatars',
    fileName?: string
  ): Promise<{ success: boolean; url: string; publicUrl: string; bucket: string; path: string }> {
    let fileBase64 = '';
    let fileType = 'image/png';
    let name = fileName || 'image.png';

    if (typeof file === 'string') {
      fileBase64 = file;
    } else if (file instanceof File || file instanceof Blob) {
      fileType = file.type || 'image/png';
      if (file instanceof File) {
        name = file.name;
      }
      fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    return await request<{ success: boolean; url: string; publicUrl: string; bucket: string; path: string }>('/storage/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: fileBase64,
        fileName: name,
        fileType,
        bucket,
      }),
    });
  },

  // Interviews
  async getInterviews(): Promise<InterviewSchedule[]> {
    try {
      return await request<InterviewSchedule[]>('/interviews');
    } catch {
      return [];
    }
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      return await request<NotificationItem[]>('/notifications');
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    await request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await request('/notifications/read-all', {
      method: 'PUT',
    });
  },

  // AI Services
  async matchResume(data: {
    resumeText: string;
    jobDescription: string;
    targetJobTitle?: string;
    requiredSkills?: string[];
  }): Promise<AIMatchBreakdown & { recommendations?: string[] }> {
    return await request('/ai/match-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async generateJD(data: {
    prompt?: string;
    aiPromptHint?: string;
    keyRequirements?: string;
    title?: string;
    department?: string;
    experienceLevel?: string;
    type?: string;
    employmentType?: string;
    location?: string;
    salaryMin?: number | string | null;
    salaryMax?: number | string | null;
    skills?: string[];
    description?: string;
    requirements?: string[];
  }): Promise<{
    title: string;
    department: 'Engineering' | 'Design' | 'Product' | 'Marketing' | 'Sales' | 'Operations';
    experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive';
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
    employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';
    location: string;
    salaryMin: number | null;
    salaryMax: number | null;
    minSalary?: number | null;
    maxSalary?: number | null;
    skills: string[];
    description: string;
    requirements: string[];
    niceToHave?: string[];
    benefits?: string[];
  }> {
    return await request('/ai/generate-jd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async screenCandidate(data: {
    candidateName: string;
    candidateResume: string;
    jobTitle: string;
    jobRequirements: string;
  }): Promise<{
    screeningSummary: string;
    recommendedFocusAreas: string[];
    interviewQuestions: string[];
  }> {
    return await request('/ai/screen-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async generateCoverLetter(data: {
    candidateName: string;
    candidateResume: string;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  }): Promise<{ coverLetter: string }> {
    return await request('/ai/cover-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async sendCopilotMessage(data: {
    message: string;
    role: string;
    context?: string;
  }): Promise<{ reply: string }> {
    return await request('/ai/chat-copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Resume Builder API
  async getCandidateResumes(): Promise<CandidateResumeData[]> {
    try {
      const data = await request<{ resumes: CandidateResumeData[] }>('/candidate/resumes', {
        method: 'GET',
      });
      return data.resumes || [];
    } catch {
      return [];
    }
  },

  async getCandidateResumeById(id: string): Promise<CandidateResumeData | null> {
    try {
      const data = await request<{ resume: CandidateResumeData }>('/candidate/resumes/' + encodeURIComponent(id), {
        method: 'GET',
      });
      return data.resume || null;
    } catch {
      return null;
    }
  },

  async createCandidateResume(resumeData: Partial<CandidateResumeData>): Promise<CandidateResumeData> {
    const data = await request<{ success: boolean; resume: CandidateResumeData }>('/candidate/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resumeData),
    });
    return data.resume;
  },

  async updateCandidateResume(id: string, resumeData: Partial<CandidateResumeData>): Promise<CandidateResumeData> {
    const data = await request<{ success: boolean; resume: CandidateResumeData }>('/candidate/resumes/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resumeData),
    });
    return data.resume;
  },

  async deleteCandidateResume(id: string): Promise<{ success: boolean }> {
    return await request<{ success: boolean; message: string }>('/candidate/resumes/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  },

  // Backward compatibility
  async getCandidateResume(): Promise<CandidateResumeData | null> {
    try {
      const data = await request<{ resume: CandidateResumeData | null }>('/candidate/resume', {
        method: 'GET',
      });
      return data.resume || null;
    } catch {
      return null;
    }
  },

  async saveCandidateResume(resumeData: Partial<CandidateResumeData>): Promise<CandidateResumeData> {
    const data = await request<{ success: boolean; resume: CandidateResumeData }>('/candidate/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resumeData),
    });
    return data.resume;
  },

  // ATS Resume Analyzer API
  async analyzeATSResume(data: {
    resumeSource?: 'saved' | 'upload' | 'text';
    jobSource?: 'job' | 'custom';
    resumeId?: string;
    jobId?: string;
    resumeText: string;
    jobDescription: string;
    targetJobTitle?: string;
    companyName?: string;
    parsedResumeData?: any;
  }): Promise<ATSAnalysisResult> {
    return await request<ATSAnalysisResult>('/candidate/resume-match/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getATSAnalysisHistory(): Promise<ATSAnalysisResult[]> {
    try {
      const data = await request<{ history: ATSAnalysisResult[] }>('/candidate/resume-match/history', {
        method: 'GET',
      });
      return data.history || [];
    } catch {
      return [];
    }
  },

  async getATSAnalysisById(id: string): Promise<ATSAnalysisResult | null> {
    try {
      const data = await request<{ analysis: ATSAnalysisResult }>('/candidate/resume-match/history/' + encodeURIComponent(id), {
        method: 'GET',
      });
      return data.analysis || null;
    } catch {
      return null;
    }
  },

  async deleteATSAnalysis(id: string): Promise<{ success: boolean }> {
    return await request<{ success: boolean; message: string }>('/candidate/resume-match/history/' + encodeURIComponent(id), {
      method: 'DELETE',
    });
  },

  async extractDocumentFile(data: {
    fileData: string;
    fileName: string;
    mimeType: string;
    parseStructured?: boolean;
  }): Promise<{
    success: boolean;
    extractedText: string;
    fileName: string;
    fileSize: number;
    structuredData?: any;
  }> {
    return await request('/candidate/resume-match/extract-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async saveOptimizedResume(data: {
    baseResumeId?: string;
    newTitle: string;
    appliedBullets?: ATSBulletReview[];
    appliedSkills?: (string | { name: string; category?: string })[];
    updatedSummary?: string;
    rawResumeData?: any;
  }): Promise<{ success: boolean; resume: CandidateResumeData; message: string }> {
    return await request('/candidate/resume-match/save-optimized-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};


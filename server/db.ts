import { prisma, hasDatabaseUrl } from './prisma';
import { inMemoryStore, DBUser } from './inMemoryStore';
import {
  User,
  Job,
  Application,
  CandidateProfile,
  RecruiterProfile,
  InterviewSchedule,
  NotificationItem,
  UserRole,
  CandidateResumeData,
  ATSAnalysisResult,
  ApplicationStatus,
} from '../src/types';

export type { DBUser };

function formatTimeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function mapPrismaUserToDBUser(user: any): DBUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role as UserRole,
    avatar: user.avatar || undefined,
    title: user.title || undefined,
    companyName: user.companyName || undefined,
    companyLocation: user.companyLocation || undefined,
    phone: user.phone || undefined,
    location: user.location || undefined,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
  };
}

function mapPrismaJobToJob(job: any): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    companyLogo: job.companyLogo || undefined,
    department: job.department,
    location: job.location,
    type: job.type,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    description: job.description,
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    niceToHave: Array.isArray(job.niceToHave) ? job.niceToHave : [],
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
    skills: Array.isArray(job.skills) ? job.skills : [],
    status: job.status,
    isActive: job.isActive !== undefined ? job.isActive : job.status === 'ACTIVE',
    closedAt: job.closedAt instanceof Date ? job.closedAt.toISOString() : (job.closedAt ? String(job.closedAt) : undefined),
    archivedAt: job.archivedAt instanceof Date ? job.archivedAt.toISOString() : (job.archivedAt ? String(job.archivedAt) : undefined),
    recruiterId: job.recruiterId,
    recruiterName: job.recruiterName,
    createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : String(job.createdAt),
    applicantCount: job.applicantCount || 0,
  };
}

function mapPrismaApplicationToApplication(app: any): Application {
  const firstInterview = app.interviews && app.interviews.length > 0 ? app.interviews[0] : null;
  return {
    id: app.id,
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    company: app.company,
    companyName: app.company,
    candidateId: app.candidateId,
    candidateName: app.candidateName,
    candidateEmail: app.candidateEmail,
    candidateAvatar: app.candidateAvatar || undefined,
    candidateTitle: app.candidateTitle || undefined,
    candidateLocation: app.candidateLocation || undefined,
    appliedDate: app.appliedDate instanceof Date ? app.appliedDate.toISOString() : String(app.appliedDate),
    status: (app.status === 'SHORTLISTED' ? 'SCREENING' : app.status === 'INTERVIEW' ? 'INTERVIEWING' : app.status) as ApplicationStatus,
    resumeText: app.resumeText,
    coverLetter: app.coverLetter || undefined,
    aiMatch: typeof app.aiMatch === 'string' ? JSON.parse(app.aiMatch) : app.aiMatch,
    recruiterNotes: app.recruiterNotes || undefined,
    interviewDate: app.interviewDate || (firstInterview ? firstInterview.date : undefined),
    interviewType: app.interviewType || (firstInterview ? firstInterview.type : undefined),
    interviewDetails: firstInterview
      ? {
          date: firstInterview.date,
          time: firstInterview.time,
          type: firstInterview.type,
        }
      : undefined,
  };
}

function mapPrismaCandidateProfileToCandidateProfile(p: any, user?: any): CandidateProfile {
  return {
    id: p.id,
    userId: p.userId,
    name: user?.name,
    email: user?.email,
    title: user?.title,
    avatar: p.avatarUrl || user?.avatar,
    avatarUrl: p.avatarUrl || user?.avatar,
    phone: p.phone || '',
    location: p.location || 'Remote',
    skills: Array.isArray(p.skills) ? p.skills : [],
    headline: p.headline || 'Software Professional',
    summary: p.summary || '',
    portfolioUrl: p.portfolioUrl || undefined,
    githubUrl: p.githubUrl || undefined,
    linkedinUrl: p.linkedinUrl || undefined,
    experience: Array.isArray(p.experience) ? p.experience : [],
    education: Array.isArray(p.education) ? p.education : [],
    resumeText: p.resumeText || '',
    resumeFileName: p.resumeFileName || undefined,
    profileStrength: p.profileStrength || 80,
  };
}

function mapPrismaRecruiterProfileToRecruiterProfile(p: any, user?: any): RecruiterProfile {
  return {
    id: p.id,
    userId: p.userId,
    companyName: p.companyName || user?.companyName || 'My Company',
    jobTitle: p.jobTitle || user?.title,
    companyLocation: p.companyLocation || user?.companyLocation,
    companyWebsite: p.companyWebsite || undefined,
    companyDescription: p.companyDescription || undefined,
    companySize: p.companySize || undefined,
    companyLogo: p.companyLogo || user?.avatar,
    companyLogoUrl: p.companyLogo || user?.avatar,
    industry: p.industry || undefined,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
  };
}

function mapPrismaInterviewToInterview(i: any): InterviewSchedule {
  return {
    id: i.id,
    applicationId: i.applicationId,
    candidateName: i.candidateName,
    jobTitle: i.jobTitle,
    date: i.date,
    time: i.time,
    interviewer: i.interviewer,
    type: i.type,
    meetingLink: i.meetingLink,
    status: i.status,
    notes: i.notes || undefined,
  };
}

function mapPrismaNotificationToNotification(n: any): NotificationItem {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    description: n.message,
    isRead: n.isRead,
    read: n.isRead,
    time: formatTimeAgo(n.createdAt),
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : String(n.createdAt),
    metadata: typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata || {},
  };
}

function mapPrismaResumeToCandidateResume(r: any): CandidateResumeData {
  return {
    id: r.id,
    candidateId: r.candidateId,
    title: r.title,
    selectedTemplate: r.selectedTemplate || 'google',
    personalData: typeof r.personalData === 'string' ? JSON.parse(r.personalData) : r.personalData || {
      fullName: '',
      professionalTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    summary: r.summary || '',
    education: Array.isArray(r.education) ? r.education : (typeof r.education === 'string' ? JSON.parse(r.education) : []),
    experience: Array.isArray(r.experience) ? r.experience : (typeof r.experience === 'string' ? JSON.parse(r.experience) : []),
    projects: Array.isArray(r.projects) ? r.projects : (typeof r.projects === 'string' ? JSON.parse(r.projects) : []),
    skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills || { languages: [], frameworks: [], databases: [], tools: [], aiMl: [], other: [] },
    certifications: Array.isArray(r.certifications) ? r.certifications : (typeof r.certifications === 'string' ? JSON.parse(r.certifications) : []),
    achievements: Array.isArray(r.achievements) ? r.achievements : (typeof r.achievements === 'string' ? JSON.parse(r.achievements) : []),
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
  };
}

function mapPrismaAnalysisToATSResult(a: any): ATSAnalysisResult {
  return {
    id: a.id,
    resumeId: a.resumeId || undefined,
    jobId: a.jobId || undefined,
    jobTitle: a.jobTitle,
    companyName: a.companyName || undefined,
    resumeSource: a.resumeSource || 'saved',
    jobSource: a.jobSource || 'job',
    resumeName: a.resumeName || 'Resume Analysis',
    overallScore: a.overallScore,
    verdict: a.overallScore >= 85 ? 'EXCELLENT_MATCH' : a.overallScore >= 70 ? 'STRONG_FIT' : a.overallScore >= 55 ? 'COMPETITIVE_FIT' : 'NEEDS_OPTIMIZATION',
    categoryScores: typeof a.categoryScores === 'string' ? JSON.parse(a.categoryScores) : a.categoryScores || {
      skills: 0,
      experience: 0,
      keywords: 0,
      impact: 0,
      formatting: 0,
      projects: 0,
      education: 0,
    },
    matchedSkills: Array.isArray(a.matchedSkills) ? a.matchedSkills : (typeof a.matchedSkills === 'string' ? JSON.parse(a.matchedSkills) : []),
    missingSkills: Array.isArray(a.missingSkills) ? a.missingSkills : (typeof a.missingSkills === 'string' ? JSON.parse(a.missingSkills) : []),
    weakSkills: Array.isArray(a.weakSkills) ? a.weakSkills : (typeof a.weakSkills === 'string' ? JSON.parse(a.weakSkills) : []),
    experienceGaps: Array.isArray(a.experienceGaps) ? a.experienceGaps : (typeof a.experienceGaps === 'string' ? JSON.parse(a.experienceGaps) : []),
    projectRelevance: Array.isArray(a.projectRelevance) ? a.projectRelevance : (typeof a.projectRelevance === 'string' ? JSON.parse(a.projectRelevance) : []),
    formattingChecks: Array.isArray(a.formattingChecks) ? a.formattingChecks : (typeof a.formattingChecks === 'string' ? JSON.parse(a.formattingChecks) : []),
    completenessCheck: typeof a.completenessCheck === 'string' ? JSON.parse(a.completenessCheck) : a.completenessCheck || {
      contactInfo: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      wordCount: 450,
      estimatedPages: 1,
      readingTimeMinutes: 2,
    },
    bulletReviews: Array.isArray(a.bulletReviews) ? a.bulletReviews : (typeof a.bulletReviews === 'string' ? JSON.parse(a.bulletReviews) : []),
    recommendations: Array.isArray(a.recommendations) ? a.recommendations : (typeof a.recommendations === 'string' ? JSON.parse(a.recommendations) : []),
    aiSummary: a.aiSummary || '',
    parsedResumeData: typeof a.parsedResumeData === 'string' ? JSON.parse(a.parsedResumeData) : a.parsedResumeData || {},
    rawResumeText: a.rawResumeText || undefined,
    rawJobDescription: a.rawJobDescription || undefined,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
  };
}

export class Database {
  // =========================================================================
  // USER METHODS
  // =========================================================================
  async getUserByEmail(email: string): Promise<DBUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (hasDatabaseUrl()) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (user) return mapPrismaUserToDBUser(user);
      } catch (e) {
        console.warn('[DB] Prisma getUserByEmail failed, falling back to memory store:', e);
      }
    }

    for (const u of inMemoryStore.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        return { ...u };
      }
    }
    return null;
  }

  async getUserById(id: string): Promise<DBUser | null> {
    if (hasDatabaseUrl()) {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
        });
        if (user) return mapPrismaUserToDBUser(user);
      } catch (e) {
        console.warn('[DB] Prisma getUserById failed, falling back to memory store:', e);
      }
    }
    const memUser = inMemoryStore.users.get(id);
    return memUser ? { ...memUser } : null;
  }

  async createUser(userData: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    avatar?: string;
    title?: string;
    companyName?: string;
    companyLocation?: string;
    phone?: string;
    location?: string;
  }): Promise<DBUser> {
    const cleanEmail = userData.email.trim().toLowerCase();

    if (hasDatabaseUrl()) {
      try {
        const created = await prisma.user.create({
          data: {
            name: userData.name,
            email: cleanEmail,
            passwordHash: userData.passwordHash,
            role: userData.role,
            avatar: userData.avatar,
            title: userData.title,
            companyName: userData.companyName,
            companyLocation: userData.companyLocation,
            phone: userData.phone,
            location: userData.location,
            candidateProfile:
              userData.role === 'CANDIDATE'
                ? {
                    create: {
                      headline: `${userData.title || 'Professional'} | Open to Opportunities`,
                      summary: 'Motivated software professional seeking challenging career opportunities.',
                      skills: [],
                      experience: [],
                      education: [],
                      location: userData.location || 'Remote',
                      phone: userData.phone || '',
                    },
                  }
                : undefined,
            recruiterProfile:
              userData.role === 'RECRUITER'
                ? {
                    create: {
                      companyName: userData.companyName || 'My Company',
                      jobTitle: userData.title || 'Recruiter',
                      companyLocation: userData.companyLocation || 'Remote',
                    },
                  }
                : undefined,
          },
        });
        return mapPrismaUserToDBUser(created);
      } catch (e) {
        console.warn('[DB] Prisma createUser failed, falling back to memory store:', e);
      }
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser: DBUser = {
      id,
      name: userData.name,
      email: cleanEmail,
      passwordHash: userData.passwordHash,
      role: userData.role,
      avatar: userData.avatar,
      title: userData.title,
      companyName: userData.companyName,
      companyLocation: userData.companyLocation,
      phone: userData.phone,
      location: userData.location,
      createdAt: new Date().toISOString(),
    };

    inMemoryStore.users.set(id, newUser);

    if (userData.role === 'CANDIDATE') {
      inMemoryStore.candidateProfiles.set(id, {
        id: `cprof_${id}`,
        userId: id,
        name: newUser.name,
        email: newUser.email,
        title: newUser.title,
        avatar: newUser.avatar,
        phone: newUser.phone || '',
        location: newUser.location || 'Remote',
        headline: `${newUser.title || 'Professional'} | Open to Opportunities`,
        summary: 'Motivated software professional seeking challenging career opportunities.',
        skills: [],
        experience: [],
        education: [],
        resumeText: '',
        profileStrength: 50,
      });
    } else if (userData.role === 'RECRUITER') {
      inMemoryStore.recruiterProfiles.set(id, {
        id: `rprof_${id}`,
        userId: id,
        companyName: newUser.companyName || 'My Company',
        jobTitle: newUser.title || 'Recruiter',
        companyLocation: newUser.companyLocation || 'Remote',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return { ...newUser };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<DBUser | null> {
    if (hasDatabaseUrl()) {
      try {
        const updated = await prisma.user.update({
          where: { id },
          data: {
            name: updates.name,
            avatar: updates.avatar,
            title: updates.title,
            companyName: updates.companyName,
            companyLocation: updates.companyLocation,
            phone: updates.phone,
            location: updates.location,
          },
        });
        return mapPrismaUserToDBUser(updated);
      } catch (e) {
        console.warn('[DB] Prisma updateUser failed, falling back to memory store:', e);
      }
    }

    const existing = inMemoryStore.users.get(id);
    if (!existing) return null;
    const merged: DBUser = {
      ...existing,
      ...updates,
    };
    inMemoryStore.users.set(id, merged);
    return { ...merged };
  }

  // =========================================================================
  // JOB REQUISITION METHODS
  // =========================================================================
  async getJobs(filters?: {
    search?: string;
    department?: string;
    location?: string;
    type?: string;
    experienceLevel?: string;
    skills?: string[];
    status?: string;
    recruiterId?: string;
    activeOnly?: boolean;
    includeArchived?: boolean;
  }): Promise<Job[]> {
    if (hasDatabaseUrl()) {
      try {
        const where: any = {};
        if (filters?.recruiterId) where.recruiterId = filters.recruiterId;
        if (filters?.status) where.status = filters.status;
        if (filters?.activeOnly) where.status = 'ACTIVE';
        if (filters?.department) where.department = { contains: filters.department, mode: 'insensitive' };
        if (filters?.type) where.type = filters.type;
        if (filters?.experienceLevel) where.experienceLevel = filters.experienceLevel;

        const jobs = await prisma.job.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });

        let mapped = jobs.map(mapPrismaJobToJob);
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          mapped = mapped.filter(
            (j) =>
              j.title.toLowerCase().includes(s) ||
              j.company.toLowerCase().includes(s) ||
              j.description.toLowerCase().includes(s) ||
              j.skills.some((sk) => sk.toLowerCase().includes(s))
          );
        }
        return mapped;
      } catch (e) {
        console.warn('[DB] Prisma getJobs failed, falling back to memory store:', e);
      }
    }

    let list = Array.from(inMemoryStore.jobs.values());
    if (filters?.recruiterId) {
      list = list.filter((j) => j.recruiterId === filters.recruiterId);
    }
    if (filters?.status) {
      list = list.filter((j) => j.status === filters.status);
    }
    if (filters?.activeOnly) {
      list = list.filter((j) => j.status === 'ACTIVE' && j.isActive !== false);
    }
    if (!filters?.includeArchived && !filters?.status) {
      list = list.filter((j) => j.status !== 'ARCHIVED');
    }
    if (filters?.department) {
      const dep = filters.department.toLowerCase();
      list = list.filter((j) => j.department.toLowerCase().includes(dep));
    }
    if (filters?.type) {
      list = list.filter((j) => j.type.toLowerCase() === filters.type!.toLowerCase());
    }
    if (filters?.experienceLevel) {
      list = list.filter((j) => j.experienceLevel.toLowerCase() === filters.experienceLevel!.toLowerCase());
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(s) ||
          j.company.toLowerCase().includes(s) ||
          j.description.toLowerCase().includes(s) ||
          j.skills.some((sk) => sk.toLowerCase().includes(s))
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getJobById(id: string): Promise<Job | null> {
    if (hasDatabaseUrl()) {
      try {
        const job = await prisma.job.findUnique({
          where: { id },
        });
        if (job) return mapPrismaJobToJob(job);
      } catch (e) {
        console.warn('[DB] Prisma getJobById failed, falling back to memory store:', e);
      }
    }
    const memJob = inMemoryStore.jobs.get(id);
    return memJob ? { ...memJob } : null;
  }

  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'applicantCount'>): Promise<Job> {
    if (hasDatabaseUrl()) {
      try {
        const created = await prisma.job.create({
          data: {
            recruiterId: jobData.recruiterId,
            recruiterName: jobData.recruiterName,
            title: jobData.title,
            company: jobData.company,
            companyLogo: jobData.companyLogo,
            department: jobData.department || 'Engineering',
            location: jobData.location || 'Remote',
            type: jobData.type || 'Full-time',
            experienceLevel: jobData.experienceLevel || 'Mid-Level',
            salaryMin: jobData.salaryMin || 100000,
            salaryMax: jobData.salaryMax || 150000,
            salaryCurrency: jobData.salaryCurrency || 'USD',
            description: jobData.description,
            requirements: jobData.requirements || [],
            niceToHave: jobData.niceToHave || [],
            benefits: jobData.benefits || [],
            skills: jobData.skills || [],
            status: jobData.status || 'ACTIVE',
            isActive: jobData.isActive ?? true,
          },
        });
        return mapPrismaJobToJob(created);
      } catch (e) {
        console.warn('[DB] Prisma createJob failed, falling back to memory store:', e);
      }
    }

    const id = `job_${Date.now()}`;
    const newJob: Job = {
      id,
      recruiterId: jobData.recruiterId,
      recruiterName: jobData.recruiterName,
      title: jobData.title,
      company: jobData.company,
      companyLogo: jobData.companyLogo,
      department: jobData.department || 'Engineering',
      location: jobData.location || 'Remote',
      type: jobData.type || 'Full-time',
      experienceLevel: jobData.experienceLevel || 'Mid-Level',
      salaryMin: jobData.salaryMin || 100000,
      salaryMax: jobData.salaryMax || 150000,
      salaryCurrency: jobData.salaryCurrency || 'USD',
      description: jobData.description,
      requirements: jobData.requirements || [],
      niceToHave: jobData.niceToHave || [],
      benefits: jobData.benefits || [],
      skills: jobData.skills || [],
      status: jobData.status || 'ACTIVE',
      isActive: jobData.isActive ?? true,
      applicantCount: 0,
      createdAt: new Date().toISOString(),
    };

    inMemoryStore.jobs.set(id, newJob);
    return { ...newJob };
  }

  async updateJob(id: string, updates: Partial<Job>, recruiterId?: string): Promise<Job | null> {
    if (hasDatabaseUrl()) {
      try {
        if (recruiterId) {
          const existing = await prisma.job.findUnique({ where: { id } });
          if (existing && existing.recruiterId !== recruiterId) {
            throw new Error('Forbidden. You can only edit your own job postings.');
          }
        }
        const updated = await prisma.job.update({
          where: { id },
          data: {
            title: updates.title,
            department: updates.department,
            location: updates.location,
            type: updates.type,
            experienceLevel: updates.experienceLevel,
            salaryMin: updates.salaryMin,
            salaryMax: updates.salaryMax,
            salaryCurrency: updates.salaryCurrency,
            description: updates.description,
            requirements: updates.requirements,
            niceToHave: updates.niceToHave,
            benefits: updates.benefits,
            skills: updates.skills,
            status: updates.status,
            isActive: updates.isActive,
          },
        });
        return mapPrismaJobToJob(updated);
      } catch (e: any) {
        if (e.message?.includes('Forbidden')) throw e;
        console.warn('[DB] Prisma updateJob failed, falling back to memory store:', e);
      }
    }

    const job = inMemoryStore.jobs.get(id);
    if (!job) return null;
    if (recruiterId && job.recruiterId !== recruiterId) {
      throw new Error('Forbidden. You can only edit your own job postings.');
    }
    const merged: Job = { ...job, ...updates };
    inMemoryStore.jobs.set(id, merged);
    return { ...merged };
  }

  async closeJob(jobId: string, recruiterId: string): Promise<Job | null> {
    return this.updateJob(
      jobId,
      {
        status: 'CLOSED',
        isActive: false,
        closedAt: new Date().toISOString(),
      },
      recruiterId
    );
  }

  async archiveJob(jobId: string, recruiterId: string): Promise<Job | null> {
    return this.updateJob(
      jobId,
      {
        status: 'ARCHIVED',
        isActive: false,
        archivedAt: new Date().toISOString(),
      },
      recruiterId
    );
  }

  async deleteJob(id: string, recruiterId?: string): Promise<boolean> {
    if (hasDatabaseUrl()) {
      try {
        if (recruiterId) {
          const job = await prisma.job.findUnique({ where: { id } });
          if (job && job.recruiterId !== recruiterId) {
            throw new Error('Forbidden. You can only delete your own jobs.');
          }
        }
        await prisma.job.delete({ where: { id } });
        return true;
      } catch (e: any) {
        if (e.message?.includes('Forbidden')) throw e;
        console.warn('[DB] Prisma deleteJob failed, falling back to memory store:', e);
      }
    }

    const job = inMemoryStore.jobs.get(id);
    if (!job) return true;
    if (recruiterId && job.recruiterId !== recruiterId) {
      throw new Error('Forbidden. You can only delete your own jobs.');
    }
    inMemoryStore.jobs.delete(id);
    return true;
  }

  // =========================================================================
  // APPLICATION METHODS
  // =========================================================================
  async getApplications(filters?: {
    candidateId?: string;
    jobId?: string;
    recruiterId?: string;
    status?: string;
  }): Promise<Application[]> {
    if (hasDatabaseUrl()) {
      try {
        const where: any = {};
        if (filters?.candidateId) where.candidateId = filters.candidateId;
        if (filters?.jobId) where.jobId = filters.jobId;
        if (filters?.status) where.status = filters.status;
        if (filters?.recruiterId) {
          where.job = { recruiterId: filters.recruiterId };
        }

        const apps = await prisma.application.findMany({
          where,
          include: { interviews: true },
          orderBy: { createdAt: 'desc' },
        });
        return apps.map(mapPrismaApplicationToApplication);
      } catch (e) {
        console.warn('[DB] Prisma getApplications failed, falling back to memory store:', e);
      }
    }

    let list = Array.from(inMemoryStore.applications.values());
    if (filters?.candidateId) {
      list = list.filter((a) => a.candidateId === filters.candidateId);
    }
    if (filters?.jobId) {
      list = list.filter((a) => a.jobId === filters.jobId);
    }
    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.recruiterId) {
      const recruiterJobs = new Set(
        Array.from(inMemoryStore.jobs.values())
          .filter((j) => j.recruiterId === filters.recruiterId)
          .map((j) => j.id)
      );
      list = list.filter((a) => recruiterJobs.has(a.jobId));
    }

    return list.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  }

  async getApplicationById(id: string): Promise<Application | null> {
    if (hasDatabaseUrl()) {
      try {
        const app = await prisma.application.findUnique({
          where: { id },
          include: { interviews: true },
        });
        if (app) return mapPrismaApplicationToApplication(app);
      } catch (e) {
        console.warn('[DB] Prisma getApplicationById failed, falling back to memory store:', e);
      }
    }
    const memApp = inMemoryStore.applications.get(id);
    return memApp ? { ...memApp } : null;
  }

  async createApplication(appData: Omit<Application, 'id' | 'appliedDate'>): Promise<Application> {
    if (hasDatabaseUrl()) {
      try {
        const targetJob = await prisma.job.findUnique({ where: { id: appData.jobId } });
        if (targetJob && (targetJob.status === 'CLOSED' || targetJob.status === 'ARCHIVED' || targetJob.isActive === false)) {
          throw new Error('This job is closed or archived. New applications are not accepted.');
        }

        const created = await prisma.$transaction(async (tx) => {
          const app = await tx.application.create({
            data: {
              jobId: appData.jobId,
              jobTitle: appData.jobTitle,
              company: appData.company || appData.companyName || 'HireFlow Partner',
              candidateId: appData.candidateId,
              candidateName: appData.candidateName,
              candidateEmail: appData.candidateEmail,
              candidateAvatar: appData.candidateAvatar,
              candidateTitle: appData.candidateTitle,
              candidateLocation: appData.candidateLocation,
              status: appData.status || 'APPLIED',
              resumeText: appData.resumeText || '',
              coverLetter: appData.coverLetter,
              aiMatch: appData.aiMatch as any,
              matchScore: appData.aiMatch?.overallScore,
              aiSummary: appData.aiMatch?.aiSummary,
              recruiterNotes: appData.recruiterNotes,
            },
          });

          await tx.job.update({
            where: { id: appData.jobId },
            data: { applicantCount: { increment: 1 } },
          });

          if (targetJob) {
            await tx.notification.create({
              data: {
                userId: targetJob.recruiterId,
                type: 'NEW_APPLICATION',
                title: `New applicant for ${targetJob.title}`,
                message: `${appData.candidateName} submitted an application with a ${appData.aiMatch?.overallScore || 0}% AI Match Score.`,
                metadata: {
                  jobId: targetJob.id,
                  applicationId: app.id,
                  candidateId: appData.candidateId,
                  matchScore: appData.aiMatch?.overallScore,
                },
              },
            });
          }

          return app;
        });

        return mapPrismaApplicationToApplication(created);
      } catch (e: any) {
        if (e.message?.includes('closed') || e.message?.includes('archived')) throw e;
        console.warn('[DB] Prisma createApplication failed, falling back to memory store:', e);
      }
    }

    const job = inMemoryStore.jobs.get(appData.jobId);
    if (job && (job.status === 'CLOSED' || job.status === 'ARCHIVED' || !job.isActive)) {
      throw new Error('This job is closed or archived. New applications are not accepted.');
    }

    const id = `app_${Date.now()}`;
    const newApp: Application = {
      id,
      jobId: appData.jobId,
      jobTitle: appData.jobTitle,
      company: appData.company || appData.companyName || 'HireFlow Partner',
      companyName: appData.company || appData.companyName || 'HireFlow Partner',
      candidateId: appData.candidateId,
      candidateName: appData.candidateName,
      candidateEmail: appData.candidateEmail,
      candidateAvatar: appData.candidateAvatar,
      candidateTitle: appData.candidateTitle,
      candidateLocation: appData.candidateLocation,
      appliedDate: new Date().toISOString(),
      status: appData.status || 'APPLIED',
      resumeText: appData.resumeText || '',
      coverLetter: appData.coverLetter,
      aiMatch: appData.aiMatch,
      recruiterNotes: appData.recruiterNotes,
    };

    inMemoryStore.applications.set(id, newApp);

    if (job) {
      job.applicantCount = (job.applicantCount || 0) + 1;
      inMemoryStore.jobs.set(job.id, job);

      const notifId = `notif_${Date.now()}`;
      inMemoryStore.notifications.set(notifId, {
        id: notifId,
        userId: job.recruiterId,
        type: 'NEW_APPLICATION',
        title: `New applicant for ${job.title}`,
        message: `${appData.candidateName} submitted an application with a ${appData.aiMatch?.overallScore || 0}% AI Match Score.`,
        description: `${appData.candidateName} submitted an application with a ${appData.aiMatch?.overallScore || 0}% AI Match Score.`,
        isRead: false,
        read: false,
        time: 'Just now',
        createdAt: new Date().toISOString(),
        metadata: { jobId: job.id, applicationId: id },
      });
    }

    return { ...newApp };
  }

  async updateApplication(id: string, updates: Partial<Application>, recruiterId?: string): Promise<Application | null> {
    if (hasDatabaseUrl()) {
      try {
        const app = await prisma.application.findUnique({
          where: { id },
          include: { job: true },
        });
        if (!app) return null;
        if (recruiterId && app.job.recruiterId !== recruiterId) {
          throw new Error('Forbidden. You can only update applications for your own job requisitions.');
        }

        const updated = await prisma.application.update({
          where: { id },
          data: {
            status: updates.status,
            recruiterNotes: updates.recruiterNotes,
            interviewDate: updates.interviewDate,
            interviewType: updates.interviewType,
          },
          include: { interviews: true },
        });

        if (updates.status && updates.status !== app.status) {
          await prisma.notification.create({
            data: {
              userId: app.candidateId,
              type: `APPLICATION_STATUS_CHANGED`,
              title: `Application Status Update`,
              message: `Your application status for ${app.jobTitle} at ${app.company} has been updated to "${updates.status}".`,
              metadata: { applicationId: app.id, jobId: app.jobId, status: updates.status },
            },
          });
        }

        return mapPrismaApplicationToApplication(updated);
      } catch (e: any) {
        if (e.message?.includes('Forbidden')) throw e;
        console.warn('[DB] Prisma updateApplication failed, falling back to memory store:', e);
      }
    }

    const app = inMemoryStore.applications.get(id);
    if (!app) return null;
    const merged: Application = { ...app, ...updates };
    inMemoryStore.applications.set(id, merged);

    if (updates.status && updates.status !== app.status) {
      const notifId = `notif_${Date.now()}`;
      inMemoryStore.notifications.set(notifId, {
        id: notifId,
        userId: app.candidateId,
        type: `APPLICATION_STATUS_CHANGED`,
        title: `Application Status Update`,
        message: `Your application status for ${app.jobTitle} at ${app.company} has been updated to "${updates.status}".`,
        description: `Your application status for ${app.jobTitle} at ${app.company} has been updated to "${updates.status}".`,
        isRead: false,
        read: false,
        time: 'Just now',
        createdAt: new Date().toISOString(),
        metadata: { applicationId: app.id, jobId: app.jobId, status: updates.status },
      });
    }

    return { ...merged };
  }

  // =========================================================================
  // CANDIDATE PROFILE METHODS
  // =========================================================================
  async getProfile(userId: string): Promise<CandidateProfile | null> {
    if (hasDatabaseUrl()) {
      try {
        const profile = await prisma.candidateProfile.findUnique({
          where: { userId },
          include: { user: true },
        });
        if (profile) return mapPrismaCandidateProfileToCandidateProfile(profile, profile.user);
      } catch (e) {
        console.warn('[DB] Prisma getProfile failed, falling back to memory store:', e);
      }
    }

    const p = inMemoryStore.candidateProfiles.get(userId);
    if (p) return { ...p };
    const u = inMemoryStore.users.get(userId);
    if (u) {
      return {
        id: `cprof_${userId}`,
        userId,
        name: u.name,
        email: u.email,
        title: u.title,
        avatar: u.avatar,
        phone: u.phone || '',
        location: u.location || 'Remote',
        headline: `${u.title || 'Professional'} | Open to Opportunities`,
        summary: 'Motivated software professional.',
        skills: [],
        experience: [],
        education: [],
        resumeText: '',
        profileStrength: 50,
      };
    }
    return null;
  }

  async updateProfile(userId: string, updates: Partial<CandidateProfile>): Promise<CandidateProfile | null> {
    return this.updateCandidateProfileAndUser(userId, updates);
  }

  async updateCandidateProfileAndUser(userId: string, updates: Partial<CandidateProfile>): Promise<CandidateProfile | null> {
    if (hasDatabaseUrl()) {
      try {
        const [prof, user] = await prisma.$transaction(async (tx) => {
          const u = await tx.user.update({
            where: { id: userId },
            data: {
              name: updates.name,
              title: updates.title,
              avatar: updates.avatar || updates.avatarUrl,
              phone: updates.phone,
              location: updates.location,
            },
          });

          const p = await tx.candidateProfile.upsert({
            where: { userId },
            update: {
              headline: updates.headline,
              summary: updates.summary,
              phone: updates.phone,
              location: updates.location,
              skills: updates.skills as any,
              portfolioUrl: updates.portfolioUrl,
              githubUrl: updates.githubUrl,
              linkedinUrl: updates.linkedinUrl,
              experience: updates.experience as any,
              education: updates.education as any,
              resumeText: updates.resumeText,
              resumeFileName: updates.resumeFileName,
              profileStrength: updates.profileStrength,
            },
            create: {
              userId,
              headline: updates.headline || 'Software Professional',
              summary: updates.summary || '',
              phone: updates.phone || '',
              location: updates.location || 'Remote',
              skills: (updates.skills || []) as any,
              experience: (updates.experience || []) as any,
              education: (updates.education || []) as any,
              resumeText: updates.resumeText || '',
              profileStrength: updates.profileStrength || 70,
            },
          });

          return [p, u];
        });

        return mapPrismaCandidateProfileToCandidateProfile(prof, user);
      } catch (e) {
        console.warn('[DB] Prisma updateCandidateProfile failed, falling back to memory store:', e);
      }
    }

    const currentProf = inMemoryStore.candidateProfiles.get(userId) || {
      id: `cprof_${userId}`,
      userId,
      phone: '',
      location: 'Remote',
      skills: [],
      experience: [],
      education: [],
      resumeText: '',
      profileStrength: 75,
      headline: '',
      summary: '',
    };

    const mergedProf: CandidateProfile = {
      ...currentProf,
      ...updates,
      location: updates.location || currentProf.location || 'Remote',
      phone: updates.phone || currentProf.phone || '',
    };
    inMemoryStore.candidateProfiles.set(userId, mergedProf);

    const u = inMemoryStore.users.get(userId);
    if (u) {
      if (updates.name) u.name = updates.name;
      if (updates.title) u.title = updates.title;
      if (updates.avatar || updates.avatarUrl) u.avatar = updates.avatar || updates.avatarUrl;
      if (updates.phone) u.phone = updates.phone;
      if (updates.location) u.location = updates.location;
      inMemoryStore.users.set(userId, u);
    }

    return { ...mergedProf };
  }

  // =========================================================================
  // RECRUITER PROFILE METHODS
  // =========================================================================
  async getRecruiterProfile(userId: string): Promise<RecruiterProfile | null> {
    if (hasDatabaseUrl()) {
      try {
        const profile = await prisma.recruiterProfile.findUnique({
          where: { userId },
          include: { user: true },
        });
        if (profile) return mapPrismaRecruiterProfileToRecruiterProfile(profile, profile.user);
      } catch (e) {
        console.warn('[DB] Prisma getRecruiterProfile failed, falling back to memory store:', e);
      }
    }

    const p = inMemoryStore.recruiterProfiles.get(userId);
    if (p) return { ...p };
    const u = inMemoryStore.users.get(userId);
    if (u) {
      return {
        id: `rprof_${userId}`,
        userId,
        companyName: u.companyName || 'My Company',
        jobTitle: u.title || 'Recruiter',
        companyLocation: u.companyLocation || 'Remote',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  }

  async updateRecruiterProfile(userId: string, updates: Partial<RecruiterProfile>): Promise<RecruiterProfile | null> {
    return this.updateRecruiterProfileAndUser(userId, updates);
  }

  async updateRecruiterProfileAndUser(userId: string, updates: Partial<RecruiterProfile>): Promise<RecruiterProfile | null> {
    if (hasDatabaseUrl()) {
      try {
        const [prof, user] = await prisma.$transaction(async (tx) => {
          const u = await tx.user.update({
            where: { id: userId },
            data: {
              companyName: updates.companyName,
              companyLocation: updates.companyLocation,
              title: updates.jobTitle,
              avatar: updates.companyLogo || updates.companyLogoUrl,
            },
          });

          const p = await tx.recruiterProfile.upsert({
            where: { userId },
            update: {
              companyName: updates.companyName || 'My Company',
              jobTitle: updates.jobTitle,
              companyLocation: updates.companyLocation,
              companyWebsite: updates.companyWebsite,
              companyDescription: updates.companyDescription,
              companySize: updates.companySize,
              companyLogo: updates.companyLogo || updates.companyLogoUrl,
              industry: updates.industry,
            },
            create: {
              userId,
              companyName: updates.companyName || 'My Company',
              jobTitle: updates.jobTitle,
              companyLocation: updates.companyLocation,
              companyWebsite: updates.companyWebsite,
              companyDescription: updates.companyDescription,
              companySize: updates.companySize,
              companyLogo: updates.companyLogo || updates.companyLogoUrl,
              industry: updates.industry,
            },
          });

          return [p, u];
        });

        return mapPrismaRecruiterProfileToRecruiterProfile(prof, user);
      } catch (e) {
        console.warn('[DB] Prisma updateRecruiterProfile failed, falling back to memory store:', e);
      }
    }

    const currentProf = inMemoryStore.recruiterProfiles.get(userId) || {
      id: `rprof_${userId}`,
      userId,
      companyName: 'My Company',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const merged: RecruiterProfile = {
      ...currentProf,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    inMemoryStore.recruiterProfiles.set(userId, merged);

    const u = inMemoryStore.users.get(userId);
    if (u) {
      if (updates.companyName) u.companyName = updates.companyName;
      if (updates.companyLocation) u.companyLocation = updates.companyLocation;
      if (updates.jobTitle) u.title = updates.jobTitle;
      if (updates.companyLogo || updates.companyLogoUrl) u.avatar = updates.companyLogo || updates.companyLogoUrl;
      inMemoryStore.users.set(userId, u);
    }

    return { ...merged };
  }

  // =========================================================================
  // INTERVIEW METHODS
  // =========================================================================
  async getInterviews(filters?: {
    applicationId?: string;
    candidateName?: string;
    recruiterId?: string;
  }): Promise<InterviewSchedule[]> {
    if (hasDatabaseUrl()) {
      try {
        const where: any = {};
        if (filters?.applicationId) where.applicationId = filters.applicationId;
        if (filters?.candidateName) where.candidateName = { contains: filters.candidateName, mode: 'insensitive' };
        if (filters?.recruiterId) {
          where.application = {
            job: { recruiterId: filters.recruiterId },
          };
        }

        const items = await prisma.interview.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });
        return items.map(mapPrismaInterviewToInterview);
      } catch (e) {
        console.warn('[DB] Prisma getInterviews failed, falling back to memory store:', e);
      }
    }

    let list = Array.from(inMemoryStore.interviews.values());
    if (filters?.applicationId) {
      list = list.filter((i) => i.applicationId === filters.applicationId);
    }
    if (filters?.candidateName) {
      const name = filters.candidateName.toLowerCase();
      list = list.filter((i) => i.candidateName.toLowerCase().includes(name));
    }
    return list;
  }

  async getInterviewById(id: string): Promise<InterviewSchedule | null> {
    if (hasDatabaseUrl()) {
      try {
        const item = await prisma.interview.findUnique({ where: { id } });
        if (item) return mapPrismaInterviewToInterview(item);
      } catch (e) {
        console.warn('[DB] Prisma getInterviewById failed, falling back to memory store:', e);
      }
    }
    const memItem = inMemoryStore.interviews.get(id);
    return memItem ? { ...memItem } : null;
  }

  async createInterview(data: Omit<InterviewSchedule, 'id'>, recruiterId?: string): Promise<InterviewSchedule> {
    if (hasDatabaseUrl()) {
      try {
        const targetApp = await this.getApplicationById(data.applicationId);
        if (!targetApp) throw new Error('Target application not found for interview schedule.');

        const [interview] = await prisma.$transaction(async (tx) => {
          const item = await tx.interview.create({
            data: {
              applicationId: data.applicationId,
              candidateName: data.candidateName,
              jobTitle: data.jobTitle,
              date: data.date,
              time: data.time,
              interviewer: data.interviewer,
              type: data.type || 'Technical',
              meetingLink: data.meetingLink || 'https://meet.google.com/hfw-live-session',
              status: data.status || 'SCHEDULED',
              notes: data.notes,
            },
          });

          await tx.application.update({
            where: { id: data.applicationId },
            data: {
              status: 'INTERVIEWING',
              interviewDate: data.date,
              interviewType: data.type || 'Technical',
            },
          });

          await tx.notification.create({
            data: {
              userId: targetApp.candidateId,
              type: 'INTERVIEW_SCHEDULED',
              title: `Interview scheduled for ${data.jobTitle}`,
              message: `Your ${data.type || 'interview'} with ${data.interviewer} has been scheduled for ${data.date} at ${data.time}.`,
              metadata: {
                interviewId: item.id,
                applicationId: targetApp.id,
                jobTitle: data.jobTitle,
                date: data.date,
                time: data.time,
                meetingLink: data.meetingLink,
              },
            },
          });

          return [item];
        });

        return mapPrismaInterviewToInterview(interview);
      } catch (e: any) {
        if (e.message?.includes('Target application') || e.message?.includes('Forbidden')) throw e;
        console.warn('[DB] Prisma createInterview failed, falling back to memory store:', e);
      }
    }

    const app = inMemoryStore.applications.get(data.applicationId);
    const id = `int_${Date.now()}`;
    const newInterview: InterviewSchedule = {
      id,
      applicationId: data.applicationId,
      candidateName: data.candidateName,
      jobTitle: data.jobTitle,
      date: data.date,
      time: data.time,
      interviewer: data.interviewer,
      type: data.type || 'Technical',
      meetingLink: data.meetingLink || 'https://meet.google.com/hfw-live-session',
      status: data.status || 'SCHEDULED',
      notes: data.notes,
    };

    inMemoryStore.interviews.set(id, newInterview);

    if (app) {
      app.status = 'INTERVIEWING';
      app.interviewDate = data.date;
      app.interviewType = data.type || 'Technical';
      app.interviewDetails = {
        date: data.date,
        time: data.time,
        type: data.type || 'Technical',
      };
      inMemoryStore.applications.set(app.id, app);

      const notifId = `notif_${Date.now()}`;
      inMemoryStore.notifications.set(notifId, {
        id: notifId,
        userId: app.candidateId,
        type: 'INTERVIEW_SCHEDULED',
        title: `Interview scheduled for ${data.jobTitle}`,
        message: `Your ${data.type || 'interview'} with ${data.interviewer} has been scheduled for ${data.date} at ${data.time}.`,
        description: `Your ${data.type || 'interview'} with ${data.interviewer} has been scheduled for ${data.date} at ${data.time}.`,
        isRead: false,
        read: false,
        time: 'Just now',
        createdAt: new Date().toISOString(),
        metadata: {
          interviewId: id,
          applicationId: app.id,
          jobTitle: data.jobTitle,
          date: data.date,
          time: data.time,
        },
      });
    }

    return { ...newInterview };
  }

  async updateInterview(id: string, updates: Partial<InterviewSchedule>): Promise<InterviewSchedule | null> {
    if (hasDatabaseUrl()) {
      try {
        const item = await prisma.interview.update({
          where: { id },
          data: updates as any,
        });
        return mapPrismaInterviewToInterview(item);
      } catch (e) {
        console.warn('[DB] Prisma updateInterview failed, falling back to memory store:', e);
      }
    }
    const item = inMemoryStore.interviews.get(id);
    if (!item) return null;
    const merged: InterviewSchedule = { ...item, ...updates };
    inMemoryStore.interviews.set(id, merged);
    return { ...merged };
  }

  async deleteInterview(id: string): Promise<boolean> {
    if (hasDatabaseUrl()) {
      try {
        await prisma.interview.delete({ where: { id } });
        return true;
      } catch (e) {
        console.warn('[DB] Prisma deleteInterview failed, falling back to memory store:', e);
      }
    }
    inMemoryStore.interviews.delete(id);
    return true;
  }

  // =========================================================================
  // NOTIFICATION METHODS
  // =========================================================================
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (hasDatabaseUrl()) {
      try {
        const list = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
        return list.map(mapPrismaNotificationToNotification);
      } catch (e) {
        console.warn('[DB] Prisma getNotifications failed, falling back to memory store:', e);
      }
    }

    return Array.from(inMemoryStore.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
  }): Promise<NotificationItem> {
    if (hasDatabaseUrl()) {
      try {
        const item = await prisma.notification.create({
          data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            metadata: data.metadata || {},
          },
        });
        return mapPrismaNotificationToNotification(item);
      } catch (e) {
        console.warn('[DB] Prisma createNotification failed, falling back to memory store:', e);
      }
    }

    const id = `notif_${Date.now()}`;
    const newNotif: NotificationItem = {
      id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      description: data.message,
      isRead: false,
      read: false,
      time: 'Just now',
      createdAt: new Date().toISOString(),
      metadata: data.metadata || {},
    };
    inMemoryStore.notifications.set(id, newNotif);
    return { ...newNotif };
  }

  async markNotificationAsRead(id: string, userId: string): Promise<boolean> {
    if (hasDatabaseUrl()) {
      try {
        await prisma.notification.updateMany({
          where: { id, userId },
          data: { isRead: true },
        });
        return true;
      } catch (e) {
        console.warn('[DB] Prisma markNotificationAsRead failed, falling back to memory store:', e);
      }
    }
    const notif = inMemoryStore.notifications.get(id);
    if (notif && notif.userId === userId) {
      notif.isRead = true;
      notif.read = true;
      inMemoryStore.notifications.set(id, notif);
    }
    return true;
  }

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    return this.markNotificationAsRead(id, userId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    if (hasDatabaseUrl()) {
      try {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });
        return true;
      } catch (e) {
        console.warn('[DB] Prisma markAllNotificationsAsRead failed, falling back to memory store:', e);
      }
    }
    for (const notif of inMemoryStore.notifications.values()) {
      if (notif.userId === userId) {
        notif.isRead = true;
        notif.read = true;
      }
    }
    return true;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    return this.markAllNotificationsAsRead(userId);
  }

  // =========================================================================
  // CANDIDATE RESUME METHODS
  // =========================================================================
  async getCandidateResumes(candidateId: string): Promise<CandidateResumeData[]> {
    if (hasDatabaseUrl()) {
      try {
        const list = await prisma.candidateResume.findMany({
          where: { candidateId },
          orderBy: { updatedAt: 'desc' },
        });
        return list.map(mapPrismaResumeToCandidateResume);
      } catch (e) {
        console.warn('[DB] Prisma getCandidateResumes failed, falling back to memory store:', e);
      }
    }
    return Array.from(inMemoryStore.resumes.values())
      .filter((r) => r.candidateId === candidateId)
      .sort((a, b) => new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime());
  }

  async listResumesByCandidateId(candidateId: string): Promise<CandidateResumeData[]> {
    return this.getCandidateResumes(candidateId);
  }

  async getCandidateResumeById(id: string, candidateId?: string): Promise<CandidateResumeData | null> {
    if (hasDatabaseUrl()) {
      try {
        const where: any = { id };
        if (candidateId) where.candidateId = candidateId;
        const r = await prisma.candidateResume.findFirst({ where });
        if (r) return mapPrismaResumeToCandidateResume(r);
      } catch (e) {
        console.warn('[DB] Prisma getCandidateResumeById failed, falling back to memory store:', e);
      }
    }
    const resume = inMemoryStore.resumes.get(id);
    if (!resume) return null;
    if (candidateId && resume.candidateId !== candidateId) return null;
    return { ...resume };
  }

  async getResumeById(id: string, candidateId?: string): Promise<CandidateResumeData | null> {
    return this.getCandidateResumeById(id, candidateId);
  }

  async getResumeByCandidateId(candidateId: string): Promise<CandidateResumeData | null> {
    const list = await this.getCandidateResumes(candidateId);
    if (list.length > 0) return list[0];
    return null;
  }

  async createCandidateResume(candidateId: string, data: Partial<CandidateResumeData>): Promise<CandidateResumeData> {
    if (hasDatabaseUrl()) {
      try {
        const r = await prisma.candidateResume.create({
          data: {
            candidateId,
            title: data.title?.trim() || 'My Resume',
            selectedTemplate: data.selectedTemplate || 'google',
            personalData: (data.personalData || {}) as any,
            summary: data.summary || '',
            education: (data.education || []) as any,
            experience: (data.experience || []) as any,
            projects: (data.projects || []) as any,
            skills: (data.skills || { languages: [], frameworks: [], databases: [], tools: [], aiMl: [], other: [] }) as any,
            certifications: (data.certifications || []) as any,
            achievements: (data.achievements || []) as any,
          },
        });
        return mapPrismaResumeToCandidateResume(r);
      } catch (e) {
        console.warn('[DB] Prisma createCandidateResume failed, falling back to memory store:', e);
      }
    }

    const id = `res_${Date.now()}`;
    const newResume: CandidateResumeData = {
      id,
      candidateId,
      title: data.title?.trim() || 'My Resume',
      selectedTemplate: data.selectedTemplate || 'google',
      personalData: data.personalData || {
        fullName: '',
        professionalTitle: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
      },
      summary: data.summary || '',
      education: data.education || [],
      experience: data.experience || [],
      projects: data.projects || [],
      skills: data.skills || { languages: [], frameworks: [], databases: [], tools: [], aiMl: [], other: [] },
      certifications: data.certifications || [],
      achievements: data.achievements || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryStore.resumes.set(id, newResume);
    return { ...newResume };
  }

  async saveCandidateResume(candidateId: string, data: Partial<CandidateResumeData>): Promise<CandidateResumeData> {
    if (data.id) {
      const updated = await this.updateCandidateResume(data.id, candidateId, data);
      if (updated) return updated;
    }
    return this.createCandidateResume(candidateId, data);
  }

  async updateCandidateResume(
    id: string,
    candidateId: string,
    updates: Partial<CandidateResumeData>
  ): Promise<CandidateResumeData | null> {
    if (hasDatabaseUrl()) {
      try {
        const r = await prisma.candidateResume.update({
          where: { id },
          data: {
            title: updates.title,
            selectedTemplate: updates.selectedTemplate,
            personalData: updates.personalData as any,
            summary: updates.summary,
            education: updates.education as any,
            experience: updates.experience as any,
            projects: updates.projects as any,
            skills: updates.skills as any,
            certifications: updates.certifications as any,
            achievements: updates.achievements as any,
          },
        });
        return mapPrismaResumeToCandidateResume(r);
      } catch (e) {
        console.warn('[DB] Prisma updateCandidateResume failed, falling back to memory store:', e);
      }
    }

    const existing = inMemoryStore.resumes.get(id);
    if (!existing) return null;
    if (existing.candidateId !== candidateId) return null;

    const merged: CandidateResumeData = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    inMemoryStore.resumes.set(id, merged);
    return { ...merged };
  }

  async deleteCandidateResume(id: string, candidateId?: string): Promise<boolean> {
    if (hasDatabaseUrl()) {
      try {
        const where: any = { id };
        if (candidateId) where.candidateId = candidateId;
        await prisma.candidateResume.deleteMany({ where });
        return true;
      } catch (e) {
        console.warn('[DB] Prisma deleteCandidateResume failed, falling back to memory store:', e);
      }
    }
    const existing = inMemoryStore.resumes.get(id);
    if (existing && (!candidateId || existing.candidateId === candidateId)) {
      inMemoryStore.resumes.delete(id);
    }
    return true;
  }

  // =========================================================================
  // RESUME ATS ANALYSIS METHODS
  // =========================================================================
  async getResumeAnalyses(candidateId: string): Promise<ATSAnalysisResult[]> {
    if (hasDatabaseUrl()) {
      try {
        const list = await prisma.resumeAnalysis.findMany({
          where: { candidateId },
          orderBy: { createdAt: 'desc' },
        });
        return list.map(mapPrismaAnalysisToATSResult);
      } catch (e) {
        console.warn('[DB] Prisma getResumeAnalyses failed, falling back to memory store:', e);
      }
    }
    return Array.from(inMemoryStore.analyses.values())
      .filter((a) => a.candidateId === candidateId)
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
  }

  async getResumeAnalysesByCandidateId(candidateId: string): Promise<ATSAnalysisResult[]> {
    return this.getResumeAnalyses(candidateId);
  }

  async getResumeAnalysisById(id: string, candidateId?: string): Promise<ATSAnalysisResult | null> {
    if (hasDatabaseUrl()) {
      try {
        const where: any = { id };
        if (candidateId) where.candidateId = candidateId;
        const item = await prisma.resumeAnalysis.findFirst({ where });
        if (item) return mapPrismaAnalysisToATSResult(item);
      } catch (e) {
        console.warn('[DB] Prisma getResumeAnalysisById failed, falling back to memory store:', e);
      }
    }
    const item = inMemoryStore.analyses.get(id);
    if (!item) return null;
    if (candidateId && item.candidateId !== candidateId) return null;
    return { ...item };
  }

  async saveResumeAnalysis(candidateId: string, analysisData: Partial<ATSAnalysisResult>): Promise<ATSAnalysisResult> {
    if (hasDatabaseUrl()) {
      try {
        const created = await prisma.resumeAnalysis.create({
          data: {
            candidateId,
            resumeId: analysisData.resumeId,
            jobId: analysisData.jobId,
            jobTitle: analysisData.jobTitle || 'Target Role',
            companyName: analysisData.companyName,
            resumeSource: analysisData.resumeSource || 'saved',
            jobSource: analysisData.jobSource || 'job',
            resumeName: analysisData.resumeName || 'Resume Analysis',
            overallScore: analysisData.overallScore || 0,
            categoryScores: (analysisData.categoryScores || {}) as any,
            matchedSkills: (analysisData.matchedSkills || []) as any,
            missingSkills: (analysisData.missingSkills || []) as any,
            weakSkills: (analysisData.weakSkills || []) as any,
            experienceGaps: (analysisData.experienceGaps || []) as any,
            projectRelevance: (analysisData.projectRelevance || []) as any,
            formattingChecks: (analysisData.formattingChecks || []) as any,
            completenessCheck: (analysisData.completenessCheck || {}) as any,
            bulletReviews: (analysisData.bulletReviews || []) as any,
            recommendations: (analysisData.recommendations || []) as any,
            aiSummary: analysisData.aiSummary || '',
            parsedResumeData: (analysisData.parsedResumeData || {}) as any,
            rawResumeText: analysisData.rawResumeText,
            rawJobDescription: analysisData.rawJobDescription,
          },
        });
        return mapPrismaAnalysisToATSResult(created);
      } catch (e) {
        console.warn('[DB] Prisma saveResumeAnalysis failed, falling back to memory store:', e);
      }
    }

    const id = `ana_${Date.now()}`;
    const score = analysisData.overallScore || 0;
    const newAnalysis: ATSAnalysisResult = {
      id,
      candidateId,
      resumeId: analysisData.resumeId,
      jobId: analysisData.jobId,
      jobTitle: analysisData.jobTitle || 'Target Role',
      companyName: analysisData.companyName,
      resumeSource: analysisData.resumeSource || 'saved',
      jobSource: analysisData.jobSource || 'job',
      resumeName: analysisData.resumeName || 'Resume Analysis',
      overallScore: score,
      verdict: analysisData.verdict || (score >= 85 ? 'EXCELLENT_MATCH' : score >= 70 ? 'STRONG_FIT' : score >= 55 ? 'COMPETITIVE_FIT' : 'NEEDS_OPTIMIZATION'),
      categoryScores: analysisData.categoryScores || {
        skills: 0,
        experience: 0,
        keywords: 0,
        impact: 0,
        formatting: 0,
        projects: 0,
        education: 0,
      },
      matchedSkills: analysisData.matchedSkills || [],
      missingSkills: analysisData.missingSkills || [],
      weakSkills: analysisData.weakSkills || [],
      experienceGaps: analysisData.experienceGaps || [],
      projectRelevance: analysisData.projectRelevance || [],
      formattingChecks: analysisData.formattingChecks || [],
      completenessCheck: analysisData.completenessCheck || {
        contactInfo: true,
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: true,
        wordCount: 450,
        estimatedPages: 1,
        readingTimeMinutes: 2,
      },
      bulletReviews: analysisData.bulletReviews || [],
      recommendations: analysisData.recommendations || [],
      aiSummary: analysisData.aiSummary || '',
      parsedResumeData: analysisData.parsedResumeData || {},
      rawResumeText: analysisData.rawResumeText,
      rawJobDescription: analysisData.rawJobDescription,
      createdAt: new Date().toISOString(),
    };

    inMemoryStore.analyses.set(id, newAnalysis);
    return { ...newAnalysis };
  }

  async createResumeAnalysis(candidateId: string, analysisData: Partial<ATSAnalysisResult>): Promise<ATSAnalysisResult> {
    return this.saveResumeAnalysis(candidateId, analysisData);
  }

  async deleteResumeAnalysis(id: string, candidateId?: string): Promise<boolean> {
    if (hasDatabaseUrl()) {
      try {
        const where: any = { id };
        if (candidateId) where.candidateId = candidateId;
        await prisma.resumeAnalysis.deleteMany({ where });
        return true;
      } catch (e) {
        console.warn('[DB] Prisma deleteResumeAnalysis failed, falling back to memory store:', e);
      }
    }
    const item = inMemoryStore.analyses.get(id);
    if (item && (!candidateId || item.candidateId === candidateId)) {
      inMemoryStore.analyses.delete(id);
    }
    return true;
  }
}

export const db = new Database();

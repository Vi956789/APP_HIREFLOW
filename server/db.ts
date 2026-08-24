import { prisma } from './prisma';
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
} from '../src/types';

export interface DBUser extends User {
  passwordHash: string;
}

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
    status: app.status,
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

function mapPrismaCandidateProfileToProfile(prof: any): CandidateProfile {
  return {
    id: prof.id,
    userId: prof.userId,
    headline: prof.headline,
    summary: prof.summary,
    location: prof.location,
    phone: prof.phone,
    portfolioUrl: prof.portfolioUrl || undefined,
    githubUrl: prof.githubUrl || undefined,
    linkedinUrl: prof.linkedinUrl || undefined,
    skills: Array.isArray(prof.skills) ? prof.skills : [],
    experience: Array.isArray(prof.experience) ? prof.experience : [],
    education: Array.isArray(prof.education) ? prof.education : [],
    resumeText: prof.resumeText || '',
    resumeFileName: prof.resumeFileName || undefined,
    avatarUrl: prof.avatarUrl || undefined,
    profileStrength: prof.profileStrength || 85,
  };
}

function mapPrismaRecruiterProfileToProfile(prof: any): RecruiterProfile {
  return {
    id: prof.id,
    userId: prof.userId,
    companyName: prof.companyName || '',
    jobTitle: prof.jobTitle || undefined,
    companyLocation: prof.companyLocation || undefined,
    companyWebsite: prof.companyWebsite || undefined,
    companyDescription: prof.companyDescription || undefined,
    companySize: prof.companySize || undefined,
    industry: prof.industry || undefined,
    companyLogo: prof.companyLogo || undefined,
    companyLogoUrl: prof.companyLogo || undefined,
    createdAt: prof.createdAt instanceof Date ? prof.createdAt.toISOString() : String(prof.createdAt),
    updatedAt: prof.updatedAt instanceof Date ? prof.updatedAt.toISOString() : String(prof.updatedAt),
  };
}

function mapPrismaInterviewToInterview(item: any): InterviewSchedule {
  return {
    id: item.id,
    applicationId: item.applicationId,
    candidateName: item.candidateName,
    jobTitle: item.jobTitle,
    date: item.date,
    time: item.time,
    interviewer: item.interviewer,
    type: item.type,
    meetingLink: item.meetingLink,
    status: item.status,
    notes: item.notes || undefined,
  };
}

function mapPrismaResumeToCandidateResume(r: any): CandidateResumeData {
  return {
    id: r.id,
    candidateId: r.candidateId,
    title: r.title || 'My Resume',
    selectedTemplate: (r.selectedTemplate as 'google' | 'latex') || 'google',
    personalData: typeof r.personalData === 'string' ? JSON.parse(r.personalData) : (r.personalData || {}),
    summary: r.summary || '',
    education: typeof r.education === 'string' ? JSON.parse(r.education) : (r.education || []),
    experience: typeof r.experience === 'string' ? JSON.parse(r.experience) : (r.experience || []),
    projects: typeof r.projects === 'string' ? JSON.parse(r.projects) : (r.projects || []),
    skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : (r.skills || { languages: [], frameworks: [], databases: [], tools: [], aiMl: [], other: [] }),
    certifications: typeof r.certifications === 'string' ? JSON.parse(r.certifications) : (r.certifications || []),
    achievements: typeof r.achievements === 'string' ? JSON.parse(r.achievements) : (r.achievements || []),
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
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
    metadata: typeof n.metadata === 'string' ? JSON.parse(n.metadata) : (n.metadata || {}),
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : String(n.createdAt),
  };
}

function mapPrismaAnalysisToATSResult(item: any): ATSAnalysisResult {
  const overall = item.overallScore || 0;
  let verdict: any = 'MODERATE_FIT';
  if (overall >= 90) verdict = 'EXCELLENT_MATCH';
  else if (overall >= 78) verdict = 'STRONG_FIT';
  else if (overall >= 65) verdict = 'COMPETITIVE_FIT';
  else if (overall >= 50) verdict = 'MODERATE_FIT';
  else verdict = 'NEEDS_OPTIMIZATION';

  return {
    id: item.id,
    candidateId: item.candidateId,
    resumeId: item.resumeId || undefined,
    jobId: item.jobId || undefined,
    jobTitle: item.jobTitle,
    companyName: item.companyName || undefined,
    resumeSource: item.resumeSource as any,
    jobSource: item.jobSource as any,
    resumeName: item.resumeName || undefined,
    overallScore: item.overallScore,
    verdict,
    categoryScores: (item.categoryScores || {
      skills: 0,
      experience: 0,
      keywords: 0,
      impact: 0,
      formatting: 0,
      projects: 0,
      education: 0,
    }) as any,
    matchedSkills: Array.isArray(item.matchedSkills) ? item.matchedSkills : [],
    missingSkills: Array.isArray(item.missingSkills) ? item.missingSkills : [],
    weakSkills: Array.isArray(item.weakSkills) ? item.weakSkills : [],
    experienceGaps: Array.isArray(item.experienceGaps) ? item.experienceGaps : [],
    projectRelevance: Array.isArray(item.projectRelevance) ? item.projectRelevance : [],
    formattingChecks: Array.isArray(item.formattingChecks) ? item.formattingChecks : [],
    completenessCheck: (item.completenessCheck || {
      contactInfo: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      wordCount: 500,
      estimatedPages: 1,
      readingTimeMinutes: 2,
    }) as any,
    bulletReviews: Array.isArray(item.bulletReviews) ? item.bulletReviews : [],
    recommendations: Array.isArray(item.recommendations) ? item.recommendations : [],
    aiSummary: item.aiSummary || '',
    parsedResumeData: item.parsedResumeData || undefined,
    rawResumeText: item.rawResumeText || undefined,
    rawJobDescription: item.rawJobDescription || undefined,
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
    updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
  };
}

export class Database {
  // =========================================================================
  // USER METHODS
  // =========================================================================
  async getUserByEmail(email: string): Promise<DBUser | null> {
    const clean = (email || '').toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: clean,
          mode: 'insensitive',
        },
      },
    });
    return user ? mapPrismaUserToDBUser(user) : null;
  }

  async getUserById(id: string): Promise<DBUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user ? mapPrismaUserToDBUser(user) : null;
  }

  async createUser(userData: Omit<DBUser, 'id' | 'createdAt'>): Promise<DBUser> {
    const cleanEmail = userData.email.toLowerCase().trim();
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: cleanEmail,
        passwordHash: userData.passwordHash,
        role: userData.role as 'RECRUITER' | 'CANDIDATE',
        avatar: userData.avatar,
        title: userData.title,
        companyName: userData.companyName,
        companyLocation: userData.companyLocation,
        phone: userData.phone,
        location: userData.location,
      },
    });

    if (userData.role === 'RECRUITER') {
      await prisma.recruiterProfile.create({
        data: {
          userId: user.id,
          companyName: userData.companyName || 'My Company',
          jobTitle: userData.title || 'Talent Acquisition',
          companyLocation: userData.companyLocation || 'Remote',
        },
      }).catch((err) => {
        console.error('[DB] Failed to create recruiter profile:', err);
      });
    } else {
      await prisma.candidateProfile.create({
        data: {
          userId: user.id,
          phone: userData.phone || '',
          location: userData.location || 'Remote',
          headline: userData.title ? `${userData.title} | Open to Opportunities` : 'Software Professional | Open to Opportunities',
          summary: 'Experienced professional seeking innovative challenges.',
          skills: [],
          experience: [],
          education: [],
          resumeText: `${userData.name} - ${userData.title || 'Software Professional'}`,
        },
      }).catch((err) => {
        console.error('[DB] Failed to create candidate profile:', err);
      });
    }

    return mapPrismaUserToDBUser(user);
  }

  async updateUser(id: string, updates: Partial<DBUser>): Promise<DBUser | null> {
    const data: any = {};
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.email !== undefined) data.email = updates.email.toLowerCase().trim();
    if (updates.passwordHash !== undefined) data.passwordHash = updates.passwordHash;
    if (updates.avatar !== undefined) data.avatar = updates.avatar;
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.companyName !== undefined) data.companyName = updates.companyName;
    if (updates.companyLocation !== undefined) data.companyLocation = updates.companyLocation;
    if (updates.phone !== undefined) data.phone = updates.phone;
    if (updates.location !== undefined) data.location = updates.location;

    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user ? mapPrismaUserToDBUser(user) : null;
  }

  // =========================================================================
  // JOB METHODS
  // =========================================================================
  async getJobs(filters?: {
    recruiterId?: string;
    status?: string;
    department?: string;
    type?: string;
    search?: string;
    includeArchived?: boolean;
    activeOnly?: boolean;
  }): Promise<Job[]> {
    const where: any = {};
    if (filters?.recruiterId) {
      where.recruiterId = filters.recruiterId;
      if (!filters.includeArchived && filters.status !== 'ARCHIVED' && filters.status !== 'ALL') {
        if (!filters.status) {
          where.status = { not: 'ARCHIVED' };
        }
      }
    }
    if (filters?.activeOnly) {
      where.status = 'ACTIVE';
      where.isActive = true;
    } else if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters?.department && filters.department !== 'All') {
      where.department = {
        equals: filters.department,
        mode: 'insensitive',
      };
    }
    if (filters?.type && filters.type !== 'All') {
      where.type = {
        equals: filters.type,
        mode: 'insensitive',
      };
    }
    if (filters?.search) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return jobs.map(mapPrismaJobToJob);
  }

  async getJobById(id: string): Promise<Job | null> {
    const job = await prisma.job.findUnique({
      where: { id },
    });
    return job ? mapPrismaJobToJob(job) : null;
  }

  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'applicantCount'>): Promise<Job> {
    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        companyLogo: jobData.companyLogo,
        department: jobData.department,
        location: jobData.location,
        type: jobData.type,
        experienceLevel: jobData.experienceLevel,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryCurrency: jobData.salaryCurrency,
        description: jobData.description,
        requirements: jobData.requirements as any,
        niceToHave: (jobData.niceToHave || []) as any,
        benefits: (jobData.benefits || []) as any,
        skills: (jobData.skills || []) as any,
        status: jobData.status || 'ACTIVE',
        isActive: jobData.status !== 'CLOSED' && jobData.status !== 'ARCHIVED',
        recruiterId: jobData.recruiterId,
        recruiterName: jobData.recruiterName,
        applicantCount: 0,
      },
    });
    return mapPrismaJobToJob(job);
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    const data: any = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.company !== undefined) data.company = updates.company;
    if (updates.companyLogo !== undefined) data.companyLogo = updates.companyLogo;
    if (updates.department !== undefined) data.department = updates.department;
    if (updates.location !== undefined) data.location = updates.location;
    if (updates.type !== undefined) data.type = updates.type;
    if (updates.experienceLevel !== undefined) data.experienceLevel = updates.experienceLevel;
    if (updates.salaryMin !== undefined) data.salaryMin = updates.salaryMin;
    if (updates.salaryMax !== undefined) data.salaryMax = updates.salaryMax;
    if (updates.salaryCurrency !== undefined) data.salaryCurrency = updates.salaryCurrency;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.requirements !== undefined) data.requirements = updates.requirements as any;
    if (updates.niceToHave !== undefined) data.niceToHave = updates.niceToHave as any;
    if (updates.benefits !== undefined) data.benefits = updates.benefits as any;
    if (updates.skills !== undefined) data.skills = updates.skills as any;
    if (updates.status !== undefined) {
      data.status = updates.status;
      data.isActive = updates.status === 'ACTIVE';
      if (updates.status === 'CLOSED') {
        data.closedAt = new Date();
      } else if (updates.status === 'ARCHIVED') {
        data.archivedAt = new Date();
      }
    }
    if (updates.isActive !== undefined) data.isActive = updates.isActive;
    if (updates.applicantCount !== undefined) data.applicantCount = updates.applicantCount;

    const job = await prisma.job.update({
      where: { id },
      data,
    });
    return job ? mapPrismaJobToJob(job) : null;
  }

  async closeJob(jobId: string, recruiterId: string): Promise<Job> {
    const existing = await this.getJobById(jobId);
    if (!existing) throw new Error('Job requisition not found.');
    if (existing.recruiterId !== recruiterId) throw new Error('Forbidden. You can only close your own job postings.');

    const [updatedJob] = await prisma.$transaction(async (tx) => {
      const job = await tx.job.update({
        where: { id: jobId },
        data: {
          status: 'CLOSED',
          isActive: false,
          closedAt: new Date(),
        },
      });

      // Find all active/in-progress applications for this job that aren't already HIRED, REJECTED, or JOB_CLOSED
      const activeApps = await tx.application.findMany({
        where: {
          jobId,
          status: { notIn: ['HIRED', 'REJECTED', 'JOB_CLOSED'] },
        },
      });

      if (activeApps.length > 0) {
        await tx.application.updateMany({
          where: {
            jobId,
            status: { notIn: ['HIRED', 'REJECTED', 'JOB_CLOSED'] },
          },
          data: { status: 'JOB_CLOSED' },
        });

        for (const app of activeApps) {
          await tx.notification.create({
            data: {
              userId: app.candidateId,
              type: 'JOB_CLOSED',
              title: 'Hiring closed',
              message: `Hiring for ${job.title} at ${job.company} has been closed.`,
              isRead: false,
              metadata: {
                jobId: job.id,
                jobTitle: job.title,
                company: job.company,
                applicationId: app.id,
                previousStatus: app.status,
                newStatus: 'JOB_CLOSED',
              },
            },
          });
        }
      }

      return [job];
    });

    return mapPrismaJobToJob(updatedJob);
  }

  async archiveJob(jobId: string, recruiterId: string): Promise<Job> {
    const existing = await this.getJobById(jobId);
    if (!existing) throw new Error('Job requisition not found.');
    if (existing.recruiterId !== recruiterId) throw new Error('Forbidden. You can only archive your own job postings.');

    const [updatedJob] = await prisma.$transaction(async (tx) => {
      const job = await tx.job.update({
        where: { id: jobId },
        data: {
          status: 'ARCHIVED',
          isActive: false,
          archivedAt: new Date(),
        },
      });

      // Find all active/in-progress applications for this job that aren't already HIRED, REJECTED, or JOB_CLOSED
      const activeApps = await tx.application.findMany({
        where: {
          jobId,
          status: { notIn: ['HIRED', 'REJECTED', 'JOB_CLOSED'] },
        },
      });

      if (activeApps.length > 0) {
        await tx.application.updateMany({
          where: {
            jobId,
            status: { notIn: ['HIRED', 'REJECTED', 'JOB_CLOSED'] },
          },
          data: { status: 'JOB_CLOSED' },
        });

        for (const app of activeApps) {
          await tx.notification.create({
            data: {
              userId: app.candidateId,
              type: 'JOB_CLOSED',
              title: 'Position archived',
              message: `The position ${job.title} at ${job.company} has been archived.`,
              isRead: false,
              metadata: {
                jobId: job.id,
                jobTitle: job.title,
                company: job.company,
                applicationId: app.id,
                previousStatus: app.status,
                newStatus: 'JOB_CLOSED',
              },
            },
          });
        }
      }

      return [job];
    });

    return mapPrismaJobToJob(updatedJob);
  }

  async deleteJob(id: string, recruiterId?: string): Promise<boolean> {
    if (recruiterId) {
      await this.archiveJob(id, recruiterId);
      return true;
    }
    await prisma.job.delete({
      where: { id },
    });
    return true;
  }

  // =========================================================================
  // APPLICATION METHODS
  // =========================================================================
  async getApplications(filters?: {
    jobId?: string;
    candidateId?: string;
    recruiterId?: string;
    status?: string;
    excludeArchivedJobs?: boolean;
  }): Promise<Application[]> {
    const where: any = {};
    if (filters?.jobId) where.jobId = filters.jobId;
    if (filters?.candidateId) where.candidateId = filters.candidateId;
    if (filters?.recruiterId) {
      where.job = {
        recruiterId: filters.recruiterId,
        ...(filters.excludeArchivedJobs ? { status: { not: 'ARCHIVED' } } : {}),
      };
    }
    if (filters?.status && filters.status !== 'ALL') where.status = filters.status;

    const apps = await prisma.application.findMany({
      where,
      include: {
        interviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { appliedDate: 'desc' },
    });
    return apps.map(mapPrismaApplicationToApplication);
  }

  async getApplicationById(id: string): Promise<Application | null> {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        interviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    return app ? mapPrismaApplicationToApplication(app) : null;
  }

  async createApplication(appData: Omit<Application, 'id' | 'appliedDate'>): Promise<Application> {
    const targetJob = await this.getJobById(appData.jobId);
    if (!targetJob) throw new Error('Target job requisition not found.');
    if (!targetJob.isActive || targetJob.status !== 'ACTIVE') {
      throw new Error('This job is closed and no longer accepting applications.');
    }

    const [app] = await prisma.$transaction(async (tx) => {
      const existing = await tx.application.findFirst({
        where: {
          jobId: appData.jobId,
          candidateId: appData.candidateId,
        },
      });
      if (existing) {
        throw new Error('You have already applied for this position.');
      }

      const createdApp = await tx.application.create({
        data: {
          jobId: appData.jobId,
          jobTitle: appData.jobTitle,
          company: appData.company,
          candidateId: appData.candidateId,
          candidateName: appData.candidateName,
          candidateEmail: appData.candidateEmail,
          candidateAvatar: appData.candidateAvatar,
          candidateTitle: appData.candidateTitle,
          candidateLocation: appData.candidateLocation,
          status: appData.status || 'APPLIED',
          resumeText: appData.resumeText,
          coverLetter: appData.coverLetter,
          aiMatch: appData.aiMatch as any,
          recruiterNotes: appData.recruiterNotes,
          interviewDate: appData.interviewDate,
          interviewType: appData.interviewType,
        },
      });

      await tx.job.update({
        where: { id: appData.jobId },
        data: { applicantCount: { increment: 1 } },
      });

      await tx.notification.create({
        data: {
          userId: targetJob.recruiterId,
          type: 'NEW_APPLICATION',
          title: `New applicant for ${targetJob.title}`,
          message: `${appData.candidateName} has submitted an application for ${targetJob.title}.`,
          metadata: {
            jobId: targetJob.id,
            jobTitle: targetJob.title,
            applicationId: createdApp.id,
            candidateId: appData.candidateId,
            candidateName: appData.candidateName,
          },
        },
      });

      return [createdApp];
    });

    return mapPrismaApplicationToApplication(app);
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application | null> {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.application.findUnique({
        where: { id },
        include: {
          job: true,
          interviews: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!existing) return null;

      // Validate job lifecycle state for stage/status transitions
      if (updates.status !== undefined && existing.job) {
        const isJobInactive =
          existing.job.status === 'CLOSED' ||
          existing.job.status === 'ARCHIVED' ||
          existing.job.isActive === false;

        if (isJobInactive) {
          throw new Error('This job is no longer active. Candidate status cannot be changed.');
        }
      }

      const data: any = {};
      if (updates.status !== undefined) data.status = updates.status;
      if (updates.recruiterNotes !== undefined) data.recruiterNotes = updates.recruiterNotes;
      if (updates.interviewDate !== undefined) data.interviewDate = updates.interviewDate;
      if (updates.interviewType !== undefined) data.interviewType = updates.interviewType;

      const app = await tx.application.update({
        where: { id },
        data,
        include: {
          interviews: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      // Normalize status helper for duplicate prevention
      const normalizeStatus = (s?: string) => {
        if (!s) return '';
        const upper = s.toUpperCase().trim();
        if (upper === 'SCREENING') return 'SHORTLISTED';
        if (upper === 'INTERVIEWING') return 'INTERVIEW';
        if (upper === 'OFFERED') return 'OFFER';
        if (upper === 'CLOSED') return 'JOB_CLOSED';
        return upper;
      };

      const oldStatusNorm = normalizeStatus(existing.status);
      const newStatusNorm = updates.status ? normalizeStatus(updates.status) : oldStatusNorm;
      const statusChanged = updates.status !== undefined && oldStatusNorm !== newStatusNorm;

      if (statusChanged && updates.status) {
        const jobTitle = existing.jobTitle || existing.job?.title || 'Position';
        const companyName = existing.company || existing.job?.company || 'Company';

        let notifInfo: { type: string; title: string; message: string } | null = null;

        if (newStatusNorm === 'SHORTLISTED') {
          notifInfo = {
            type: 'APPLICATION_SHORTLISTED',
            title: 'Application shortlisted',
            message: `Your application for ${jobTitle} at ${companyName} has been shortlisted.`,
          };
        } else if (newStatusNorm === 'INTERVIEW') {
          notifInfo = {
            type: 'APPLICATION_INTERVIEW',
            title: 'Interview stage reached',
            message: `Your application for ${jobTitle} at ${companyName} has moved to the interview stage.`,
          };
        } else if (newStatusNorm === 'OFFER') {
          notifInfo = {
            type: 'APPLICATION_OFFER',
            title: 'Offer received',
            message: `Congratulations! You have received an offer for ${jobTitle} at ${companyName}.`,
          };
        } else if (newStatusNorm === 'HIRED') {
          notifInfo = {
            type: 'APPLICATION_HIRED',
            title: "Congratulations — You're hired!",
            message: `Your application for ${jobTitle} at ${companyName} has been marked as hired.`,
          };
        } else if (newStatusNorm === 'REJECTED') {
          notifInfo = {
            type: 'APPLICATION_REJECTED',
            title: 'Application update',
            message: `Your application for ${jobTitle} at ${companyName} was not selected.`,
          };
        } else if (newStatusNorm === 'JOB_CLOSED') {
          notifInfo = {
            type: 'JOB_CLOSED',
            title: 'Hiring closed',
            message: `Hiring for ${jobTitle} at ${companyName} has been closed.`,
          };
        }

        if (notifInfo) {
          // existing.candidateId is User.id in Prisma schema
          await tx.notification.create({
            data: {
              userId: existing.candidateId,
              type: notifInfo.type,
              title: notifInfo.title,
              message: notifInfo.message,
              isRead: false,
              metadata: {
                applicationId: id,
                jobId: existing.jobId,
                jobTitle,
                company: companyName,
                previousStatus: existing.status,
                newStatus: updates.status,
              },
            },
          });
        }
      }

      return mapPrismaApplicationToApplication(app);
    });
  }

  // =========================================================================
  // PROFILE METHODS
  // =========================================================================
  async getProfile(userId: string): Promise<CandidateProfile> {
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { candidateProfile: true },
    });

    if (!userWithProfile) {
      throw new Error(`User with ID ${userId} not found in database.`);
    }

    let profile = userWithProfile.candidateProfile;
    if (!profile) {
      profile = await prisma.candidateProfile.create({
        data: {
          userId,
          headline: userWithProfile.title ? `${userWithProfile.title} | Open to Opportunities` : 'Software Professional | Open to Opportunities',
          summary: 'Experienced and motivated professional seeking innovative software engineering and AI challenges.',
          location: userWithProfile.location || 'Remote',
          phone: userWithProfile.phone || '',
          skills: [],
          experience: [],
          education: [],
          resumeText: `${userWithProfile.name} - ${userWithProfile.title || 'Software Professional'}`,
          profileStrength: 85,
        },
      });
    }

    const mapped = mapPrismaCandidateProfileToProfile(profile);
    return {
      ...mapped,
      name: userWithProfile.name,
      email: userWithProfile.email,
      title: userWithProfile.title || profile.headline,
      avatar: userWithProfile.avatar || undefined,
    };
  }

  async updateProfile(
    userId: string,
    updates: Partial<CandidateProfile> & { name?: string; title?: string }
  ): Promise<{ user: DBUser; profile: CandidateProfile }> {
    return this.updateCandidateProfileAndUser(userId, updates as any);
  }

  async updateCandidateProfileAndUser(
    userId: string,
    updates: {
      name?: string;
      title?: string;
      headline?: string;
      summary?: string;
      location?: string;
      phone?: string;
      portfolioUrl?: string;
      githubUrl?: string;
      linkedinUrl?: string;
      skills?: any;
      experience?: any;
      education?: any;
      resumeText?: string;
      resumeFileName?: string;
      avatar?: string;
      avatarUrl?: string;
    }
  ): Promise<{ user: DBUser; profile: CandidateProfile }> {
    const avatarValue = updates.avatarUrl !== undefined ? updates.avatarUrl : updates.avatar;

    const [updatedUser, updatedProfile] = await prisma.$transaction(async (tx) => {
      const userUpdates: any = {};
      if (updates.name !== undefined) userUpdates.name = updates.name;
      if (updates.title !== undefined) userUpdates.title = updates.title;
      if (updates.location !== undefined) userUpdates.location = updates.location;
      if (updates.phone !== undefined) userUpdates.phone = updates.phone;
      if (avatarValue !== undefined) userUpdates.avatar = avatarValue;

      const user = await tx.user.update({
        where: { id: userId },
        data: userUpdates,
      });

      const profUpdates: any = {};
      if (updates.headline !== undefined) profUpdates.headline = updates.headline;
      else if (updates.title !== undefined) profUpdates.headline = `${updates.title} | Open to Opportunities`;
      if (updates.summary !== undefined) profUpdates.summary = updates.summary;
      if (updates.location !== undefined) profUpdates.location = updates.location;
      if (updates.phone !== undefined) profUpdates.phone = updates.phone;
      if (updates.portfolioUrl !== undefined) profUpdates.portfolioUrl = updates.portfolioUrl;
      if (updates.githubUrl !== undefined) profUpdates.githubUrl = updates.githubUrl;
      if (updates.linkedinUrl !== undefined) profUpdates.linkedinUrl = updates.linkedinUrl;
      if (updates.skills !== undefined) profUpdates.skills = updates.skills as any;
      if (updates.experience !== undefined) profUpdates.experience = updates.experience as any;
      if (updates.education !== undefined) profUpdates.education = updates.education as any;
      if (updates.resumeText !== undefined) profUpdates.resumeText = updates.resumeText;
      if (updates.resumeFileName !== undefined) profUpdates.resumeFileName = updates.resumeFileName;
      if (avatarValue !== undefined) profUpdates.avatarUrl = avatarValue;

      let strength = 40;
      if (updates.summary || profUpdates.summary) strength += 15;
      if ((updates.skills && updates.skills.length > 0) || (profUpdates.skills && profUpdates.skills.length > 0)) strength += 15;
      if ((updates.experience && updates.experience.length > 0) || (profUpdates.experience && profUpdates.experience.length > 0)) strength += 15;
      if (updates.resumeText || profUpdates.resumeText) strength += 15;
      profUpdates.profileStrength = Math.min(100, strength);

      const titleVal = updates.title || updates.headline;
      const prof = await tx.candidateProfile.upsert({
        where: { userId },
        update: profUpdates,
        create: {
          userId,
          headline: titleVal || user.title || 'Software Professional | Open to Opportunities',
          summary: updates.summary || 'Experienced professional seeking innovative challenges.',
          location: updates.location || user.location || 'Remote',
          phone: updates.phone || user.phone || '',
          skills: (updates.skills || []) as any,
          experience: (updates.experience || []) as any,
          education: (updates.education || []) as any,
          resumeText: updates.resumeText || '',
          resumeFileName: updates.resumeFileName,
          avatarUrl: avatarValue || null,
          profileStrength: Math.min(100, strength),
        },
      });

      return [user, prof];
    });

    const mappedUser = mapPrismaUserToDBUser(updatedUser);
    const mappedProfile = mapPrismaCandidateProfileToProfile(updatedProfile);

    return {
      user: mappedUser,
      profile: {
        ...mappedProfile,
        name: mappedUser.name,
        email: mappedUser.email,
        title: mappedUser.title || mappedProfile.headline,
        avatar: mappedUser.avatar || mappedProfile.avatarUrl || undefined,
        avatarUrl: mappedProfile.avatarUrl || mappedUser.avatar || undefined,
      },
    };
  }

  // =========================================================================
  // RECRUITER PROFILE METHODS
  // =========================================================================
  async getRecruiterProfile(userId: string): Promise<RecruiterProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { recruiterProfile: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found in database.`);
    }

    let profile = user.recruiterProfile;
    if (!profile) {
      profile = await prisma.recruiterProfile.create({
        data: {
          userId,
          companyName: user.companyName || 'My Company',
          jobTitle: user.title || 'Head of Talent Acquisition',
          companyLocation: user.companyLocation || 'Remote',
          companyWebsite: '',
          companyDescription: 'Fast-growing innovative team building industry-leading solutions.',
          companySize: '50-200 employees',
          industry: 'Technology & Software',
        },
      });
    }

    return mapPrismaRecruiterProfileToProfile(profile);
  }

  async updateRecruiterProfile(
    userId: string,
    updates: Partial<RecruiterProfile> & { name?: string; title?: string }
  ): Promise<{ user: DBUser; profile: RecruiterProfile }> {
    const [updatedUser, updatedProfile] = await prisma.$transaction(async (tx) => {
      const userUpdates: any = {};
      if (updates.name !== undefined) userUpdates.name = updates.name;
      if (updates.title !== undefined) userUpdates.title = updates.title;
      if (updates.companyName !== undefined) userUpdates.companyName = updates.companyName;
      if (updates.companyLocation !== undefined) userUpdates.companyLocation = updates.companyLocation;
      if (updates.companyLogoUrl !== undefined || updates.companyLogo !== undefined) {
        userUpdates.avatar = updates.companyLogoUrl || updates.companyLogo;
      }

      const user = await tx.user.update({
        where: { id: userId },
        data: userUpdates,
      });

      const profUpdates: any = {};
      if (updates.companyName !== undefined) profUpdates.companyName = updates.companyName;
      if (updates.jobTitle !== undefined) profUpdates.jobTitle = updates.jobTitle;
      else if (updates.title !== undefined) profUpdates.jobTitle = updates.title;
      if (updates.companyLocation !== undefined) profUpdates.companyLocation = updates.companyLocation;
      if (updates.companyWebsite !== undefined) profUpdates.companyWebsite = updates.companyWebsite;
      if (updates.companyDescription !== undefined) profUpdates.companyDescription = updates.companyDescription;
      if (updates.companySize !== undefined) profUpdates.companySize = updates.companySize;
      if (updates.industry !== undefined) profUpdates.industry = updates.industry;
      if (updates.companyLogo !== undefined) profUpdates.companyLogo = updates.companyLogo;
      if (updates.companyLogoUrl !== undefined) profUpdates.companyLogo = updates.companyLogoUrl;

      const profile = await tx.recruiterProfile.upsert({
        where: { userId },
        update: profUpdates,
        create: {
          userId,
          companyName: updates.companyName || user.companyName || 'My Company',
          jobTitle: updates.jobTitle || updates.title || user.title || 'Head of Talent Acquisition',
          companyLocation: updates.companyLocation || user.companyLocation || 'Remote',
          companyWebsite: updates.companyWebsite || '',
          companyDescription: updates.companyDescription || 'Fast-growing innovative team.',
          companySize: updates.companySize || '50-200 employees',
          industry: updates.industry || 'Technology',
          companyLogo: updates.companyLogo || updates.companyLogoUrl || null,
        },
      });

      return [user, profile];
    });

    return {
      user: mapPrismaUserToDBUser(updatedUser),
      profile: mapPrismaRecruiterProfileToProfile(updatedProfile),
    };
  }

  async updateRecruiterProfileAndUser(
    userId: string,
    updates: Partial<RecruiterProfile> & { name?: string; title?: string }
  ): Promise<{ user: DBUser; profile: RecruiterProfile }> {
    return this.updateRecruiterProfile(userId, updates);
  }

  // =========================================================================
  // INTERVIEW METHODS
  // =========================================================================
  async getInterviews(filters?: { applicationId?: string; recruiterId?: string }): Promise<InterviewSchedule[]> {
    const where: any = {};
    if (filters?.applicationId) {
      where.applicationId = filters.applicationId;
    }
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
  }

  async getInterviewById(id: string): Promise<InterviewSchedule | null> {
    const item = await prisma.interview.findUnique({
      where: { id },
    });
    return item ? mapPrismaInterviewToInterview(item) : null;
  }

  async createInterview(data: Omit<InterviewSchedule, 'id'>, recruiterId?: string): Promise<InterviewSchedule> {
    const targetApp = await this.getApplicationById(data.applicationId);
    if (!targetApp) throw new Error('Target application not found for interview schedule.');

    const job = await this.getJobById(targetApp.jobId);
    if (!job) throw new Error('Associated job requisition not found.');

    if (recruiterId && job.recruiterId !== recruiterId) {
      throw new Error('Forbidden. You can only schedule interviews for your own job requisitions.');
    }

    if (job.status === 'CLOSED' || job.status === 'ARCHIVED' || job.isActive === false) {
      throw new Error('This job is no longer active. Interviews cannot be scheduled.');
    }

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
          status: 'INTERVIEW',
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
  }

  async updateInterview(id: string, updates: Partial<InterviewSchedule>): Promise<InterviewSchedule | null> {
    const data: any = {};
    if (updates.date !== undefined) data.date = updates.date;
    if (updates.time !== undefined) data.time = updates.time;
    if (updates.interviewer !== undefined) data.interviewer = updates.interviewer;
    if (updates.type !== undefined) data.type = updates.type;
    if (updates.meetingLink !== undefined) data.meetingLink = updates.meetingLink;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.notes !== undefined) data.notes = updates.notes;

    const item = await prisma.interview.update({
      where: { id },
      data,
    });
    return item ? mapPrismaInterviewToInterview(item) : null;
  }

  async deleteInterview(id: string): Promise<boolean> {
    await prisma.interview.delete({
      where: { id },
    });
    return true;
  }

  // =========================================================================
  // NOTIFICATION METHODS
  // =========================================================================
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const list = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return list.map(mapPrismaNotificationToNotification);
  }

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
  }): Promise<NotificationItem> {
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
  }

  async markNotificationAsRead(id: string, userId: string): Promise<boolean> {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return true;
  }

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    return this.markNotificationAsRead(id, userId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return true;
  }

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    return this.markAllNotificationsAsRead(userId);
  }

  // =========================================================================
  // CANDIDATE RESUME METHODS (Builder & Generator)
  // =========================================================================
  async getCandidateResumes(candidateId: string): Promise<CandidateResumeData[]> {
    const list = await prisma.candidateResume.findMany({
      where: { candidateId },
      orderBy: { updatedAt: 'desc' },
    });
    return list.map(mapPrismaResumeToCandidateResume);
  }

  async listResumesByCandidateId(candidateId: string): Promise<CandidateResumeData[]> {
    return this.getCandidateResumes(candidateId);
  }

  async getCandidateResumeById(id: string, candidateId?: string): Promise<CandidateResumeData | null> {
    const where: any = { id };
    if (candidateId) where.candidateId = candidateId;
    const r = await prisma.candidateResume.findFirst({ where });
    return r ? mapPrismaResumeToCandidateResume(r) : null;
  }

  async getResumeById(id: string, candidateId?: string): Promise<CandidateResumeData | null> {
    return this.getCandidateResumeById(id, candidateId);
  }

  async getResumeByCandidateId(candidateId: string): Promise<CandidateResumeData | null> {
    const list = await this.getCandidateResumes(candidateId);
    if (list.length > 0) return list[0];
    return null;
  }

  async createCandidateResume(
    candidateId: string,
    data: Partial<CandidateResumeData>
  ): Promise<CandidateResumeData> {
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
  }

  async saveCandidateResume(
    candidateId: string,
    data: Partial<CandidateResumeData>
  ): Promise<CandidateResumeData> {
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
    const data: any = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.selectedTemplate !== undefined) data.selectedTemplate = updates.selectedTemplate;
    if (updates.personalData !== undefined) data.personalData = updates.personalData as any;
    if (updates.summary !== undefined) data.summary = updates.summary;
    if (updates.education !== undefined) data.education = updates.education as any;
    if (updates.experience !== undefined) data.experience = updates.experience as any;
    if (updates.projects !== undefined) data.projects = updates.projects as any;
    if (updates.skills !== undefined) data.skills = updates.skills as any;
    if (updates.certifications !== undefined) data.certifications = updates.certifications as any;
    if (updates.achievements !== undefined) data.achievements = updates.achievements as any;

    const r = await prisma.candidateResume.update({
      where: { id },
      data,
    });
    return r ? mapPrismaResumeToCandidateResume(r) : null;
  }

  async deleteCandidateResume(id: string, candidateId?: string): Promise<boolean> {
    const where: any = { id };
    if (candidateId) where.candidateId = candidateId;
    await prisma.candidateResume.deleteMany({ where });
    return true;
  }

  // =========================================================================
  // RESUME ATS ANALYSIS METHODS
  // =========================================================================
  async getResumeAnalyses(candidateId: string): Promise<ATSAnalysisResult[]> {
    const list = await prisma.resumeAnalysis.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map(mapPrismaAnalysisToATSResult);
  }

  async getResumeAnalysesByCandidateId(candidateId: string): Promise<ATSAnalysisResult[]> {
    return this.getResumeAnalyses(candidateId);
  }

  async getResumeAnalysisById(id: string, candidateId?: string): Promise<ATSAnalysisResult | null> {
    const where: any = { id };
    if (candidateId) where.candidateId = candidateId;
    const item = await prisma.resumeAnalysis.findFirst({ where });
    return item ? mapPrismaAnalysisToATSResult(item) : null;
  }

  async saveResumeAnalysis(
    candidateId: string,
    analysisData: Partial<ATSAnalysisResult>
  ): Promise<ATSAnalysisResult> {
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
  }

  async createResumeAnalysis(
    candidateId: string,
    analysisData: Partial<ATSAnalysisResult>
  ): Promise<ATSAnalysisResult> {
    return this.saveResumeAnalysis(candidateId, analysisData);
  }

  async deleteResumeAnalysis(id: string, candidateId?: string): Promise<boolean> {
    const where: any = { id };
    if (candidateId) where.candidateId = candidateId;
    await prisma.resumeAnalysis.deleteMany({ where });
    return true;
  }
}

export const db = new Database();

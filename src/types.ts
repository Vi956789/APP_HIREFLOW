export type UserRole = 'RECRUITER' | 'CANDIDATE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  companyName?: string;
  companyLocation?: string;
  phone?: string;
  location?: string;
  createdAt: string;
}

export interface JobExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  field: string;
  graduationYear: string;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName: string;
  jobTitle?: string;
  companyLocation?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companySize?: string;
  companyLogo?: string;
  companyLogoUrl?: string;
  industry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline: string;
  summary: string;
  location: string;
  phone: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  skills: { name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' }[];
  experience: JobExperience[];
  education: Education[];
  resumeText: string;
  resumeFileName?: string;
  profileStrength: number; // 0-100
  name?: string;
  email?: string;
  title?: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  department: 'Engineering' | 'Design' | 'Product' | 'Marketing' | 'Sales' | 'Operations' | string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid' | string;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive' | string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  description: string;
  requirements: string[];
  niceToHave?: string[];
  benefits?: string[];
  skills: string[];
  status: 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'ARCHIVED';
  isActive?: boolean;
  closedAt?: string;
  archivedAt?: string;
  recruiterId: string;
  recruiterName: string;
  createdAt: string;
  applicantCount: number;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEWING'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED'
  | 'JOB_CLOSED';

export interface AIMatchBreakdown {
  overallScore: number; // 0-100
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  aiSummary: string;
  recommendedInterviewQuestions?: string[];
  verdict: 'STRONG_FIT' | 'POTENTIAL_FIT' | 'LOW_FIT';
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyName?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string;
  candidateTitle?: string;
  candidateLocation?: string;
  appliedDate: string;
  status: ApplicationStatus;
  resumeText: string;
  coverLetter?: string;
  aiMatch: AIMatchBreakdown;
  recruiterNotes?: string;
  interviewDate?: string;
  interviewType?: 'Phone Screen' | 'Technical' | 'Behavioral' | 'Final Round' | string;
  interviewDetails?: {
    date: string;
    time: string;
    type: string;
  };
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  interviewer: string;
  type: 'Phone Screen' | 'Technical' | 'Behavioral' | 'Final Round' | string;
  meetingLink: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | 'APPLICATION_STATUS_CHANGED'
    | 'JOB_CLOSED'
    | 'JOB_ARCHIVED'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEW_UPDATED'
    | 'OFFER_RECEIVED'
    | 'NEW_APPLICATION'
    | 'application'
    | 'interview'
    | 'match'
    | 'system'
    | string;
  title: string;
  message: string;
  description?: string; // compatibility
  isRead: boolean;
  read?: boolean; // compatibility
  time?: string;
  metadata?: any;
  createdAt: string;
}

export type ResumeTemplateType = 'google' | 'latex';

export interface ResumePersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface ResumeEducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location?: string;
  startDate: string;
  endDate: string;
  grade?: string;
  details?: string;
}

export interface ResumeExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ResumeProjectItem {
  id: string;
  name: string;
  technologies: string;
  githubUrl?: string;
  liveUrl?: string;
  bullets: string[];
}

export interface ResumeSkillsCategories {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  aiMl: string[];
  other: string[];
}

export interface ResumeCertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface ResumeAchievementItem {
  id: string;
  text: string;
}

export interface CandidateResumeData {
  id?: string;
  candidateId?: string;
  title: string;
  selectedTemplate: ResumeTemplateType;
  personalData: ResumePersonalInfo;
  summary: string;
  education: ResumeEducationItem[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  skills: ResumeSkillsCategories;
  certifications: ResumeCertificationItem[];
  achievements: ResumeAchievementItem[];
  createdAt?: string;
  updatedAt?: string;
}

export type ATSScoreVerdict =
  | 'EXCELLENT_MATCH'
  | 'STRONG_FIT'
  | 'COMPETITIVE_FIT'
  | 'MODERATE_FIT'
  | 'NEEDS_OPTIMIZATION';

export interface ATSCategoryScores {
  skills: number; // 25%
  experience: number; // 20%
  keywords: number; // 15%
  impact: number; // 15%
  formatting: number; // 10%
  projects: number; // 10%
  education: number; // 5%
}

export interface ATSMatchedSkill {
  name: string;
  category: string;
  importance: 'CRITICAL' | 'IMPORTANT' | 'NICE_TO_HAVE';
  context?: string;
}

export interface ATSMissingSkill {
  name: string;
  category: string;
  importance: 'CRITICAL' | 'IMPORTANT' | 'NICE_TO_HAVE';
  reason: string;
  suggestedSection: string;
}

export interface ATSWeakSkill {
  name: string;
  currentEvidence: string;
  recommendation: string;
}

export interface ATSExperienceGap {
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  detail: string;
  recommendation: string;
}

export interface ATSProjectRelevance {
  title: string;
  relevanceScore: number;
  feedback: string;
  keywordAlignment: string[];
}

export interface ATSFormattingCheck {
  name: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  message: string;
  tip?: string;
}

export interface ATSCompletenessCheck {
  contactInfo: boolean;
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  projects: boolean;
  wordCount: number;
  estimatedPages: number;
  readingTimeMinutes: number;
}

export interface ATSBulletReview {
  id: string;
  originalBullet: string;
  improvedBullet: string;
  roleOrProject?: string;
  reason: string;
  addedKeywords: string[];
  accepted?: boolean;
}

export interface ATSRecommendation {
  priority: 'P1' | 'P2' | 'P3';
  category: string;
  action: string;
  impact: string;
}

export interface ATSAnalysisResult {
  id?: string;
  candidateId?: string;
  resumeId?: string;
  jobId?: string;
  jobTitle: string;
  companyName?: string;
  resumeSource: 'saved' | 'upload' | 'paste';
  jobSource: 'job' | 'upload' | 'paste';
  resumeName?: string;
  overallScore: number;
  verdict: ATSScoreVerdict;
  categoryScores: ATSCategoryScores;
  matchedSkills: ATSMatchedSkill[];
  missingSkills: ATSMissingSkill[];
  weakSkills: ATSWeakSkill[];
  experienceGaps: ATSExperienceGap[];
  projectRelevance: ATSProjectRelevance[];
  formattingChecks: ATSFormattingCheck[];
  completenessCheck: ATSCompletenessCheck;
  bulletReviews: ATSBulletReview[];
  recommendations: ATSRecommendation[];
  aiSummary: string;
  parsedResumeData?: Partial<CandidateResumeData>;
  rawResumeText?: string;
  rawJobDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}



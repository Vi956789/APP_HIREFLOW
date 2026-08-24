import bcrypt from 'bcryptjs';
import {
  User,
  Job,
  Application,
  CandidateProfile,
  RecruiterProfile,
  InterviewSchedule,
  NotificationItem,
  CandidateResumeData,
  ATSAnalysisResult,
  UserRole,
} from '../src/types';

export interface DBUser extends User {
  passwordHash: string;
}

const DEFAULT_HASH = bcrypt.hashSync('password123', 10);

class InMemoryStore {
  users = new Map<string, DBUser>();
  recruiterProfiles = new Map<string, RecruiterProfile>();
  candidateProfiles = new Map<string, CandidateProfile>();
  jobs = new Map<string, Job>();
  applications = new Map<string, Application>();
  interviews = new Map<string, InterviewSchedule>();
  notifications = new Map<string, NotificationItem>();
  resumes = new Map<string, CandidateResumeData>();
  analyses = new Map<string, ATSAnalysisResult>();

  constructor() {
    this.seed();
  }

  private seed() {
    const recruiterUser: DBUser = {
      id: 'recruiter_1',
      name: 'Sarah Jenkins',
      email: 'recruiter@nexusai.tech',
      passwordHash: DEFAULT_HASH,
      role: 'RECRUITER',
      title: 'Head of Talent Acquisition',
      companyName: 'Nexus AI Technologies',
      companyLocation: 'San Francisco, CA (Hybrid / Remote)',
      phone: '+1 (415) 762-9900',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };

    const candidateUser: DBUser = {
      id: 'candidate_1',
      name: 'Alex Chen',
      email: 'candidate@hireflow.io',
      passwordHash: DEFAULT_HASH,
      role: 'CANDIDATE',
      title: 'Senior Full Stack & AI Engineer',
      location: 'San Francisco, CA (Remote)',
      phone: '+1 (415) 890-2341',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    };

    this.users.set(recruiterUser.id, recruiterUser);
    this.users.set(candidateUser.id, candidateUser);

    this.recruiterProfiles.set(recruiterUser.id, {
      id: 'rprof_1',
      userId: recruiterUser.id,
      companyName: 'Nexus AI Technologies',
      jobTitle: 'Head of Talent Acquisition',
      companyLocation: 'San Francisco, CA (Hybrid / Remote)',
      companyWebsite: 'https://nexusai.tech',
      companyDescription: 'Pioneering multimodal intelligence, autonomous agents, and enterprise AI workflows.',
      companySize: '50-200 employees',
      industry: 'Artificial Intelligence & Software',
      companyLogo: recruiterUser.avatar,
      companyLogoUrl: recruiterUser.avatar,
      createdAt: recruiterUser.createdAt,
      updatedAt: new Date().toISOString(),
    });

    this.candidateProfiles.set(candidateUser.id, {
      id: 'cprof_1',
      userId: candidateUser.id,
      name: candidateUser.name,
      email: candidateUser.email,
      title: candidateUser.title,
      avatar: candidateUser.avatar,
      avatarUrl: candidateUser.avatar,
      phone: '+1 (415) 890-2341',
      location: 'San Francisco, CA (Remote)',
      headline: 'Senior Full Stack & AI Engineer | Open to Opportunities',
      summary: '5+ years building scalable React, TypeScript, Node.js distributed platforms and production GenAI pipelines. Passionate about performant UX, clean systems architecture, and intelligent workflow automation.',
      portfolioUrl: 'https://alexchen.dev',
      githubUrl: 'https://github.com/alexchen',
      linkedinUrl: 'https://linkedin.com/in/alexchen',
      profileStrength: 92,
      skills: [
        { name: 'TypeScript', level: 'Expert' },
        { name: 'React', level: 'Expert' },
        { name: 'Node.js', level: 'Expert' },
        { name: 'PostgreSQL', level: 'Advanced' },
        { name: 'Python', level: 'Advanced' },
        { name: 'Tailwind CSS', level: 'Expert' },
        { name: 'Gemini API', level: 'Advanced' },
        { name: 'Docker', level: 'Intermediate' },
      ],
      experience: [
        {
          id: 'exp_1',
          title: 'Senior Full Stack Engineer',
          company: 'HyperScale AI Labs',
          location: 'San Francisco, CA (Remote)',
          startDate: '2022-04',
          endDate: 'Present',
          current: true,
          description: 'Spearheaded the developer platform re-architecture using React 19, Node.js, and PostgreSQL, reducing end-to-end latency by 42%. Built automated LLM evaluation harnesses and real-time streaming interfaces.',
        },
        {
          id: 'exp_2',
          title: 'Software Engineer',
          company: 'CloudMatrix Technologies',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: '2022-03',
          current: false,
          description: 'Engineered microservices handling 20M+ daily API requests. Implemented robust CI/CD pipelines with GitHub Actions and Docker containerization.',
        },
      ],
      education: [
        {
          id: 'edu_1',
          degree: 'B.S. in Computer Science',
          school: 'University of California, Berkeley',
          field: 'Distributed Systems & Software Engineering',
          graduationYear: '2020',
        },
      ],
      resumeText: `Alex Chen
Senior Full Stack & AI Engineer
Email: candidate@hireflow.io | Phone: +1 (415) 890-2341 | Location: San Francisco, CA (Remote)
Portfolio: alexchen.dev | GitHub: github.com/alexchen

SUMMARY
Senior Full Stack & AI Engineer with 5+ years of experience architecting high-scale web applications, microservices, and AI-enabled systems using TypeScript, React, Node.js, Python, and PostgreSQL.

SKILLS
- Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
- Frameworks: React, Next.js, Node.js, Express, Tailwind CSS, FastAPI
- Databases: PostgreSQL, Redis, MongoDB
- Cloud & Tools: AWS, Docker, Git, CI/CD, Gemini API, RESTful APIs

EXPERIENCE
HyperScale AI Labs - Senior Full Stack Engineer (2022 - Present)
- Spearheaded the developer platform re-architecture, reducing end-to-end API latency by 42%.
- Built automated LLM evaluation harnesses and real-time streaming interfaces serving 100k+ active users.
- Mentored 4 junior and mid-level engineers in clean code and unit test coverage.

CloudMatrix Technologies - Software Engineer (2020 - 2022)
- Engineered microservices handling 20M+ daily API requests in Node.js and PostgreSQL.
- Implemented robust CI/CD pipelines with GitHub Actions and Docker containerization.

EDUCATION
University of California, Berkeley - B.S. in Computer Science (2020)`,
    });

    const job1: Job = {
      id: 'job_1',
      recruiterId: recruiterUser.id,
      recruiterName: recruiterUser.name,
      title: 'Senior Full Stack & AI Engineer',
      company: 'Nexus AI Technologies',
      companyLogo: recruiterUser.avatar,
      department: 'Engineering',
      location: 'San Francisco, CA (Hybrid / Remote)',
      type: 'Full-time',
      experienceLevel: 'Senior',
      salaryMin: 155000,
      salaryMax: 195000,
      salaryCurrency: 'USD',
      description: 'We are seeking an exceptional Senior Full Stack & AI Engineer to help build our core multimodal intelligence engine and enterprise AI copilot. You will collaborate directly with our founding engineering team to design, build, and deploy high-throughput web applications and AI agent workflows.',
      requirements: [
        '5+ years of professional full-stack software development experience',
        'Expert proficiency with TypeScript, React, Node.js, and modern CSS/Tailwind',
        'Demonstrated hands-on experience integrating LLM APIs (Gemini, OpenAI) or vector search',
        'Strong knowledge of PostgreSQL schema design, indexing, and query optimization',
        'Track record of architecting reliable, high-performance distributed microservices',
      ],
      niceToHave: [
        'Experience with Docker, Kubernetes, or cloud infrastructure (GCP/AWS)',
        'Contributions to open-source developer tooling or agent frameworks',
      ],
      benefits: [
        'Competitive base salary + comprehensive stock options',
        '100% company-paid medical, dental, and vision coverage',
        'Flexible remote/hybrid work arrangement with home office stipend',
        'Unlimited paid time off (PTO) + annual company retreat',
        '$3,000 annual learning & development allowance',
      ],
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Python', 'Tailwind CSS', 'Docker', 'REST API'],
      status: 'ACTIVE',
      isActive: true,
      applicantCount: 3,
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    };

    const job2: Job = {
      id: 'job_2',
      recruiterId: recruiterUser.id,
      recruiterName: recruiterUser.name,
      title: 'Lead Frontend Architect',
      company: 'Nexus AI Technologies',
      companyLogo: recruiterUser.avatar,
      department: 'Engineering',
      location: 'Remote (US/Canada)',
      type: 'Full-time',
      experienceLevel: 'Lead',
      salaryMin: 170000,
      salaryMax: 215000,
      salaryCurrency: 'USD',
      description: 'Join Nexus AI as Lead Frontend Architect to establish frontend architecture standards, design systems, and rich canvas interactions across our product suite.',
      requirements: [
        '7+ years experience in web technologies and enterprise frontend architectures',
        'Deep expertise in React 19, TypeScript, state management, and web performance profiling',
        'Experience crafting accessible, high-density dashboard interfaces and design systems',
      ],
      niceToHave: ['Canvas / WebGL / SVG rendering experience'],
      benefits: ['Top-tier equity package', 'Flexible hours', 'Comprehensive health benefits'],
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Design Systems', 'Performance'],
      status: 'ACTIVE',
      isActive: true,
      applicantCount: 2,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    };

    const job3: Job = {
      id: 'job_3',
      recruiterId: recruiterUser.id,
      recruiterName: recruiterUser.name,
      title: 'Senior Product Designer',
      company: 'Nexus AI Technologies',
      companyLogo: recruiterUser.avatar,
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time',
      experienceLevel: 'Senior',
      salaryMin: 140000,
      salaryMax: 180000,
      salaryCurrency: 'USD',
      description: 'We are looking for a Senior Product Designer with a sharp aesthetic sensibility and product instincts to create intuitive generative AI user interfaces.',
      requirements: [
        '4+ years designing complex SaaS products and developer platforms',
        'Mastery of Figma, design systems, prototyping, and user journey mapping',
        'Strong collaboration with engineering teams on component implementation',
      ],
      niceToHave: ['Experience prototyping in code (HTML/CSS/React)'],
      benefits: ['Health coverage', '401(k) matching', 'Flexible vacation'],
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping'],
      status: 'ACTIVE',
      isActive: true,
      applicantCount: 1,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    };

    this.jobs.set(job1.id, job1);
    this.jobs.set(job2.id, job2);
    this.jobs.set(job3.id, job3);

    const app1: Application = {
      id: 'app_1',
      jobId: job1.id,
      jobTitle: job1.title,
      company: job1.company,
      companyName: job1.company,
      candidateId: candidateUser.id,
      candidateName: candidateUser.name,
      candidateEmail: candidateUser.email,
      candidateTitle: candidateUser.title,
      candidateLocation: candidateUser.location,
      candidateAvatar: candidateUser.avatar,
      appliedDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      status: 'SCREENING',
      resumeText: this.candidateProfiles.get(candidateUser.id)?.resumeText || '',
      coverLetter: 'I am excited to apply for the Senior Full Stack & AI Engineer position at Nexus AI. With my strong background in React, TypeScript, and AI pipelines, I look forward to contributing immediately.',
      aiMatch: {
        overallScore: 94,
        skillsScore: 96,
        experienceScore: 92,
        educationScore: 95,
        matchedSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Python', 'Tailwind CSS', 'Docker'],
        missingSkills: [],
        strengths: [
          'Demonstrated expertise in high-scale TypeScript & React architecture',
          'Direct hands-on experience building generative AI workflows and low-latency APIs',
          'Strong engineering leadership and performance optimization track record',
        ],
        gaps: ['Discuss distributed consensus patterns during technical interview'],
        aiSummary: 'Alex Chen is a top-tier fit (94% score) for the Senior Full Stack role with proven end-to-end technical mastery.',
        recommendedInterviewQuestions: [
          'Can you walk through how you architected the automated LLM evaluation platform at HyperScale AI Labs?',
          'What caching and indexing strategies did you deploy in PostgreSQL to reduce query latency?',
        ],
        verdict: 'STRONG_FIT',
      },
      recruiterNotes: 'Top candidate from initial screening. Impressive background in modern React and distributed Node.js.',
      interviewDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      interviewType: 'Technical',
      interviewDetails: {
        date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        time: '2:00 PM EST (45 mins)',
        type: 'Technical',
      },
    };

    this.applications.set(app1.id, app1);

    const int1: InterviewSchedule = {
      id: 'int_1',
      applicationId: app1.id,
      candidateName: candidateUser.name,
      jobTitle: job1.title,
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      time: '2:00 PM EST (45 mins)',
      interviewer: 'Sarah Jenkins & Principal Architect',
      type: 'Technical',
      meetingLink: 'https://meet.google.com/hfw-live-session',
      status: 'SCHEDULED',
      notes: 'Deep-dive architectural review and full-stack coding session.',
    };
    this.interviews.set(int1.id, int1);

    const notif1: NotificationItem = {
      id: 'notif_1',
      userId: candidateUser.id,
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Application Shortlisted',
      message: `Your application for ${job1.title} at ${job1.company} has been shortlisted by the recruiting team.`,
      description: `Your application for ${job1.title} at ${job1.company} has been shortlisted by the recruiting team.`,
      isRead: false,
      read: false,
      time: '2d ago',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      metadata: { jobId: job1.id, applicationId: app1.id },
    };

    const notif2: NotificationItem = {
      id: 'notif_2',
      userId: candidateUser.id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Technical Interview Scheduled',
      message: `Your Technical interview for ${job1.title} is scheduled for ${int1.date} at ${int1.time}.`,
      description: `Your Technical interview for ${job1.title} is scheduled for ${int1.date} at ${int1.time}.`,
      isRead: false,
      read: false,
      time: '1d ago',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      metadata: { interviewId: int1.id, applicationId: app1.id },
    };

    const notif3: NotificationItem = {
      id: 'notif_3',
      userId: recruiterUser.id,
      type: 'NEW_APPLICATION',
      title: `New applicant for ${job1.title}`,
      message: `${candidateUser.name} submitted an application with a 94% AI Match Score.`,
      description: `${candidateUser.name} submitted an application with a 94% AI Match Score.`,
      isRead: false,
      read: false,
      time: '4d ago',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      metadata: { jobId: job1.id, applicationId: app1.id },
    };

    this.notifications.set(notif1.id, notif1);
    this.notifications.set(notif2.id, notif2);
    this.notifications.set(notif3.id, notif3);

    const resume1: CandidateResumeData = {
      id: 'res_1',
      candidateId: candidateUser.id,
      title: 'Senior Full Stack Engineer Resume',
      selectedTemplate: 'google',
      personalData: {
        fullName: 'Alex Chen',
        professionalTitle: 'Senior Full Stack & AI Engineer',
        email: 'candidate@hireflow.io',
        phone: '+1 (415) 890-2341',
        location: 'San Francisco, CA (Remote)',
        linkedin: 'https://linkedin.com/in/alexchen',
        github: 'https://github.com/alexchen',
        portfolio: 'https://alexchen.dev',
      },
      summary: 'Senior Full Stack & AI Engineer with 5+ years of experience architecting high-scale web applications, microservices, and AI-enabled systems using TypeScript, React, Node.js, Python, and PostgreSQL.',
      education: [
        {
          id: 'edu_1',
          institution: 'University of California, Berkeley',
          degree: 'B.S. in Computer Science',
          fieldOfStudy: 'Software Engineering & AI',
          startDate: '2016',
          endDate: '2020',
          grade: '3.85 GPA',
          details: 'Dean’s Honors List, ACM Collegiate Programming Finalist',
        },
      ],
      experience: [
        {
          id: 'exp_1',
          company: 'HyperScale AI Labs',
          role: 'Senior Full Stack Engineer',
          location: 'San Francisco, CA',
          startDate: '2022-04',
          endDate: 'Present',
          current: true,
          bullets: [
            'Spearheaded the developer platform re-architecture, reducing end-to-end API latency by 42% across 100k+ active users.',
            'Built automated LLM evaluation harnesses and real-time streaming interfaces using TypeScript, React, and Node.js.',
            'Mentored 4 junior and mid-level engineers in clean code architectures and automated test coverage.',
          ],
        },
        {
          id: 'exp_2',
          company: 'CloudMatrix Technologies',
          role: 'Software Engineer',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: '2022-03',
          current: false,
          bullets: [
            'Engineered microservices handling 20M+ daily API requests in Node.js, Express, and PostgreSQL.',
            'Implemented robust CI/CD pipelines with GitHub Actions and Docker containerization, reducing build times by 35%.',
          ],
        },
      ],
      projects: [
        {
          id: 'proj_1',
          name: 'HireFlow AI Requisition Copilot',
          technologies: 'React 19, TypeScript, Tailwind CSS, Gemini API, Node.js',
          githubUrl: 'https://github.com/alexchen/hireflow',
          liveUrl: 'https://hireflow.ai',
          bullets: [
            'Designed sub-100ms deterministic ATS keyword extraction and bullet point optimization engine.',
            'Engineered interactive live A4 PDF resume generation and LaTeX typography preview.',
          ],
        },
      ],
      skills: {
        languages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML5', 'CSS3'],
        frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'FastAPI'],
        databases: ['PostgreSQL', 'Redis', 'MongoDB'],
        tools: ['AWS', 'Docker', 'Git', 'CI/CD', 'Linux'],
        aiMl: ['Gemini API', 'LLMs', 'Vector Databases', 'RAG'],
        other: ['System Design', 'Microservices', 'REST APIs', 'Agile'],
      },
      certifications: [
        {
          id: 'cert_1',
          name: 'AWS Certified Solutions Architect - Associate',
          issuer: 'Amazon Web Services',
          date: '2023',
        },
      ],
      achievements: [
        {
          id: 'ach_1',
          text: '1st Place Winner - AI Developer Hackathon 2024: Built real-time autonomous document parser and recruiter copilot.',
        },
      ],
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.resumes.set(resume1.id, resume1);
  }
}

export const inMemoryStore = new InMemoryStore();

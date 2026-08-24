import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import {
  ATSAnalysisResult,
  ATSCategoryScores,
  ATSScoreVerdict,
  ATSMatchedSkill,
  ATSMissingSkill,
  ATSWeakSkill,
  ATSExperienceGap,
  ATSProjectRelevance,
  ATSFormattingCheck,
  ATSCompletenessCheck,
  ATSBulletReview,
  ATSRecommendation,
  CandidateResumeData,
  ResumePersonalInfo,
  ResumeSkillsCategories,
} from '../src/types';

// Standard Technical Skill Taxonomy
export const COMMON_SKILLS_DICTIONARY: Record<string, string[]> = {
  languages: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby',
    'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS', 'HTML5', 'CSS3', 'Sass', 'SCSS', 'Shell', 'Bash',
  ],
  frameworks: [
    'React', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Express.js', 'NestJS',
    'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Ruby on Rails', 'ASP.NET', 'Tailwind CSS',
    'Bootstrap', 'GraphQL', 'REST API', 'Redux', 'Zustand', 'Prisma', 'Drizzle',
  ],
  databases: [
    'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'Supabase',
    'Firebase', 'Firestore', 'SQLite', 'Elasticsearch', 'Oracle', 'Snowflake', 'BigQuery',
  ],
  cloudAndDevOps: [
    'AWS', 'Amazon Web Services', 'GCP', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD',
    'GitHub Actions', 'Terraform', 'Jenkins', 'Linux', 'Nginx', 'Vercel', 'Cloudflare', 'Microservices',
    'Serverless', 'Kafka', 'RabbitMQ',
  ],
  aiAndML: [
    'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'OpenAI', 'Gemini', 'LLM',
    'NLP', 'Computer Vision', 'LangChain', 'LlamaIndex', 'Hugging Face', 'Vector Database', 'RAG',
  ],
  toolsAndPractices: [
    'Git', 'GitHub', 'GitLab', 'Jira', 'Agile', 'Scrum', 'TDD', 'Unit Testing', 'Jest', 'Cypress',
    'Playwright', 'Vitest', 'Webpack', 'Vite', 'Postman', 'Figma', 'System Design',
  ],
};

const STRONG_ACTION_VERBS = new Set([
  'architected', 'spearheaded', 'engineered', 'developed', 'designed', 'optimized', 'scaled',
  'refactored', 'streamlined', 'automated', 'deployed', 'implemented', 'reduced', 'increased',
  'accelerated', 'launched', 'mentored', 'orchestrated', 'authored', 'transformed', 'delivered',
]);

const WEAK_VERB_PHRASES = [
  'worked on',
  'helped with',
  'responsible for',
  'assisted in',
  'participated in',
  'handled',
  'contributed to',
  'tried to',
  'duties included',
];

/**
 * Extract clean plain text from uploaded PDF, DOCX, or TXT buffer
 */
export async function extractTextFromFileBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const lowerName = fileName.toLowerCase();
  
  try {
    if (mimeType.includes('pdf') || lowerName.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const data: any = await parser.getText();
      const text = typeof data === 'string' ? data : (data?.text || '');
      return cleanExtractedText(text);
    }

    if (
      mimeType.includes('wordprocessingml') ||
      mimeType.includes('msword') ||
      lowerName.endsWith('.docx') ||
      lowerName.endsWith('.doc')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return cleanExtractedText(result.value || '');
    }

    // Default text/plain / markdown
    return cleanExtractedText(buffer.toString('utf-8'));
  } catch (err: any) {
    console.error('File text extraction failed:', err);
    // Fallback best effort string conversion
    return cleanExtractedText(buffer.toString('utf-8'));
  }
}

function cleanExtractedText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[\r\n]{3,}/g, '\n\n')
    .replace(/[\t\v\f\r ]+/g, ' ')
    .replace(/[^\x20-\x7E\n]/g, ' ') // Strip non-printable ASCII
    .trim();
}

/**
 * Parse raw text into structured resume format
 */
export function parseResumeTextToStructured(text: string, titleHint = 'Imported Resume'): Partial<CandidateResumeData> {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  
  // Extract contact info
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);

  const fullName = lines[0] ? lines[0].replace(/^#+\s*/, '') : 'Candidate';
  const professionalTitle = lines[1] && lines[1].length < 80 ? lines[1] : 'Software Engineer';

  // Extract skills by scanning dictionary
  const foundSkills: ResumeSkillsCategories = {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    aiMl: [],
    other: [],
  };

  const lowerText = text.toLowerCase();
  for (const lang of COMMON_SKILLS_DICTIONARY.languages) {
    if (new RegExp(`\\b${escapeRegExp(lang.toLowerCase())}\\b`, 'i').test(lowerText)) {
      foundSkills.languages.push(lang);
    }
  }
  for (const fw of COMMON_SKILLS_DICTIONARY.frameworks) {
    if (new RegExp(`\\b${escapeRegExp(fw.toLowerCase())}\\b`, 'i').test(lowerText)) {
      foundSkills.frameworks.push(fw);
    }
  }
  for (const db of COMMON_SKILLS_DICTIONARY.databases) {
    if (new RegExp(`\\b${escapeRegExp(db.toLowerCase())}\\b`, 'i').test(lowerText)) {
      foundSkills.databases.push(db);
    }
  }
  for (const cd of COMMON_SKILLS_DICTIONARY.cloudAndDevOps) {
    if (new RegExp(`\\b${escapeRegExp(cd.toLowerCase())}\\b`, 'i').test(lowerText)) {
      foundSkills.tools.push(cd);
    }
  }
  for (const ai of COMMON_SKILLS_DICTIONARY.aiAndML) {
    if (new RegExp(`\\b${escapeRegExp(ai.toLowerCase())}\\b`, 'i').test(lowerText)) {
      foundSkills.aiMl.push(ai);
    }
  }

  // Extract bullet points
  const bulletLines = lines
    .filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'))
    .map((l) => l.replace(/^[•\-*]\s*/, '').trim());

  return {
    title: titleHint,
    selectedTemplate: 'google',
    personalData: {
      fullName,
      professionalTitle,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: 'Remote',
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : '',
      github: githubMatch ? `https://${githubMatch[0]}` : '',
      portfolio: '',
    },
    summary: lines.slice(2, 6).join(' ').substring(0, 400),
    skills: foundSkills,
    experience: [
      {
        id: 'exp-1',
        company: 'Technology Experience',
        role: professionalTitle,
        location: 'Remote',
        startDate: '2022',
        endDate: 'Present',
        current: true,
        bullets: bulletLines.slice(0, 6).length > 0 ? bulletLines.slice(0, 6) : [
          'Engineered scalable full-stack features and API endpoints using modern frameworks.',
          'Optimized database queries and background workers, improving execution latency.',
          'Collaborated with cross-functional teams to deliver production-ready software solutions.',
        ],
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University / Institute',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science or Related Field',
        startDate: '2018',
        endDate: '2022',
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'Key Project Initiative',
        technologies: foundSkills.frameworks.slice(0, 3).join(', ') || 'React, TypeScript, Node.js',
        bullets: bulletLines.slice(6, 9).length > 0 ? bulletLines.slice(6, 9) : [
          'Architected and deployed full-featured web application with end-to-end type safety.',
          'Implemented responsive UI interfaces and real-time state management.',
        ],
      },
    ],
    certifications: [],
    achievements: [],
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Deterministic ATS Scoring and Audit Engine
 */
export function runDeterministicATSEngine(
  resumeText: string,
  jobText: string,
  targetJobTitle = 'Target Role'
) {
  const cleanResume = resumeText.toLowerCase();
  const cleanJob = jobText.toLowerCase();

  // 1. Skill & Keyword Extraction
  const matchedSkills: ATSMatchedSkill[] = [];
  const missingSkills: ATSMissingSkill[] = [];
  const allIdentifiedJobSkills: { name: string; category: string }[] = [];

  const allTaxonomyEntries = [
    ...COMMON_SKILLS_DICTIONARY.languages.map((s) => ({ name: s, category: 'Programming Languages' })),
    ...COMMON_SKILLS_DICTIONARY.frameworks.map((s) => ({ name: s, category: 'Frameworks & Libraries' })),
    ...COMMON_SKILLS_DICTIONARY.databases.map((s) => ({ name: s, category: 'Databases & Storage' })),
    ...COMMON_SKILLS_DICTIONARY.cloudAndDevOps.map((s) => ({ name: s, category: 'Cloud & Infrastructure' })),
    ...COMMON_SKILLS_DICTIONARY.aiAndML.map((s) => ({ name: s, category: 'AI & Data Science' })),
    ...COMMON_SKILLS_DICTIONARY.toolsAndPractices.map((s) => ({ name: s, category: 'Tools & Methodologies' })),
  ];

  for (const skill of allTaxonomyEntries) {
    const isRequiredInJob = new RegExp(`\\b${escapeRegExp(skill.name.toLowerCase())}\\b`, 'i').test(cleanJob);
    if (isRequiredInJob) {
      allIdentifiedJobSkills.push(skill);
      const isPresentInResume = new RegExp(`\\b${escapeRegExp(skill.name.toLowerCase())}\\b`, 'i').test(cleanResume);
      if (isPresentInResume) {
        matchedSkills.push({
          name: skill.name,
          category: skill.category,
          importance: 'CRITICAL',
          context: `Found in resume matching required criteria.`,
        });
      } else {
        missingSkills.push({
          name: skill.name,
          category: skill.category,
          importance: 'CRITICAL',
          reason: `Highlighted in job requirements but absent from resume text.`,
          suggestedSection: skill.category.includes('Language') || skill.category.includes('Framework') ? 'Technical Skills / Experience' : 'Tools & Technologies',
        });
      }
    }
  }

  // 2. Completeness Check
  const words = resumeText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 500));
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasContactInfo = hasEmail || hasPhone;
  const hasSummary = /(summary|objective|about|profile|professional summary)/i.test(resumeText);
  const hasExperience = /(experience|work history|employment|career history)/i.test(resumeText);
  const hasEducation = /(education|degree|university|bachelor|master|phd|diploma)/i.test(resumeText);
  const hasSkills = /(skills|technical skills|technologies|proficiencies)/i.test(resumeText);
  const hasProjects = /(projects|key projects|portfolio|initiatives)/i.test(resumeText);

  const completenessCheck: ATSCompletenessCheck = {
    contactInfo: hasContactInfo,
    summary: hasSummary,
    experience: hasExperience,
    education: hasEducation,
    skills: hasSkills,
    projects: hasProjects,
    wordCount,
    estimatedPages,
    readingTimeMinutes,
  };

  // 3. Formatting & ATS Friendliness Checks
  const formattingChecks: ATSFormattingCheck[] = [];

  // Check 1: Length & Density
  if (wordCount >= 350 && wordCount <= 900) {
    formattingChecks.push({
      name: 'Length & Word Density',
      status: 'PASS',
      message: `Optimal resume length (${wordCount} words, ~${estimatedPages} page).`,
      tip: 'Perfect for fast recruiter scanning and ATS keyword parsers.',
    });
  } else if (wordCount < 350) {
    formattingChecks.push({
      name: 'Length & Word Density',
      status: 'WARNING',
      message: `Resume appears short (${wordCount} words).`,
      tip: 'Consider expanding your bullet points with quantifiable project achievements.',
    });
  } else {
    formattingChecks.push({
      name: 'Length & Word Density',
      status: 'WARNING',
      message: `Resume exceeds 900 words (${wordCount} words).`,
      tip: 'Keep content focused on the most relevant high-impact achievements to avoid truncation.',
    });
  }

  // Check 2: Contact Details
  if (hasContactInfo) {
    formattingChecks.push({
      name: 'Contact Header Parsing',
      status: 'PASS',
      message: 'Direct email/phone detected in standard machine-readable text format.',
    });
  } else {
    formattingChecks.push({
      name: 'Contact Header Parsing',
      status: 'FAIL',
      message: 'Missing explicit contact email or phone number in parseable text.',
      tip: 'Ensure your email and phone number are in plain text at the top of the resume.',
    });
  }

  // Check 3: Standard Section Headers
  if (hasExperience && hasEducation && hasSkills) {
    formattingChecks.push({
      name: 'Standard ATS Section Headers',
      status: 'PASS',
      message: 'Found standard sections: Experience, Education, and Skills.',
    });
  } else {
    formattingChecks.push({
      name: 'Standard ATS Section Headers',
      status: 'WARNING',
      message: 'Some standard section headers (Experience, Education, Skills) were not clearly identified.',
      tip: 'Use standard header names like "Experience", "Skills", and "Education" rather than creative names.',
    });
  }

  // Check 4: Measurable Metrics & Action Verbs
  const lines = resumeText.split('\n').map((l) => l.trim()).filter((l) => l.length > 15);
  let quantifiableBulletsCount = 0;
  let strongVerbsCount = 0;
  const bulletReviews: ATSBulletReview[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line);
    const content = line.replace(/^[•\-*\d.]\s*/, '').trim();

    if (content.length > 25 && content.length < 250) {
      // Check for metrics (%, $, numbers)
      const hasMetric = /\b(\d+%\b|\$\d+|\d+\+|\b\d{2,}\b|2x|3x|10x)/.test(content);
      if (hasMetric) quantifiableBulletsCount++;

      // Check first word for strong verb
      const firstWord = content.split(' ')[0]?.toLowerCase().replace(/[^a-z]/g, '');
      if (firstWord && STRONG_ACTION_VERBS.has(firstWord)) {
        strongVerbsCount++;
      }

      // Check for weak phrases to propose rewrite
      const weakPhraseFound = WEAK_VERB_PHRASES.find((p) => content.toLowerCase().includes(p));
      if (weakPhraseFound && bulletReviews.length < 4) {
        const improved = content
          .replace(new RegExp(escapeRegExp(weakPhraseFound), 'i'), 'Architected and delivered')
          .replace(/\.$/, '') + `, optimizing efficiency and delivery speed.`;

        bulletReviews.push({
          id: `rev-${i}`,
          originalBullet: content,
          improvedBullet: improved,
          reason: `Replaced passive phrase "${weakPhraseFound}" with high-impact action verb and quantifiable outcome.`,
          addedKeywords: ['efficiency', 'delivery speed'],
          accepted: false,
        });
      }
    }
  }

  if (strongVerbsCount >= 3) {
    formattingChecks.push({
      name: 'Action Verb & Impact Strength',
      status: 'PASS',
      message: `Detected ${strongVerbsCount} strong action verbs driving bullet points.`,
    });
  } else {
    formattingChecks.push({
      name: 'Action Verb & Impact Strength',
      status: 'WARNING',
      message: `Bullet points could be strengthened with more direct action verbs.`,
      tip: 'Start bullets with verbs like Architected, Scaled, Engineered, Optimized, Delivered.',
    });
  }

  // 4. Score Calculation
  const totalJobSkills = Math.max(1, allIdentifiedJobSkills.length);
  const skillsMatchRatio = matchedSkills.length / totalJobSkills;
  const skillsScore = Math.round(Math.min(100, Math.max(20, skillsMatchRatio * 100)));

  // Experience relevance approximation
  const expKeywords = ['senior', 'lead', 'staff', 'years', 'led', 'architect', 'managed', 'production'];
  let expScore = 60;
  for (const kw of expKeywords) {
    if (cleanResume.includes(kw) && cleanJob.includes(kw)) {
      expScore += 5;
    }
  }
  const experienceScore = Math.min(98, Math.max(30, expScore));

  // Keyword Score
  const keywordScore = Math.round((skillsScore * 0.7) + (hasExperience ? 20 : 0) + (hasSkills ? 10 : 0));

  // Impact Score (based on quantifiable bullets and action verbs)
  const impactScore = Math.min(95, Math.max(40, (strongVerbsCount * 12) + (quantifiableBulletsCount * 15) + 30));

  // Formatting Score
  const passedChecks = formattingChecks.filter((c) => c.status === 'PASS').length;
  const formattingScore = Math.round((passedChecks / formattingChecks.length) * 100);

  // Projects & Education
  const projectsScore = hasProjects ? 85 : 55;
  const educationScore = hasEducation ? 90 : 60;

  // Weighted Overall ATS Score
  // Skills: 25%, Experience: 20%, Keywords: 15%, Impact: 15%, Formatting: 10%, Projects: 10%, Education: 5%
  const overallScore = Math.round(
    skillsScore * 0.25 +
    experienceScore * 0.20 +
    keywordScore * 0.15 +
    impactScore * 0.15 +
    formattingScore * 0.10 +
    projectsScore * 0.10 +
    educationScore * 0.05
  );

  let verdict: ATSScoreVerdict = 'MODERATE_FIT';
  if (overallScore >= 88) verdict = 'EXCELLENT_MATCH';
  else if (overallScore >= 76) verdict = 'STRONG_FIT';
  else if (overallScore >= 62) verdict = 'COMPETITIVE_FIT';
  else if (overallScore >= 48) verdict = 'MODERATE_FIT';
  else verdict = 'NEEDS_OPTIMIZATION';

  const categoryScores: ATSCategoryScores = {
    skills: skillsScore,
    experience: experienceScore,
    keywords: keywordScore,
    impact: impactScore,
    formatting: formattingScore,
    projects: projectsScore,
    education: educationScore,
  };

  // Recommendations
  const recommendations: ATSRecommendation[] = [];
  if (missingSkills.length > 0) {
    recommendations.push({
      priority: 'P1',
      category: 'Keyword Optimization',
      action: `Integrate missing high-priority skills: ${missingSkills.slice(0, 4).map((s) => s.name).join(', ')}.`,
      impact: 'Increases ATS search relevance and automated screening pass rate.',
    });
  }
  if (impactScore < 75) {
    recommendations.push({
      priority: 'P2',
      category: 'Measurable Achievements',
      action: 'Add 2-3 specific numbers, percentage increases, or performance metrics to your bullet points.',
      impact: 'Demonstrates clear business and engineering value to hiring managers.',
    });
  }
  if (bulletReviews.length > 0) {
    recommendations.push({
      priority: 'P2',
      category: 'Action Verbs',
      action: 'Replace passive phrases like "worked on" with active power verbs like "Architected" or "Engineered".',
      impact: 'Elevates perceived seniority and leadership ownership.',
    });
  }
  if (!hasSummary) {
    recommendations.push({
      priority: 'P3',
      category: 'Executive Summary',
      action: 'Add a concise 2-3 line professional summary highlighting your core expertise and target role.',
      impact: 'Gives recruiters instant context in the initial 6-second scan.',
    });
  }

  return {
    overallScore,
    verdict,
    categoryScores,
    matchedSkills,
    missingSkills,
    weakSkills: [] as ATSWeakSkill[],
    experienceGaps: [] as ATSExperienceGap[],
    projectRelevance: [] as ATSProjectRelevance[],
    formattingChecks,
    completenessCheck,
    bulletReviews,
    recommendations,
    aiSummary: `ATS scan evaluated candidate resume against ${targetJobTitle}. Identified ${matchedSkills.length} matching skills and ${missingSkills.length} critical missing keywords with an overall compatibility rating of ${overallScore}%.`,
  };
}

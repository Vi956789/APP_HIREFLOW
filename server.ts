import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { db, DBUser } from "./server/db";
import { prisma } from "./server/prisma";
import {
  Job,
  Application,
  CandidateProfile,
  User,
  InterviewSchedule,
  ATSAnalysisResult,
  ATSScoreVerdict,
  CandidateResumeData,
} from "./src/types";
import {
  extractTextFromFileBuffer,
  parseResumeTextToStructured,
  runDeterministicATSEngine,
  COMMON_SKILLS_DICTIONARY,
} from "./server/atsAnalyzer";

const JWT_SECRET = process.env.JWT_SECRET || "hireflow_super_secure_jwt_secret_2026";

// Lazy Gemini client helper
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient Gemini Invoker with multi-model fallback, timeout protection, and domain fallback
async function callGeminiSafe<T>(
  promptOrParams: { prompt: string; systemInstruction?: string; responseMimeType?: string; temperature?: number },
  fallbackGenerator: () => T
): Promise<T> {
  const ai = getGeminiAI();
  if (!ai) {
    return fallbackGenerator();
  }

  // Prioritize fast, high-availability flash models
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {};
        if (promptOrParams.responseMimeType) {
          config.responseMimeType = promptOrParams.responseMimeType;
        }
        if (promptOrParams.systemInstruction) {
          config.systemInstruction = promptOrParams.systemInstruction;
        }
        if (promptOrParams.temperature !== undefined) {
          config.temperature = promptOrParams.temperature;
        }

        const generatePromise = ai.models.generateContent({
          model,
          contents: promptOrParams.prompt,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 10000)
        );

        const response: any = await Promise.race([generatePromise, timeoutPromise]);

        if (response && response.text) {
          if (promptOrParams.responseMimeType === "application/json") {
            let cleanText = response.text.trim();
            if (cleanText.startsWith("```json")) {
              cleanText = cleanText.replace(/^```json/, "").replace(/```$/, "").trim();
            } else if (cleanText.startsWith("```")) {
              cleanText = cleanText.replace(/^```/, "").replace(/```$/, "").trim();
            }
            const parsed = JSON.parse(cleanText);
            return parsed as T;
          } else {
            return response.text as unknown as T;
          }
        }
      } catch (err: any) {
        const isTransient =
          err?.status === 503 ||
          err?.message?.includes("503") ||
          err?.message?.includes("high demand") ||
          err?.message?.includes("RESOURCE_EXHAUSTED") ||
          err?.message?.includes("429");

        if (isTransient && attempt === 0) {
          // Brief backoff before retry
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }
        // Gracefully continue to next model candidate
        break;
      }
    }
  }

  return fallbackGenerator();
}

function sanitizeUser(user: DBUser): User {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function getSessionUser(req: express.Request): Promise<DBUser | null> {
  const authHeader = req.headers.authorization || (req.headers.Authorization as string);
  let token: string | null = null;

  if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token && req.cookies?.hireflow_session) {
    token = req.cookies.hireflow_session;
  }

  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return await db.getUserById(decoded.id);
  } catch {
    return null;
  }
}

async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthenticated. Please log in." });
    }
    (req as any).user = user;
    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Authentication error" });
  }
}

function requireRole(role: "RECRUITER" | "CANDIDATE") {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const user = await getSessionUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthenticated. Please log in." });
      }
      if (user.role !== role) {
        return res.status(403).json({ error: `Forbidden. This action requires ${role} role.` });
      }
      (req as any).user = user;
      next();
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Authorization error" });
    }
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", 1);
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  // Helper for setting cookie
  const setAuthCookie = (req: express.Request, res: express.Response, token: string) => {
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.cookie("hireflow_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  };

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Current session user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const user = await getSessionUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthenticated" });
      }
      res.json({ user: sanitizeUser(user) });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch session" });
    }
  });

  // Real Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Generate secure session token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set secure HTTP-only session cookie
      setAuthCookie(req, res, token);

      res.json({
        success: true,
        user: sanitizeUser(user),
        token,
      });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: err.message || "Login failed" });
    }
  });

  // Real Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role, title, companyName, companyLocation, location, phone } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Full name is required." });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ error: "Email address is required." });
      }
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
      }
      if (role === "RECRUITER" && (!companyName || !companyName.trim())) {
        return res.status(400).json({ error: "Company name is required for recruiter registration." });
      }

      const existing = await db.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "An account with this email address already exists." });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const userRole = role === "RECRUITER" ? "RECRUITER" : "CANDIDATE";

      const newUser = await db.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: userRole,
        title: title?.trim() || (userRole === "RECRUITER" ? "Head of Talent Acquisition" : "Software Professional"),
        companyName: userRole === "RECRUITER" ? companyName.trim() : undefined,
        companyLocation: userRole === "RECRUITER" ? companyLocation?.trim() : undefined,
        location: userRole === "CANDIDATE" ? (location?.trim() || "Remote") : undefined,
        phone: phone?.trim(),
        avatar: userRole === "RECRUITER"
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      });

      if (userRole === "CANDIDATE") {
        await db.getProfile(newUser.id);
      }

      // Generate JWT token & set cookie
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      setAuthCookie(req, res, token);

      res.status(201).json({
        success: true,
        user: sanitizeUser(newUser),
        token,
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      res.status(500).json({ error: err.message || "Registration failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    res.clearCookie("hireflow_session", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.clearCookie("hireflow_session", {
      httpOnly: true,
      secure: isHttps || process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("hireflow_session", {
      path: "/",
    });
    res.json({ success: true });
  });

  // ==========================================
  // JOBS ROUTES
  // ==========================================
  app.get("/api/jobs", async (req, res) => {
    try {
      const sessionUser = await getSessionUser(req);
      const { department, type, search, recruiterId, myJobs, status, includeArchived } = req.query;

      if (sessionUser && sessionUser.role === "RECRUITER" && (myJobs === "true" || recruiterId === sessionUser.id)) {
        const recruiterJobs = await db.getJobs({
          recruiterId: sessionUser.id,
          status: status as string,
          department: department as string,
          type: type as string,
          search: search as string,
          includeArchived: includeArchived === "true",
        });
        return res.json(recruiterJobs);
      }

      // Public / Candidate Discovery view: active jobs only
      const activeJobs = await db.getJobs({
        activeOnly: true,
        department: department as string,
        type: type as string,
        search: search as string,
      });
      res.json(activeJobs);
    } catch (err: any) {
      console.error("Get jobs error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await db.getJobById(req.params.id);
      if (!job) return res.status(404).json({ error: "Job not found" });
      res.json(job);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", requireRole("RECRUITER"), async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const {
        title,
        department,
        location,
        type,
        experienceLevel,
        salaryMin,
        salaryMax,
        salaryCurrency,
        description,
        requirements,
        niceToHave,
        benefits,
        skills,
        status,
      } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Job title is required." });
      }

      const recruiterProf = await db.getRecruiterProfile(user.id);
      const companyLogo = recruiterProf.companyLogo || user.avatar || undefined;

      const newJob = await db.createJob({
        title,
        company: user.companyName || recruiterProf.companyName || "Nexus AI Technologies",
        companyLogo: companyLogo,
        department: department || "Engineering",
        location: location || "Remote",
        type: type || "Full-time",
        experienceLevel: experienceLevel || "Mid-Level",
        salaryMin: Number(salaryMin) || 120000,
        salaryMax: Number(salaryMax) || 160000,
        salaryCurrency: salaryCurrency || "USD",
        description: description || "Role overview and mission.",
        requirements: Array.isArray(requirements) ? requirements : ["3+ years experience"],
        niceToHave: Array.isArray(niceToHave) ? niceToHave : [],
        benefits: Array.isArray(benefits) ? benefits : ["Health insurance", "Equity"],
        skills: Array.isArray(skills) ? skills : ["TypeScript", "React"],
        status: status || "ACTIVE",
        recruiterId: user.id,
        recruiterName: user.name,
      });

      res.status(201).json(newJob);
    } catch (err: any) {
      console.error("Create job error:", err);
      res.status(500).json({ error: err.message || "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", requireRole("RECRUITER"), async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const existing = await db.getJobById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Job not found" });
      }
      if (existing.recruiterId !== user.id) {
        return res.status(403).json({ error: "Forbidden. You can only modify your own job postings." });
      }

      if (req.body.status === "CLOSED" && existing.status !== "CLOSED") {
        const closed = await db.closeJob(req.params.id, user.id);
        return res.json(closed);
      }

      if (req.body.status === "ARCHIVED" && existing.status !== "ARCHIVED") {
        const archived = await db.archiveJob(req.params.id, user.id);
        return res.json(archived);
      }

      const updated = await db.updateJob(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update job" });
    }
  });

  app.post("/api/jobs/:id/close", requireRole("RECRUITER"), async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const closed = await db.closeJob(req.params.id, user.id);
      res.json(closed);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to close job" });
    }
  });

  app.post("/api/jobs/:id/archive", requireRole("RECRUITER"), async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const archived = await db.archiveJob(req.params.id, user.id);
      res.json(archived);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to archive job" });
    }
  });

  app.delete("/api/jobs/:id", requireRole("RECRUITER"), async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const existing = await db.getJobById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Job not found" });
      }
      if (existing.recruiterId !== user.id) {
        return res.status(403).json({ error: "Forbidden. You can only delete your own job postings." });
      }

      // Perform soft archive to prevent orphaned applications and data loss
      await db.archiveJob(req.params.id, user.id);
      res.json({ success: true, message: "Job requisition archived successfully." });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete job" });
    }
  });

  // ==========================================
  // APPLICATIONS ROUTES
  // ==========================================
  app.get("/api/applications", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const { jobId, status } = req.query;

      if (user.role === "RECRUITER") {
        const apps = await db.getApplications({
          recruiterId: user.id,
          jobId: jobId as string,
          status: status as string,
        });
        return res.json(apps);
      } else {
        const apps = await db.getApplications({
          candidateId: user.id,
          jobId: jobId as string,
          status: status as string,
        });
        return res.json(apps);
      }
    } catch (err: any) {
      console.error("Get applications error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const { jobId, resumeText, coverLetter } = req.body;

      const job = await db.getJobById(jobId);
      if (!job) return res.status(404).json({ error: "Target job not found" });

      // Check if already applied
      const existingApps = await db.getApplications({ candidateId: user.id, jobId });
      if (existingApps.length > 0) {
        return res.status(400).json({ error: "You have already applied for this position." });
      }

      const profile = await db.getProfile(user.id);
      const candidateResume = resumeText || profile.resumeText || `${user.name} - ${user.title || "Software Engineer"}`;

      // Perform AI analysis on application submission
      let aiMatch = {
        overallScore: 88,
        skillsScore: 90,
        experienceScore: 86,
        educationScore: 90,
        matchedSkills: job.skills.slice(0, 4),
        missingSkills: job.skills.slice(4),
        strengths: ["Strong technical foundations", "Directly relevant skillset"],
        gaps: ["Verify domain specific depth during interview"],
        aiSummary: `${user.name} exhibits strong alignment with ${job.title} core requirements.`,
        recommendedInterviewQuestions: [
          `How have you applied ${job.skills[0] || "modern architectures"} in previous positions?`,
          `Describe an engineering challenge you navigated when scaling distributed components.`,
        ],
        verdict: "STRONG_FIT" as "STRONG_FIT" | "POTENTIAL_FIT" | "LOW_FIT",
      };

      if (candidateResume) {
        const prompt = `Analyze this candidate's application against the job requisition:
Job Title: ${job.title}
Job Description: ${job.description}
Required Skills: ${job.skills.join(", ")}
Requirements: ${job.requirements.join("; ")}

Candidate Resume / Profile:
${candidateResume}

Candidate Cover Letter:
${coverLetter || "None provided"}

Evaluate the match. Return a valid JSON object with EXACTLY this structure:
{
  "overallScore": number (0-100),
  "skillsScore": number (0-100),
  "experienceScore": number (0-100),
  "educationScore": number (0-100),
  "matchedSkills": string[],
  "missingSkills": string[],
  "strengths": string[] (3 concise points),
  "gaps": string[] (1-2 points),
  "aiSummary": string (2 sentences),
  "recommendedInterviewQuestions": string[] (2 tailored questions),
  "verdict": "STRONG_FIT" | "POTENTIAL_FIT" | "LOW_FIT"
}`;

        const evaluatedMatch = await callGeminiSafe(
          { prompt, responseMimeType: "application/json", temperature: 0.2 },
          () => {
            const resumeLower = (candidateResume || "").toLowerCase();
            const matched = job.skills.filter((s) => resumeLower.includes(s.toLowerCase()));
            const missing = job.skills.filter((s) => !resumeLower.includes(s.toLowerCase()));
            const ratio = (matched.length + 1) / (job.skills.length + 1);
            const score = Math.min(96, Math.max(70, Math.round(ratio * 100)));
            return {
              overallScore: score,
              skillsScore: Math.min(98, score + 3),
              experienceScore: Math.min(95, score - 2),
              educationScore: 92,
              matchedSkills: matched.length > 0 ? matched : job.skills.slice(0, 3),
              missingSkills: missing,
              strengths: [
                `Proven familiarity with ${matched.slice(0, 2).join(" & ") || job.skills[0]}`,
                "Comprehensive problem-solving and software engineering background",
                "Demonstrated track record of delivering user-facing features",
              ],
              gaps: missing.length > 0 ? [`Limited highlighted exposure to ${missing[0]}`] : ["Discuss distributed scale benchmarks during interview"],
              aiSummary: `${user.name} shows solid competence with an estimated ${score}% alignment for the ${job.title} position.`,
              recommendedInterviewQuestions: [
                `How have you structured production applications using ${matched[0] || job.skills[0]}?`,
                `Describe an engineering tradeoff you made when scaling backend workloads.`,
              ],
              verdict: (score >= 85 ? "STRONG_FIT" : score >= 70 ? "POTENTIAL_FIT" : "LOW_FIT") as "STRONG_FIT" | "POTENTIAL_FIT" | "LOW_FIT",
            };
          }
        );
        aiMatch = { ...aiMatch, ...evaluatedMatch };
      }

      const newApp = await db.createApplication({
        jobId,
        jobTitle: job.title,
        company: job.company,
        candidateId: user.id,
        candidateName: user.name,
        candidateEmail: user.email,
        candidateTitle: user.title || "Software Engineer",
        candidateLocation: user.location || "Remote",
        candidateAvatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        status: "APPLIED",
        resumeText: candidateResume,
        coverLetter: coverLetter || "",
        aiMatch,
      });

      res.status(201).json(newApp);
    } catch (err: any) {
      console.error("Create application error:", err);
      res.status(500).json({ error: err.message || "Failed to create application" });
    }
  });

  app.put("/api/applications/:id/status", requireRole("RECRUITER"), async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const { status, recruiterNotes, interviewDate, interviewType } = req.body;
      
      const existing = await db.getApplicationById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Application not found" });

      const job = await db.getJobById(existing.jobId);
      if (!job) {
        return res.status(404).json({ error: "Associated job requisition not found" });
      }

      if (job.recruiterId !== user.id) {
        return res.status(403).json({ error: "Forbidden. You can only update applications for your jobs." });
      }

      // Check job lifecycle state - reject status updates if job is CLOSED or ARCHIVED
      if (job.status === "CLOSED" || job.status === "ARCHIVED" || job.isActive === false) {
        return res.status(409).json({
          error: "This job is no longer active. Candidate status cannot be changed.",
        });
      }

      const updated = await db.updateApplication(req.params.id, {
        status,
        recruiterNotes,
        interviewDate,
        interviewType,
      });

      if (status === "INTERVIEWING" && interviewDate) {
        await db.createInterview({
          applicationId: existing.id,
          candidateName: existing.candidateName,
          jobTitle: existing.jobTitle,
          date: interviewDate.split("T")[0],
          time: "2:00 PM EST (45 mins)",
          interviewer: `${user.name} & Technical Panel`,
          type: interviewType || "Technical",
          meetingLink: "https://meet.google.com/hfw-live-session",
          status: "SCHEDULED",
          notes: recruiterNotes || "AI-screened candidate interview session.",
        }, user.id);
      }

      res.json(updated);
    } catch (err: any) {
      console.error("Update application status error:", err);
      const isConflict = err.message?.includes("no longer active");
      res.status(isConflict ? 409 : 500).json({ error: err.message || "Failed to update application status" });
    }
  });

  // ==========================================
  // CANDIDATE PROFILE ROUTES
  // ==========================================
  app.get("/api/profile/:userId", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      if (user.role === "CANDIDATE" && user.id !== req.params.userId) {
        return res.status(403).json({ error: "Forbidden. You can only view your own profile." });
      }

      const profile = await db.getProfile(req.params.userId);
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch profile" });
    }
  });

  app.put("/api/profile/:userId", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      if (user.id !== req.params.userId) {
        return res.status(403).json({ error: "Forbidden. You can only update your own profile." });
      }

      const { id, userId, email, role, password, passwordHash, ...safeUpdates } = req.body;
      const updated = await db.updateCandidateProfileAndUser(req.params.userId, safeUpdates);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update profile" });
    }
  });

  // ==========================================
  // RECRUITER COMPANY PROFILE ROUTES
  // ==========================================
  app.get("/api/recruiter/profile", requireRole("RECRUITER"), async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const profile = await db.getRecruiterProfile(user.id);
      res.json(profile);
    } catch (err: any) {
      console.error("Get recruiter profile error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch company profile" });
    }
  });

  app.put("/api/recruiter/profile", requireRole("RECRUITER"), async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const {
        companyName,
        companyLocation,
        companyWebsite,
        companyDescription,
        companySize,
        industry,
        jobTitle,
        companyLogo,
        companyLogoUrl,
      } = req.body;

      if (!companyName || !companyName.trim()) {
        return res.status(400).json({ error: "Company name is required." });
      }

      const logoVal = companyLogo !== undefined ? companyLogo : companyLogoUrl;

      const result = await db.updateRecruiterProfileAndUser(user.id, {
        companyName: companyName.trim(),
        companyLocation: companyLocation !== undefined ? companyLocation.trim() : undefined,
        companyWebsite: companyWebsite !== undefined ? companyWebsite.trim() : undefined,
        companyDescription: companyDescription !== undefined ? companyDescription.trim() : undefined,
        companySize: companySize !== undefined ? companySize.trim() : undefined,
        industry: industry !== undefined ? industry.trim() : undefined,
        jobTitle: jobTitle !== undefined ? jobTitle.trim() : undefined,
        companyLogo: logoVal,
      });

      const updatedUser = await db.getUserById(user.id);
      res.json({
        success: true,
        user: updatedUser ? sanitizeUser(updatedUser) : sanitizeUser(user),
        profile: result,
      });
    } catch (err: any) {
      console.error("Update recruiter profile error:", err);
      res.status(500).json({ error: err.message || "Failed to update company profile" });
    }
  });

  // ==========================================
  // STORAGE & ASSET UPLOADS (Supabase Storage)
  // ==========================================
  app.get("/api/storage/:bucket/:userId/:fileName", (req, res) => {
    try {
      const { bucket, userId, fileName } = req.params;
      if (bucket !== "candidate-avatars" && bucket !== "company-logos") {
        return res.status(400).json({ error: "Invalid storage bucket." });
      }
      if (userId.includes("..") || fileName.includes("..")) {
        return res.status(400).json({ error: "Invalid file identifier." });
      }

      const filePath = path.join(process.cwd(), "uploads", "storage", bucket, userId, fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Image not found." });
      }

      const ext = path.extname(fileName).toLowerCase();
      let contentType = "image/png";
      if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".svg") contentType = "image/svg+xml";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.sendFile(filePath);
    } catch (err: any) {
      console.error("Storage retrieve error:", err);
      res.status(500).json({ error: "Failed to retrieve image" });
    }
  });

  app.post("/api/storage/upload", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const { file, fileData, fileBase64, fileName, fileType, mimeType, bucket } = req.body;

      const rawFile = file || fileData || fileBase64;
      if (!rawFile) {
        return res.status(400).json({ error: "No file content provided." });
      }

      const targetBucket = bucket || (user.role === "RECRUITER" ? "company-logos" : "candidate-avatars");
      if (targetBucket !== "candidate-avatars" && targetBucket !== "company-logos") {
        return res.status(400).json({ error: "Invalid bucket name. Allowed: candidate-avatars, company-logos" });
      }

      if (targetBucket === "candidate-avatars" && user.role !== "CANDIDATE") {
        return res.status(403).json({ error: "Forbidden. Only candidates can upload avatars to candidate-avatars." });
      }
      if (targetBucket === "company-logos" && user.role !== "RECRUITER") {
        return res.status(403).json({ error: "Forbidden. Only recruiters can upload logos to company-logos." });
      }

      let base64String = rawFile;
      let detectedMime = fileType || mimeType || "image/png";

      if (typeof rawFile === "string" && rawFile.startsWith("data:")) {
        const matches = rawFile.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          detectedMime = matches[1];
          base64String = matches[2];
        }
      }

      if (!detectedMime.startsWith("image/")) {
        return res.status(400).json({ error: "Invalid file format. Only image formats (PNG, JPEG, WebP, GIF, SVG) are supported." });
      }

      const buffer = Buffer.from(base64String, "base64");
      const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
      if (buffer.length > MAX_SIZE) {
        return res.status(400).json({ error: "Image file exceeds 5MB limit. Please upload a smaller image." });
      }

      let ext = "png";
      if (detectedMime.includes("jpeg") || detectedMime.includes("jpg")) ext = "jpg";
      else if (detectedMime.includes("webp")) ext = "webp";
      else if (detectedMime.includes("gif")) ext = "gif";
      else if (detectedMime.includes("svg")) ext = "svg";

      const safeFileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
      const uploadDir = path.join(process.cwd(), "uploads", "storage", targetBucket, user.id);
      fs.mkdirSync(uploadDir, { recursive: true });

      const fullFilePath = path.join(uploadDir, safeFileName);
      fs.writeFileSync(fullFilePath, buffer);

      // Record in Supabase PostgreSQL storage.objects table if available
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        const ownerUuid = isUUID ? user.id : null;

        await prisma.$executeRawUnsafe(
          `INSERT INTO storage.objects (bucket_id, name, owner, metadata)
           VALUES ($1, $2, $3::uuid, $4::jsonb)
           ON CONFLICT (bucket_id, name) DO UPDATE 
           SET updated_at = NOW(), metadata = EXCLUDED.metadata`,
          targetBucket,
          `${user.id}/${safeFileName}`,
          ownerUuid,
          JSON.stringify({
            mimetype: detectedMime,
            size: buffer.length,
            originalName: fileName || safeFileName,
            ownerId: user.id,
          })
        );
      } catch (storageErr) {
        // Storage table in PostgreSQL is optional; file is stored in filesystem
      }

      const publicUrl = `/api/storage/${targetBucket}/${user.id}/${safeFileName}`;

      res.status(201).json({
        success: true,
        url: publicUrl,
        publicUrl,
        bucket: targetBucket,
        path: `${user.id}/${safeFileName}`,
      });
    } catch (err: any) {
      console.error("File upload error:", err);
      res.status(500).json({ error: err.message || "Failed to upload file." });
    }
  });

  app.post("/api/upload", requireAuth, async (req, res, next) => {
    // Forward /api/upload to storage upload handler
    req.url = "/api/storage/upload";
    (app as any)._router.handle(req, res, next);
  });

  // ==========================================
  // CANDIDATE RESUME BUILDER ROUTES
  // ==========================================
  // List all resumes for current candidate
  app.get("/api/candidate/resumes", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const resumes = await db.listResumesByCandidateId(user.id);
      res.json({ resumes });
    } catch (err: any) {
      console.error("List candidate resumes error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch candidate resumes" });
    }
  });

  // Create a new resume for current candidate
  app.post("/api/candidate/resumes", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const resumeData = req.body || {};
      const created = await db.createCandidateResume(user.id, resumeData);
      res.status(201).json({ success: true, resume: created });
    } catch (err: any) {
      console.error("Create candidate resume error:", err);
      res.status(500).json({ error: err.message || "Failed to create candidate resume" });
    }
  });

  // Get specific resume by ID (with ownership check)
  app.get("/api/candidate/resumes/:resumeId", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const resume = await db.getResumeById(req.params.resumeId, user.id);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found or access denied" });
      }
      res.json({ resume });
    } catch (err: any) {
      console.error("Get candidate resume by ID error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch resume" });
    }
  });

  // Update specific resume by ID (with ownership check)
  app.put("/api/candidate/resumes/:resumeId", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const updated = await db.updateCandidateResume(req.params.resumeId, user.id, req.body || {});
      if (!updated) {
        return res.status(404).json({ error: "Resume not found or access denied" });
      }
      res.json({ success: true, resume: updated });
    } catch (err: any) {
      console.error("Update candidate resume error:", err);
      res.status(500).json({ error: err.message || "Failed to update resume" });
    }
  });

  // Delete specific resume by ID (with ownership check)
  app.delete("/api/candidate/resumes/:resumeId", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const deleted = await db.deleteCandidateResume(req.params.resumeId, user.id);
      if (!deleted) {
        return res.status(404).json({ error: "Resume not found or access denied" });
      }
      res.json({ success: true, message: "Resume deleted successfully" });
    } catch (err: any) {
      console.error("Delete candidate resume error:", err);
      res.status(500).json({ error: err.message || "Failed to delete resume" });
    }
  });

  // Backward compatibility routes for single-resume clients
  app.get("/api/candidate/resume", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const resume = await db.getResumeByCandidateId(user.id);
      res.json({ resume });
    } catch (err: any) {
      console.error("Get candidate resume error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch candidate resume" });
    }
  });

  app.post("/api/candidate/resume", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const resumeData = req.body || {};
      const saved = await db.saveCandidateResume(user.id, resumeData);
      res.json({ success: true, resume: saved });
    } catch (err: any) {
      console.error("Save candidate resume error:", err);
      res.status(500).json({ error: err.message || "Failed to save candidate resume" });
    }
  });

  // ==========================================
  // INTERVIEWS ROUTES
  // ==========================================
  app.get("/api/interviews", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      if (user.role === "RECRUITER") {
        const ints = await db.getInterviews({ recruiterId: user.id });
        res.json(ints);
      } else {
        const apps = await db.getApplications({ candidateId: user.id });
        const appIds = new Set(apps.map((a) => a.id));
        const allInts = await db.getInterviews();
        const candidateInts = allInts.filter((i) => appIds.has(i.applicationId));
        res.json(candidateInts);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch interviews" });
    }
  });

  app.post("/api/interviews", requireRole("RECRUITER"), async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const { applicationId, candidateName, jobTitle, date, time, interviewer, type, meetingLink, notes } = req.body;

      const targetApp = await db.getApplicationById(applicationId);
      if (!targetApp) {
        return res.status(404).json({ error: "Application not found" });
      }

      const job = await db.getJobById(targetApp.jobId);
      if (!job) {
        return res.status(404).json({ error: "Associated job requisition not found" });
      }

      if (job.recruiterId !== user.id) {
        return res.status(403).json({ error: "Forbidden. You can only schedule interviews for your own job requisitions." });
      }

      if (job.status === "CLOSED" || job.status === "ARCHIVED" || job.isActive === false) {
        return res.status(409).json({
          error: "This job is no longer active. Interviews cannot be scheduled.",
        });
      }

      const created = await db.createInterview({
        applicationId,
        candidateName: candidateName || targetApp.candidateName,
        jobTitle: jobTitle || targetApp.jobTitle,
        date: date || new Date().toISOString().split("T")[0],
        time: time || "2:00 PM EST (45 mins)",
        interviewer: interviewer || `${user.name} & Technical Panel`,
        type: type || "Technical",
        meetingLink: meetingLink || "https://meet.google.com/hfw-live-session",
        status: "SCHEDULED",
        notes: notes || "AI-screened candidate interview session.",
      }, user.id);

      res.status(201).json(created);
    } catch (err: any) {
      console.error("Create interview endpoint error:", err);
      const isConflict = err.message?.includes("no longer active");
      res.status(isConflict ? 409 : 500).json({ error: err.message || "Failed to schedule interview" });
    }
  });

  // ==========================================
  // NOTIFICATIONS ROUTES
  // ==========================================
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const notifications = await db.getNotifications(user.id);
      res.json(notifications);
    } catch (err: any) {
      console.error("Get notifications error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch notifications" });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      await db.markNotificationRead(req.params.id, user.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to mark notification read" });
    }
  });

  app.put("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      await db.markAllNotificationsRead(user.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to mark all notifications read" });
    }
  });

  // ==========================================
  // CANDIDATE ATS RESUME ANALYZER ENDPOINTS
  // ==========================================
  app.post("/api/candidate/resume-match/extract-file", requireAuth, async (req, res) => {
    try {
      const { fileData, fileName, mimeType, parseStructured } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: "No file content provided." });
      }

      let base64String = fileData;
      let detectedMime = mimeType || "text/plain";
      if (typeof fileData === "string" && fileData.startsWith("data:")) {
        const matches = fileData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          detectedMime = matches[1];
          base64String = matches[2];
        }
      }

      const buffer = Buffer.from(base64String, "base64");
      if (buffer.length > 8 * 1024 * 1024) {
        return res.status(400).json({ error: "File exceeds 8MB maximum size limit." });
      }

      const extractedText = await extractTextFromFileBuffer(buffer, detectedMime, fileName || "document.txt");
      if (!extractedText.trim()) {
        return res.status(400).json({ error: "Could not extract text from the uploaded file. Please ensure it is not password-protected or image-only." });
      }

      let structuredData: any = null;
      if (parseStructured) {
        structuredData = parseResumeTextToStructured(extractedText, fileName?.replace(/\.[^/.]+$/, "") || "Imported Resume");
      }

      res.json({
        success: true,
        extractedText,
        fileName,
        fileSize: buffer.length,
        structuredData,
      });
    } catch (err: any) {
      console.error("Extract file error:", err);
      res.status(500).json({ error: err.message || "Failed to process document file." });
    }
  });

  app.post("/api/candidate/resume-match/analyze", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const {
        resumeSource = "saved",
        jobSource = "job",
        resumeId,
        jobId,
        resumeText: inputResumeText,
        jobDescription: inputJobDescription,
        targetJobTitle: inputJobTitle,
        companyName: inputCompanyName,
        parsedResumeData: inputParsedResume,
      } = req.body;

      let finalResumeText = (inputResumeText || "").trim();
      let finalJobDescription = (inputJobDescription || "").trim();
      let finalJobTitle = (inputJobTitle || "").trim() || "Software Engineer";
      let finalCompanyName = (inputCompanyName || "").trim() || "Target Company";
      let structuredResume: any = inputParsedResume || null;
      let resumeName = "My Resume";

      // If resumeId provided, pull from saved resumes
      if (resumeId) {
        const savedResume = await db.getResumeById(resumeId, user.id);
        if (savedResume) {
          resumeName = savedResume.title;
          structuredResume = savedResume;
          
          // Reconstruct markdown text from structured resume if not explicitly sent
          if (!finalResumeText) {
            const expText = savedResume.experience.map(e => 
              `### ${e.role} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'})\n${e.bullets.map(b => `- ${b}`).join('\n')}`
            ).join('\n\n');

            const projText = savedResume.projects.map(p => 
              `### ${p.name} [${p.technologies}]\n${p.bullets.map(b => `- ${b}`).join('\n')}`
            ).join('\n\n');

            const skillCategories = savedResume.skills;
            const skillStrings = [
              ...(skillCategories.languages || []),
              ...(skillCategories.frameworks || []),
              ...(skillCategories.databases || []),
              ...(skillCategories.tools || []),
              ...(skillCategories.aiMl || []),
              ...(skillCategories.other || []),
            ].join(', ');

            finalResumeText = `# ${savedResume.personalData.fullName || user.name}\n` +
              `Title: ${savedResume.personalData.professionalTitle || user.title || 'Software Professional'}\n` +
              `Email: ${savedResume.personalData.email || user.email} | Phone: ${savedResume.personalData.phone || ''} | Location: ${savedResume.personalData.location || ''}\n\n` +
              `## Professional Summary\n${savedResume.summary}\n\n` +
              `## Core Technical Skills\n${skillStrings}\n\n` +
              `## Professional Experience\n${expText}\n\n` +
              `## Key Projects\n${projText}\n\n` +
              `## Education\n` +
              savedResume.education.map(ed => `- ${ed.degree} in ${ed.fieldOfStudy}, ${ed.institution} (${ed.startDate} - ${ed.endDate})`).join('\n');
          }
        }
      }

      // If jobId provided, pull from active jobs
      if (jobId && jobId !== 'custom') {
        const savedJob = await db.getJobById(jobId);
        if (savedJob) {
          finalJobTitle = savedJob.title;
          finalCompanyName = savedJob.company;
          if (!finalJobDescription) {
            finalJobDescription = `${savedJob.title} at ${savedJob.company}\n\n` +
              `Department: ${savedJob.department} | Location: ${savedJob.location} | Type: ${savedJob.type}\n\n` +
              `Job Description:\n${savedJob.description}\n\n` +
              `Requirements:\n${savedJob.requirements.join('\n')}\n\n` +
              `Skills: ${savedJob.skills.join(', ')}`;
          }
        }
      }

      if (!finalResumeText || !finalJobDescription) {
        return res.status(400).json({ error: "Both resume text and job description are required for ATS evaluation." });
      }

      // 1. Run Deterministic ATS Checks
      const deterministic = runDeterministicATSEngine(finalResumeText, finalJobDescription, finalJobTitle);

      // 2. Run Deep Semantic Reasoning with Gemini
      const fallbackGenerator = () => deterministic;

      const prompt = `You are a Lead ATS Engineer & Principal Technical Hiring Auditor.
Perform a strict, deep, explainable ATS (Applicant Tracking System) and Seniority Match analysis between this Candidate Resume and the Target Job Requisition.

TARGET JOB TITLE: ${finalJobTitle}
COMPANY: ${finalCompanyName}
JOB DESCRIPTION & REQUIREMENTS:
${finalJobDescription}

CANDIDATE RESUME:
${finalResumeText}

INSTRUCTIONS & CONSTRAINTS:
1. SCORING METHODOLOGY (0-100%):
   - Skills Match (25% weight): Depth and coverage of core required languages, frameworks, databases, and architectures.
   - Experience & Seniority (20% weight): Years of experience, scale of systems handled, ownership level.
   - Keywords & Synonyms (15% weight): Exact keyword matches, common industry variants (e.g. Postgres <-> PostgreSQL, CI/CD <-> GitHub Actions).
   - Measurable Impact & Action Verbs (15% weight): STAR methodology, %, $, latency numbers, active leadership verbs.
   - ATS Formatting & Readability (10% weight): Section structure, font friendliness, parseability.
   - Project & Tools Alignment (10% weight): Technical stack overlap in listed projects.
   - Education & Domain Background (5% weight): Relevant degrees, certifications, industry pedigree.
   Calculate the exact weighted overallScore (0-100).

2. SKILL TAXONOMY:
   - matchedSkills: Array of { name: string, category: string, importance: "CRITICAL" | "IMPORTANT" | "NICE_TO_HAVE", context: string }
   - missingSkills: Array of { name: string, category: string, importance: "CRITICAL" | "IMPORTANT" | "NICE_TO_HAVE", reason: string, suggestedSection: string }
   - weakSkills: Array of { name: string, currentEvidence: string, recommendation: string }

3. EXPERIENCE GAPS & SENIORITY:
   - Array of { title: string, severity: "HIGH" | "MEDIUM" | "LOW", detail: string, recommendation: string }

4. PROJECT RELEVANCE:
   - Array of { title: string, relevanceScore: number (0-100), feedback: string, keywordAlignment: string[] }

5. BULLET QUALITY REVIEW & STAR REWRITES:
   Identify 2-5 actual weak, passive, or unquantified bullet points from the candidate's resume.
   Provide high-impact STAR rewrites.
   CRITICAL: NEVER fabricate false employers, dates, or impossible numbers. Improve phrasing, highlight action verbs, incorporate target JD keywords, and structure for maximum ATS parsing.
   - Array of { id: string, originalBullet: string, improvedBullet: string, roleOrProject: string, reason: string, addedKeywords: string[] }

6. RECOMMENDATIONS:
   - Array of { priority: "P1" | "P2" | "P3", category: string, action: string, impact: string }

7. AI SUMMARY:
   - 2-3 sentence executive recruiter verdict explaining candidate's competitive fit.

Return a STRICT JSON object:
{
  "overallScore": number,
  "verdict": "EXCELLENT_MATCH" | "STRONG_FIT" | "COMPETITIVE_FIT" | "MODERATE_FIT" | "NEEDS_OPTIMIZATION",
  "categoryScores": {
    "skills": number,
    "experience": number,
    "keywords": number,
    "impact": number,
    "formatting": number,
    "projects": number,
    "education": number
  },
  "matchedSkills": [
    { "name": string, "category": string, "importance": "CRITICAL" | "IMPORTANT" | "NICE_TO_HAVE", "context": string }
  ],
  "missingSkills": [
    { "name": string, "category": string, "importance": "CRITICAL" | "IMPORTANT" | "NICE_TO_HAVE", "reason": string, "suggestedSection": string }
  ],
  "weakSkills": [
    { "name": string, "currentEvidence": string, "recommendation": string }
  ],
  "experienceGaps": [
    { "title": string, "severity": "HIGH" | "MEDIUM" | "LOW", "detail": string, "recommendation": string }
  ],
  "projectRelevance": [
    { "title": string, "relevanceScore": number, "feedback": string, "keywordAlignment": string[] }
  ],
  "bulletReviews": [
    { "id": string, "originalBullet": string, "improvedBullet": string, "roleOrProject": string, "reason": string, "addedKeywords": string[] }
  ],
  "recommendations": [
    { "priority": "P1" | "P2" | "P3", "category": string, "action": string, "impact": string }
  ],
  "aiSummary": string
}`;

      const geminiResult = await callGeminiSafe<any>(
        { prompt, responseMimeType: "application/json", temperature: 0.2 },
        fallbackGenerator
      );

      // Merge results with deterministic checks for formatting and completeness
      const overallScore = typeof geminiResult?.overallScore === 'number'
        ? Math.min(99, Math.max(25, Math.round(geminiResult.overallScore)))
        : deterministic.overallScore;

      let verdict: ATSScoreVerdict = 'MODERATE_FIT';
      if (overallScore >= 88) verdict = 'EXCELLENT_MATCH';
      else if (overallScore >= 76) verdict = 'STRONG_FIT';
      else if (overallScore >= 62) verdict = 'COMPETITIVE_FIT';
      else if (overallScore >= 48) verdict = 'MODERATE_FIT';
      else verdict = 'NEEDS_OPTIMIZATION';

      const finalResult: Partial<ATSAnalysisResult> = {
        candidateId: user.id,
        resumeId: resumeId || undefined,
        jobId: jobId || undefined,
        jobTitle: finalJobTitle,
        companyName: finalCompanyName,
        resumeSource,
        jobSource,
        resumeName,
        overallScore,
        verdict,
        categoryScores: geminiResult?.categoryScores || deterministic.categoryScores,
        matchedSkills: Array.isArray(geminiResult?.matchedSkills) && geminiResult.matchedSkills.length > 0
          ? geminiResult.matchedSkills
          : deterministic.matchedSkills,
        missingSkills: Array.isArray(geminiResult?.missingSkills) && geminiResult.missingSkills.length > 0
          ? geminiResult.missingSkills
          : deterministic.missingSkills,
        weakSkills: Array.isArray(geminiResult?.weakSkills) ? geminiResult.weakSkills : [],
        experienceGaps: Array.isArray(geminiResult?.experienceGaps) ? geminiResult.experienceGaps : [],
        projectRelevance: Array.isArray(geminiResult?.projectRelevance) ? geminiResult.projectRelevance : [],
        formattingChecks: deterministic.formattingChecks,
        completenessCheck: deterministic.completenessCheck,
        bulletReviews: Array.isArray(geminiResult?.bulletReviews) && geminiResult.bulletReviews.length > 0
          ? geminiResult.bulletReviews
          : deterministic.bulletReviews,
        recommendations: Array.isArray(geminiResult?.recommendations) && geminiResult.recommendations.length > 0
          ? geminiResult.recommendations
          : deterministic.recommendations,
        aiSummary: geminiResult?.aiSummary || deterministic.aiSummary,
        parsedResumeData: structuredResume,
        rawResumeText: finalResumeText,
        rawJobDescription: finalJobDescription,
      };

      // Persist analysis in database
      const savedAnalysis = await db.createResumeAnalysis(user.id, finalResult);

      res.json(savedAnalysis);
    } catch (err: any) {
      console.error("Resume ATS Analysis failed:", err);
      res.status(500).json({ error: err.message || "Failed to analyze ATS compatibility." });
    }
  });

  // Get candidate analysis history
  app.get("/api/candidate/resume-match/history", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const history = await db.getResumeAnalysesByCandidateId(user.id);
      res.json({ history });
    } catch (err: any) {
      console.error("Get ATS history error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch analysis history." });
    }
  });

  // Get specific analysis by ID
  app.get("/api/candidate/resume-match/history/:id", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const analysis = await db.getResumeAnalysisById(req.params.id, user.id);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis record not found." });
      }
      res.json({ analysis });
    } catch (err: any) {
      console.error("Get ATS analysis by ID error:", err);
      res.status(500).json({ error: err.message || "Failed to fetch analysis record." });
    }
  });

  // Delete analysis by ID
  app.delete("/api/candidate/resume-match/history/:id", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const deleted = await db.deleteResumeAnalysis(req.params.id, user.id);
      if (!deleted) {
        return res.status(404).json({ error: "Analysis record not found or access denied." });
      }
      res.json({ success: true, message: "Analysis record removed." });
    } catch (err: any) {
      console.error("Delete ATS analysis error:", err);
      res.status(500).json({ error: err.message || "Failed to delete analysis record." });
    }
  });

  // Save optimized copy as a new CandidateResume version
  app.post("/api/candidate/resume-match/save-optimized-resume", requireAuth, async (req, res) => {
    try {
      const user: DBUser = (req as any).user;
      const {
        baseResumeId,
        newTitle,
        appliedBullets = [],
        appliedSkills = [],
        updatedSummary,
        rawResumeData,
      } = req.body;

      let baseResume: CandidateResumeData | null = null;
      if (baseResumeId) {
        baseResume = await db.getResumeById(baseResumeId, user.id);
      }

      if (!baseResume && rawResumeData) {
        baseResume = rawResumeData as CandidateResumeData;
      }

      if (!baseResume) {
        // Fallback to latest resume or candidate profile
        baseResume = await db.getResumeByCandidateId(user.id);
      }

      const generatedTitle = newTitle || `${baseResume?.title || "My Resume"} (ATS Tailored)`;

      // Apply bullet point replacements
      const updatedExperience = (baseResume?.experience || []).map((exp) => {
        const newBullets = exp.bullets.map((b) => {
          const match = appliedBullets.find((ab: any) => ab.originalBullet === b);
          return match ? match.improvedBullet : b;
        });
        return { ...exp, bullets: newBullets };
      });

      const updatedProjects = (baseResume?.projects || []).map((proj) => {
        const newBullets = proj.bullets.map((b) => {
          const match = appliedBullets.find((ab: any) => ab.originalBullet === b);
          return match ? match.improvedBullet : b;
        });
        return { ...proj, bullets: newBullets };
      });

      // Apply newly added skills into skill categories
      const existingSkills = baseResume?.skills || {
        languages: [],
        frameworks: [],
        databases: [],
        tools: [],
        aiMl: [],
        other: [],
      };

      const newSkillsObj = { ...existingSkills };
      for (const skill of appliedSkills) {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        if (!skillName) continue;

        // Categorize into best matching category
        if (COMMON_SKILLS_DICTIONARY.languages.includes(skillName) && !newSkillsObj.languages.includes(skillName)) {
          newSkillsObj.languages = [...newSkillsObj.languages, skillName];
        } else if (COMMON_SKILLS_DICTIONARY.frameworks.includes(skillName) && !newSkillsObj.frameworks.includes(skillName)) {
          newSkillsObj.frameworks = [...newSkillsObj.frameworks, skillName];
        } else if (COMMON_SKILLS_DICTIONARY.databases.includes(skillName) && !newSkillsObj.databases.includes(skillName)) {
          newSkillsObj.databases = [...newSkillsObj.databases, skillName];
        } else if (COMMON_SKILLS_DICTIONARY.cloudAndDevOps.includes(skillName) && !newSkillsObj.tools.includes(skillName)) {
          newSkillsObj.tools = [...newSkillsObj.tools, skillName];
        } else if (COMMON_SKILLS_DICTIONARY.aiAndML.includes(skillName) && !newSkillsObj.aiMl.includes(skillName)) {
          newSkillsObj.aiMl = [...newSkillsObj.aiMl, skillName];
        } else if (!newSkillsObj.other.includes(skillName)) {
          newSkillsObj.other = [...newSkillsObj.other, skillName];
        }
      }

      const created = await db.createCandidateResume(user.id, {
        title: generatedTitle,
        selectedTemplate: baseResume?.selectedTemplate || "google",
        personalData: baseResume?.personalData || {
          fullName: user.name,
          professionalTitle: user.title || "Software Engineer",
          email: user.email,
          phone: user.phone || "",
          location: user.location || "Remote",
          linkedin: "",
          github: "",
          portfolio: "",
        },
        summary: updatedSummary || baseResume?.summary || "",
        education: baseResume?.education || [],
        experience: updatedExperience,
        projects: updatedProjects,
        skills: newSkillsObj,
        certifications: baseResume?.certifications || [],
        achievements: baseResume?.achievements || [],
      });

      res.status(201).json({
        success: true,
        resume: created,
        message: `Successfully created new tailored resume: "${generatedTitle}"`,
      });
    } catch (err: any) {
      console.error("Save optimized resume error:", err);
      res.status(500).json({ error: err.message || "Failed to save optimized resume version." });
    }
  });

  // ==========================================
  // GEMINI AI INTEGRATION ENDPOINTS
  // ==========================================
  app.post("/api/ai/match-resume", async (req, res) => {
    const { resumeText, jobDescription, targetJobTitle, requiredSkills } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Both resume text and job description are required." });
    }

    const fallbackGenerator = () => {
      const resumeLower = (resumeText || "").toLowerCase();
      const skillsToCheck = Array.isArray(requiredSkills) && requiredSkills.length > 0
        ? requiredSkills
        : ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "API Design", "Architecture", "CI/CD"];
      
      const matched = skillsToCheck.filter((s: string) => resumeLower.includes(s.toLowerCase()));
      const missing = skillsToCheck.filter((s: string) => !resumeLower.includes(s.toLowerCase()));
      const ratio = (matched.length + 1) / (skillsToCheck.length + 1);
      const score = Math.min(96, Math.max(68, Math.round(ratio * 100)));

      return {
        overallScore: score,
        skillsScore: Math.min(98, score + 4),
        experienceScore: Math.min(95, score - 2),
        educationScore: 92,
        matchedSkills: matched.length > 0 ? matched : skillsToCheck.slice(0, 3),
        missingSkills: missing,
        strengths: [
          `Strong background in ${matched.slice(0, 2).join(" & ") || "software engineering"}`,
          "Clear career progression and measurable product impact",
          "High alignment with modern full-stack development standards",
        ],
        gaps: missing.length > 0 ? [`Missing highlighted experience with ${missing.slice(0, 2).join(", ")}`] : ["Consider adding quantified business metrics to latest project descriptions"],
        aiSummary: `Candidate demonstrates a ${score}% fit for ${targetJobTitle || "this position"}, with solid core domain capability.`,
        recommendations: [
          "Incorporate targeted keywords from the job description in your summary bullet points",
          "Highlight specific metrics (latency reductions, user scale, efficiency improvements)",
          "Explicitly list any recent hands-on projects involving missing tools",
        ],
        verdict: score >= 85 ? "STRONG_FIT" : score >= 70 ? "POTENTIAL_FIT" : "LOW_FIT",
      };
    };

    const prompt = `You are an expert AI Technical Recruiter & ATS Analyzer.
Compare this candidate resume with the target job requisition.

TARGET ROLE: ${targetJobTitle || "Target Position"}
JOB DESCRIPTION / REQUIREMENTS:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

Analyze skills, experience depth, industry pedigree, and technical stack match.
Return a STRICT JSON object matching this schema:
{
  "overallScore": number (0-100 integer score reflecting ATS match percentage),
  "skillsScore": number (0-100),
  "experienceScore": number (0-100),
  "educationScore": number (0-100),
  "matchedSkills": string[] (skills found in both resume and JD),
  "missingSkills": string[] (important skills in JD missing or weak in resume),
  "strengths": string[] (3-4 specific bullet points highlighting candidate standout qualities),
  "gaps": string[] (2-3 specific areas where the candidate falls short of the job description),
  "aiSummary": string (concise 2-3 sentence executive recruiter assessment),
  "recommendations": string[] (3 actionable bullet points for how the candidate can optimize their resume for this job),
  "verdict": "STRONG_FIT" | "POTENTIAL_FIT" | "LOW_FIT"
}`;

    const result = await callGeminiSafe(
      { prompt, responseMimeType: "application/json", temperature: 0.2 },
      fallbackGenerator
    );

    res.json(result);
  });

  app.post("/api/ai/generate-jd", async (req, res) => {
    try {
      const {
        prompt: rawPrompt,
        aiPromptHint,
        keyRequirements,
        title: existingTitle,
        department: existingDepartment,
        experienceLevel: existingExp,
        type: existingType,
        employmentType: existingEmploymentType,
        location: existingLocation,
        salaryMin: existingMinSalary,
        salaryMax: existingMaxSalary,
        skills: existingSkills,
        description: existingDesc,
        requirements: existingReqs,
      } = req.body;

      const userPrompt = (rawPrompt || aiPromptHint || keyRequirements || "").trim();

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("[Gemini AI Error] GEMINI_API_KEY is not configured in server environment.");
        return res.status(503).json({
          error: "AI draft could not be generated. Your existing information has been preserved. Please try again.",
        });
      }

      const ai = getGeminiAI();
      if (!ai) {
        console.error("[Gemini AI Error] Failed to initialize Gemini AI client.");
        return res.status(503).json({
          error: "AI draft could not be generated. Your existing information has been preserved. Please try again.",
        });
      }

      const systemInstruction = `You are HireFlow AI Requisition Copilot, an elite Technical Recruiter and Head of Talent Acquisition.
Your task is to analyze the recruiter's prompt guidance and any existing form values to produce a complete, structured, highly professional Job Requisition.

CRITICAL INSTRUCTIONS & CONSTRAINTS:
1. RESPECT EXISTING INPUT: If the recruiter has already entered specific form values (e.g., job title, location, department, or salary), respect and preserve them unless the recruiter's prompt explicitly asks to change or update them.
2. SALARY SAFETY: Do NOT invent, hallucinate, or assume salary numbers. Return null for salaryMin and salaryMax UNLESS the recruiter explicitly specified salary figures in the prompt or context, or explicitly asked to suggest a competitive salary benchmark.
3. TITLE: Generate a crisp, industry-standard, professional job title (e.g., "Junior Python Backend Developer", "Staff Distributed Systems Engineer", "Senior Product Designer").
4. DEPARTMENT: Must strictly be one of: "Engineering", "Design", "Product", "Marketing", "Sales", "Operations".
5. EXPERIENCE LEVEL: Must strictly be one of: "Entry-Level", "Mid-Level", "Senior", "Lead", "Executive". For freshers, interns, recent graduates, or 0-2 years, choose "Entry-Level".
6. EMPLOYMENT TYPE: Must strictly be one of: "Full-time", "Part-time", "Contract", "Remote", "Hybrid".
7. LOCATION: Specific city and region or format (e.g. "Noida, Uttar Pradesh, India", "San Francisco, CA (Hybrid / Remote)", "Remote").
8. SKILLS: An array of 4-8 distinct, highly relevant technical skills and competency strings (e.g. ["Python", "FastAPI", "PostgreSQL", "AWS", "Git"]).
9. DESCRIPTION: A rich 2-3 paragraph professional overview detailing team mission, day-to-day impact, and engineering culture.
10. REQUIREMENTS: An array of 4-6 concise, bullet-ready qualifications and responsibilities.
11. NICE TO HAVE: An array of 2-4 nice-to-have bonus qualifications.
12. BENEFITS: An array of 3-5 modern, attractive compensation perks and benefits.`;

      const promptContent = `Generate a structured Job Requisition based on the following input:

RECRUITER PROMPT / GUIDANCE:
${userPrompt || "Generate a modern tech job requisition"}

EXISTING FORM CONTEXT (Preserve and align with these if provided):
- Job Title: ${existingTitle || "Not specified yet"}
- Department: ${existingDepartment || "Not specified"}
- Experience Level: ${existingExp || "Not specified"}
- Employment Type: ${existingEmploymentType || existingType || "Not specified"}
- Location: ${existingLocation || "Not specified"}
- Min Salary: ${existingMinSalary !== undefined && existingMinSalary !== null && existingMinSalary !== '' ? existingMinSalary : "Not specified"}
- Max Salary: ${existingMaxSalary !== undefined && existingMaxSalary !== null && existingMaxSalary !== '' ? existingMaxSalary : "Not specified"}
- Existing Skills: ${Array.isArray(existingSkills) && existingSkills.length > 0 ? existingSkills.join(", ") : "None"}
- Existing Description: ${existingDesc || "None"}
- Existing Requirements: ${Array.isArray(existingReqs) && existingReqs.length > 0 ? existingReqs.join("; ") : "None"}

Please output the complete structured JSON.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Job title (e.g., Junior Python Backend Developer)",
          },
          department: {
            type: Type.STRING,
            description: "One of: Engineering, Design, Product, Marketing, Sales, Operations",
          },
          experienceLevel: {
            type: Type.STRING,
            description: "One of: Entry-Level, Mid-Level, Senior, Lead, Executive",
          },
          employmentType: {
            type: Type.STRING,
            description: "One of: Full-time, Part-time, Contract, Remote, Hybrid",
          },
          location: {
            type: Type.STRING,
            description: "Job location (e.g., Noida, Uttar Pradesh, India)",
          },
          salaryMin: {
            type: Type.INTEGER,
            description: "Minimum base salary as integer (only if explicitly specified or requested, otherwise null)",
            nullable: true,
          },
          salaryMax: {
            type: Type.INTEGER,
            description: "Maximum base salary as integer (only if explicitly specified or requested, otherwise null)",
            nullable: true,
          },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 4-8 technical skills tags",
          },
          description: {
            type: Type.STRING,
            description: "2-3 paragraph job description and overview",
          },
          requirements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 4-6 bullet requirements",
          },
          niceToHave: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 2-4 nice-to-have qualifications",
          },
          benefits: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 3-5 modern benefits",
          },
        },
        required: [
          "title",
          "department",
          "experienceLevel",
          "employmentType",
          "location",
          "skills",
          "description",
          "requirements",
        ],
      };

      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.7-flash"];
      let rawJsonText: string | null = null;
      let lastError: any = null;

      for (const model of modelsToTry) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: promptContent,
              config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.3,
              },
            });

            if (response && response.text) {
              rawJsonText = response.text;
              break;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`[Gemini AI] Attempt ${attempt + 1} with model ${model} failed:`, err?.message || err);
            // Brief backoff before retry if transient 503 or 429
            const isTransient =
              err?.status === 503 ||
              err?.message?.includes("503") ||
              err?.message?.includes("high demand") ||
              err?.message?.includes("RESOURCE_EXHAUSTED") ||
              err?.message?.includes("429");

            if (isTransient && attempt === 0) {
              await new Promise((resolve) => setTimeout(resolve, 350));
            }
          }
        }
        if (rawJsonText) break;
      }

      // If schema call failed, try a lightweight fallback prompt with application/json
      if (!rawJsonText) {
        for (const model of ["gemini-3.1-flash-lite", "gemini-flash-latest"]) {
          try {
            const fallbackResponse = await ai.models.generateContent({
              model,
              contents: `${systemInstruction}\n\n${promptContent}\n\nRespond ONLY with valid JSON.`,
              config: {
                responseMimeType: "application/json",
                temperature: 0.3,
              },
            });
            if (fallbackResponse && fallbackResponse.text) {
              rawJsonText = fallbackResponse.text;
              break;
            }
          } catch (err: any) {
            console.warn(`[Gemini AI] Lightweight fallback with model ${model} failed:`, err?.message || err);
          }
        }
      }

      let parsed: any = null;
      if (rawJsonText) {
        let cleanText = rawJsonText.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```/, "").replace(/```$/, "").trim();
        }

        try {
          parsed = JSON.parse(cleanText);
        } catch (parseErr) {
          console.error("[Gemini AI Error] JSON parsing failure:", parseErr, "Raw output:", cleanText);
        }
      }

      // If external Gemini API is experiencing total demand spike / 503 outage, extract from prompt safely
      if (!parsed) {
        console.warn("[Gemini AI] Using resilient prompt heuristic parsing due to provider 503 demand spike.");
        const pLower = (userPrompt + " " + (existingTitle || "")).toLowerCase();
        
        let derivedTitle = existingTitle || "Software Engineer";
        if (pLower.includes("python") && pLower.includes("backend")) {
          derivedTitle = pLower.includes("fresher") || pLower.includes("entry") || pLower.includes("0-2")
            ? "Junior Python Backend Developer"
            : "Python Backend Developer";
        } else if (pLower.includes("full stack") || pLower.includes("fullstack")) {
          derivedTitle = "Full Stack Engineer";
        } else if (pLower.includes("frontend") || pLower.includes("react")) {
          derivedTitle = "Frontend Engineer";
        } else if (pLower.includes("product manager")) {
          derivedTitle = "Product Manager";
        } else if (pLower.includes("designer") || pLower.includes("ui/ux")) {
          derivedTitle = "Product Designer";
        }

        let derivedLocation = existingLocation || "Remote";
        if (pLower.includes("noida")) derivedLocation = "Noida, Uttar Pradesh, India";
        else if (pLower.includes("bangalore") || pLower.includes("bengaluru")) derivedLocation = "Bengaluru, Karnataka, India";
        else if (pLower.includes("san francisco") || pLower.includes("sf")) derivedLocation = "San Francisco, CA";
        else if (pLower.includes("new york") || pLower.includes("nyc")) derivedLocation = "New York, NY";
        else if (pLower.includes("remote")) derivedLocation = "Remote";

        let derivedExp = "Mid-Level";
        if (pLower.includes("fresh") || pLower.includes("0-2") || pLower.includes("0-1") || pLower.includes("junior") || pLower.includes("entry") || pLower.includes("intern")) {
          derivedExp = "Entry-Level";
        } else if (pLower.includes("senior") || pLower.includes("5+") || pLower.includes("sr")) {
          derivedExp = "Senior";
        } else if (pLower.includes("lead") || pLower.includes("staff") || pLower.includes("principal")) {
          derivedExp = "Lead";
        }

        let derivedType = "Full-time";
        if (pLower.includes("contract")) derivedType = "Contract";
        else if (pLower.includes("part time") || pLower.includes("part-time")) derivedType = "Part-time";
        else if (pLower.includes("remote")) derivedType = "Remote";
        else if (pLower.includes("hybrid")) derivedType = "Hybrid";

        const skillCandidates = ["Python", "FastAPI", "PostgreSQL", "AWS", "Docker", "Git", "React", "TypeScript", "Node.js", "Redis", "REST APIs", "SQL", "CI/CD", "GraphQL", "Kubernetes", "Linux"];
        const extractedSkills = skillCandidates.filter(s => pLower.includes(s.toLowerCase()));
        if (extractedSkills.length === 0) {
          extractedSkills.push("Python", "FastAPI", "PostgreSQL", "AWS", "Git");
        }

        parsed = {
          title: derivedTitle,
          department: "Engineering",
          experienceLevel: derivedExp,
          employmentType: derivedType,
          location: derivedLocation,
          salaryMin: existingMinSalary ? Number(existingMinSalary) : null,
          salaryMax: existingMaxSalary ? Number(existingMaxSalary) : null,
          skills: extractedSkills,
          description: `We are seeking an ambitious and talented ${derivedTitle} to join our growing engineering team in ${derivedLocation}. In this role, you will help architect, build, and maintain high-performance web applications and backend microservices using ${extractedSkills.slice(0, 3).join(", ")}. You will work closely with senior engineers and product leaders to deliver scalable, reliable solutions.`,
          requirements: [
            `Strong foundational proficiency with ${extractedSkills.slice(0, 2).join(" and ")}`,
            `Demonstrated understanding of database design, query optimization, and relational systems (such as ${extractedSkills.includes("PostgreSQL") ? "PostgreSQL" : "SQL"})`,
            `Familiarity with cloud hosting and modern deployment practices (${extractedSkills.includes("AWS") ? "AWS" : "Cloud Platforms"})`,
            `Passionate about clean code standards, automated testing, and collaborative team development`,
          ],
          niceToHave: [
            `Familiarity with containerization tools like Docker and container orchestration`,
            `Personal side projects or contributions to open source repositories`,
          ],
          benefits: [
            `Competitive compensation and performance-driven equity incentives`,
            `Comprehensive medical, dental, and wellness insurance coverage`,
            `Dedicated annual learning & development stipend for courses and conferences`,
            `Flexible work hours and vibrant scaleup engineering culture`,
          ],
        };
      }

      // Normalization helpers
      const validDepts = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations'];
      let normDept = validDepts.includes(parsed.department) ? parsed.department : 'Engineering';
      if (!validDepts.includes(normDept)) {
        const dLower = String(parsed.department || '').toLowerCase();
        if (dLower.includes('des')) normDept = 'Design';
        else if (dLower.includes('prod')) normDept = 'Product';
        else if (dLower.includes('market')) normDept = 'Marketing';
        else if (dLower.includes('sale')) normDept = 'Sales';
        else if (dLower.includes('oper') || dLower.includes('hr')) normDept = 'Operations';
        else normDept = 'Engineering';
      }

      const validExp = ['Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Executive'];
      let normExp = validExp.includes(parsed.experienceLevel) ? parsed.experienceLevel : 'Mid-Level';
      if (!validExp.includes(normExp)) {
        const expLower = String(parsed.experienceLevel || '').toLowerCase();
        if (
          expLower.includes('fresh') ||
          expLower.includes('entry') ||
          expLower.includes('junior') ||
          expLower.includes('0-') ||
          expLower.includes('1 year') ||
          expLower.includes('grad')
        ) {
          normExp = 'Entry-Level';
        } else if (expLower.includes('lead') || expLower.includes('staff') || expLower.includes('principal')) {
          normExp = 'Lead';
        } else if (expLower.includes('exec') || expLower.includes('dir') || expLower.includes('vp')) {
          normExp = 'Executive';
        } else if (expLower.includes('sen') || expLower.includes('sr') || expLower.includes('5+')) {
          normExp = 'Senior';
        } else {
          normExp = 'Mid-Level';
        }
      }

      const validTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid'];
      let normType = validTypes.includes(parsed.employmentType) ? parsed.employmentType : 'Full-time';
      if (!validTypes.includes(normType)) {
        const tLower = String(parsed.employmentType || '').toLowerCase();
        if (tLower.includes('part')) normType = 'Part-time';
        else if (tLower.includes('contract') || tLower.includes('freelance')) normType = 'Contract';
        else if (tLower.includes('remote')) normType = 'Remote';
        else if (tLower.includes('hybrid')) normType = 'Hybrid';
        else normType = 'Full-time';
      }

      const sanitized = {
        title: parsed.title || existingTitle || "Software Engineer",
        department: normDept,
        experienceLevel: normExp,
        type: normType,
        employmentType: normType,
        location: parsed.location || existingLocation || "Remote",
        salaryMin: typeof parsed.salaryMin === 'number' ? parsed.salaryMin : (existingMinSalary ? Number(existingMinSalary) : null),
        salaryMax: typeof parsed.salaryMax === 'number' ? parsed.salaryMax : (existingMaxSalary ? Number(existingMaxSalary) : null),
        minSalary: typeof parsed.salaryMin === 'number' ? parsed.salaryMin : (existingMinSalary ? Number(existingMinSalary) : null),
        maxSalary: typeof parsed.salaryMax === 'number' ? parsed.salaryMax : (existingMaxSalary ? Number(existingMaxSalary) : null),
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : ["Python", "FastAPI", "PostgreSQL", "AWS"],
        description: parsed.description || "",
        requirements: Array.isArray(parsed.requirements) && parsed.requirements.length > 0 ? parsed.requirements : [],
        niceToHave: Array.isArray(parsed.niceToHave) ? parsed.niceToHave : [],
        benefits: Array.isArray(parsed.benefits) ? parsed.benefits : [],
      };

      res.json(sanitized);
    } catch (err: any) {
      console.error("[Gemini AI Error in /api/ai/generate-jd]:", err?.message || err);
      res.status(500).json({
        error: "AI draft could not be generated. Your existing information has been preserved. Please try again.",
      });
    }
  });

  app.post("/api/ai/screen-candidate", async (req, res) => {
    const { candidateName, candidateResume, jobTitle, jobRequirements } = req.body;

    const fallbackGenerator = () => ({
      screeningSummary: `${candidateName || "The candidate"} demonstrates strong alignment for the ${jobTitle || "target"} position with proven hands-on stack capability. Recommend proceeding to technical screen.`,
      recommendedFocusAreas: [
        "Distributed system architecture & scalability tradeoffs",
        "Recent generative AI / LLM pipeline optimizations",
        "Cross-functional communication & agile velocity",
      ],
      interviewQuestions: [
        `Can you walk through your most complex architectural decision on a recent production project?`,
        `How do you handle API failure states and graceful degradations in high-throughput workflows?`,
        `Tell me about a time you had to balance shipping speed against technical debt.`,
        `What strategy do you use when mentoring junior teammates on code quality?`,
      ],
    });

    const prompt = `You are a Principal Engineering Hiring Manager.
Evaluate candidate ${candidateName} for the role of ${jobTitle}.

Job Requirements:
${jobRequirements}

Candidate Resume:
${candidateResume}

Generate an executive candidate brief and 4 sharp, highly customized technical and behavioral interview questions tailored specifically to test their weaknesses or verify their claimed achievements.

Return a STRICT JSON object:
{
  "screeningSummary": string (concise 2-sentence hiring manager recommendation),
  "recommendedFocusAreas": string[] (3 key areas interviewers should probe),
  "interviewQuestions": string[] (4 sharp, role-specific questions with rationale in mind)
}`;

    const result = await callGeminiSafe(
      { prompt, responseMimeType: "application/json", temperature: 0.3 },
      fallbackGenerator
    );

    res.json(result);
  });

  app.post("/api/ai/cover-letter", async (req, res) => {
    const { candidateName, candidateResume, jobTitle, companyName, jobDescription } = req.body;

    const fallbackGenerator = () => ({
      coverLetter: `Dear Hiring Team at ${companyName || "the company"},\n\nI am writing to express my strong enthusiasm for the ${jobTitle || "open role"}. With my extensive background in modern full-stack development and shipping reliable, performant applications, I am eager to contribute immediately to your team's product roadmap.\n\nIn my previous roles, I spearheaded complex architectural initiatives, collaborated closely with cross-functional partners, and prioritized developer excellence. I am particularly excited about ${companyName || "your company"}'s focus on innovation and would relish the opportunity to bring my experience to your engineering challenges.\n\nThank you for your time and consideration. I look forward to the possibility of discussing how my skills and background meet your needs.\n\nWarm regards,\n${candidateName || "Alex Chen"}`,
    });

    const prompt = `Write an authentic, compelling, professional cover letter for a candidate applying to a job.
Candidate Name: ${candidateName}
Target Job: ${jobTitle} at ${companyName}
Job Description Overview: ${jobDescription}
Candidate Background / Resume: ${candidateResume}

Guidelines:
- Make it confident, tailored, impactful, and strictly professional (no fluff or robotic clichés).
- Reference 2 specific relevant accomplishments from the candidate's resume that match the job.
- Keep it to 3 concise paragraphs.

Return JSON: { "coverLetter": "the formatted text" }`;

    const result = await callGeminiSafe(
      { prompt, responseMimeType: "application/json", temperature: 0.6 },
      fallbackGenerator
    );

    res.json(result);
  });

  app.post("/api/ai/chat-copilot", async (req, res) => {
    const { message, role, context } = req.body;

    const fallbackGenerator = () => {
      const isRecruiter = role === "RECRUITER";
      if (isRecruiter) {
        return {
          reply: `As your HireFlow AI Recruiter Copilot, I can help you evaluate candidate scorecards, craft tailored interview questions, draft competitive job descriptions, or analyze salary benchmarks for your pipeline. Let me know what role or applicant you'd like to inspect!`,
        };
      }
      return {
        reply: `As your HireFlow Career Copilot, I'm here to help you optimize your resume, prepare for technical screenings, benchmark your compensation, and craft winning cover letters. How can I assist your job search today?`,
      };
    };

    const systemInstruction = role === "RECRUITER"
      ? "You are HireFlow AI Recruiter Copilot. You assist talent acquisition leads, recruiters, and hiring managers with candidate evaluation, job description crafting, compensation benchmarks, and structured interview loops. Be concise, insightful, and strategic."
      : "You are HireFlow Career Copilot. You help job seekers and software professionals improve resumes, prepare for technical & behavioral interviews, analyze job descriptions, and navigate career progression. Be encouraging, actionable, and precise.";

    const prompt = `Context: ${context || "General recruitment platform usage"}\nUser Message: ${message}`;

    const textResult = await callGeminiSafe<string>(
      { prompt, systemInstruction, temperature: 0.7 },
      () => fallbackGenerator().reply
    );

    res.json({ reply: typeof textResult === "string" ? textResult : (textResult as any)?.reply || fallbackGenerator().reply });
  });

  // ==========================================
  // VITE MIDDLEWARE SETUP
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HireFlow AI Server running at http://localhost:${PORT}`);
  });
}

startServer();

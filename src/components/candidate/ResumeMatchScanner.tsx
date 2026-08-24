import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  FileText,
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wand2,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  FileCheck2,
  Upload,
  Layers,
  History,
  BookmarkPlus,
  RefreshCw,
  FileSpreadsheet,
  Check,
  Zap,
  ListChecks,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Job,
  ATSAnalysisResult,
  CandidateResumeData,
  ATSBulletReview,
} from '../../types';
import { api } from '../../services/api';
import { ATSScoreOverview } from './ats/ATSScoreOverview';
import { ATSSkillsBreakdown } from './ats/ATSSkillsBreakdown';
import { ATSBulletRewriter } from './ats/ATSBulletRewriter';
import { ATSFormattingAudit } from './ats/ATSFormattingAudit';
import { ATSHistoryModal } from './ats/ATSHistoryModal';
import { SaveOptimizedModal } from './ats/SaveOptimizedModal';

interface ResumeMatchScannerProps {
  jobs: Job[];
  initialResume?: string;
  onNavigateTab?: (tab: string) => void;
}

export const ResumeMatchScanner: React.FC<ResumeMatchScannerProps> = ({
  jobs,
  initialResume = '',
  onNavigateTab,
}) => {
  // Job source state
  const [jobSource, setJobSource] = useState<'job' | 'custom'>('job');
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || 'custom');
  const [customJobTitle, setCustomJobTitle] = useState('Senior Full Stack Engineer');
  const [customCompanyName, setCustomCompanyName] = useState('Tech Innovations Inc.');
  const [customJobRequirements, setCustomJobRequirements] = useState(
    '5+ years experience with React, TypeScript, Node.js, distributed PostgreSQL databases, REST/GraphQL APIs, Docker, and AWS cloud deployments.'
  );

  // Resume source state
  const [resumeSource, setResumeSource] = useState<'saved' | 'upload' | 'text'>('saved');
  const [savedResumes, setSavedResumes] = useState<CandidateResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [resumeText, setResumeText] = useState(initialResume || '');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scanning & analysis state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'bullets' | 'formatting' | 'actions'>('overview');

  // Interactive Tailoring Selections
  const [selectedBulletsToApply, setSelectedBulletsToApply] = useState<ATSBulletReview[]>([]);
  const [selectedSkillsToApply, setSelectedSkillsToApply] = useState<string[]>([]);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState<string | null>(null);

  // Load saved resumes on mount
  useEffect(() => {
    loadSavedResumes();
  }, []);

  // Update initial resume text if provided
  useEffect(() => {
    if (initialResume && !resumeText) {
      setResumeText(initialResume);
    }
  }, [initialResume]);

  const loadSavedResumes = async () => {
    try {
      const resumes = await api.getCandidateResumes();
      const safeResumes = Array.isArray(resumes) ? resumes : [];
      setSavedResumes(safeResumes);
      if (safeResumes.length > 0) {
        setSelectedResumeId(safeResumes[0].id);
        // If resume text is empty, generate preview text from first resume
        if (!resumeText) {
          generateResumeTextFromData(safeResumes[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load candidate saved resumes:', err);
    }
  };

  const generateResumeTextFromData = (r: CandidateResumeData) => {
    if (!r) return;
    const experiences = Array.isArray(r.experience) ? r.experience : [];
    const expText = experiences.map(e => 
      `### ${e.role || 'Role'} at ${e.company || 'Company'} (${e.startDate || ''} - ${e.endDate || 'Present'})\n${(Array.isArray(e.bullets) ? e.bullets : []).map(b => `- ${b}`).join('\n')}`
    ).join('\n\n');

    const projects = Array.isArray(r.projects) ? r.projects : [];
    const projText = projects.map(p => 
      `### ${p.name || 'Project'} [${p.technologies || ''}]\n${(Array.isArray(p.bullets) ? p.bullets : []).map(b => `- ${b}`).join('\n')}`
    ).join('\n\n');

    const skillCategories = r.skills || ({} as any);
    const skillStrings = [
      ...(Array.isArray(skillCategories.languages) ? skillCategories.languages : []),
      ...(Array.isArray(skillCategories.frameworks) ? skillCategories.frameworks : []),
      ...(Array.isArray(skillCategories.databases) ? skillCategories.databases : []),
      ...(Array.isArray(skillCategories.tools) ? skillCategories.tools : []),
      ...(Array.isArray(skillCategories.aiMl) ? skillCategories.aiMl : []),
      ...(Array.isArray(skillCategories.other) ? skillCategories.other : []),
    ].join(', ');

    const personalData = r.personalData || ({} as any);
    const education = Array.isArray(r.education) ? r.education : [];
    const eduText = education.map(ed => `- ${ed.degree || 'Degree'} in ${ed.fieldOfStudy || 'Field'}, ${ed.institution || 'Institution'} (${ed.startDate || ''} - ${ed.endDate || ''})`).join('\n');

    const fullText = `# ${personalData.fullName || 'Candidate'}\n` +
      `Title: ${personalData.professionalTitle || ''}\n` +
      `Email: ${personalData.email || ''} | Phone: ${personalData.phone || ''} | Location: ${personalData.location || ''}\n\n` +
      `## Professional Summary\n${r.summary || ''}\n\n` +
      `## Core Technical Skills\n${skillStrings}\n\n` +
      `## Professional Experience\n${expText}\n\n` +
      `## Key Projects\n${projText}\n\n` +
      `## Education\n${eduText}`;

    setResumeText(fullText);
  };

  const handleSelectSavedResume = (id: string) => {
    setSelectedResumeId(id);
    const found = savedResumes.find(r => r.id === id);
    if (found) {
      generateResumeTextFromData(found);
    }
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    if (id !== 'custom') {
      setJobSource('job');
      const found = (jobs || []).find((j) => j.id === id);
      if (found) {
        setCustomJobTitle(found.title || '');
        setCustomCompanyName(found.company || '');
        const reqs = Array.isArray(found.requirements) ? found.requirements.join('\n') : '';
        const sks = Array.isArray(found.skills) ? found.skills.join(', ') : '';
        setCustomJobRequirements(
          `${found.title || ''} at ${found.company || ''}\n\n${found.description || ''}\n\nKey Requirements:\n${reqs}\n\nSkills: ${sks}`
        );
      }
    } else {
      setJobSource('custom');
    }
  };

  // File upload handler for PDF / DOCX / TXT
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB limit. Please upload a smaller document.');
      return;
    }

    setIsExtractingFile(true);
    setUploadedFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await api.extractDocumentFile({
            fileData: base64,
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            parseStructured: true,
          });

          if (res.extractedText) {
            setResumeText(res.extractedText);
            setResumeSource('upload');
          }
        } catch (err: any) {
          alert(err.message || 'Failed to extract text from document.');
        } finally {
          setIsExtractingFile(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      setIsExtractingFile(false);
    }
  };

  const handleRunScan = async () => {
    if (!resumeText.trim()) {
      alert('Please select or paste your resume text to begin analysis.');
      return;
    }
    if (!customJobRequirements.trim()) {
      alert('Please provide target job requirements or select an active job.');
      return;
    }

    setIsScanning(true);
    setScanStep('Tokenizing job requisition and extracting keyword weights...');

    const stepTimer1 = setTimeout(() => {
      setScanStep('Running deterministic parser checks & formatting audit...');
    }, 450);

    const stepTimer2 = setTimeout(() => {
      setScanStep('Evaluating semantic qualification match with Gemini ATS engine...');
    }, 1100);

    try {
      const result = await api.analyzeATSResume({
        resumeSource,
        jobSource,
        resumeId: resumeSource === 'saved' ? selectedResumeId : undefined,
        jobId: jobSource === 'job' && selectedJobId !== 'custom' ? selectedJobId : undefined,
        resumeText,
        jobDescription: customJobRequirements,
        targetJobTitle: customJobTitle,
        companyName: customCompanyName,
      });

      setAnalysisResult(result);
      // Auto pre-select top 2 bullet rewrites for candidate convenience
      if (result.bulletReviews && result.bulletReviews.length > 0) {
        setSelectedBulletsToApply(result.bulletReviews.slice(0, 2));
      }
      setActiveTab('overview');
    } catch (err: any) {
      console.error('Scan failed:', err);
      alert(err.message || 'ATS Analysis failed. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleToggleBullet = (bullet: ATSBulletReview) => {
    setSelectedBulletsToApply((prev) => {
      const exists = prev.some((b) => b.id === bullet.id);
      if (exists) {
        return prev.filter((b) => b.id !== bullet.id);
      }
      return [...prev, bullet];
    });
  };

  const handleToggleSkill = (skillName: string) => {
    setSelectedSkillsToApply((prev) => {
      if (prev.includes(skillName)) {
        return prev.filter((s) => s !== skillName);
      }
      return [...prev, skillName];
    });
  };

  const handleSavedOptimizedResumeSuccess = (newResume: CandidateResumeData) => {
    setSavedSuccessToast(`Saved new version: "${newResume.title}"`);
    loadSavedResumes();
    setTimeout(() => setSavedSuccessToast(null), 6000);
  };

  const handleLoadHistoryRecord = (rec: ATSAnalysisResult) => {
    setAnalysisResult(rec);
    if (rec.rawResumeText) setResumeText(rec.rawResumeText);
    if (rec.rawJobDescription) setCustomJobRequirements(rec.rawJobDescription);
    if (rec.jobTitle) setCustomJobTitle(rec.jobTitle);
    if (rec.companyName) setCustomCompanyName(rec.companyName);
    setActiveTab('overview');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {savedSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-900 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">{savedSuccessToast}</p>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('resume-builder')}
                className="text-[11px] text-emerald-300 hover:underline flex items-center gap-1 mt-0.5 font-semibold cursor-pointer"
              >
                Open in Resume Builder <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1.5 border border-blue-100 dark:border-blue-900">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Enterprise ATS Optimization & Semantic Analyzer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ATS Resume Match & Keyword Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Evaluate your resume against specific job requisitions, discover missing high-ranking keywords, audit parseability, and create tailored versions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Scan History</span>
          </button>
        </div>
      </div>

      {/* Dual Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Target Job Criteria */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                1. Target Job Criteria
              </h3>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setJobSource('job')}
                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  jobSource === 'job'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                HireFlow Jobs
              </button>
              <button
                type="button"
                onClick={() => {
                  setJobSource('custom');
                  setSelectedJobId('custom');
                }}
                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  jobSource === 'custom'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                Custom JD
              </button>
            </div>
          </div>

          {jobSource === 'job' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Active Job Posting
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => handleSelectJob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {j.company} ({j.location})
                  </option>
                ))}
                <option value="custom">+ Paste Custom Job Specification</option>
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={customJobTitle}
                  onChange={(e) => setCustomJobTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Company Name
                </label>
                <input
                  type="text"
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Job Description & Key Requirements
              </label>
              <span className="text-[10px] text-slate-400">
                {customJobRequirements.length} characters
              </span>
            </div>
            <textarea
              rows={9}
              value={customJobRequirements}
              onChange={(e) => setCustomJobRequirements(e.target.value)}
              placeholder="Paste job description, required qualifications, and technical stack..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden font-mono text-[11px] leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Candidate Resume Source */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  2. Candidate Resume Source
                </h3>
              </div>

              {/* Source Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setResumeSource('saved')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                    resumeSource === 'saved'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Saved ({savedResumes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setResumeSource('upload')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                    resumeSource === 'upload'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setResumeSource('text')}
                  className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                    resumeSource === 'text'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Text / Markdown
                </button>
              </div>
            </div>

            {/* Saved Resumes Dropdown */}
            {resumeSource === 'saved' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select from Saved Resumes
                </label>
                {savedResumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => handleSelectSavedResume(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    {savedResumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.selectedTemplate === 'latex' ? 'Classic LaTeX' : 'Google Professional'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                    No saved resumes found. You can upload a PDF/DOCX or paste text below.
                  </div>
                )}
              </div>
            )}

            {/* File Upload Zone */}
            {resumeSource === 'upload' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40"
                >
                  {isExtractingFile ? (
                    <div className="py-3 flex flex-col items-center justify-center gap-1.5 text-blue-600 text-xs font-semibold">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Parsing document text (PDF/DOCX)...</span>
                    </div>
                  ) : (
                    <div className="py-2 flex flex-col items-center justify-center gap-1 text-slate-500 text-xs">
                      <Upload className="w-5 h-5 text-blue-500 mb-0.5" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {uploadedFileName || 'Upload PDF, DOCX, or TXT Resume'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Extracts text cleanly without losing formatting keywords (up to 8MB)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resume Content Preview Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Resume Content (Parsed for Evaluation)
                </label>
                <span className="text-[10px] text-slate-400">
                  {resumeText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={resumeSource === 'upload' ? 6 : 9}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or review resume text here..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden font-mono text-[11px] leading-relaxed"
              />
            </div>
          </div>

          {/* Run Scan Action Button */}
          <button
            type="button"
            onClick={handleRunScan}
            disabled={isScanning}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer mt-3"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{scanStep || 'Analyzing ATS Match with Gemini 3.7...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>✨ Run Deep ATS & Semantic Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Workspace */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Scorecard ({analysisResult.overallScore}/100)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Skills Matrix ({(analysisResult.matchedSkills || []).length} matched / {(analysisResult.missingSkills || []).length} missing)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bullets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'bullets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>STAR Bullet Rewriter ({(analysisResult.bulletReviews || []).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('formatting')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'formatting'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Parser & Layout Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'actions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Prioritized Action Plan ({(analysisResult.recommendations || []).length})</span>
            </button>
          </div>

          {/* Active Tab Views */}
          {activeTab === 'overview' && (
            <ATSScoreOverview
              analysis={analysisResult}
              onOpenSaveModal={() => setIsSaveModalOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />
          )}

          {activeTab === 'skills' && (
            <ATSSkillsBreakdown
              matchedSkills={analysisResult.matchedSkills || []}
              missingSkills={analysisResult.missingSkills || []}
              weakSkills={analysisResult.weakSkills || []}
              selectedSkillsToApply={selectedSkillsToApply || []}
              onToggleSkillToApply={handleToggleSkill}
            />
          )}

          {activeTab === 'bullets' && (
            <ATSBulletRewriter
              bulletReviews={analysisResult.bulletReviews || []}
              selectedBullets={selectedBulletsToApply || []}
              onToggleBullet={handleToggleBullet}
              onSelectAll={() => setSelectedBulletsToApply(analysisResult.bulletReviews || [])}
              onDeselectAll={() => setSelectedBulletsToApply([])}
            />
          )}

          {activeTab === 'formatting' && (
            <ATSFormattingAudit
              formattingChecks={analysisResult.formattingChecks}
              completenessCheck={analysisResult.completenessCheck}
              experienceGaps={analysisResult.experienceGaps || []}
              projectRelevance={analysisResult.projectRelevance || []}
            />
          )}

          {activeTab === 'actions' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-blue-600" />
                    Prioritized ATS Optimization Checklist
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Strategic, high-impact fixes ordered by their potential to raise your ATS screening rank.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Save Tailored Copy</span>
                </button>
              </div>

              <div className="space-y-3">
                {(analysisResult.recommendations || []).map((rec, idx) => {
                  const isP1 = rec.priority === 'P1';
                  const isP2 = rec.priority === 'P2';

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                        isP1
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/60'
                          : isP2
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80'
                      }`}
                    >
                      <span
                        className={`text-xs font-black px-2 py-1 rounded-lg shrink-0 ${
                          isP1
                            ? 'bg-rose-600 text-white'
                            : isP2
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {rec.priority}
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {rec.action}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong className="text-slate-700 dark:text-slate-200">Impact:</strong> {rec.impact}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Drawer Modal */}
      <ATSHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectAnalysis={handleLoadHistoryRecord}
      />

      {/* Save Optimized Resume Modal */}
      {analysisResult && (
        <SaveOptimizedModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          analysis={analysisResult}
          selectedBullets={selectedBulletsToApply}
          selectedSkills={selectedSkillsToApply}
          onSavedSuccess={handleSavedOptimizedResumeSuccess}
        />
      )}
    </div>
  );
};

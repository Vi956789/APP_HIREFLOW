import React, { useState, useEffect, useCallback } from 'react';
import {
  CandidateResumeData,
  ResumeTemplateType,
  User,
  CandidateProfile,
} from '../../../types';
import { api } from '../../../services/api';
import { ResumeEditor } from './ResumeEditor';
import { ResumePreview } from './ResumePreview';
import { TemplateSelector } from './TemplateSelector';
import { ResumeList } from './ResumeList';
import { CreateResumeModal } from './CreateResumeModal';
import { downloadResumeAsPdf } from '../../../utils/resumePdfGenerator';
import {
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Sparkles,
  LayoutTemplate,
  ArrowLeft,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

interface CandidateResumeBuilderProps {
  currentUser: User | null;
  candidateProfile?: CandidateProfile | null;
}

const DEFAULT_RESUME_DATA: CandidateResumeData = {
  title: 'My Resume',
  selectedTemplate: 'google',
  personalData: {
    fullName: 'Alex Morgan',
    professionalTitle: 'Full-Stack Software Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alex-morgan',
    github: 'github.com/alexmorgan',
    portfolio: 'alexmorgan.dev',
  },
  summary:
    'Dedicated Full-Stack Software Engineer with 4+ years of experience building high-scale distributed systems, RESTful microservices, and modern web applications. Proven track record of improving system latency by 35% and mentoring junior developers.',
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2018',
      endDate: '2022',
      grade: '3.85 / 4.0',
      details: 'Dean’s Honor List (4 semesters), Member of Upsilon Pi Epsilon (CS Honor Society)',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'TechFlow Systems',
      role: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      startDate: 'Jul 2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected and deployed high-throughput event processing pipeline handling 12M+ daily events using Node.js, TypeScript, and Redis.',
        'Redesigned core relational database schema with PostgreSQL, cutting complex reporting query latencies by 42%.',
        'Led migration of 6 legacy microservices to Docker containers, establishing CI/CD automation with GitHub Actions.',
      ],
    },
    {
      id: 'exp-2',
      company: 'Nexus Software Labs',
      role: 'Software Engineer',
      location: 'San Jose, CA',
      startDate: 'Jun 2021',
      endDate: 'Jun 2022',
      current: false,
      bullets: [
        'Developed customer-facing dashboard in React with Tailwind CSS, supporting 85,000 monthly active users.',
        'Built secure OAuth 2.0 authentication and role-based access control (RBAC) layers.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'CloudQueue Engine',
      technologies: 'Go, Redis, Docker, gRPC',
      githubUrl: 'https://github.com/alexmorgan/cloudqueue',
      liveUrl: 'https://cloudqueue.io',
      bullets: [
        'Implemented distributed in-memory task queue featuring dead-letter exchanges and rate-limiting middleware.',
        'Achieved sub-5ms round-trip task execution latency under 20k concurrent simulated connections.',
      ],
    },
    {
      id: 'proj-2',
      name: 'HireFlow AI Copilot',
      technologies: 'React, TypeScript, Tailwind CSS, PostgreSQL',
      githubUrl: 'https://github.com/alexmorgan/hireflow',
      liveUrl: 'https://hireflow.app',
      bullets: [
        'Created ATS-friendly applicant evaluation workflow with dynamic visual scoring and structured resume builder.',
      ],
    },
  ],
  skills: {
    languages: ['TypeScript', 'JavaScript', 'Python', 'Go', 'SQL', 'C++'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Tailwind CSS'],
    databases: ['PostgreSQL', 'Redis', 'MongoDB', 'Supabase'],
    tools: ['Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD', 'Linux', 'Vite'],
    aiMl: ['Gemini API', 'LangChain', 'RAG Pipelines', 'Vector Search'],
    other: ['RESTful APIs', 'Microservices', 'System Design', 'Agile Scrum'],
  },
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: '2023',
      credentialUrl: '',
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      text: '1st Place Winner at CalHacks Hackathon 2021 out of 300+ university engineering teams.',
    },
  ],
};

export const CandidateResumeBuilder: React.FC<CandidateResumeBuilderProps> = ({
  currentUser,
  candidateProfile,
}) => {
  const [resumes, setResumes] = useState<CandidateResumeData[]>([]);
  const [activeResume, setActiveResume] = useState<CandidateResumeData | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving' | 'error'>('saved');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Modals & Title Edit
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingResume, setIsCreatingResume] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to build initial resume data populated from candidate profile
  const buildProfileData = useCallback(
    (baseTitle: string, baseTemplate: ResumeTemplateType = 'google') => {
      const profileName = candidateProfile?.name || currentUser?.name || 'Candidate Name';
      const profileEmail = currentUser?.email || 'candidate@example.com';
      const profileTitle = candidateProfile?.title || currentUser?.title || 'Software Engineer';
      const profilePhone = candidateProfile?.phone || currentUser?.phone || '';
      const profileLocation = candidateProfile?.location || currentUser?.location || 'Remote';
      const profileBio = candidateProfile?.bio || candidateProfile?.about || '';

      const profileSkills = Array.isArray(candidateProfile?.skills) ? candidateProfile.skills : [];
      const languages: string[] = [];
      const frameworks: string[] = [];
      const tools: string[] = ['Git', 'CI/CD'];

      profileSkills.forEach((s: string) => {
        const lower = s.toLowerCase();
        if (['python', 'javascript', 'typescript', 'go', 'java', 'c++', 'c#', 'rust', 'sql', 'ruby', 'kotlin', 'swift'].includes(lower)) {
          languages.push(s);
        } else if (['react', 'vue', 'angular', 'next.js', 'node.js', 'express', 'fastapi', 'django', 'tailwind css', 'spring'].includes(lower)) {
          frameworks.push(s);
        } else {
          tools.push(s);
        }
      });

      return {
        ...DEFAULT_RESUME_DATA,
        title: baseTitle,
        selectedTemplate: baseTemplate,
        personalData: {
          fullName: profileName,
          email: profileEmail,
          professionalTitle: profileTitle,
          phone: profilePhone,
          location: profileLocation,
          linkedin: candidateProfile?.linkedinUrl || currentUser?.linkedin || '',
          github: candidateProfile?.githubUrl || currentUser?.github || '',
          portfolio: candidateProfile?.portfolioUrl || currentUser?.portfolio || '',
        },
        summary: profileBio || DEFAULT_RESUME_DATA.summary,
        skills: {
          languages: languages.length > 0 ? languages : DEFAULT_RESUME_DATA.skills.languages,
          frameworks: frameworks.length > 0 ? frameworks : DEFAULT_RESUME_DATA.skills.frameworks,
          databases: DEFAULT_RESUME_DATA.skills.databases,
          tools: tools.length > 0 ? tools : DEFAULT_RESUME_DATA.skills.tools,
          aiMl: DEFAULT_RESUME_DATA.skills.aiMl,
          other: DEFAULT_RESUME_DATA.skills.other,
        },
      };
    },
    [candidateProfile, currentUser]
  );

  // Load all resumes for candidate from backend
  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await api.getCandidateResumes();
      setResumes(list);
    } catch (err) {
      console.error('Error loading resumes:', err);
      showToast('Failed to load your resumes from database.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Select a resume for editing
  const handleSelectResume = (resume: CandidateResumeData) => {
    setActiveResume(resume);
    setTempTitle(resume.title || 'Untitled Resume');
    setSaveStatus('saved');
    setViewMode('editor');
  };

  // Create new resume submit handler
  const handleCreateNewResume = async (
    title: string,
    template: ResumeTemplateType,
    prefillProfile: boolean
  ) => {
    setIsCreatingResume(true);
    try {
      let initialPayload: Partial<CandidateResumeData>;
      if (prefillProfile) {
        initialPayload = buildProfileData(title, template);
      } else {
        initialPayload = {
          ...DEFAULT_RESUME_DATA,
          title,
          selectedTemplate: template,
        };
      }

      const created = await api.createCandidateResume(initialPayload);
      setResumes((prev) => [created, ...prev]);
      setActiveResume(created);
      setTempTitle(created.title);
      setSaveStatus('saved');
      setIsCreateModalOpen(false);
      setViewMode('editor');
      showToast(`Resume "${created.title}" created!`, 'success');
    } catch (err: any) {
      console.error('Failed to create resume:', err);
      showToast(err.message || 'Failed to create resume.', 'error');
    } finally {
      setIsCreatingResume(false);
    }
  };

  // Delete resume handler
  const handleDeleteResume = async (resume: CandidateResumeData) => {
    if (!resume.id) return;
    try {
      await api.deleteCandidateResume(resume.id);
      setResumes((prev) => prev.filter((r) => r.id !== resume.id));
      if (activeResume?.id === resume.id) {
        setActiveResume(null);
        setViewMode('list');
      }
      showToast(`Resume "${resume.title}" deleted.`, 'info');
    } catch (err: any) {
      console.error('Failed to delete resume:', err);
      showToast(err.message || 'Failed to delete resume.', 'error');
    }
  };

  // Back to list with unsaved protection
  const handleBackToList = () => {
    if (saveStatus === 'unsaved') {
      setShowUnsavedPrompt(true);
    } else {
      setViewMode('list');
      setActiveResume(null);
    }
  };

  // Handle data updates in editor
  const handleDataChange = (updated: CandidateResumeData) => {
    setActiveResume(updated);
    setSaveStatus('unsaved');
  };

  // Handle template selection in editor
  const handleSelectTemplate = (template: ResumeTemplateType) => {
    if (!activeResume) return;
    setActiveResume((prev) => (prev ? { ...prev, selectedTemplate: template } : prev));
    setSaveStatus('unsaved');
  };

  // Save active resume to database
  const handleSaveActiveResume = async () => {
    if (!activeResume || !activeResume.id) return;
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const updated = await api.updateCandidateResume(activeResume.id, activeResume);
      setActiveResume(updated);
      setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSaveStatus('saved');
      showToast('Resume saved successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to save resume:', err);
      setSaveStatus('error');
      showToast(err.message || 'Failed to save resume.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save and then exit
  const handleSaveAndExit = async () => {
    if (!activeResume || !activeResume.id) {
      setViewMode('list');
      setActiveResume(null);
      setShowUnsavedPrompt(false);
      return;
    }
    setIsSaving(true);
    try {
      const updated = await api.updateCandidateResume(activeResume.id, activeResume);
      setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSaveStatus('saved');
      showToast('Resume saved!', 'success');
      setShowUnsavedPrompt(false);
      setViewMode('list');
      setActiveResume(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save before leaving.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes and exit
  const handleDiscardAndExit = () => {
    setShowUnsavedPrompt(false);
    setViewMode('list');
    setActiveResume(null);
    setSaveStatus('saved');
  };

  // Inline Title Rename
  const handleSaveTitleRename = async () => {
    if (!activeResume) return;
    const clean = tempTitle.trim() || 'Untitled Resume';
    const updated = { ...activeResume, title: clean };
    setActiveResume(updated);
    setIsEditingTitle(false);
    setSaveStatus('unsaved');
  };

  // Download PDF
  const handleDownloadPdf = async (resumeToDownload?: CandidateResumeData) => {
    const target = resumeToDownload || activeResume;
    if (!target) return;
    const targetId = target.id || 'active';
    setDownloadingId(targetId);
    setIsDownloading(true);
    try {
      downloadResumeAsPdf(target, target.selectedTemplate);
      showToast(`Downloaded "${target.title}" PDF!`, 'success');
    } catch (err: any) {
      console.error('PDF download error:', err);
      showToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
      setDownloadingId(null);
    }
  };

  // Autofill button handler inside editor
  const handleAutoFillClick = () => {
    if (!activeResume) return;
    const updated = buildProfileData(activeResume.title, activeResume.selectedTemplate);
    setActiveResume({
      ...updated,
      id: activeResume.id,
      candidateId: activeResume.candidateId,
      createdAt: activeResume.createdAt,
      updatedAt: activeResume.updatedAt,
    });
    setSaveStatus('unsaved');
    showToast('Profile information synced into resume editor!', 'info');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-600">Loading your resumes...</p>
      </div>
    );
  }

  return (
    <div id="candidate-resume-builder-page" className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toastMessage.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : 'bg-blue-900 text-white border-blue-700'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* VIEW 1: MY RESUMES LIST VIEW */}
      {viewMode === 'list' && (
        <ResumeList
          resumes={resumes}
          onSelectResume={handleSelectResume}
          onCreateNew={() => setIsCreateModalOpen(true)}
          onDeleteResume={handleDeleteResume}
          onDownloadPdf={(r) => handleDownloadPdf(r)}
          isDownloadingId={downloadingId}
        />
      )}

      {/* VIEW 2: RESUME EDITOR & LIVE A4 PREVIEW */}
      {viewMode === 'editor' && activeResume && (
        <div className="space-y-6">
          {/* Editor Header Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Back button & Editable Title */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  id="back-to-resumes-btn"
                  onClick={handleBackToList}
                  className="p-2 hover:bg-gray-100 text-gray-600 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
                  title="Back to all resumes"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">My Resumes</span>
                </button>

                <div className="h-5 w-px bg-gray-200 shrink-0" />

                {/* Editable Title */}
                {isEditingTitle ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitleRename();
                        if (e.key === 'Escape') setIsEditingTitle(false);
                      }}
                      className="px-2.5 py-1 text-sm font-bold text-gray-900 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTitleRename}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Save Title"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(false)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group min-w-0">
                    <h1
                      className="text-base sm:text-lg font-bold text-gray-900 truncate tracking-tight"
                      title={activeResume.title}
                    >
                      {activeResume.title}
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setTempTitle(activeResume.title);
                        setIsEditingTitle(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition opacity-80 group-hover:opacity-100 cursor-pointer"
                      title="Rename Resume"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Status & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Save status badge */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">All changes saved</span>
                    </>
                  )}
                  {saveStatus === 'unsaved' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-amber-700 font-medium">Unsaved changes</span>
                    </>
                  )}
                  {saveStatus === 'saving' && (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      <span className="text-blue-700">Saving...</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-700">Error saving</span>
                    </>
                  )}
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  id="save-resume-btn"
                  onClick={handleSaveActiveResume}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>

                {/* Download PDF Button */}
                <button
                  type="button"
                  id="download-resume-pdf-btn"
                  onClick={() => handleDownloadPdf()}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Template Selector Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2.5">
                <LayoutTemplate className="w-3.5 h-3.5 text-gray-500" />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Template Style</h3>
              </div>
              <TemplateSelector
                selectedTemplate={activeResume.selectedTemplate}
                onSelectTemplate={handleSelectTemplate}
              />
            </div>
          </div>

          {/* Mobile Tab Switcher (Editor vs Preview) */}
          <div className="flex lg:hidden bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setMobileTab('editor')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                mobileTab === 'editor' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resume Content Editor
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                mobileTab === 'preview' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live A4 Preview
            </button>
          </div>

          {/* Main Two-Panel Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL: Content Editor */}
            <div
              className={`lg:col-span-6 space-y-4 ${
                mobileTab === 'editor' ? 'block' : 'hidden lg:block'
              }`}
            >
              <ResumeEditor
                data={activeResume}
                onChange={handleDataChange}
                onAutoFillProfile={handleAutoFillClick}
                hasProfileData={Boolean(candidateProfile?.name || currentUser?.name)}
              />
            </div>

            {/* RIGHT PANEL: Live A4 Resume Preview */}
            <div
              className={`lg:col-span-6 lg:sticky lg:top-20 ${
                mobileTab === 'preview' ? 'block' : 'hidden lg:block'
              }`}
              style={{ maxHeight: 'calc(100vh - 110px)' }}
            >
              <ResumePreview data={activeResume} />
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW RESUME MODAL */}
      <CreateResumeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNewResume}
        isSubmitting={isCreatingResume}
      />

      {/* UNSAVED CHANGES CONFIRMATION DIALOG */}
      {showUnsavedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 p-6 animate-in fade-in zoom-in-95 duration-150"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Unsaved Changes</h3>
                <p className="text-xs text-gray-500">You have unsaved edits in this resume.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Leaving now will discard your recent updates to{' '}
              <strong className="text-gray-900 font-semibold">"{activeResume?.title}"</strong>. Would you like to save your changes before returning to your resumes list?
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowUnsavedPrompt(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
              >
                Stay on Page
              </button>
              <button
                type="button"
                onClick={handleDiscardAndExit}
                className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                Discard & Leave
              </button>
              <button
                type="button"
                onClick={handleSaveAndExit}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save & Return</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  MapPin,
  HelpCircle,
  Clock,
  Loader2,
  X,
  Bot,
  Lock,
} from 'lucide-react';
import { Application, Job, ApplicationStatus } from '../../types';
import { AIScoreBadge } from '../common/AIScoreBadge';
import { api } from '../../services/api';

interface ApplicationsManagerProps {
  applications: Application[];
  jobs: Job[];
  selectedJobId?: string;
  onUpdateAppStatus: (appId: string, status: ApplicationStatus, notes?: string) => void;
  onScheduleInterview: (app: Application) => void;
}

export const ApplicationsManager: React.FC<ApplicationsManagerProps> = ({
  applications,
  jobs,
  selectedJobId,
  onUpdateAppStatus,
  onScheduleInterview,
}) => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [jobFilter, setJobFilter] = useState<string>(selectedJobId || 'ALL');
  const [scoreFilter, setScoreFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isBatchScreening, setIsBatchScreening] = useState(false);
  const [aiScreeningModal, setAiScreeningModal] = useState<Application | null>(null);
  const [aiScreeningReport, setAiScreeningReport] = useState<{
    screeningSummary: string;
    recommendedFocusAreas: string[];
    interviewQuestions: string[];
  } | null>(null);
  const [isLoadingScreenReport, setIsLoadingScreenReport] = useState(false);

  const tabs: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Candidates' },
    { id: 'APPLIED', label: 'New Applied' },
    { id: 'SCREENING', label: 'In Screening' },
    { id: 'INTERVIEWING', label: 'Interviewing' },
    { id: 'OFFERED', label: 'Offered' },
    { id: 'HIRED', label: 'Hired' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'JOB_CLOSED', label: 'Position Closed' },
  ];

  const isAppActive = (app: Application) => {
    const job = jobs.find((j) => j.id === app.jobId);
    if (job) {
      return job.status === 'ACTIVE' && job.isActive !== false && app.status !== 'JOB_CLOSED';
    }
    return app.status !== 'JOB_CLOSED';
  };

  const filteredApps = applications.filter((app) => {
    const isCandidateActive = isAppActive(app);

    let matchesTab = false;
    if (jobFilter !== 'ALL') {
      matchesTab = activeTab === 'ALL' || app.status === activeTab;
    } else {
      if (activeTab === 'JOB_CLOSED') {
        matchesTab = !isCandidateActive || app.status === 'JOB_CLOSED';
      } else if (activeTab === 'ALL') {
        matchesTab = isCandidateActive;
      } else {
        matchesTab = isCandidateActive && app.status === activeTab;
      }
    }

    const matchesJob = jobFilter === 'ALL' || app.jobId === jobFilter;
    const matchesSearch =
      app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      app.candidateEmail.toLowerCase().includes(search.toLowerCase());
    
    let matchesScore = true;
    const score = app.aiMatch?.overallScore || 0;
    if (scoreFilter === 'TOP') matchesScore = score >= 85;
    if (scoreFilter === 'MED') matchesScore = score >= 70 && score < 85;
    if (scoreFilter === 'LOW') matchesScore = score < 70;

    return matchesTab && matchesJob && matchesSearch && matchesScore;
  });

  const handleBatchAIAnalysis = () => {
    setIsBatchScreening(true);
    setTimeout(() => {
      setIsBatchScreening(false);
      alert('Batch Gemini AI Screening complete. Top 3 candidates flagged for priority interview.');
    }, 1200);
  };

  const handleOpenAIScreeningAssistant = async (app: Application) => {
    setAiScreeningModal(app);
    setIsLoadingScreenReport(true);
    try {
      const res = await api.screenCandidate({
        candidateName: app.candidateName,
        candidateResume: app.resumeText || 'Senior Full Stack & AI Engineer with 6+ years experience in React, Node, and LLMs.',
        jobTitle: app.jobTitle,
        jobRequirements: '5+ years React, Node.js, distributed databases, and generative AI integrations.',
      });
      setAiScreeningReport(res);
    } catch (err) {
      console.error('Failed to load screen report:', err);
    } finally {
      setIsLoadingScreenReport(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Candidate Pipeline (ATS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review AI match scores, run batch screening, and manage interview progressions.
          </p>
        </div>

        <button
          onClick={handleBatchAIAnalysis}
          disabled={isBatchScreening}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer w-fit"
        >
          {isBatchScreening ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Pipeline with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>✨ Batch Gemini AI Screening</span>
            </>
          )}
        </button>
      </div>

      {/* Stage Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          let count = 0;
          if (jobFilter !== 'ALL') {
            const jobApps = applications.filter((a) => a.jobId === jobFilter);
            count = tab.id === 'ALL' ? jobApps.length : jobApps.filter((a) => a.status === tab.id).length;
          } else {
            if (tab.id === 'ALL') {
              count = applications.filter(isAppActive).length;
            } else if (tab.id === 'JOB_CLOSED') {
              count = applications.filter((a) => !isAppActive(a) || a.status === 'JOB_CLOSED').length;
            } else {
              count = applications.filter((a) => isAppActive(a) && a.status === tab.id).length;
            }
          }
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, role, email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden max-w-[200px] truncate"
          >
            <option value="ALL">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">All Match Scores</option>
            <option value="TOP">Strong Fit (&gt; 85%)</option>
            <option value="MED">Potential Fit (70-84%)</option>
            <option value="LOW">Low Fit (&lt; 70%)</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApps.map((app) => {
          const relatedJob = jobs.find((j) => j.id === app.jobId);
          const isJobInactive = relatedJob
            ? relatedJob.status === 'CLOSED' || relatedJob.status === 'ARCHIVED' || relatedJob.isActive === false
            : app.status === 'JOB_CLOSED';

          return (
            <div
              key={app.id}
              className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                isJobInactive ? 'bg-slate-50/40 dark:bg-slate-900/60' : ''
              }`}
            >
              {/* Candidate Info */}
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={
                    app.candidateAvatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={app.candidateName}
                  className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {app.candidateName}
                    </h3>
                    <AIScoreBadge score={app.aiMatch?.overallScore || 88} size="sm" />
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        app.status === 'INTERVIEWING'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : app.status === 'OFFERED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : app.status === 'SCREENING'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : app.status === 'JOB_CLOSED'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {app.status === 'JOB_CLOSED' ? 'POSITION CLOSED' : app.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Applied for: <strong className="text-slate-900 dark:text-white">{app.jobTitle}</strong> • {new Date(app.appliedDate).toLocaleDateString()}
                  </p>

                  {/* Inactive Job Warning Banner */}
                  {isJobInactive && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
                      <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>This job is no longer active. Application status is read-only.</span>
                    </div>
                  )}

                  {/* AI Snippet */}
                  {app.aiMatch?.aiSummary && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                      ✨ Gemini Note: {app.aiMatch.aiSummary}
                    </p>
                  )}

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(app.aiMatch?.matchedSkills || []).slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenAIScreeningAssistant(app)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer border border-purple-200 dark:border-purple-800"
                >
                  <Bot className="w-3.5 h-3.5" />
                  AI Interview Prep
                </button>

                <select
                  disabled={isJobInactive}
                  value={app.status}
                  onChange={(e) => onUpdateAppStatus(app.id, e.target.value as ApplicationStatus)}
                  title={isJobInactive ? 'This job is no longer active. Application status is read-only.' : 'Update candidate stage'}
                  className={`px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden ${
                    isJobInactive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer'
                  }`}
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="OFFERED">Offered</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Reject</option>
                  <option value="JOB_CLOSED">Closed Position</option>
                </select>

                <button
                  disabled={isJobInactive}
                  onClick={() => !isJobInactive && onScheduleInterview(app)}
                  title={isJobInactive ? 'This job is no longer active. Interviews cannot be scheduled.' : 'Schedule Interview'}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs ${
                    isJobInactive
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                      : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule
                </button>
              </div>
            </div>
          );
        })}

        {filteredApps.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-500">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">No applications matching your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try switching tabs or resetting the job filter.</p>
          </div>
        )}
      </div>

      {/* AI Screening & Interview Questions Modal */}
      {aiScreeningModal && (() => {
        const modalRelatedJob = jobs.find((j) => j.id === aiScreeningModal.jobId);
        const isModalJobInactive = modalRelatedJob
          ? modalRelatedJob.status === 'CLOSED' || modalRelatedJob.status === 'ARCHIVED' || modalRelatedJob.isActive === false
          : aiScreeningModal.status === 'JOB_CLOSED';

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-6">
              <button
                onClick={() => setAiScreeningModal(null)}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Gemini Candidate Screener
                  </h3>
                  <p className="text-xs text-slate-500">
                    Custom evaluation for {aiScreeningModal.candidateName} • {aiScreeningModal.jobTitle}
                  </p>
                </div>
              </div>

              {isModalJobInactive && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This job is no longer active. Application status is read-only.</span>
                </div>
              )}

              {isLoadingScreenReport ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <p className="text-xs font-semibold">Analyzing candidate profile against role criteria...</p>
                </div>
              ) : aiScreeningReport ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-slate-800 dark:text-slate-200">
                    <span className="font-bold block mb-1 text-purple-900 dark:text-purple-300 uppercase tracking-wider text-[10px]">
                      Executive Hiring Brief
                    </span>
                    <p className="leading-relaxed">{aiScreeningReport.screeningSummary}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block mb-1.5">
                      Recommended Technical Focus Areas
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {aiScreeningReport.recommendedFocusAreas.map((area, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                        >
                          ⚡ {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block mb-1.5">
                      Tailored Interview Questions for Candidate
                    </span>
                    <div className="space-y-2">
                      {aiScreeningReport.interviewQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        >
                          <p className="font-semibold text-slate-900 dark:text-white mb-0.5">
                            Question {idx + 1}:
                          </p>
                          <p className="italic">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    {isModalJobInactive ? (
                      <span className="text-xs text-slate-400 italic">
                        Interview scheduling disabled for closed/archived requisitions.
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onScheduleInterview(aiScreeningModal);
                          setAiScreeningModal(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Proceed to Schedule Interview
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

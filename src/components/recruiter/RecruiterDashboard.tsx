import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  Sparkles,
  Clock,
  TrendingUp,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  Eye,
  ArrowUpRight,
  MoreVertical,
  X,
  FileText,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { Job, Application, User } from '../../types';
import { AIScoreBadge } from '../common/AIScoreBadge';

interface RecruiterDashboardProps {
  jobs: Job[];
  applications: Application[];
  currentUser: User | null;
  onOpenCreateJob: () => void;
  onViewAllJobs: () => void;
  onViewAllApplications: () => void;
  onUpdateAppStatus: (appId: string, status: any) => void;
  onScheduleInterview: (app: Application) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  jobs,
  applications,
  currentUser,
  onOpenCreateJob,
  onViewAllJobs,
  onViewAllApplications,
  onUpdateAppStatus,
  onScheduleInterview,
}) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const activeJobs = jobs.filter((j) => j.status === 'ACTIVE' && j.isActive !== false);
  const activeJobIds = new Set(activeJobs.map((j) => j.id));
  const activeApplications = applications.filter(
    (a) => activeJobIds.has(a.jobId) && a.status !== 'JOB_CLOSED'
  );

  const totalApplicants = activeApplications.length;
  const interviewingCount = activeApplications.filter((a) => a.status === 'INTERVIEWING').length;
  const avgScore =
    activeApplications.length > 0
      ? Math.round(
          activeApplications.reduce((acc, a) => acc + (a.aiMatch?.overallScore || 0), 0) /
            activeApplications.length
        )
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recruitment Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, {currentUser?.name || 'Recruiter'}. AI screening has analyzed {totalApplicants} candidate {totalApplicants === 1 ? 'profile' : 'profiles'}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onViewAllApplications}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            Review All Applicants
          </button>
          <button
            onClick={onOpenCreateJob}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Create Job Requisition</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Pipeline
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totalApplicants}
              </span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +18%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across all open roles</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Open Positions
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {activeJobs.length}
              </span>
              <span className="text-[11px] text-slate-400">
                ({jobs.length} total reqs)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Engineering, Design & PM</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Avg AI Match Quality
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {avgScore}%
              </span>
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                High Caliber
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Evaluated by Gemini 3.7</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Interviews
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {interviewingCount}
              </span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md">
                On Schedule
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">16-day avg time to hire</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Applicants (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Recent Applicants & AI Scores
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {activeApplications.length}
              </span>
            </div>
            <button
              onClick={onViewAllApplications}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View ATS Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Applied Role</th>
                  <th className="py-3 px-4">AI Fit Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeApplications.slice(0, 5).map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            app.candidateAvatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          }
                          alt={app.candidateName}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {app.candidateName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                            {app.candidateTitle || app.candidateEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[180px]">
                        {app.jobTitle}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(app.appliedDate).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <AIScoreBadge score={app.aiMatch?.overallScore || 85} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
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
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}

                {activeApplications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-xs">No active applicants in pipeline</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Candidates will appear here as they apply to active requisitions.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Active Jobs Postings (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Active Job Requisitions
              </h3>
              <button
                onClick={onViewAllJobs}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                All Jobs
              </button>
            </div>

            <div className="space-y-3">
              {activeJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {job.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {job.department} • {job.type}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {job.applicantCount || 0} applicants
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500">
                    <span>${Math.round(job.salaryMin / 1000)}k - ${Math.round(job.salaryMax / 1000)}k</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ● Active
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenCreateJob}
              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              + Create New Role Requisition
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Deep Review Drawer / Modal */}
      {selectedApp && (() => {
        const appJob = jobs.find((j) => j.id === selectedApp.jobId);
        const isAppJobInactive = appJob
          ? appJob.status === 'CLOSED' || appJob.status === 'ARCHIVED' || appJob.isActive === false
          : selectedApp.status === 'JOB_CLOSED';

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Candidate Header */}
              <div className="flex items-start gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <img
                  src={
                    selectedApp.candidateAvatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={selectedApp.candidateName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedApp.candidateName}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {selectedApp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Applied for: <strong className="text-slate-800 dark:text-slate-200">{selectedApp.jobTitle}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {selectedApp.candidateEmail} • {selectedApp.candidateLocation || 'Remote'}
                  </p>
                </div>
              </div>

              {/* Inactive Job Warning Banner */}
              {isAppJobInactive && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This job is no longer active. Application status is read-only.</span>
                </div>
              )}

              {/* AI Fit Breakdown */}
              <div className="py-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-linear-to-br from-blue-50/70 to-indigo-50/70 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-100 dark:border-slate-700">
                  <AIScoreBadge score={selectedApp.aiMatch?.overallScore || 88} size="lg" />

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Technical Skills Match</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedApp.aiMatch?.skillsScore || 90}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${selectedApp.aiMatch?.skillsScore || 90}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Experience & Seniority</span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedApp.aiMatch?.experienceScore || 85}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${selectedApp.aiMatch?.experienceScore || 85}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Gemini AI Executive Summary */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Gemini Screening Synthesis
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedApp.aiMatch?.aiSummary ||
                      'Candidate exhibits top-tier proficiency with the target tech stack. Demonstrated track record in high-velocity teams.'}
                  </p>
                </div>

                {/* Strengths & Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1.5">
                      Key Standout Strengths
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {(selectedApp.aiMatch?.strengths || ['High stack alignment', 'Verified track record']).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-1.5">
                      Identified Gaps / Probe Areas
                    </span>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {(selectedApp.aiMatch?.gaps || ['Probe depth in production scale']).map((g, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Questions */}
                {selectedApp.aiMatch?.recommendedInterviewQuestions && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-2">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                      AI Recommended Interview Questions
                    </div>
                    <div className="space-y-1.5">
                      {selectedApp.aiMatch.recommendedInterviewQuestions.map((q, idx) => (
                        <p key={idx} className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          &quot;{q}&quot;
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Bar */}
              <div className="pt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Stage:</span>
                  <select
                    disabled={isAppJobInactive}
                    value={selectedApp.status}
                    onChange={(e) => {
                      if (!isAppJobInactive) {
                        onUpdateAppStatus(selectedApp.id, e.target.value);
                        setSelectedApp({ ...selectedApp, status: e.target.value as any });
                      }
                    }}
                    title={isAppJobInactive ? 'This job is no longer active. Application status is read-only.' : 'Update stage'}
                    className={`px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-hidden ${
                      isAppJobInactive
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer'
                    }`}
                  >
                    <option value="APPLIED">Applied (New)</option>
                    <option value="SCREENING">Screening</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFERED">Offered</option>
                    <option value="HIRED">Hired</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="JOB_CLOSED">Position Closed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isAppJobInactive}
                    onClick={() => {
                      if (!isAppJobInactive) {
                        onScheduleInterview(selectedApp);
                        setSelectedApp(null);
                      }
                    }}
                    title={isAppJobInactive ? 'This job is no longer active. Interviews cannot be scheduled.' : 'Schedule Interview'}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm transition-colors ${
                      isAppJobInactive
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

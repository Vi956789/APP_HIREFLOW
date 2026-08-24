import React from 'react';
import {
  Sparkles,
  Briefcase,
  Compass,
  FileSearch,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Building2,
  MapPin,
  Clock,
  Send,
  Video,
} from 'lucide-react';
import { Job, Application, User, CandidateProfile as CandidateProfileType } from '../../types';
import { AIScoreBadge } from '../common/AIScoreBadge';

interface CandidateDashboardProps {
  currentUser: User | null;
  candidateProfile: CandidateProfileType | null;
  jobs: Job[];
  applications: Application[];
  onNavigateTab: (tab: string) => void;
  onSelectJobForDetail: (job: Job) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  currentUser,
  candidateProfile,
  jobs,
  applications,
  onNavigateTab,
  onSelectJobForDetail,
}) => {
  const activeApplications = applications.filter((a) => a.candidateId === currentUser?.id);
  const interviewList = activeApplications.filter((a) => a.status === 'INTERVIEWING');
  const recommendedJobs = jobs.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI Resume Powered Job Search
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name || 'Candidate'}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            {activeApplications.length > 0
              ? `You have ${activeApplications.length} active application${activeApplications.length === 1 ? '' : 's'} and ${interviewList.length} scheduled interview round${interviewList.length === 1 ? '' : 's'}.`
              : 'Scan your resume against live ATS requirements and discover tailored opportunities.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => onNavigateTab('resume-match')}
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileSearch className="w-4 h-4" />
            <span>Scan Resume ATS Fit</span>
          </button>
          <button
            onClick={() => onNavigateTab('discover')}
            className="px-4 py-2.5 rounded-xl bg-blue-500/40 hover:bg-blue-500/60 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Roles</span>
          </button>
        </div>

        {/* Decorative blur circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Submitted Applications
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {activeApplications.length}
              </span>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded-md">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Real-time status updates</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Upcoming Interviews
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {interviewList.length}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md">
                Confirmed
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Next: Technical Panel</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Avg Profile Match
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                92%
              </span>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded-md">
                Top 5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Gemini ATS calibrated</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Roles + Applications Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Match Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Curated Job Matches For You
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Top Alignment
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('discover')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recommendedJobs.map((job, idx) => {
              const simulatedScores = [96, 92, 88];
              const score = simulatedScores[idx] || 90;

              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                          {job.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {job.company}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span>{job.type}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ${Math.round(job.salaryMin / 1000)}k - ${Math.round(job.salaryMax / 1000)}k
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills.slice(0, 4).map((skill, sIdx) => {
                          const skillLabel = typeof skill === 'string' ? skill : (skill as any)?.name || 'Skill';
                          return (
                            <span
                              key={`${skillLabel}-${sIdx}`}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {skillLabel}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <AIScoreBadge score={score} size="sm" />
                    <button
                      onClick={() => onSelectJobForDetail(job)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      View & Apply
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Active Interviews & Applications Status */}
        <div className="space-y-6">
          {/* Upcoming Interview Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Next Interview
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                In 2 Days
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="font-bold text-xs text-slate-900 dark:text-white">
                Technical Architecture & Concurrency Round
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nexus AI Technologies • Senior Full Stack Role
              </p>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold pt-1">
                <Video className="w-3.5 h-3.5" />
                <span>Google Meet link attached</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('applications')}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              View Interview Schedule
            </button>
          </div>

          {/* Quick Resume ATS Scan Prompt */}
          <div className="p-5 rounded-3xl bg-linear-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-850 border border-indigo-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                Resume ATS Keyword Scanner
              </h3>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Get real-time insights into how recruiters&apos; ATS algorithms rate your resume against job specifications.
            </p>
            <button
              onClick={() => onNavigateTab('resume-match')}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileSearch className="w-3.5 h-3.5" />
              Analyze Resume ATS Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

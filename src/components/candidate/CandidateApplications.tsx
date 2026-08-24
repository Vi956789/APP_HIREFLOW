import React, { useState } from 'react';
import {
  Send,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Video,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Application, User } from '../../types';
import { AIScoreBadge } from '../common/AIScoreBadge';

interface CandidateApplicationsProps {
  applications: Application[];
  currentUser: User | null;
  onExploreJobs: () => void;
}

export const CandidateApplications: React.FC<CandidateApplicationsProps> = ({
  applications = [],
  currentUser,
  onExploreJobs,
}) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const userApps = (Array.isArray(applications) ? applications : []).filter(
    (a) => a && (a.candidateId === currentUser?.id || a.candidateEmail === currentUser?.email)
  );

  const stages = [
    { key: 'APPLIED', label: 'Application Sent' },
    { key: 'SCREENING', label: 'AI & Recruiter Screening' },
    { key: 'INTERVIEWING', label: 'Interview Scheduled' },
    { key: 'OFFERED', label: 'Offer Extended' },
    { key: 'HIRED', label: 'Hired' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 0;
      case 'SCREENING':
        return 1;
      case 'INTERVIEWING':
        return 2;
      case 'OFFERED':
        return 3;
      case 'HIRED':
        return 4;
      case 'REJECTED':
      case 'JOB_CLOSED':
        return -1;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track real-time candidate progression, match diagnostics, and interview schedules.
          </p>
        </div>

        <button
          onClick={onExploreJobs}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer w-fit"
        >
          + Apply to More Roles
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {userApps.map((app) => {
          const currentIndex = getStageIndex(app.status);
          const isRejected = app.status === 'REJECTED';
          const isJobClosed = app.status === 'JOB_CLOSED';

          return (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {app.jobTitle}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{app.companyName || 'Nexus AI Technologies'}</span>
                      <span>•</span>
                      <span>Applied on {new Date(app.appliedDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <AIScoreBadge score={app.aiMatch?.overallScore || 92} size="sm" />
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
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
              </div>

              {/* Multi-step progress timeline */}
              {!isRejected && !isJobClosed ? (
                <div className="pt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {stages.map((stage, idx) => {
                      const isComplete = currentIndex >= idx;
                      const isCurrent = currentIndex === idx;

                      return (
                        <div
                          key={stage.key}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                              : isComplete
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 text-[11px] mb-1">
                            {isComplete && <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>Step {idx + 1}</span>
                          </div>
                          <p className="text-xs leading-tight">{stage.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : isJobClosed ? (
                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    The hiring process for this position has closed. Your application and resume profile remain saved for future opportunities.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300">
                  Application archived. We encourage you to explore other openings tailored to your skillset.
                </div>
              )}

              {/* Interview info box if scheduled */}
              {app.interviewDetails && (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {app.interviewDetails.type} Interview Confirmed
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        {app.interviewDetails.date} at {app.interviewDetails.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-slate-700 shadow-2xs">
                      <Video className="w-3.5 h-3.5" />
                      Google Meet Active
                    </span>
                  </div>
                </div>
              )}

              {/* AI Diagnostic Summary */}
              {app.aiMatch?.aiSummary && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Gemini ATS Assessment:</strong> {app.aiMatch.aiSummary}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {userApps.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-500">
            <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">No applications submitted yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Explore job openings and apply with 1-click AI resume matching.
            </p>
            <button
              onClick={onExploreJobs}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Explore Job Postings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

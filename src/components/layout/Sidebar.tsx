import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileCheck2,
  Building2,
  Compass,
  FileSearch,
  Send,
  UserCheck,
  Sparkles,
  LogOut,
  FileText,
} from 'lucide-react';
import { UserRole } from '../../types';

export type RecruiterTab = 'dashboard' | 'jobs' | 'applications' | 'screening' | 'company';
export type CandidateTab = 'dashboard' | 'discover' | 'resume-match' | 'resume-builder' | 'applications' | 'profile';

interface SidebarProps {
  userRole: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  openJobModal?: () => void;
  applicantCount?: number;
  activeJobsCount?: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  currentTab,
  onSelectTab,
  openJobModal,
  applicantCount = 0,
  activeJobsCount = 0,
  onLogout,
}) => {
  const recruiterLinks = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'jobs',
      label: 'Job Postings',
      icon: Briefcase,
      badge: `${activeJobsCount}`,
    },
    {
      id: 'applications',
      label: 'Candidates (ATS)',
      icon: Users,
      badge: `${applicantCount}`,
    },
    {
      id: 'screening',
      label: 'AI Match Insights',
      icon: FileCheck2,
      badge: 'AI',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    },
    {
      id: 'company',
      label: 'Company Profile',
      icon: Building2,
      badge: undefined,
    },
  ];

  const candidateLinks = [
    {
      id: 'dashboard',
      label: 'My Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'discover',
      label: 'Discover Jobs',
      icon: Compass,
      badge: `${activeJobsCount || 'All'}`,
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      id: 'resume-match',
      label: 'Resume Match AI',
      icon: FileSearch,
      badge: 'Gemini',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    },
    {
      id: 'resume-builder',
      label: 'Resume Builder',
      icon: FileText,
      badge: 'New',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      id: 'applications',
      label: 'My Applications',
      icon: Send,
      badge: `${applicantCount}`,
    },
    {
      id: 'profile',
      label: 'Profile & Resume',
      icon: UserCheck,
      badge: undefined,
    },
  ];

  const links = userRole === 'RECRUITER' ? recruiterLinks : candidateLinks;

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Workspace Title */}
        <div className="px-3 pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {userRole === 'RECRUITER' ? 'Recruiter Suite' : 'Candidate Suite'}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;

            return (
              <button
                key={link.id}
                id={`sidebar-tab-${link.id}`}
                onClick={() => onSelectTab(link.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>

                {link.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : link.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Recruiter Quick Action */}
        {userRole === 'RECRUITER' && openJobModal && (
          <div className="pt-2">
            <button
              id="sidebar-create-job-button"
              onClick={openJobModal}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400 dark:text-white" />
              + Create Requisition
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="space-y-3">
        {/* Bottom Pro Card */}
        <div className="rounded-2xl p-3.5 bg-linear-to-br from-blue-50 to-indigo-50/80 dark:from-slate-800/60 dark:to-slate-850 border border-blue-100/80 dark:border-slate-700/80">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Gemini 3.7 Screener
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {userRole === 'RECRUITER'
              ? 'Candidate match rankings automatically calibrate to your job requisitions.'
              : 'Resume keyword optimizer automatically aligns with hiring benchmarks.'}
          </p>
        </div>

        {/* Sidebar Sign Out Action */}
        {onLogout && (
          <button
            id="sidebar-sign-out-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
};

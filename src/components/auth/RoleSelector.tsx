import React from 'react';
import { Sparkles, Briefcase, Users, ArrowRight, ShieldCheck, Zap, CheckCircle2, UserCheck, Bot, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../../types';

interface RoleSelectorProps {
  onOpenLogin: (role?: UserRole) => void;
  onOpenRegister: (role?: UserRole) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  onOpenLogin,
  onOpenRegister,
  darkMode = false,
  onToggleDarkMode,
}) => {
  return (
    <div id="role-selector-landing" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Brand */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              HireFlow<span className="text-blue-600">.ai</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Gemini 3.7 Intelligent ATS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onToggleDarkMode && (
            <button
              id="landing-theme-toggle-btn"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs transition-colors cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            </button>
          )}
          <button
            id="header-sign-in-btn"
            onClick={() => onOpenLogin('CANDIDATE')}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs cursor-pointer transition-colors"
          >
            Sign In
          </button>
          <button
            id="header-get-started-btn"
            onClick={() => onOpenRegister('CANDIDATE')}
            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-all"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Recruitment Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How will you use HireFlow?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Choose your portal to experience AI candidate screening, deep resume matching, and intelligent requisition workflows.
          </p>
        </div>

        {/* Dual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Candidate */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-all"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <Briefcase className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    I am a Candidate
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Job Seeker
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Discover high-impact roles, analyze resume ATS match scores, and apply with AI.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interactive <strong>Resume Match AI</strong> with score breakdown</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Personalized <strong>Gemini Cover Letter</strong> generator</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time application status and interview calendar</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2.5">
              <button
                id="enter-candidate-btn"
                onClick={() => onOpenLogin('CANDIDATE')}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Enter Candidate Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
                <button
                  onClick={() => onOpenLogin('CANDIDATE')}
                  className="hover:text-blue-600 font-semibold cursor-pointer"
                >
                  Sign In
                </button>
                <span>•</span>
                <button
                  onClick={() => onOpenRegister('CANDIDATE')}
                  className="hover:text-blue-600 font-semibold cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Recruiter */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-all"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                <Users className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    I am a Recruiter
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Talent Lead / HR
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Automate candidate screening, generate job requisitions with AI, and manage ATS pipeline.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Automated <strong>AI Candidate Screening</strong> & fit scores</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>1-Click <strong>Job Description Generator</strong> with requirements</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Structured interview questions tailored to each applicant</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2.5">
              <button
                id="enter-recruiter-btn"
                onClick={() => onOpenLogin('RECRUITER')}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Enter Recruiter Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
                <button
                  onClick={() => onOpenLogin('RECRUITER')}
                  className="hover:text-blue-600 font-semibold cursor-pointer"
                >
                  Sign In
                </button>
                <span>•</span>
                <button
                  onClick={() => onOpenRegister('RECRUITER')}
                  className="hover:text-blue-600 font-semibold cursor-pointer"
                >
                  Create Recruiter Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Features Bar */}
      <footer className="max-w-5xl mx-auto w-full pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Gemini 3.7 Pro</span>
            </div>
            <p className="text-[11px] text-slate-500">Deep semantic candidate scoring</p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-time ATS Sync</span>
            </div>
            <p className="text-[11px] text-slate-500">Instant application status workflows</p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Role-Based Security</span>
            </div>
            <p className="text-[11px] text-slate-500">Secure HTTP-only session tokens</p>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-500" />
              <span>AI Copilot Engine</span>
            </div>
            <p className="text-[11px] text-slate-500">Interactive recruiter & career assistant</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Award,
  Layers,
  Zap,
  Info,
  BookmarkPlus,
  History,
  Copy,
  Check,
} from 'lucide-react';
import { ATSAnalysisResult, ATSScoreVerdict } from '../../../types';

interface ATSScoreOverviewProps {
  analysis: ATSAnalysisResult;
  onOpenSaveModal: () => void;
  onOpenHistory: () => void;
  isSavingOptimized?: boolean;
}

export const ATSScoreOverview: React.FC<ATSScoreOverviewProps> = ({
  analysis,
  onOpenSaveModal,
  onOpenHistory,
}) => {
  const [copied, setCopied] = React.useState(false);
  const { overallScore, verdict, categoryScores, aiSummary, jobTitle, companyName } = analysis;

  const getVerdictStyle = (v: ATSScoreVerdict) => {
    switch (v) {
      case 'EXCELLENT_MATCH':
        return {
          label: 'Excellent Match (Top 5% Fit)',
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
          dot: 'bg-emerald-500',
          desc: 'High keyword density, strong seniority alignment, and quantifiable impact across required technologies.',
        };
      case 'STRONG_FIT':
        return {
          label: 'Strong Fit (Interview-Ready)',
          bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
          dot: 'bg-blue-500',
          desc: 'Covers core stack requirements with minor keyword gaps easily addressed with recommended bullet tweaks.',
        };
      case 'COMPETITIVE_FIT':
        return {
          label: 'Competitive Fit',
          bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
          dot: 'bg-indigo-500',
          desc: 'Solid technical background; adding 2-3 missing domain keywords will significantly boost ATS screening ranking.',
        };
      case 'MODERATE_FIT':
        return {
          label: 'Moderate Fit (Needs Tailoring)',
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
          dot: 'bg-amber-500',
          desc: 'Relevant foundational experience present, but resume lacks specific technical terms highlighted in the JD.',
        };
      case 'NEEDS_OPTIMIZATION':
      default:
        return {
          label: 'Optimization Recommended',
          bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
          dot: 'bg-rose-500',
          desc: 'Substantial disconnect in keywords or seniority phrasing. Follow the AI action plan below to align your resume.',
        };
    }
  };

  const verdictConfig = getVerdictStyle(verdict);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 55) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 55) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const copySummary = () => {
    const text = `HireFlow ATS Score: ${overallScore}/100 (${verdict})\nRole: ${jobTitle} at ${companyName || 'Target'}\n\nSummary:\n${aiSummary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { label: 'Core Technical Skills', score: categoryScores.skills, weight: '25% weight', desc: 'Languages, frameworks, databases, and architectural depth' },
    { label: 'Experience & Seniority Fit', score: categoryScores.experience, weight: '20% weight', desc: 'Years of practice, ownership scope, and scale' },
    { label: 'Role Keywords & Synonyms', score: categoryScores.keywords, weight: '15% weight', desc: 'Exact terminology and industry variations matched' },
    { label: 'Impact & Action Verbs', score: categoryScores.impact, weight: '15% weight', desc: 'Quantified metrics (%, $, scale) & active STAR framing' },
    { label: 'ATS Format & Structure', score: categoryScores.formatting, weight: '10% weight', desc: 'Parser readability, section headers, and length' },
    { label: 'Project Alignment', score: categoryScores.projects, weight: '10% weight', desc: 'Technical stack overlap in portfolio projects' },
    { label: 'Education & Domain Credential', score: categoryScores.education, weight: '5% weight', desc: 'Degrees, certifications, and industry pedigree' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Card with Score Gauge */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${verdictConfig.bg}`}>
                <span className={`w-2 h-2 rounded-full ${verdictConfig.dot} animate-pulse`} />
                {verdictConfig.label}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Target: <strong className="text-slate-900 dark:text-white">{jobTitle}</strong> {companyName ? `at ${companyName}` : ''}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ATS Optimization Scorecard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {verdictConfig.desc}
            </p>
          </div>

          {/* Large Calibrated Score Badge */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                ATS Fit Score
              </div>
              <div className={`text-4xl sm:text-5xl font-black tracking-tight ${getScoreColor(overallScore)}`}>
                {overallScore}
                <span className="text-lg font-medium text-slate-400 dark:text-slate-500">/100</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                Weighted Evaluation
              </div>
            </div>

            <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={onOpenSaveModal}
                className="w-full px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save Tailored Copy</span>
              </button>
              <button
                type="button"
                onClick={onOpenHistory}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Scan History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Executive AI Recruiter Summary */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Executive AI Hiring Manager Verdict
            </span>
            <button
              type="button"
              onClick={copySummary}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Verdict</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
            {aiSummary}
          </p>
        </div>

        {/* 7 Breakdown Progress Bars */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Scoring Dimensions Breakdown
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Weighted multi-factor model</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cat.label}</span>
                    <span className="ml-1.5 text-[10px] text-slate-400 font-semibold">({cat.weight})</span>
                  </div>
                  <span className={`font-bold ${getScoreColor(cat.score)}`}>{cat.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getBarColor(cat.score)}`}
                    style={{ width: `${Math.min(100, Math.max(5, cat.score))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Disclaimer Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-700 dark:text-slate-300">Methodology Note:</strong> This score reflects strict keyword parsing, seniority signal density, and semantic qualification overlap against this specific job requisition. Real ATS systems vary across enterprise vendors (Workday, Greenhouse, Lever, Taleo).
          </div>
        </div>
      </div>
    </div>
  );
};

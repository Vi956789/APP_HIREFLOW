import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  Activity,
  Award,
  Layers,
  HelpCircle,
  Check,
  X,
} from 'lucide-react';
import {
  ATSFormattingCheck,
  ATSCompletenessCheck,
  ATSExperienceGap,
  ATSProjectRelevance,
} from '../../../types';

interface ATSFormattingAuditProps {
  formattingChecks: ATSFormattingCheck;
  completenessCheck: ATSCompletenessCheck;
  experienceGaps: ATSExperienceGap[];
  projectRelevance: ATSProjectRelevance[];
}

export const ATSFormattingAudit: React.FC<ATSFormattingAuditProps> = ({
  formattingChecks,
  completenessCheck,
  experienceGaps = [],
  projectRelevance = [],
}) => {
  const safeFormatting = formattingChecks || ({} as any);
  const wordCount = safeFormatting.wordCount ?? 0;
  const isLengthIdeal = safeFormatting.isLengthIdeal ?? true;
  const lengthFeedback = safeFormatting.lengthFeedback ?? '';
  const parseabilityWarnings = Array.isArray(safeFormatting.parseabilityWarnings) ? safeFormatting.parseabilityWarnings : [];
  const metricsCount = safeFormatting.metricsCount ?? 0;
  const actionVerbsCount = safeFormatting.actionVerbsCount ?? 0;

  const safeCompleteness = completenessCheck || ({} as any);
  const sectionsList = [
    { label: 'Contact Info', present: Boolean(safeCompleteness.hasContactInfo) },
    { label: 'Professional Summary', present: Boolean(safeCompleteness.hasSummary) },
    { label: 'Work Experience', present: Boolean(safeCompleteness.hasExperience) },
    { label: 'Education Credentials', present: Boolean(safeCompleteness.hasEducation) },
    { label: 'Skills Section', present: Boolean(safeCompleteness.hasSkills) },
    { label: 'Projects / Portfolio', present: Boolean(safeCompleteness.hasProjects) },
    { label: 'Certifications', present: Boolean(safeCompleteness.hasCertifications) },
  ];

  const safeExperienceGaps = Array.isArray(experienceGaps) ? experienceGaps : [];
  const safeProjectRelevance = Array.isArray(projectRelevance) ? projectRelevance : [];

  const getSeverityBadge = (sev: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (sev) {
      case 'HIGH':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">High Priority</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Medium</span>;
      case 'LOW':
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Formatting & Parser Diagnostics Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            ATS Document Architecture & Parseability Audit
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated compliance check against enterprise parser standards (standard headings, word density, and quantification).
          </p>
        </div>

        {/* Diagnostic Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Word Count Metric */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Resume Length
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {wordCount}
              </span>
              <span className="text-xs text-slate-500">words</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
              {lengthFeedback || (isLengthIdeal ? 'Optimal length for 1-2 page standard ATS scan.' : 'Check length guidelines.')}
            </p>
          </div>

          {/* Action Verb Count */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Leadership Verbs
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {actionVerbsCount}
              </span>
              <span className="text-xs text-slate-500">instances</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
              Strong verbs (Spearheaded, Architected, Engineered) increase ATS parser score.
            </p>
          </div>

          {/* Quantified Metrics Count */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Measurable Metrics
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {metricsCount}
              </span>
              <span className="text-xs text-slate-500">quantified data points</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
              Percentages, latencies, dollar amounts, and user counts found.
            </p>
          </div>
        </div>

        {/* Section Header Verification Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Recognized Section Structure
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {sectionsList.map((sec, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  sec.present
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                <span className="font-semibold">{sec.label}</span>
                {sec.present ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warnings / Parseability Notes */}
        {parseabilityWarnings.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Formatting & Layout Optimization Notes
            </span>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              {parseabilityWarnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Experience & Seniority Gap Analysis */}
      {safeExperienceGaps.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Seniority & Experience Gaps
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Areas where hiring managers or ATS algorithms might question depth of ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {safeExperienceGaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {gap.title}
                  </span>
                  {getSeverityBadge(gap.severity)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {gap.detail}
                </p>
                <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200">
                  <strong>Recommendation:</strong> {gap.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Alignment Analysis */}
      {safeProjectRelevance.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Project Portfolio Alignment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              How closely your listed projects mirror the technical challenges of the target requisition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {safeProjectRelevance.map((proj, idx) => {
              const keywords = Array.isArray(proj.keywordAlignment) ? proj.keywordAlignment : [];
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {proj.title}
                    </span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80">
                      {proj.relevanceScore}% Fit
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {proj.feedback}
                  </p>
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {keywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

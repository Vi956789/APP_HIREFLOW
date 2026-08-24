import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Plus,
  Check,
  Tag,
  Filter,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { ATSMatchedSkill, ATSMissingSkill, ATSWeakSkill } from '../../../types';

interface ATSSkillsBreakdownProps {
  matchedSkills: ATSMatchedSkill[];
  missingSkills: ATSMissingSkill[];
  weakSkills: ATSWeakSkill[];
  selectedSkillsToApply: string[];
  onToggleSkillToApply: (skillName: string) => void;
}

export const ATSSkillsBreakdown: React.FC<ATSSkillsBreakdownProps> = ({
  matchedSkills = [],
  missingSkills = [],
  weakSkills = [],
  selectedSkillsToApply = [],
  onToggleSkillToApply,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'MATCHED' | 'MISSING' | 'WEAK'>('ALL');
  const [importanceFilter, setImportanceFilter] = useState<'ALL' | 'CRITICAL' | 'IMPORTANT' | 'NICE_TO_HAVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const safeMatched = Array.isArray(matchedSkills) ? matchedSkills : [];
  const safeMissing = Array.isArray(missingSkills) ? missingSkills : [];
  const safeWeak = Array.isArray(weakSkills) ? weakSkills : [];
  const safeSelected = Array.isArray(selectedSkillsToApply) ? selectedSkillsToApply : [];

  const filteredMatched = safeMatched.filter((s) => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImportance = importanceFilter === 'ALL' || s.importance === importanceFilter;
    return matchesSearch && matchesImportance;
  });

  const filteredMissing = safeMissing.filter((s) => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImportance = importanceFilter === 'ALL' || s.importance === importanceFilter;
    return matchesSearch && matchesImportance;
  });

  const filteredWeak = safeWeak.filter((s) => {
    return (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.recommendation || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getImportanceBadge = (importance: 'CRITICAL' | 'IMPORTANT' | 'NICE_TO_HAVE') => {
    switch (importance) {
      case 'CRITICAL':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Must Have</span>;
      case 'IMPORTANT':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Core Stack</span>;
      case 'NICE_TO_HAVE':
      default:
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Bonus</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header with Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Skills & Keyword Taxonomy Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare exact technical keywords extracted from the JD against your resume content.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({safeMatched.length + safeMissing.length + safeWeak.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('MATCHED')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'MATCHED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
              }`}
            >
              Matched ({safeMatched.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('MISSING')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'MISSING'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 dark:text-rose-400 hover:text-rose-800'
              }`}
            >
              Missing ({safeMissing.length})
            </button>
            {safeWeak.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterType('WEAK')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterType === 'WEAK'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-700 dark:text-amber-400 hover:text-amber-800'
                }`}
              >
                Weak ({safeWeak.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Search & Importance Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter skills (e.g., Python, Docker, AWS, React)..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>

        <select
          value={importanceFilter}
          onChange={(e) => setImportanceFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-hidden font-medium"
        >
          <option value="ALL">All Importance Levels</option>
          <option value="CRITICAL">Must-Have Only</option>
          <option value="IMPORTANT">Core Stack Only</option>
          <option value="NICE_TO_HAVE">Bonus Only</option>
        </select>
      </div>

      {/* Grid of Skills */}
      <div className="space-y-6">
        {/* Missing Skills Section (Top Priority for ATS) */}
        {(filterType === 'ALL' || filterType === 'MISSING') && filteredMissing.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Missing ATS Keywords & Skills ({filteredMissing.length})
              </span>
              <span className="text-[11px] text-slate-400">Click &quot;+ Add to Tailored Resume&quot; to inject</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMissing.map((skill, idx) => {
                const isSelected = selectedSkillsToApply.includes(skill.name);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-1 ring-rose-400'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {skill.name}
                          </span>
                          {getImportanceBadge(skill.importance)}
                          <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60">
                            {skill.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {skill.reason}
                        </p>
                        {skill.suggestedSection && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                            <span>Recommended in:</span>
                            <strong className="text-slate-700 dark:text-slate-300">{skill.suggestedSection}</strong>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleSkillToApply(skill.name)}
                        className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Matched Skills Section */}
        {(filterType === 'ALL' || filterType === 'MATCHED') && filteredMatched.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Matched Skills & Keywords ({filteredMatched.length})
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMatched.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                        {skill.name}
                      </span>
                      {getImportanceBadge(skill.importance)}
                    </div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 dark:bg-emerald-900/60">
                      {skill.category}
                    </span>
                  </div>
                  {skill.context && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                      &quot;{skill.context}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weak / Under-Emphasized Skills */}
        {(filterType === 'ALL' || filterType === 'WEAK') && filteredWeak.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Under-Emphasized Skills ({filteredWeak.length})
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredWeak.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-1.5"
                >
                  <span className="font-bold text-sm text-amber-950 dark:text-amber-200 block">
                    {skill.name}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-800 dark:text-slate-200">Current mention:</strong> {skill.currentEvidence}
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    <strong className="text-amber-900 dark:text-amber-200">How to strengthen:</strong> {skill.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredMatched.length === 0 && filteredMissing.length === 0 && filteredWeak.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-xs">
            No skills match your current search or filter.
          </div>
        )}
      </div>
    </div>
  );
};

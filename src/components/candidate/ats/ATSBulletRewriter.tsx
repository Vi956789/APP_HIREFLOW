import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Copy,
  Plus,
  Zap,
  BookmarkCheck,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { ATSBulletReview } from '../../../types';

interface ATSBulletRewriterProps {
  bulletReviews: ATSBulletReview[];
  selectedBullets: ATSBulletReview[];
  onToggleBullet: (bullet: ATSBulletReview) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const ATSBulletRewriter: React.FC<ATSBulletRewriterProps> = ({
  bulletReviews = [],
  selectedBullets = [],
  onToggleBullet,
  onSelectAll,
  onDeselectAll,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const safeBulletReviews = Array.isArray(bulletReviews) ? bulletReviews : [];
  const safeSelectedBullets = Array.isArray(selectedBullets) ? selectedBullets : [];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isSelected = (id: string) => safeSelectedBullets.some((b) => b.id === id);
  const allSelected = safeBulletReviews.length > 0 && safeSelectedBullets.length === safeBulletReviews.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold mb-1 border border-purple-100 dark:border-purple-900">
            <Sparkles className="w-3.5 h-3.5" />
            STAR Methodology & Quantified Impact
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            High-Impact Bullet Point Rewriter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transform passive responsibilities into measurable accomplishments aligned with job keywords.
          </p>
        </div>

        {safeBulletReviews.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
            >
              {allSelected ? 'Deselect All' : `Select All (${safeBulletReviews.length})`}
            </button>
          </div>
        )}
      </div>

      {safeBulletReviews.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
          <BookmarkCheck className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Strong Bullet Formulation
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your existing resume bullets already utilize strong action verbs and quantified impact metrics.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {safeBulletReviews.map((review, idx) => {
            const checked = isSelected(review.id);
            const isCopied = copiedId === review.id;
            const keywords = Array.isArray(review.addedKeywords) ? review.addedKeywords : [];

            return (
              <div
                key={review.id || idx}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  checked
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 ring-1 ring-blue-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {review.roleOrProject || `Experience Item #${idx + 1}`}
                    </span>
                    {keywords.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        {keywords.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                          >
                            +{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(review.id, review.improvedBullet)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-all"
                      title="Copy improved bullet"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleBullet(review)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        checked
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600'
                      }`}
                    >
                      {checked ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Apply to Tailored Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Before vs After Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Original Bullet */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Original Phrasing
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px]">
                      &quot;{review.originalBullet}&quot;
                    </p>
                  </div>

                  {/* Improved STAR Bullet */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      Optimized STAR Rewrite
                    </span>
                    <p className="text-emerald-950 dark:text-emerald-200 leading-relaxed font-semibold">
                      {review.improvedBullet}
                    </p>
                  </div>
                </div>

                {/* Reason & Rationale */}
                {review.reason && (
                  <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl">
                    <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Why this works:</span>
                    <span>{review.reason}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
}

export const AIScoreBadge: React.FC<AIScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  showIcon = true,
}) => {
  const isHigh = score >= 85;
  const isMed = score >= 70 && score < 85;

  const colorClasses = isHigh
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    : isMed
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';

  const ringColor = isHigh
    ? 'stroke-emerald-500'
    : isMed
    ? 'stroke-amber-500'
    : 'stroke-rose-500';

  if (size === 'lg') {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="7"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={`${ringColor} transition-all duration-1000 ease-out`}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-0.5 font-bold text-2xl text-slate-900 dark:text-white">
            {score}
            <span className="text-xs font-semibold text-slate-400">%</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            AI Match
          </span>
        </div>
      </div>
    );
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${colorClasses} transition-all shadow-xs`}
    >
      {showIcon && <Sparkles className="w-3.5 h-3.5 text-current animate-pulse" />}
      <span className="font-bold">{score}%</span>
      {showLabel && (
        <span className="font-medium opacity-90">
          {isHigh ? 'Strong Fit' : isMed ? 'Potential Fit' : 'Low Match'}
        </span>
      )}
    </div>
  );
};

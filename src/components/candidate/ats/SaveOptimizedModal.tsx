import React, { useState } from 'react';
import {
  BookmarkPlus,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
  FileCheck,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { ATSAnalysisResult, ATSBulletReview, CandidateResumeData } from '../../../types';
import { api } from '../../../services/api';

interface SaveOptimizedModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ATSAnalysisResult;
  selectedBullets: ATSBulletReview[];
  selectedSkills: string[];
  onSavedSuccess: (newResume: CandidateResumeData) => void;
}

export const SaveOptimizedModal: React.FC<SaveOptimizedModalProps> = ({
  isOpen,
  onClose,
  analysis,
  selectedBullets,
  selectedSkills,
  onSavedSuccess,
}) => {
  const [resumeTitle, setResumeTitle] = useState(
    `${analysis.resumeName || 'My Resume'} (ATS Tailored for ${analysis.jobTitle || 'Role'})`
  );
  const [saving, setSaving] = useState(false);
  const [savedResume, setSavedResume] = useState<CandidateResumeData | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeTitle.trim()) return;

    setSaving(true);
    try {
      const response = await api.saveOptimizedResume({
        baseResumeId: analysis.resumeId,
        newTitle: resumeTitle.trim(),
        appliedBullets: selectedBullets,
        appliedSkills: selectedSkills,
        rawResumeData: analysis.parsedResumeData,
      });

      if (response.success && response.resume) {
        setSavedResume(response.resume);
        onSavedSuccess(response.resume);
      }
    } catch (err: any) {
      console.error('Failed to save optimized resume:', err);
      alert(err.message || 'Failed to create optimized resume version.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Save Tailored Resume Version
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Creates a new version in your saved resumes collection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedResume ? (
          /* Success Screen */
          <div className="p-6 space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                Tailored Resume Saved!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                &quot;{savedResume.title}&quot; is now saved in your Resume Builder collection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Applied STAR Bullet Rewrites:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBullets.length} items</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Injected ATS Keywords:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSkills.length} skills</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
              >
                Keep Analyzing
              </button>
            </div>
          </div>
        ) : (
          /* Save Form */
          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Version Name / Resume Title
              </label>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                required
                placeholder="e.g. Senior Backend Engineer (Tailored for Stripe)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            {/* Optimization Summary Badges */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Included Enhancements:
              </span>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Selected STAR Bullet Rewrites:</span>
                <span className="font-bold text-emerald-600">{selectedBullets.length} of {analysis.bulletReviews.length}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Injected Missing Skills:</span>
                <span className="font-bold text-blue-600">{selectedSkills.length} selected</span>
              </div>

              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200"
                    >
                      +{s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !resumeTitle.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Version...</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Create Tailored Resume Version</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

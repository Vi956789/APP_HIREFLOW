import React, { useState } from 'react';
import { ResumeTemplateType } from '../../../types';
import { X, FileText, Sparkles, Check, Loader2 } from 'lucide-react';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, template: ResumeTemplateType, prefillProfile: boolean) => Promise<void>;
  isSubmitting: boolean;
}

const TITLE_SUGGESTIONS = [
  'Full-Stack Software Engineer',
  'Backend Systems Engineer',
  'Frontend React Developer',
  'DevOps & Cloud Architect',
  'AI / ML Engineer',
];

export const CreateResumeModal: React.FC<CreateResumeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<ResumeTemplateType>('google');
  const [prefillProfile, setPrefillProfile] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Please provide a name or title for your resume.');
      return;
    }
    setError('');
    await onSubmit(cleanTitle, template, prefillProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-resume-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-resume-title" className="text-base font-bold text-gray-900">
                Create New Resume
              </h2>
              <p className="text-xs text-gray-500">
                Start a targeted resume tailored to a specific role or application.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Resume Name / Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Resume Name / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="new-resume-title-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Senior Full-Stack Engineer Resume"
              disabled={isSubmitting}
              autoFocus
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}

            {/* Quick Suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TITLE_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setTitle(suggestion);
                    if (error) setError('');
                  }}
                  className="text-[11px] px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Template Style Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Initial Template Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Google Professional */}
              <button
                type="button"
                onClick={() => setTemplate('google')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  template === 'google'
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-xs text-gray-900">Google Professional</div>
                  {template === 'google' && (
                    <span className="p-0.5 bg-blue-600 text-white rounded-full">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  Modern Helvetica layout with blue accent headings, bullet achievements, and ATS parsing clarity.
                </p>
              </button>

              {/* Classic LaTeX */}
              <button
                type="button"
                onClick={() => setTemplate('latex')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  template === 'latex'
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-xs text-gray-900">Classic LaTeX</div>
                  {template === 'latex' && (
                    <span className="p-0.5 bg-blue-600 text-white rounded-full">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  Traditional academic serif typography (Times) with horizontal section dividing lines.
                </p>
              </button>
            </div>
          </div>

          {/* Pre-fill from Profile Checkbox */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefillProfile}
                onChange={(e) => setPrefillProfile(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-900">
                    Pre-populate with my HireFlow Profile
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Automatically copies your candidate name, contact details, headline, and profile skills into the starting draft.
                </p>
              </div>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-create-resume-btn"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Create Resume</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

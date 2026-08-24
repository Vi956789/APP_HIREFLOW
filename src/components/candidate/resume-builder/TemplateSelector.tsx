import React from 'react';
import { ResumeTemplateType } from '../../../types';
import { CheckCircle2, Sparkles, GraduationCap } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplateType;
  onSelectTemplate: (template: ResumeTemplateType) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3">
      {/* Google Professional Card */}
      <button
        type="button"
        id="template-select-google"
        onClick={() => onSelectTemplate('google')}
        className={`flex-1 flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all relative ${
          selectedTemplate === 'google'
            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
        }`}
      >
        <div className={`p-2 rounded-lg shrink-0 ${selectedTemplate === 'google' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">Google Professional</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
              ATS Standard
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            Clean modern sans-serif typography, structured dividers, high readability for tech & corporate roles.
          </p>
        </div>
        {selectedTemplate === 'google' && (
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 absolute top-3.5 right-3.5" />
        )}
      </button>

      {/* Classic LaTeX Card */}
      <button
        type="button"
        id="template-select-latex"
        onClick={() => onSelectTemplate('latex')}
        className={`flex-1 flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all relative ${
          selectedTemplate === 'latex'
            ? 'border-gray-900 bg-gray-50 shadow-sm ring-1 ring-gray-900/20'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
        }`}
      >
        <div className={`p-2 rounded-lg shrink-0 ${selectedTemplate === 'latex' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
          <GraduationCap className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">Classic LaTeX</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-200 text-gray-800">
              SWE & Research
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            Academic serif style, centered title, continuous rules, compact single-page engineering layout.
          </p>
        </div>
        {selectedTemplate === 'latex' && (
          <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 absolute top-3.5 right-3.5" />
        )}
      </button>
    </div>
  );
};

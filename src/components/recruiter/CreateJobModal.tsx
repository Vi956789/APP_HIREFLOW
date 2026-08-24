import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Job } from '../../types';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (newJob: Job) => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<'Engineering' | 'Design' | 'Product' | 'Marketing' | 'Sales' | 'Operations'>('Engineering');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid'>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive'>('Senior');
  const [location, setLocation] = useState('San Francisco, CA (Hybrid / Remote)');
  const [salaryMin, setSalaryMin] = useState<number | string>('');
  const [salaryMax, setSalaryMax] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([
    '5+ years of demonstrable industry experience in relevant technologies',
    'Deep knowledge of distributed systems and modern API architecture',
    'Proven track record shipping high-availability user-facing products',
  ]);
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker']);
  const [newSkill, setNewSkill] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPromptHint, setAiPromptHint] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // AI JD Generator
  const handleGenerateWithAI = async () => {
    if (!aiPromptHint.trim() && !title.trim() && !description.trim()) {
      setErrorMessage('Please enter prompt guidance in the AI Copilot box (e.g., "Need a fresher Python backend developer in Noida") or enter a Role Title to draft with Gemini.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGenerating(true);

    try {
      const res = await api.generateJD({
        prompt: aiPromptHint.trim() || undefined,
        aiPromptHint: aiPromptHint.trim() || undefined,
        title: title.trim() || undefined,
        department,
        experienceLevel,
        type,
        employmentType: type,
        location: location.trim() || undefined,
        salaryMin: salaryMin !== '' ? Number(salaryMin) : null,
        salaryMax: salaryMax !== '' ? Number(salaryMax) : null,
        skills: skills.length > 0 ? skills : undefined,
        description: description.trim() || undefined,
        requirements: requirements.length > 0 ? requirements : undefined,
      });

      if (res) {
        if (res.title) setTitle(res.title);
        if (res.department) setDepartment(res.department);
        if (res.experienceLevel) setExperienceLevel(res.experienceLevel);
        if (res.type || res.employmentType) setType((res.type || res.employmentType) as any);
        if (res.location) setLocation(res.location);

        if (res.salaryMin !== null && res.salaryMin !== undefined) {
          setSalaryMin(res.salaryMin);
        } else if (res.minSalary !== null && res.minSalary !== undefined) {
          setSalaryMin(res.minSalary);
        }

        if (res.salaryMax !== null && res.salaryMax !== undefined) {
          setSalaryMax(res.salaryMax);
        } else if (res.maxSalary !== null && res.maxSalary !== undefined) {
          setSalaryMax(res.maxSalary);
        }

        if (res.description) setDescription(res.description);
        if (res.skills && Array.isArray(res.skills) && res.skills.length > 0) {
          setSkills(res.skills);
        }
        if (res.requirements && Array.isArray(res.requirements) && res.requirements.length > 0) {
          setRequirements(res.requirements);
        }

        setSuccessMessage('Job requisition drafted with Gemini AI. You can review and edit all fields before publishing.');
      }
    } catch (err: any) {
      console.error('Failed to generate with AI:', err);
      setErrorMessage(
        err?.message?.includes('preserve')
          ? err.message
          : 'AI draft could not be generated. Your existing information has been preserved. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddRequirement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const newJob = await api.createJob({
        title: title.trim(),
        company: 'Nexus AI Technologies',
        department,
        location: location.trim() || 'Remote',
        type,
        experienceLevel,
        salaryMin: salaryMin !== '' ? Number(salaryMin) : 0,
        salaryMax: salaryMax !== '' ? Number(salaryMax) : 0,
        salaryCurrency: 'USD',
        description: description || `We are looking for an exceptional ${title} to join our ${department} team.`,
        requirements: requirements.length > 0 ? requirements : ['3+ years relevant experience'],
        skills: skills.length > 0 ? skills : ['General'],
        status: 'ACTIVE',
      });

      onJobCreated(newJob);
      onClose();
    } catch (err: any) {
      console.error('Failed to submit job:', err);
      setErrorMessage(err?.message || 'Failed to create job requisition. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Create New Job Requisition
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define requirements and use Gemini 3.7 AI Copilot to draft modern job specifications.
          </p>
        </div>

        {/* AI Copilot Prompt Card */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Gemini AI Requisition Copilot
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Drafting requisition...
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  Draft with Gemini AI
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            value={aiPromptHint}
            onChange={(e) => setAiPromptHint(e.target.value)}
            placeholder="Optional prompt guidance (e.g. 'Must have heavy Kafka & Kubernetes focus, 100% remote scaleup culture')..."
            className="w-full px-3 py-2 rounded-xl border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div className="p-3 mb-5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2">
            <p className="leading-relaxed">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-3 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-start justify-between gap-2">
            <p className="leading-relaxed">{successMessage}</p>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer (React / Node / AI)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead / Staff</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA (Hybrid / Remote)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Base Salary (USD)
              </label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 120000 (Optional)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Base Salary (USD)
              </label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 160000 (Optional)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Role Overview / Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the team mission, core responsibilities, and day-to-day impact..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
            />
          </div>

          {/* Required Skills Tags Manager */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Required Technical Skills & Competencies
            </label>
            <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 min-h-[44px]">
              {skills.map((skill, idx) => {
                const skillLabel = typeof skill === 'string' ? skill : (skill as any)?.name || 'Skill';
                return (
                  <span
                    key={`${skillLabel}-${idx}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    {skillLabel}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skillLabel)}
                      className="hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill tag (e.g. GraphQL, Gemini API, PyTorch) and press enter"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* Requirements Bullet Points */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Requirements & Qualifications
            </label>
            <div className="space-y-2 mb-2">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                >
                  <span>• {req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                placeholder="Add bullet requirement..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Publish Requisition
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

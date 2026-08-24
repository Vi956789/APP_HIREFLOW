import React, { useState } from 'react';
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Sparkles,
  CheckCircle2,
  X,
  Send,
  Building2,
  FileText,
  Loader2,
  Wand2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Job, Application, User, CandidateProfile as CandidateProfileType } from '../../types';
import { AIScoreBadge } from '../common/AIScoreBadge';
import { api } from '../../services/api';

interface JobDiscoveryProps {
  jobs: Job[];
  appliedJobIds: string[];
  onApplyForJob: (job: Job, coverLetter?: string) => Promise<void>;
  selectedJob?: Job | null;
  onClearSelectedJob?: () => void;
  currentUser?: User | null;
  candidateProfile?: CandidateProfileType | null;
}

export const JobDiscovery: React.FC<JobDiscoveryProps> = ({
  jobs,
  appliedJobIds,
  onApplyForJob,
  selectedJob: externalSelectedJob,
  onClearSelectedJob,
  currentUser,
  candidateProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [activeModalJob, setActiveModalJob] = useState<Job | null>(externalSelectedJob || null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Sync if externally opened
  React.useEffect(() => {
    if (externalSelectedJob) {
      setActiveModalJob(externalSelectedJob);
      setCoverLetter('');
      setApplySuccess(false);
    }
  }, [externalSelectedJob]);

  const departments = ['All', 'Engineering', 'Design', 'Product', 'Marketing', 'Sales'];
  const types = ['All', 'Full-time', 'Remote', 'Hybrid', 'Contract'];

  const filteredJobs = jobs.filter((job) => {
    if (job.status !== 'ACTIVE') return false;
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || job.department === departmentFilter;
    const matchesType = typeFilter === 'All' || job.type === typeFilter;
    return matchesSearch && matchesDept && matchesType;
  });

  const handleOpenJobModal = (job: Job) => {
    setActiveModalJob(job);
    setCoverLetter('');
    setApplySuccess(false);
  };

  const handleCloseModal = () => {
    setActiveModalJob(null);
    if (onClearSelectedJob) onClearSelectedJob();
  };

  const handleGenerateCoverLetter = async () => {
    if (!activeModalJob) return;
    setIsGeneratingLetter(true);

    try {
      const res = await api.generateCoverLetter({
        candidateName: currentUser?.name || 'Candidate',
        candidateResume:
          candidateProfile?.resumeText ||
          (currentUser ? `${currentUser.name} - ${currentUser.title || 'Software Professional'}` : 'Experienced Software Professional'),
        jobTitle: activeModalJob.title,
        companyName: activeModalJob.company,
        jobDescription: `${activeModalJob.description}\n\nRequirements:\n${activeModalJob.requirements.join('\n')}`,
      });

      if (res.coverLetter) {
        setCoverLetter(res.coverLetter);
      }
    } catch (err) {
      console.error('Failed to generate cover letter:', err);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleConfirmApply = async () => {
    if (!activeModalJob) return;
    setIsApplying(true);

    try {
      await onApplyForJob(activeModalJob, coverLetter);
      setApplySuccess(true);
      setTimeout(() => {
        setIsApplying(false);
        handleCloseModal();
      }, 1400);
    } catch (err) {
      console.error('Failed to apply:', err);
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Discover Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Explore verified open roles with intelligent ATS matching & Gemini cover letter synthesis.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, tech stack (e.g. React, PyTorch), company, location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  departmentFilter === dept
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Work Types' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => {
          const isApplied = appliedJobIds.includes(job.id);

          return (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {job.company} • {job.department}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {job.experienceLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span>{job.type}</span>
                  <span>•</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${Math.round(job.salaryMin / 1000)}k - ${Math.round(job.salaryMax / 1000)}k
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((skill, sIdx) => {
                    const skillLabel = typeof skill === 'string' ? skill : (skill as any)?.name || 'Skill';
                    return (
                      <span
                        key={`${skillLabel}-${sIdx}`}
                        className="text-[10px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {skillLabel}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {job.applicantCount || 0} applicants
                </span>

                {isApplied ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" /> Applied
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenJobModal(job)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View & Apply</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-500">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">No job positions found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search query or department filter.</p>
          </div>
        )}
      </div>

      {/* Interactive Job Detail & Application Modal */}
      {activeModalJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Job Header */}
            <div className="flex items-start gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20 shrink-0">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {activeModalJob.title}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {activeModalJob.department}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeModalJob.company} • {activeModalJob.location} • {activeModalJob.type}
                </p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Compensation: ${Math.round(activeModalJob.salaryMin / 1000)}k - ${Math.round(activeModalJob.salaryMax / 1000)}k USD
                </p>
              </div>
            </div>

            {/* Job Body */}
            <div className="py-5 space-y-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Role Overview
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeModalJob.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Key Requirements & Qualifications
                </h4>
                <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
                  {activeModalJob.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Target Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeModalJob.skills.map((skill, sIdx) => {
                    const skillLabel = typeof skill === 'string' ? skill : (skill as any)?.name || 'Skill';
                    return (
                      <span
                        key={`${skillLabel}-${sIdx}`}
                        className="text-xs font-semibold px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900"
                      >
                        {skillLabel}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Gemini Cover Letter Generator Box */}
            <div className="py-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    Gemini AI Cover Letter Copilot
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  disabled={isGeneratingLetter}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isGeneratingLetter ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Drafting with Gemini...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      Generate Personalized Cover Letter
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Click 'Generate Personalized Cover Letter' above to let Gemini draft a tailored note, or write your own message..."
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Close
              </button>

              {appliedJobIds.includes(activeModalJob.id) || applySuccess ? (
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md">
                  <CheckCircle2 className="w-4 h-4" /> Application Submitted!
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmApply}
                  disabled={isApplying}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting with AI Match...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      1-Click Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

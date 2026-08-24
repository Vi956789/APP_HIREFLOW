import React, { useState } from 'react';
import { CandidateResumeData } from '../../../types';
import {
  FileText,
  Plus,
  Edit3,
  Download,
  Trash2,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ResumeListProps {
  resumes: CandidateResumeData[];
  onSelectResume: (resume: CandidateResumeData) => void;
  onCreateNew: () => void;
  onDeleteResume: (resume: CandidateResumeData) => Promise<void>;
  onDownloadPdf: (resume: CandidateResumeData) => Promise<void>;
  isDownloadingId: string | null;
}

export const ResumeList: React.FC<ResumeListProps> = ({
  resumes,
  onSelectResume,
  onCreateNew,
  onDeleteResume,
  onDownloadPdf,
  isDownloadingId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingResume, setDeletingResume] = useState<CandidateResumeData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredResumes = resumes.filter((r) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (r.title || '').toLowerCase().includes(q);
    const roleMatch = (r.personalData?.professionalTitle || '').toLowerCase().includes(q);
    const summaryMatch = (r.summary || '').toLowerCase().includes(q);
    return titleMatch || roleMatch || summaryMatch;
  });

  const handleConfirmDelete = async () => {
    if (!deletingResume) return;
    setIsDeleting(true);
    try {
      await onDeleteResume(deletingResume);
      setDeletingResume(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Resumes</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage, customize, and export targeted resumes for different job applications and roles.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="create-new-resume-btn"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Resume</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Count Stats */}
        {resumes.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resumes by title, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {filteredResumes.length} of {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
            </div>
          </div>
        )}
      </div>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        // Empty State
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1">No Resumes Created Yet</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Create customized, ATS-optimized resumes tailored for different roles (e.g. Frontend, Backend, Full-Stack). Instant live A4 preview and pixel-perfect PDF export included.
          </p>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Resume</span>
          </button>
        </div>
      ) : filteredResumes.length === 0 ? (
        // Search No Results
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-sm text-gray-600 font-medium">No resumes match "{searchQuery}"</p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((resume) => {
            const expCount = Array.isArray(resume.experience) ? resume.experience.length : 0;
            const eduCount = Array.isArray(resume.education) ? resume.education.length : 0;
            const projCount = Array.isArray(resume.projects) ? resume.projects.length : 0;
            const isGoogle = (resume.selectedTemplate || 'google') === 'google';
            const isDownloading = isDownloadingId === resume.id;

            return (
              <div
                key={resume.id}
                id={`resume-card-${resume.id}`}
                className="bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 transition shadow-xs hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Title & Template Badge */}
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 truncate tracking-tight" title={resume.title}>
                        {resume.title || 'Untitled Resume'}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                        isGoogle
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : 'bg-stone-100 text-stone-800 border border-stone-200'
                      }`}
                    >
                      {isGoogle ? 'Google Professional' : 'Classic LaTeX'}
                    </span>
                  </div>

                  {/* Candidate target subtitle */}
                  <div className="text-xs text-gray-600 mb-3 font-medium">
                    {resume.personalData?.fullName || 'Candidate Name'}
                    {resume.personalData?.professionalTitle && (
                      <span className="text-gray-400"> • {resume.personalData.professionalTitle}</span>
                    )}
                  </div>

                  {/* Summary Snippet if present */}
                  {resume.summary && (
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-3">
                      {resume.summary}
                    </p>
                  )}

                  {/* Structure Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] text-gray-500">
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      <Briefcase className="w-3 h-3 text-gray-400" />
                      <span>{expCount} {expCount === 1 ? 'Role' : 'Roles'}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      <GraduationCap className="w-3 h-3 text-gray-400" />
                      <span>{eduCount} {eduCount === 1 ? 'Degree' : 'Degrees'}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      <Sparkles className="w-3 h-3 text-gray-400" />
                      <span>{projCount} {projCount === 1 ? 'Project' : 'Projects'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Last Updated & Action Buttons */}
                <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(resume.updatedAt)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeletingResume(resume)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Download PDF button */}
                    <button
                      type="button"
                      onClick={() => onDownloadPdf(resume)}
                      disabled={isDownloading}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                      title="Download PDF"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => onSelectResume(resume)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 p-6 animate-in fade-in zoom-in-95 duration-150"
            role="alertdialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Resume</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-gray-900 font-semibold">"{deletingResume.title}"</strong>? All tailored sections, bullets, and formatting will be removed from your database.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingResume(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-resume-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

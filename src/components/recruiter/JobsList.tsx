import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  Search,
  Users,
  Trash2,
  Archive,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Job } from '../../types';

interface JobsListProps {
  jobs: Job[];
  onOpenCreateJob: () => void;
  onSelectJobForApplicants: (jobId: string) => void;
  onUpdateJobStatus: (jobId: string, status: 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'ARCHIVED') => void;
  onDeleteJob: (jobId: string) => void;
}

export const JobsList: React.FC<JobsListProps> = ({
  jobs,
  onOpenCreateJob,
  onSelectJobForApplicants,
  onUpdateJobStatus,
  onDeleteJob,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const departments = ['All', 'Engineering', 'Design', 'Product', 'Marketing', 'Sales'];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'All' || job.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Job Requisitions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage open positions, close or archive hiring lifecycles, and monitor candidate pipelines.
          </p>
        </div>

        <button
          onClick={onOpenCreateJob}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer w-fit"
        >
          <Sparkles className="w-4 h-4" />
          <span>+ Create New Requisition</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by role title, skill (e.g. React, Python), or location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active (Accepting)</option>
            <option value="CLOSED">Closed (Hiring Ended)</option>
            <option value="ARCHIVED">Archived</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Role Title & Department</th>
                <th className="py-3.5 px-4">Location & Type</th>
                <th className="py-3.5 px-4">Salary Range</th>
                <th className="py-3.5 px-4">Candidates</th>
                <th className="py-3.5 px-4">Lifecycle State</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                    job.status === 'CLOSED' || job.status === 'ARCHIVED'
                      ? 'opacity-85 bg-slate-50/30 dark:bg-slate-900/40'
                      : ''
                  }`}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          job.status === 'ACTIVE'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                            : job.status === 'CLOSED'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                        }`}
                      >
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {job.title}
                          </h4>
                          {job.status === 'CLOSED' && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold border border-slate-200 dark:border-slate-700">
                              CLOSED
                            </span>
                          )}
                          {job.status === 'ARCHIVED' && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[9px] font-bold border border-amber-200 dark:border-amber-800">
                              ARCHIVED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            {job.department}
                          </span>
                          <span className="text-[10px] text-slate-400">• {job.experienceLevel}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">
                      {job.location}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{job.type}</span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${Math.round(job.salaryMin / 1000)}k - ${Math.round(job.salaryMax / 1000)}k
                    </span>
                    <span className="text-[10px] text-slate-400 block">{job.salaryCurrency}</span>
                  </td>

                  <td className="py-4 px-4">
                    <button
                      onClick={() => onSelectJobForApplicants(job.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{job.applicantCount || 0} candidates</span>
                    </button>
                  </td>

                  <td className="py-4 px-4">
                    <select
                      value={job.status}
                      onChange={(e) =>
                        onUpdateJobStatus(job.id, e.target.value as 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'ARCHIVED')
                      }
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                        job.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : job.status === 'CLOSED'
                          ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          : job.status === 'ARCHIVED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}
                    >
                      <option value="ACTIVE">Active (Open)</option>
                      <option value="CLOSED">Closed (Ended)</option>
                      <option value="ARCHIVED">Archived</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </td>

                  <td className="py-4 px-5 text-right space-x-1.5">
                    <button
                      onClick={() => onSelectJobForApplicants(job.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="View Applicants"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {job.status === 'ACTIVE' && (
                      <button
                        onClick={() => onUpdateJobStatus(job.id, 'CLOSED')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                        title="Close Hiring for this Job"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    )}
                    {job.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => onUpdateJobStatus(job.id, 'ARCHIVED')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Archive Job"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Archive/Delete Requisition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No job requisitions found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or create a new job.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

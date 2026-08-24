import React, { useState } from 'react';
import {
  CandidateResumeData,
  ResumeEducationItem,
  ResumeExperienceItem,
  ResumeProjectItem,
  ResumeCertificationItem,
  ResumeAchievementItem,
  ResumeSkillsCategories,
} from '../../../types';
import {
  User,
  FileText,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Code2,
  Award,
  Trophy,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

interface ResumeEditorProps {
  data: CandidateResumeData;
  onChange: (updated: CandidateResumeData) => void;
  onAutoFillProfile: () => void;
  hasProfileData: boolean;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  data,
  onChange,
  onAutoFillProfile,
  hasProfileData,
}) => {
  // Active accordion section management
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    projects: true,
    education: true,
    skills: true,
    certifications: false,
    achievements: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Personal Data Handlers
  const handlePersonalChange = (field: string, value: string) => {
    onChange({
      ...data,
      personalData: {
        ...data.personalData,
        [field]: value,
      },
    });
  };

  // 2. Summary Handler
  const handleSummaryChange = (summary: string) => {
    onChange({
      ...data,
      summary,
    });
  };

  // 3. Education Handlers
  const handleAddEducation = () => {
    const newEdu: ResumeEducationItem = {
      id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      location: '',
      startDate: '',
      endDate: '',
      grade: '',
      details: '',
    };
    onChange({
      ...data,
      education: [...data.education, newEdu],
    });
  };

  const handleUpdateEducation = (id: string, updates: Partial<ResumeEducationItem>) => {
    onChange({
      ...data,
      education: data.education.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((item) => item.id !== id),
    });
  };

  const handleMoveEducation = (index: number, direction: 'up' | 'down') => {
    const list = [...data.education];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    onChange({ ...data, education: list });
  };

  // 4. Experience Handlers
  const handleAddExperience = () => {
    const newExp: ResumeExperienceItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: ['Led development of core features resulting in measurable performance improvement.'],
    };
    onChange({
      ...data,
      experience: [...data.experience, newExp],
    });
  };

  const handleUpdateExperience = (id: string, updates: Partial<ResumeExperienceItem>) => {
    onChange({
      ...data,
      experience: data.experience.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter((item) => item.id !== id),
    });
  };

  const handleMoveExperience = (index: number, direction: 'up' | 'down') => {
    const list = [...data.experience];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    onChange({ ...data, experience: list });
  };

  const handleAddExpBullet = (expId: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    handleUpdateExperience(expId, {
      bullets: [...exp.bullets, ''],
    });
  };

  const handleUpdateExpBullet = (expId: string, bulletIndex: number, text: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    const updatedBullets = [...exp.bullets];
    updatedBullets[bulletIndex] = text;
    handleUpdateExperience(expId, { bullets: updatedBullets });
  };

  const handleDeleteExpBullet = (expId: string, bulletIndex: number) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    handleUpdateExperience(expId, {
      bullets: exp.bullets.filter((_, idx) => idx !== bulletIndex),
    });
  };

  // 5. Projects Handlers
  const handleAddProject = () => {
    const newProj: ResumeProjectItem = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      technologies: '',
      githubUrl: '',
      liveUrl: '',
      bullets: ['Built full-stack application with automated testing and responsive user interface.'],
    };
    onChange({
      ...data,
      projects: [...data.projects, newProj],
    });
  };

  const handleUpdateProject = (id: string, updates: Partial<ResumeProjectItem>) => {
    onChange({
      ...data,
      projects: data.projects.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const handleDeleteProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((item) => item.id !== id),
    });
  };

  const handleMoveProject = (index: number, direction: 'up' | 'down') => {
    const list = [...data.projects];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    onChange({ ...data, projects: list });
  };

  const handleAddProjBullet = (projId: string) => {
    const proj = data.projects.find((p) => p.id === projId);
    if (!proj) return;
    handleUpdateProject(projId, {
      bullets: [...proj.bullets, ''],
    });
  };

  const handleUpdateProjBullet = (projId: string, bulletIndex: number, text: string) => {
    const proj = data.projects.find((p) => p.id === projId);
    if (!proj) return;
    const updatedBullets = [...proj.bullets];
    updatedBullets[bulletIndex] = text;
    handleUpdateProject(projId, { bullets: updatedBullets });
  };

  const handleDeleteProjBullet = (projId: string, bulletIndex: number) => {
    const proj = data.projects.find((p) => p.id === projId);
    if (!proj) return;
    handleUpdateProject(projId, {
      bullets: proj.bullets.filter((_, idx) => idx !== bulletIndex),
    });
  };

  // 6. Skills Category Handlers
  const handleSkillsStringChange = (category: keyof ResumeSkillsCategories, strValue: string) => {
    const arrayItems = strValue
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({
      ...data,
      skills: {
        ...data.skills,
        [category]: arrayItems,
      },
    });
  };

  // 7. Certifications Handlers
  const handleAddCertification = () => {
    const newCert: ResumeCertificationItem = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      issuer: '',
      date: '',
      credentialUrl: '',
    };
    onChange({
      ...data,
      certifications: [...data.certifications, newCert],
    });
  };

  const handleUpdateCertification = (id: string, updates: Partial<ResumeCertificationItem>) => {
    onChange({
      ...data,
      certifications: data.certifications.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const handleDeleteCertification = (id: string) => {
    onChange({
      ...data,
      certifications: data.certifications.filter((item) => item.id !== id),
    });
  };

  // 8. Achievements Handlers
  const handleAddAchievement = () => {
    const newAch: ResumeAchievementItem = {
      id: `ach-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: '',
    };
    onChange({
      ...data,
      achievements: [...data.achievements, newAch],
    });
  };

  const handleUpdateAchievement = (id: string, text: string) => {
    onChange({
      ...data,
      achievements: data.achievements.map((item) =>
        item.id === id ? { ...item, text } : item
      ),
    });
  };

  const handleDeleteAchievement = (id: string) => {
    onChange({
      ...data,
      achievements: data.achievements.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      {/* Auto-fill Prompt Banner */}
      {hasProfileData && (
        <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-950">Pre-fill with Profile Information</p>
              <p className="text-[11px] text-blue-800">
                Sync your name, contact details, skills, and summary from your Candidate Profile.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="autofill-profile-btn"
            onClick={onAutoFillProfile}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition shadow-sm whitespace-nowrap"
          >
            Auto-fill
          </button>
        </div>
      )}

      {/* 1. PERSONAL INFORMATION SECTION */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('personal')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/70 hover:bg-gray-50 text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
              <User className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Personal Information</span>
          </div>
          {openSections.personal ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSections.personal && (
          <div className="p-4 space-y-3.5 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  id="resume-full-name-input"
                  value={data.personalData?.fullName || ''}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  id="resume-title-input"
                  value={data.personalData?.professionalTitle || ''}
                  onChange={(e) => handlePersonalChange('professionalTitle', e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  id="resume-email-input"
                  value={data.personalData?.email || ''}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  placeholder="alex.morgan@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  id="resume-phone-input"
                  value={data.personalData?.phone || ''}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location / City</label>
                <input
                  type="text"
                  id="resume-location-input"
                  value={data.personalData?.location || ''}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  placeholder="San Francisco, CA or Remote"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  id="resume-linkedin-input"
                  value={data.personalData?.linkedin || ''}
                  onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/alex-morgan"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">GitHub Profile</label>
                <input
                  type="text"
                  id="resume-github-input"
                  value={data.personalData?.github || ''}
                  onChange={(e) => handlePersonalChange('github', e.target.value)}
                  placeholder="github.com/alex-morgan"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Portfolio / Website</label>
                <input
                  type="text"
                  id="resume-portfolio-input"
                  value={data.personalData?.portfolio || ''}
                  onChange={(e) => handlePersonalChange('portfolio', e.target.value)}
                  placeholder="alexmorgan.dev"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. PROFESSIONAL SUMMARY SECTION */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('summary')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/70 hover:bg-gray-50 text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Professional Summary</span>
          </div>
          {openSections.summary ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSections.summary && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700">Executive / Career Summary</label>
              <span className="text-[11px] text-gray-400">
                {data.summary ? data.summary.split(/\s+/).filter(Boolean).length : 0} words
              </span>
            </div>
            <textarea
              id="resume-summary-textarea"
              rows={3}
              value={data.summary || ''}
              onChange={(e) => handleSummaryChange(e.target.value)}
              placeholder="High-performing Software Engineer with 4+ years of experience designing scalable microservices and real-time cloud architectures..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
            />
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              Keep concise (2–4 lines) highlighting your primary stack and core strengths.
            </p>
          </div>
        )}
      </div>

      {/* 3. EXPERIENCE SECTION */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/70 hover:bg-gray-50 text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-md">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-gray-900">
              Work Experience ({data.experience?.length || 0})
            </span>
          </div>
          {openSections.experience ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSections.experience && (
          <div className="p-4 space-y-4 border-t border-gray-100">
            {data.experience.map((exp, idx) => (
              <div key={exp.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Experience #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveExperience(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-200 transition"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveExperience(idx, 'down')}
                      disabled={idx === data.experience.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-200 transition"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition ml-1"
                      title="Delete experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Role / Job Title *</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleUpdateExperience(exp.id, { role: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleUpdateExperience(exp.id, { location: e.target.value })}
                      placeholder="San Francisco, CA or Remote"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                        placeholder="Jan 2022"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="text"
                        disabled={exp.current}
                        value={exp.current ? 'Present' : exp.endDate}
                        onChange={(e) => handleUpdateExperience(exp.id, { endDate: e.target.value })}
                        placeholder="Present"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`current-role-${exp.id}`}
                    checked={exp.current || false}
                    onChange={(e) => handleUpdateExperience(exp.id, { current: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`current-role-${exp.id}`} className="text-xs text-gray-700 font-medium">
                    I currently work in this role
                  </label>
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-1 border-t border-gray-200">
                  <label className="block text-xs font-medium text-gray-700">Key Achievements & Bullet Points</label>
                  {exp.bullets?.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => handleUpdateExpBullet(exp.id, bIdx, e.target.value)}
                        placeholder="Action verb + quantifiable achievement + technologies used..."
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExpBullet(exp.id, bIdx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                        title="Delete bullet"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddExpBullet(exp.id)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add bullet point
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              id="add-experience-btn"
              onClick={handleAddExperience}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-600 text-xs font-medium rounded-xl transition bg-white"
            >
              <Plus className="w-4 h-4" /> Add Experience Entry
            </button>
          </div>
        )}
      </div>

      {/* 4. PROJECTS SECTION */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('projects')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/70 hover:bg-gray-50 text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-violet-100 text-violet-700 rounded-md">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-gray-900">
              Projects ({data.projects?.length || 0})
            </span>
          </div>
          {openSections.projects ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSections.projects && (
          <div className="p-4 space-y-4 border-t border-gray-100">
            {data.projects.map((proj, idx) => (
              <div key={proj.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Project #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveProject(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-200 transition"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveProject(idx, 'down')}
                      disabled={idx === data.projects.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-200 transition"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition ml-1"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Project Name *</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => handleUpdateProject(proj.id, { name: e.target.value })}
                      placeholder="e.g. Distributed Task Queue"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tech Stack</label>
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) => handleUpdateProject(proj.id, { technologies: e.target.value })}
                      placeholder="TypeScript, Redis, Go, Docker"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">GitHub Repo URL</label>
                    <input
                      type="text"
                      value={proj.githubUrl || ''}
                      onChange={(e) => handleUpdateProject(proj.id, { githubUrl: e.target.value })}
                      placeholder="github.com/user/project"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Live Demo URL</label>
                    <input
                      type="text"
                      value={proj.liveUrl || ''}
                      onChange={(e) => handleUpdateProject(proj.id, { liveUrl: e.target.value })}
                      placeholder="my-demo-app.com"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-1 border-t border-gray-200">
                  <label className="block text-xs font-medium text-gray-700">Project Highlights & Impact</label>
                  {proj.bullets?.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => handleUpdateProjBullet(proj.id, bIdx, e.target.value)}
                        placeholder="Engineered background worker architecture capable of processing 10k events/sec..."
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteProjBullet(proj.id, bIdx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                        title="Delete bullet"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddProjBullet(proj.id)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add bullet point
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              id="add-project-btn"
              onClick={handleAddProject}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-600 text-xs font-medium rounded-xl transition bg-white"
            >
              <Plus className="w-4 h-4" /> Add Project Entry
            </button>
          </div>
        )}
      </div>

      {/* 5. EDUCATION SECTION */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('education')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/70 hover:bg-gray-50 text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-md">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-gray-900">
              Education ({data.education?.length || 0})
            </span>
          </div>
          {openSections.education ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSections.education && (
          <div className="p-4 space-y-4 border-t border-gray-100">
            {data.education.map((edu, idx) => (
              <div key={edu.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Education #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveEducation(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-200 transition"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveEducation(idx, 'down')}
                      disabled={idx === data.education.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-200 transition"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition ml-1"
                      title="Delete education"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Institution / University *</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducation(edu.id, { institution: e.target.value })}
                      placeholder="e.g. University of California, Berkeley"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Degree *</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(edu.id, { degree: e.target.value })}
                      placeholder="e.g. B.S. or M.S."
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Field of Study / Major</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleUpdateEducation(edu.id, { fieldOfStudy: e.target.value })}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, { location: e.target.value })}
                      placeholder="Berkeley, CA"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Year</label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => handleUpdateEducation(edu.id, { startDate: e.target.value })}
                        placeholder="2018"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Year</label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => handleUpdateEducation(edu.id, { endDate: e.target.value })}
                        placeholder="2022"
                        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Grade / CGPA (Optional)</label>
                    <input
                      type="text"
                      value={edu.grade || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, { grade: e.target.value })}
                      placeholder="3.85 / 4.0 or Magna Cum Laude"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              id="add-education-btn"
              onClick={handleAddEducation}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-600 text-xs font-medium rounded-xl transition bg-white"
            >
              <Plus className="w-4 h-4" /> Add Education Entry
            </button>
          </div>
        )}
      </div>

      {/* 6. SKILLS SECTION */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('skills')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/70 hover:bg-gray-50 text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-100 text-cyan-700 rounded-md">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Technical Skills</span>
          </div>
          {openSections.skills ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSections.skills && (
          <div className="p-4 space-y-3.5 border-t border-gray-100">
            <p className="text-[11px] text-gray-500">
              Enter comma-separated items for each skill category.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Programming Languages</label>
              <input
                type="text"
                value={data.skills?.languages?.join(', ') || ''}
                onChange={(e) => handleSkillsStringChange('languages', e.target.value)}
                placeholder="Python, TypeScript, JavaScript, Go, SQL, C++"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Frameworks & Libraries</label>
              <input
                type="text"
                value={data.skills?.frameworks?.join(', ') || ''}
                onChange={(e) => handleSkillsStringChange('frameworks', e.target.value)}
                placeholder="React, Next.js, Node.js, Express, FastAPI, Tailwind CSS"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Databases & Storage</label>
              <input
                type="text"
                value={data.skills?.databases?.join(', ') || ''}
                onChange={(e) => handleSkillsStringChange('databases', e.target.value)}
                placeholder="PostgreSQL, Redis, MongoDB, MySQL, DynamoDB"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tools, DevOps & Cloud</label>
              <input
                type="text"
                value={data.skills?.tools?.join(', ') || ''}
                onChange={(e) => handleSkillsStringChange('tools', e.target.value)}
                placeholder="Git, Docker, Kubernetes, AWS, CI/CD, Linux, Terraform"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">AI / Data Science (Optional)</label>
              <input
                type="text"
                value={data.skills?.aiMl?.join(', ') || ''}
                onChange={(e) => handleSkillsStringChange('aiMl', e.target.value)}
                placeholder="PyTorch, Gemini API, LangChain, RAG, Scikit-learn"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Other Competencies (Optional)</label>
              <input
                type="text"
                value={data.skills?.other?.join(', ') || ''}
                onChange={(e) => handleSkillsStringChange('other', e.target.value)}
                placeholder="REST APIs, Microservices, Agile Scrum, System Design"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 7. CERTIFICATIONS SECTION */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('certifications')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/70 hover:bg-gray-50 text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-md">
              <Award className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-gray-900">
              Certifications ({data.certifications?.length || 0})
            </span>
          </div>
          {openSections.certifications ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSections.certifications && (
          <div className="p-4 space-y-3.5 border-t border-gray-100">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">{cert.name || 'New Certification'}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCertification(cert.id)}
                    className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleUpdateCertification(cert.id, { name: e.target.value })}
                    placeholder="Certification Name (e.g. AWS Certified Solutions Architect)"
                    className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleUpdateCertification(cert.id, { issuer: e.target.value })}
                    placeholder="Issuer (e.g. Amazon Web Services)"
                    className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => handleUpdateCertification(cert.id, { date: e.target.value })}
                    placeholder="Date (e.g. 2023)"
                    className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={cert.credentialUrl || ''}
                    onChange={(e) => handleUpdateCertification(cert.id, { credentialUrl: e.target.value })}
                    placeholder="Verification URL (optional)"
                    className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              id="add-certification-btn"
              onClick={handleAddCertification}
              className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-600 text-xs font-medium rounded-xl transition bg-white"
            >
              <Plus className="w-3.5 h-3.5" /> Add Certification
            </button>
          </div>
        )}
      </div>

      {/* 8. ACHIEVEMENTS SECTION */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('achievements')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/70 hover:bg-gray-50 text-left transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-yellow-100 text-yellow-700 rounded-md">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-gray-900">
              Achievements & Honors ({data.achievements?.length || 0})
            </span>
          </div>
          {openSections.achievements ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {openSections.achievements && (
          <div className="p-4 space-y-3 border-t border-gray-100">
            {data.achievements.map((ach) => (
              <div key={ach.id} className="flex items-start gap-2">
                <span className="text-gray-400 mt-2 text-xs">•</span>
                <textarea
                  rows={2}
                  value={ach.text}
                  onChange={(e) => handleUpdateAchievement(ach.id, e.target.value)}
                  placeholder="e.g. 1st Place Winner at Global Hackathon 2023 out of 400+ participating engineering teams..."
                  className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteAchievement(ach.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                  title="Delete achievement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              id="add-achievement-btn"
              onClick={handleAddAchievement}
              className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-600 text-xs font-medium rounded-xl transition bg-white"
            >
              <Plus className="w-3.5 h-3.5" /> Add Achievement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

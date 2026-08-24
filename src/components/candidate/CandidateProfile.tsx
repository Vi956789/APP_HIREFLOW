import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Upload,
  Camera,
} from 'lucide-react';
import { CandidateProfile as CandidateProfileType, User as UserType } from '../../types';
import { api } from '../../services/api';

interface CandidateProfileProps {
  currentUser: UserType | null;
  profile: CandidateProfileType | null;
  onUpdateProfile?: (updated: CandidateProfileType & { name?: string; title?: string; email?: string; avatar?: string; avatarUrl?: string }) => Promise<void> | void;
}

const extractSkillNames = (skillsRaw?: any[]): string[] => {
  if (!skillsRaw || !Array.isArray(skillsRaw)) return [];
  return skillsRaw
    .map((s) => {
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object' && 'name' in s) return String(s.name);
      return '';
    })
    .filter(Boolean);
};

export const CandidateProfile: React.FC<CandidateProfileProps> = ({
  currentUser,
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentUser?.name || profile?.name || '');
  const [title, setTitle] = useState(profile?.headline || profile?.title || currentUser?.title || '');
  const [email, setEmail] = useState(currentUser?.email || profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || currentUser?.phone || '');
  const [location, setLocation] = useState(profile?.location || currentUser?.location || '');
  const [summary, setSummary] = useState(profile?.summary || '');
  const [skills, setSkills] = useState<string[]>(() => extractSkillNames(profile?.skills));
  const [newSkill, setNewSkill] = useState('');
  const [resumeText, setResumeText] = useState(profile?.resumeText || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || profile?.avatar || currentUser?.avatar || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.avatar && !avatarPreview) setAvatarUrl(currentUser.avatar);
    }
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.headline || profile.title) {
        setTitle(profile.headline || profile.title || '');
      } else if (currentUser?.title) {
        setTitle(currentUser.title);
      }
      if (profile.phone !== undefined) setPhone(profile.phone || '');
      if (profile.location !== undefined) setLocation(profile.location || '');
      if (profile.summary !== undefined) setSummary(profile.summary || '');
      if (profile.resumeText !== undefined) setResumeText(profile.resumeText || '');
      if (profile.skills) setSkills(extractSkillNames(profile.skills));
      if ((profile.avatarUrl || profile.avatar) && !avatarPreview) {
        setAvatarUrl(profile.avatarUrl || profile.avatar || '');
      }
    }
  }, [profile, currentUser]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setErrorMessage(null);
    setSelectedAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);
    try {
      let finalAvatar = avatarUrl;

      // If a new avatar was selected from device, upload it to Supabase Storage first
      if (selectedAvatarFile) {
        try {
          const uploadRes = await api.uploadFile(selectedAvatarFile, 'candidate-avatars', selectedAvatarFile.name);
          if (uploadRes && uploadRes.url) {
            finalAvatar = uploadRes.url;
            setAvatarUrl(uploadRes.url);
            setSelectedAvatarFile(null);
            setAvatarPreview(null);
          }
        } catch (uploadErr: any) {
          console.error('Avatar upload failed:', uploadErr);
          throw new Error(`Failed to upload avatar: ${uploadErr.message || 'Storage error'}`);
        }
      }

      if (onUpdateProfile) {
        const formattedSkills: { name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' }[] = skills.map(
          (s) => ({
            name: typeof s === 'string' ? s : (s as any)?.name || 'Skill',
            level: 'Advanced',
          })
        );

        const baseProfile: CandidateProfileType = profile || {
          id: `prof-${currentUser?.id || '1'}`,
          userId: currentUser?.id || '',
          headline: title,
          summary,
          location,
          phone,
          skills: formattedSkills,
          experience: [],
          education: [],
          resumeText,
          profileStrength: 85,
        };

        await onUpdateProfile({
          ...baseProfile,
          name: name.trim(),
          title: title.trim(),
          headline: title.trim(),
          email: email.trim(),
          phone: phone.trim(),
          location: location.trim(),
          summary: summary.trim(),
          skills: formattedSkills,
          resumeText,
          avatar: finalAvatar || undefined,
          avatarUrl: finalAvatar || undefined,
        });

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Candidate Profile & Resume
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Maintain your skills, bio, and master resume for 1-click ATS matching.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Avatar & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group shrink-0">
            <img
              src={
                avatarPreview ||
                avatarUrl ||
                currentUser?.avatar ||
                profile?.avatarUrl ||
                profile?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
              }
              alt={name || 'Candidate'}
              className="w-20 h-20 rounded-3xl object-cover ring-2 ring-blue-500/20 shadow-md"
            />
            <label
              htmlFor="candidate-avatar-input"
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer transition-transform hover:scale-105"
              title="Upload photo from device"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                id="candidate-avatar-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </label>
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{name || currentUser?.name || 'Candidate'}</h2>
              {selectedAvatarFile && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  New photo selected (Click Save Profile to apply)
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{title || profile?.headline || currentUser?.title || 'Open to Opportunities'}</p>
            <p className="text-xs text-slate-500">{location || 'Remote'}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chandrapal Singh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Professional Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Backend Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Location & Work Preference
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hapur, Uttar Pradesh (Open to Remote / Hybrid)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Professional Summary
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe your background, core technical focus, and career goals..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Skills Management */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Core Skills & Tech Competencies
            </label>
            <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 min-h-[44px]">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-400 italic py-1 px-2">No skills added yet. Add your key skills below.</span>
              ) : (
                skills.map((skill, idx) => {
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
                })
              )}
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
                placeholder="Add skill tag (e.g. Next.js, PyTorch, Kubernetes) and press enter"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Add Skill
              </button>
            </div>
          </div>

          {/* Master Resume Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Master Resume (Plaintext / Markdown for AI Matching)
            </label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume markdown or plaintext..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-900 dark:text-white focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
            {isSaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Profile updated successfully!
              </span>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving to Database...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

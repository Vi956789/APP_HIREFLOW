import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Globe, Sparkles, CheckCircle2, Shield, Users, Mail, Loader2, AlertCircle, Camera, Upload } from 'lucide-react';
import { User, RecruiterProfile as RecruiterProfileType } from '../../types';
import { api } from '../../services/api';

interface CompanyProfileProps {
  currentUser: User | null;
  onSave?: (updatedUser?: User) => void;
}

export const CompanyProfile: React.FC<CompanyProfileProps> = ({ currentUser, onSave }) => {
  const [companyName, setCompanyName] = useState(currentUser?.companyName || 'My Company');
  const [companyLocation, setCompanyLocation] = useState(currentUser?.companyLocation || 'San Francisco, CA (Hybrid / Remote)');
  const [website, setWebsite] = useState('https://hireflow.io');
  const [description, setDescription] = useState(
    'Leading organization creating high-impact software, scalable infrastructure, and empowering top talent.'
  );
  const [employeeCount, setEmployeeCount] = useState('150-500 employees');
  const [industry, setIndustry] = useState('Software & Technology');
  const [companyLogo, setCompanyLogo] = useState(currentUser?.avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const prof = await api.getRecruiterProfile();
        if (prof && mounted) {
          if (prof.companyName) setCompanyName(prof.companyName);
          if (prof.companyLocation) setCompanyLocation(prof.companyLocation);
          if (prof.companyWebsite) setWebsite(prof.companyWebsite);
          if (prof.companyDescription) setDescription(prof.companyDescription);
          if (prof.companySize) setEmployeeCount(prof.companySize);
          if (prof.industry) setIndustry(prof.industry);
          if (prof.companyLogo || (prof as any).companyLogoUrl) {
            setCompanyLogo(prof.companyLogo || (prof as any).companyLogoUrl);
          } else if (currentUser?.avatar) {
            setCompanyLogo(currentUser.avatar);
          }
        }
      } catch (err) {
        console.error('Failed to load recruiter company profile:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Logo image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    setError(null);
    setSelectedLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      let finalLogo = companyLogo;

      // If user selected a new logo from device, upload it to Supabase Storage first
      if (selectedLogoFile) {
        try {
          const uploadRes = await api.uploadFile(selectedLogoFile, 'company-logos', selectedLogoFile.name);
          if (uploadRes && uploadRes.url) {
            finalLogo = uploadRes.url;
            setCompanyLogo(uploadRes.url);
            setSelectedLogoFile(null);
            setLogoPreview(null);
          }
        } catch (uploadErr: any) {
          console.error('Company logo upload failed:', uploadErr);
          throw new Error(`Failed to upload company logo: ${uploadErr.message || 'Storage error'}`);
        }
      }

      const response = await api.updateRecruiterProfile({
        companyName: companyName.trim(),
        companyLocation: companyLocation.trim(),
        companyWebsite: website.trim(),
        companyDescription: description.trim(),
        companySize: employeeCount,
        industry: industry.trim(),
        companyLogo: finalLogo,
      });

      setIsSaved(true);
      if (onSave) {
        onSave(response.user);
      }
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error('Save company profile error:', err);
      setError(err.message || 'Failed to save company settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Company Profile & Branding
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure company culture, public profile details, and ATS candidate screening parameters.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Banner / Logo Header */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group shrink-0">
            <img
              src={
                logoPreview ||
                companyLogo ||
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80'
              }
              alt="Company Logo"
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-md"
            />
            <label
              htmlFor="company-logo-input"
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer transition-transform hover:scale-105"
              title="Upload company logo from device"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                id="company-logo-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                onChange={handleLogoSelect}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{companyName}</h2>
              {selectedLogoFile && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  New logo selected (Click Save to apply)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {companyLocation}
            </p>
            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 mt-2">
              Verified Hiring Enterprise
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-600 dark:rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Display Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. Acme Tech Solutions"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Headquarters Location
              </label>
              <input
                type="text"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. San Francisco, CA (Hybrid / Remote)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Size
              </label>
              <select
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="1-20 employees">1-20 employees (Seed)</option>
                <option value="20-100 employees">20-100 employees (Series A)</option>
                <option value="150-500 employees">150-500 employees (Series B/Scaleup)</option>
                <option value="500+ employees">500+ employees (Enterprise)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Company Overview & Mission
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
              placeholder="Tell candidates about your mission, product vision, engineering principles, and work culture..."
            />
          </div>

          {/* AI ATS Screening Preferences */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                Gemini 3.7 Screening Thresholds
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Candidates scoring above 85% are automatically badged as <strong>Strong Fit</strong> and surfaced in priority queues.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between">
            {isSaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully!
              </span>
            ) : isLoading ? (
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading settings...
              </span>
            ) : (
              <span></span>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Company Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RoleSelector } from './components/auth/RoleSelector';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { SignOutConfirmModal } from './components/common/SignOutConfirmModal';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { JobsList } from './components/recruiter/JobsList';
import { CreateJobModal } from './components/recruiter/CreateJobModal';
import { ApplicationsManager } from './components/recruiter/ApplicationsManager';
import { ScheduleInterviewModal } from './components/recruiter/ScheduleInterviewModal';
import { CompanyProfile } from './components/recruiter/CompanyProfile';
import { CandidateDashboard } from './components/candidate/CandidateDashboard';
import { JobDiscovery } from './components/candidate/JobDiscovery';
import { ResumeMatchScanner } from './components/candidate/ResumeMatchScanner';
import { CandidateApplications } from './components/candidate/CandidateApplications';
import { CandidateProfile } from './components/candidate/CandidateProfile';
import { CandidateResumeBuilder } from './components/candidate/resume-builder/CandidateResumeBuilder';
import { AIChatDrawer } from './components/common/AIChatDrawer';
import { Toast, ToastType } from './components/common/Toast';
import { api } from './services/api';
import { User, UserRole, Job, Application, CandidateProfile as CandidateProfileType, ApplicationStatus } from './types';
import { Sparkles } from 'lucide-react';

export function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>('CANDIDATE');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfileType | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Modals & Drawers
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [modalDefaultRole, setModalDefaultRole] = useState<UserRole>('CANDIDATE');
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const [isCreateJobOpen, setIsCreateJobOpen] = useState<boolean>(false);
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState<boolean>(false);
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<Application | null>(null);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Job | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  // Synchronize route URL with app state
  const syncRouteFromURL = useCallback((user: User | null) => {
    const path = window.location.pathname;

    if (!user) {
      if (path === '/register') {
        setIsRegisterOpen(true);
        setIsLoginOpen(false);
      } else if (path === '/login' || path.startsWith('/recruiter') || path.startsWith('/candidate')) {
        setIsLoginOpen(true);
        setIsRegisterOpen(false);
        if (path.startsWith('/recruiter')) setModalDefaultRole('RECRUITER');
        if (path.startsWith('/candidate')) setModalDefaultRole('CANDIDATE');
      }
      return;
    }

    // When authenticated
    setIsLoginOpen(false);
    setIsRegisterOpen(false);

    if (user.role === 'RECRUITER') {
      setUserRole('RECRUITER');
      if (path.startsWith('/recruiter/')) {
        const tab = path.replace('/recruiter/', '');
        const validTabs = ['dashboard', 'jobs', 'applications', 'screening', 'company'];
        setCurrentTab(validTabs.includes(tab) ? tab : 'dashboard');
      } else {
        // Redirect non-recruiter or root paths to recruiter dashboard
        setCurrentTab('dashboard');
        window.history.replaceState(null, '', '/recruiter/dashboard');
      }
    } else if (user.role === 'CANDIDATE') {
      setUserRole('CANDIDATE');
      if (path.startsWith('/candidate/')) {
        const tab = path.replace('/candidate/', '');
        const validTabs = ['dashboard', 'discover', 'resume-match', 'resume-builder', 'applications', 'profile'];
        setCurrentTab(validTabs.includes(tab) ? tab : 'dashboard');
      } else {
        // Redirect non-candidate or root paths to candidate dashboard
        setCurrentTab('dashboard');
        window.history.replaceState(null, '', '/candidate/dashboard');
      }
    }
  }, []);

  // Update URL on tab change
  const navigateTab = useCallback((tab: string) => {
    setCurrentTab(tab);
    if (currentUser) {
      const base = currentUser.role === 'RECRUITER' ? 'recruiter' : 'candidate';
      window.history.pushState(null, '', `/${base}/${tab}`);
    }
  }, [currentUser]);

  // Load User Data from Backend API
  const loadUserData = useCallback(async (user: User) => {
    setIsLoadingData(true);
    try {
      if (user.role === 'RECRUITER') {
        const [fetchedJobs, fetchedApps] = await Promise.all([
          api.getJobs({ recruiterId: user.id }),
          api.getApplications(),
        ]);
        setJobs(fetchedJobs || []);
        setApplications(fetchedApps || []);
      } else {
        const [fetchedJobs, fetchedApps, fetchedProfile] = await Promise.all([
          api.getJobs(),
          api.getApplications({ candidateId: user.id }),
          api.getProfile(user.id).catch(() => null),
        ]);
        setJobs(fetchedJobs || []);
        setApplications(fetchedApps || []);
        if (fetchedProfile) {
          setCandidateProfile(fetchedProfile);
        } else {
          setCandidateProfile({
            id: `prof-${user.id}`,
            userId: user.id,
            headline: user.title || 'Software Professional | Open to Opportunities',
            summary: 'Experienced professional seeking innovative software engineering challenges.',
            location: user.location || 'Remote',
            phone: user.phone || '',
            name: user.name,
            email: user.email,
            title: user.title || 'Software Professional',
            skills: [],
            experience: [],
            education: [],
            resumeText: `${user.name} - ${user.title || 'Software Professional'}`,
            profileStrength: 85,
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to load user data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Update Candidate Profile and synchronize user state across all components
  const handleUpdateCandidateProfile = useCallback(
    async (updated: CandidateProfileType & { name?: string; title?: string; email?: string }) => {
      if (!currentUser) return;
      try {
        const response = await api.updateProfile(currentUser.id, updated);
        if (response.user) {
          setCurrentUser(response.user);
        }
        if (response.profile) {
          setCandidateProfile(response.profile);
        }
        showToast('Profile and resume saved to database successfully!', 'success');
      } catch (err: any) {
        console.error('Update profile error in App:', err);
        showToast(err.message || 'Failed to save profile changes.', 'error');
        throw err;
      }
    },
    [currentUser, showToast]
  );

  // Check auth session on startup
  useEffect(() => {
    const checkSession = async () => {
      setIsAuthLoading(true);
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setUserRole(user.role);
          syncRouteFromURL(user);
          await loadUserData(user);
        } else {
          setCurrentUser(null);
          syncRouteFromURL(null);
        }
      } catch (err) {
        console.warn('Session verification note:', err);
        setCurrentUser(null);
        syncRouteFromURL(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkSession();

    // Listen for browser navigation (Back / Forward)
    const handlePopState = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
        if (user) {
          setUserRole(user.role);
          syncRouteFromURL(user);
        } else {
          setJobs([]);
          setApplications([]);
          setCandidateProfile(null);
          syncRouteFromURL(null);
        }
      } catch {
        setCurrentUser(null);
        setJobs([]);
        setApplications([]);
        setCandidateProfile(null);
        syncRouteFromURL(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncRouteFromURL, loadUserData]);

  // Auth Success Handlers
  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    const base = user.role === 'RECRUITER' ? 'recruiter' : 'candidate';
    window.history.pushState(null, '', `/${base}/dashboard`);
    setCurrentTab('dashboard');
    showToast(`Welcome back, ${user.name}!`, 'success');
    await loadUserData(user);
  };

  const handleRegisterSuccess = async (user: User) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    const base = user.role === 'RECRUITER' ? 'recruiter' : 'candidate';
    window.history.pushState(null, '', `/${base}/dashboard`);
    setCurrentTab('dashboard');
    showToast(`Account created successfully! Welcome to HireFlow, ${user.name}.`, 'success');
    await loadUserData(user);
  };

  // Sign-out confirmation handler
  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await api.logout();
      setCurrentUser(null);
      setJobs([]);
      setApplications([]);
      setCandidateProfile(null);
      setIsSignOutModalOpen(false);
      window.history.replaceState(null, '', '/login');
      setIsLoginOpen(true);
      showToast('You have been signed out successfully.', 'info');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setCurrentUser(null);
      setJobs([]);
      setApplications([]);
      setCandidateProfile(null);
      setIsSignOutModalOpen(false);
      window.history.replaceState(null, '', '/login');
      setIsLoginOpen(true);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Job Requisition Actions
  const handleJobCreated = async (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev]);
    showToast(`Job Requisition "${newJob.title}" published successfully!`, 'success');
    if (currentUser) {
      loadUserData(currentUser);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'ARCHIVED') => {
    try {
      if (status === 'CLOSED') {
        const updated = await api.closeJob(jobId);
        setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
        showToast('Job closed. Active applications have been archived and notified.', 'info');
      } else if (status === 'ARCHIVED') {
        const updated = await api.archiveJob(jobId);
        setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
        showToast('Job requisition archived successfully.', 'info');
      } else {
        const updated = await api.updateJob(jobId, { status });
        setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
        showToast(`Job status updated to ${status}`, 'info');
      }

      if (currentUser) {
        await loadUserData(currentUser);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update job status', 'error');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await api.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      showToast('Job requisition archived and removed from active view.', 'info');
      if (currentUser) {
        await loadUserData(currentUser);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to remove job', 'error');
    }
  };

  // Candidate Application Actions
  const handleCandidateApply = async (job: Job, customCoverLetter?: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }

    try {
      const newApp = await api.submitApplication({
        jobId: job.id,
        resumeText: candidateProfile?.resumeText || 'Senior Engineer with full-stack and AI expertise.',
        coverLetter: customCoverLetter,
      });

      setApplications((prev) => [newApp, ...prev]);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, applicantCount: (j.applicantCount || 0) + 1 } : j))
      );
      showToast(`Application for "${job.title}" submitted with AI match score!`, 'success');
    } catch (err: any) {
      console.error('Failed to submit app:', err);
      showToast(err.message || 'Failed to submit application', 'error');
    }
  };

  // Recruiter ATS Actions
  const handleUpdateAppStatus = async (appId: string, status: ApplicationStatus, notes?: string) => {
    try {
      const updated = await api.updateApplicationStatus(appId, {
        status,
        recruiterNotes: notes,
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status, notes: notes || a.notes } : a))
      );
      showToast(`Candidate status updated to ${status}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update candidate status', 'error');
    }
  };

  const handleOpenScheduleInterview = (app: Application) => {
    setSelectedAppForInterview(app);
    setIsScheduleInterviewOpen(true);
  };

  const handleConfirmScheduleInterview = async (
    appId: string,
    details: { date: string; time: string; type: string; notes?: string }
  ) => {
    try {
      const updated = await api.updateApplicationStatus(appId, {
        status: 'INTERVIEWING',
        recruiterNotes: details.notes,
        interviewDate: `${details.date} at ${details.time}`,
        interviewType: details.type,
      });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: 'INTERVIEWING', interviewDetails: details }
            : a
        )
      );
      showToast(`Interview scheduled for ${details.date}! Calendar invite sent.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule interview', 'error');
    }
  };

  // Loading Screen for Session Verification
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">HireFlow.ai</h2>
            <p className="text-xs text-slate-500 mt-1">Connecting to secure recruitment workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
        {/* Unauthenticated Landing / Role Selector */}
        {!currentUser ? (
          <>
            <RoleSelector
              onOpenLogin={(role = 'CANDIDATE') => {
                setModalDefaultRole(role);
                setIsLoginOpen(true);
                setIsRegisterOpen(false);
              }}
              onOpenRegister={(role = 'CANDIDATE') => {
                setModalDefaultRole(role);
                setIsRegisterOpen(true);
                setIsLoginOpen(false);
              }}
            />

            {/* Login Modal */}
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
              defaultRole={modalDefaultRole}
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
            />

            {/* Register Modal */}
            <RegisterModal
              isOpen={isRegisterOpen}
              onClose={() => setIsRegisterOpen(false)}
              defaultRole={modalDefaultRole}
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </>
        ) : (
          <>
            {/* Top Navigation */}
            <Navbar
              currentUser={currentUser}
              userRole={userRole}
              onOpenAIChat={() => setIsAIChatOpen(true)}
              onLogout={() => setIsSignOutModalOpen(true)}
              onOpenProfile={() => {
                navigateTab(userRole === 'RECRUITER' ? 'company' : 'profile');
              }}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
              currentTab={currentTab}
              onSelectTab={navigateTab}
            />

            {/* Main App Container */}
            <div className="flex-1 flex max-w-7xl mx-auto w-full">
              {/* Left Sidebar */}
              <Sidebar
                userRole={userRole}
                currentTab={currentTab}
                onSelectTab={navigateTab}
                openJobModal={() => setIsCreateJobOpen(true)}
                applicantCount={
                  userRole === 'RECRUITER'
                    ? applications.filter((a) => {
                        const job = jobs.find((j) => j.id === a.jobId);
                        return job
                          ? job.status === 'ACTIVE' && job.isActive !== false && a.status !== 'JOB_CLOSED'
                          : a.status !== 'JOB_CLOSED';
                      }).length
                    : applications.length
                }
                activeJobsCount={jobs.filter((j) => j.status === 'ACTIVE' && j.isActive !== false).length}
                onLogout={() => setIsSignOutModalOpen(true)}
              />

              {/* View Content Area */}
              <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto max-w-5xl">
                {/* RECRUITER VIEWS */}
                {userRole === 'RECRUITER' && (
                  <>
                    {currentTab === 'dashboard' && (
                      <RecruiterDashboard
                        jobs={jobs}
                        applications={applications}
                        currentUser={currentUser}
                        onOpenCreateJob={() => setIsCreateJobOpen(true)}
                        onViewAllJobs={() => navigateTab('jobs')}
                        onViewAllApplications={() => navigateTab('applications')}
                        onUpdateAppStatus={handleUpdateAppStatus}
                        onScheduleInterview={handleOpenScheduleInterview}
                      />
                    )}

                    {currentTab === 'jobs' && (
                      <JobsList
                        jobs={jobs}
                        onOpenCreateJob={() => setIsCreateJobOpen(true)}
                        onSelectJobForApplicants={(jobId) => {
                          navigateTab('applications');
                        }}
                        onUpdateJobStatus={handleUpdateJobStatus}
                        onDeleteJob={handleDeleteJob}
                      />
                    )}

                    {currentTab === 'applications' && (
                      <ApplicationsManager
                        applications={applications}
                        jobs={jobs}
                        onUpdateAppStatus={handleUpdateAppStatus}
                        onScheduleInterview={handleOpenScheduleInterview}
                      />
                    )}

                    {currentTab === 'screening' && (
                      <ApplicationsManager
                        applications={applications}
                        jobs={jobs}
                        onUpdateAppStatus={handleUpdateAppStatus}
                        onScheduleInterview={handleOpenScheduleInterview}
                      />
                    )}

                    {currentTab === 'company' && (
                      <CompanyProfile
                        currentUser={currentUser}
                        onSave={(updatedUser) => {
                          if (updatedUser) {
                            setCurrentUser(updatedUser);
                            loadUserData(updatedUser);
                          } else if (currentUser) {
                            loadUserData(currentUser);
                          }
                          showToast('Company profile settings saved to database', 'success');
                        }}
                      />
                    )}
                  </>
                )}

                {/* CANDIDATE VIEWS */}
                {userRole === 'CANDIDATE' && (
                  <>
                    {currentTab === 'dashboard' && (
                      <CandidateDashboard
                        currentUser={currentUser}
                        candidateProfile={candidateProfile}
                        jobs={jobs}
                        applications={applications}
                        onNavigateTab={navigateTab}
                        onSelectJobForDetail={(job) => {
                          setSelectedJobForDetail(job);
                          navigateTab('discover');
                        }}
                      />
                    )}

                    {currentTab === 'discover' && (
                      <JobDiscovery
                        jobs={jobs}
                        appliedJobIds={applications
                          .filter((a) => a.candidateId === currentUser.id || a.candidateEmail === currentUser.email)
                          .map((a) => a.jobId)}
                        onApplyForJob={handleCandidateApply}
                        selectedJob={selectedJobForDetail}
                        onClearSelectedJob={() => setSelectedJobForDetail(null)}
                        currentUser={currentUser}
                        candidateProfile={candidateProfile}
                      />
                    )}

                    {currentTab === 'resume-match' && (
                      <ResumeMatchScanner
                        jobs={jobs}
                        initialResume={candidateProfile?.resumeText}
                        onNavigateTab={navigateTab}
                      />
                    )}

                    {currentTab === 'resume-builder' && (
                      <CandidateResumeBuilder
                        currentUser={currentUser}
                        candidateProfile={candidateProfile}
                      />
                    )}

                    {currentTab === 'applications' && (
                      <CandidateApplications
                        applications={applications}
                        currentUser={currentUser}
                        onExploreJobs={() => navigateTab('discover')}
                      />
                    )}

                    {currentTab === 'profile' && (
                      <CandidateProfile
                        currentUser={currentUser}
                        profile={candidateProfile}
                        onUpdateProfile={handleUpdateCandidateProfile}
                      />
                    )}
                  </>
                )}
              </main>
            </div>

            {/* Recruiter Modals */}
            <CreateJobModal
              isOpen={isCreateJobOpen}
              onClose={() => setIsCreateJobOpen(false)}
              onJobCreated={handleJobCreated}
            />

            <ScheduleInterviewModal
              application={selectedAppForInterview}
              isOpen={isScheduleInterviewOpen}
              onClose={() => {
                setIsScheduleInterviewOpen(false);
                setSelectedAppForInterview(null);
              }}
              onConfirmSchedule={handleConfirmScheduleInterview}
            />

            {/* Gemini AI Chat Copilot Drawer */}
            <AIChatDrawer
              isOpen={isAIChatOpen}
              onClose={() => setIsAIChatOpen(false)}
              userRole={userRole}
            />
          </>
        )}

        {/* Sign Out Confirmation Modal */}
        <SignOutConfirmModal
          isOpen={isSignOutModalOpen}
          isLoading={isSigningOut}
          onClose={() => setIsSignOutModalOpen(false)}
          onConfirmSignOut={handleConfirmSignOut}
        />

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;

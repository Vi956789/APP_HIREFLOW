import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Briefcase,
  ShieldCheck,
  Moon,
  Sun,
  LogIn,
  UserPlus,
  CheckCheck,
} from 'lucide-react';
import { User, UserRole, NotificationItem } from '../../types';
import { api } from '../../services/api';

interface NavbarProps {
  currentUser: User | null;
  userRole?: UserRole;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenAIChat: () => void;
  onLogout?: () => void;
  onOpenProfile?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  userRole,
  onOpenLogin,
  onOpenRegister,
  onOpenAIChat,
  onLogout,
  onOpenProfile,
  darkMode = false,
  onToggleDarkMode,
  currentTab,
  onSelectTab,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const role: UserRole = currentUser?.role || userRole || 'CANDIDATE';

  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      setLoadingNotifications(true);
      const list = await api.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id, currentTab]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    if (onOpenProfile) {
      onOpenProfile();
    } else if (onSelectTab) {
      onSelectTab(role === 'RECRUITER' ? 'company' : 'profile');
    }
  };

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-6">
          <div
            id="navbar-brand-logo"
            onClick={() => onSelectTab && onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                HireFlow<span className="text-blue-600">.ai</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                AI Recruitment & ATS
              </span>
            </div>
          </div>

          {/* Active Workspace Pill for logged-in user */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {role === 'RECRUITER' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {currentUser.companyName || 'Recruiter Workspace'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                </>
              ) : (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Candidate Portal
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}

          {/* AI Copilot Button */}
          <button
            id="navbar-copilot-button"
            onClick={onOpenAIChat}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="hidden sm:inline">AI Copilot</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono">
              3.7
            </span>
          </button>

          {/* Notifications Bell */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => {
                  const nextState = !showNotifications;
                  setShowNotifications(nextState);
                  setShowProfileMenu(false);
                  if (nextState) {
                    loadNotifications();
                  }
                }}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isUnread = !n.isRead && !n.read;
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (isUnread) handleMarkRead(n.id);
                              if (onSelectTab && role === 'CANDIDATE') {
                                onSelectTab('applications');
                                setShowNotifications(false);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                              isUnread ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                                )}
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {n.message || n.description}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-button"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <img
                  src={
                    currentUser.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                    {currentUser.companyName || currentUser.title || (role === 'RECRUITER' ? 'Recruiter' : 'Candidate')}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {currentUser.email}
                    </p>
                    {currentUser.companyName && (
                      <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        {currentUser.companyName}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      {role === 'RECRUITER' ? 'Company Profile' : 'Edit Profile & Resume'}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      id="navbar-sign-out-btn"
                      onClick={handleLogoutClick}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Log In
                </button>
              )}
              {onOpenRegister && (
                <button
                  onClick={onOpenRegister}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Sign Up
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

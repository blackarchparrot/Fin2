import React from 'react';
import { Bot, RefreshCw, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'actions' | 'budgets' | 'goals' | 'audit';
  setActiveTab: (tab: 'overview' | 'actions' | 'budgets' | 'goals' | 'audit') => void;
  pendingActionCount: number;
  currentProfileKey: string;
  onSwitchProfile: (key: string) => void;
  onOpenCopilot: () => void;
  onResetData: () => void;
  avatarSrc: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingActionCount,
  currentProfileKey,
  onSwitchProfile,
  onOpenCopilot,
  onResetData,
  avatarSrc,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('overview');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            FinPilot AI
          </a>
          <span className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
            v1.1 Demo Sandbox
          </span>
        </div>

        {/* Zone 2: 4-5 clean single-line nav tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'overview'
                ? 'text-slate-900 dark:text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Portfolio & Runway
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'actions'
                ? 'text-slate-900 dark:text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Action Review</span>
            {pendingActionCount > 0 && (
              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs px-1.5 py-0.2 rounded-full font-mono">
                {pendingActionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'budgets'
                ? 'text-slate-900 dark:text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Budgets & Limits
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'goals'
                ? 'text-slate-900 dark:text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Savings Goals
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'audit'
                ? 'text-slate-900 dark:text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Agent Audit Log
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Sun/Moon Theme Toggle + Profile Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sun / Moon Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1.5">
            <select
              value={currentProfileKey}
              onChange={(e) => onSwitchProfile(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              title="Switch demo profile"
            >
              <option value="founder">Alex Mercer (Founder)</option>
              <option value="freelancer">Elena Chen (Freelancer)</option>
            </select>

            <button
              onClick={onResetData}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md transition-colors cursor-pointer"
              title="Reset synthetic data to default"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:text-slate-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 rounded-md transition-colors shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Plan with AI Copilot</span>
          </button>

          <img
            src={avatarSrc}
            alt="Profile Avatar"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
        </div>
      </div>
    </header>
  );
};

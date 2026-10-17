import React from 'react';
import { Bot, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'actions' | 'budgets' | 'goals' | 'audit';
  setActiveTab: (tab: 'overview' | 'actions' | 'budgets' | 'goals' | 'audit') => void;
  pendingActionCount: number;
  currentProfileKey: string;
  onSwitchProfile: (key: string) => void;
  onOpenCopilot: () => void;
  onResetData: () => void;
  avatarSrc: string;
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
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('overview');
            }}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap hover:text-emerald-400 transition-colors"
          >
            FinPilot AI
          </a>
          <span className="text-xs text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
            v1.0 Demo Sandbox
          </span>
        </div>

        {/* Zone 2: 4-5 clean single-line nav tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'overview'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Portfolio & Insights
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'actions'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Action Review</span>
            {pendingActionCount > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-1.5 py-0.2 rounded-full font-mono">
                {pendingActionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'budgets'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Budgets & Limits
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'goals'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Savings Goals
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'audit'
                ? 'text-white border-b-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Agent Audit Log
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Profile Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <select
              value={currentProfileKey}
              onChange={(e) => onSwitchProfile(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              title="Switch demo profile"
            >
              <option value="founder">Alex Mercer (Founder)</option>
              <option value="freelancer">Elena Chen (Freelancer)</option>
            </select>

            <button
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-md transition-colors"
              title="Reset synthetic data to default"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Plan with AI Copilot</span>
          </button>

          <img
            src={avatarSrc}
            alt="Profile Avatar"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
          />
        </div>
      </div>
    </header>
  );
};

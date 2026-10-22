import React, { useState } from 'react';
import { ShieldCheck, X, Zap } from 'lucide-react';

interface Props {
  isLiveOpenRouter: boolean;
  modelName: string;
}

export const DemoDisclaimerBanner: React.FC<Props> = ({ isLiveOpenRouter, modelName }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">Competition Safe Sandbox:</span>
          <span>
            Operating with clearly labeled synthetic financial data. Never moves real money or accesses external bank accounts.
          </span>
          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hidden sm:flex">
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Zero-Cost Policy: {isLiveOpenRouter ? `Active (${modelName})` : 'Deterministic Sandbox'}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden lg:inline">
            Inference restricted strictly to zero-cost OpenRouter endpoints
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, Info, X, Zap } from 'lucide-react';

interface Props {
  isLiveOpenRouter: boolean;
  modelName: string;
}

export const DemoDisclaimerBanner: React.FC<Props> = ({ isLiveOpenRouter, modelName }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-emerald-400">Competition Safe Sandbox:</span>
          <span>
            Operating with clearly labeled synthetic financial data. Never moves real money or accesses external bank accounts.
          </span>
          <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5 text-slate-400 hidden sm:flex">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Zero-Cost Policy: {isLiveOpenRouter ? `Active (${modelName})` : 'Deterministic Sandbox'}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px] hidden lg:inline">
            Inference restricted strictly to zero-cost OpenRouter endpoints
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
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

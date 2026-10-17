import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  PiggyBank,
  Calendar,
} from 'lucide-react';
import { FinancialProfile } from '../types/finance';

interface Props {
  profile: FinancialProfile;
  onQuickCopilotPrompt: (prompt: string) => void;
}

export const DashboardOverview: React.FC<Props> = ({ profile, onQuickCopilotPrompt }) => {
  const netCashflow = profile.monthlyIncome - profile.monthlyExpense;
  const isSurplus = netCashflow >= 0;

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Liquid Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Simulated Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            ${profile.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Checking & Liquid Reserve</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">FDIC-Simulated</span>
          </div>
        </div>

        {/* Metric 2: Monthly Income vs Expenses */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Monthly Cash Inflow</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            ${profile.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span>Outflow: ${profile.monthlyExpense.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300">Net: {isSurplus ? `+$${netCashflow.toLocaleString()}` : `-$${Math.abs(netCashflow).toLocaleString()}`}</span>
          </div>
        </div>

        {/* Metric 3: Savings Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Monthly Savings Rate</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {profile.savingsRate.toFixed(1)}%
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>Recommended baseline: 20.0%</span>
          </div>
        </div>

        {/* Metric 4: Runway / Safety Buffer */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Emergency Buffer Runway</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {profile.emergencyFundMonths} Months
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>At current monthly burn of ${profile.monthlyExpense.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Copilot Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">
            Plan with AI Copilot (Plan → Act → Verify → Recover)
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Choose a guided financial prompt or enter custom instructions. FinPilot requires explicit approval before applying any simulated change.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onQuickCopilotPrompt('Analyze my food and entertainment spending and suggest a balanced reallocation.')}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            Rebalance Food Deficit
          </button>
          <button
            onClick={() => onQuickCopilotPrompt('Review my surplus cashflow and propose a safe contribution toward my top savings goal.')}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            Fund Emergency Runway
          </button>
          <button
            onClick={() => onQuickCopilotPrompt('Audit my recurring transactions and detect any inactive or wasteful subscriptions.')}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            Audit Subscriptions
          </button>
        </div>
      </div>
    </div>
  );
};

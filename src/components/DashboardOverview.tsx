import React from 'react';
import {
  TrendingUp,
  Wallet,
  ShieldCheck,
  PiggyBank,
  Hourglass,
  Flame,
} from 'lucide-react';
import { FinancialProfile, SurvivalMetrics } from '../types/finance';
import { calculateSurvivalMetrics } from '../services/agentEngine';

interface Props {
  profile: FinancialProfile;
  onQuickCopilotPrompt: (prompt: string) => void;
}

export const DashboardOverview: React.FC<Props> = ({ profile, onQuickCopilotPrompt }) => {
  const netCashflow = profile.monthlyIncome - profile.monthlyExpense;
  const isSurplus = netCashflow >= 0;
  const metrics: SurvivalMetrics = profile.survivalMetrics || calculateSurvivalMetrics(profile);

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Liquid Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>Total Simulated Balance</span>
            <Wallet className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            ${profile.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Checking & Reserve</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">FDIC-Simulated</span>
          </div>
        </div>

        {/* Metric 2: Monthly Inflow vs Outflow */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>Monthly Cash Inflow</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            ${profile.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Burn: ${profile.monthlyExpense.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
            <span aria-hidden="true">·</span>
            <span className={isSurplus ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'}>
              Net: {isSurplus ? `+$${netCashflow.toLocaleString()}` : `-$${Math.abs(netCashflow).toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Metric 3: Survival Runway Days & Daily Burn */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>Survival Longevity (Zero Income)</span>
            <Hourglass className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {metrics.survivalDaysActual} <span className="text-base font-normal text-slate-500 dark:text-slate-400">Days</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              ${metrics.dailyBurnActual.toFixed(2)}/day
            </span>
            <span aria-hidden="true">·</span>
            <span>Essentials: {metrics.survivalDaysEssentialOnly}d</span>
          </div>
        </div>

        {/* Metric 4: Savings Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>Monthly Savings Rate</span>
            <PiggyBank className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {profile.savingsRate.toFixed(1)}%
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Target buffer: 20.0% · {profile.emergencyFundMonths} Months</span>
          </div>
        </div>
      </div>

      {/* Quick Copilot Action Banner */}
      <div className="bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            Autonomous Copilot Guardrails (Plan → Act → Verify → Recover)
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            FinPilot monitors daily burn velocity and survival days. Require explicit approval before executing any simulated change.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onQuickCopilotPrompt('Analyze my daily burn rate and survival days under sudden job loss. Propose an emergency budget cut.')}
            className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            Survival Mode Analysis
          </button>
          <button
            onClick={() => onQuickCopilotPrompt('Rebalance $100 from underutilized transport allowance to groceries to eliminate budget deficit.')}
            className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            Rebalance Food Deficit
          </button>
          <button
            onClick={() => onQuickCopilotPrompt('Audit active subscriptions and detect recurring leaks with zero scan-in activity.')}
            className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            Audit Subscriptions
          </button>
        </div>
      </div>
    </div>
  );
};

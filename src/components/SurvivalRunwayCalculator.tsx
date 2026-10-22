import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Flame,
  Hourglass,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { FinancialProfile, SurvivalMetrics } from '../types/finance';
import { calculateSurvivalMetrics } from '../services/agentEngine';

interface Props {
  profile: FinancialProfile;
  onTriggerSurvivalAction: (prompt: string) => void;
}

export const SurvivalRunwayCalculator: React.FC<Props> = ({
  profile,
  onTriggerSurvivalAction,
}) => {
  const metrics: SurvivalMetrics = profile.survivalMetrics || calculateSurvivalMetrics(profile);

  // Interactive Stress-testing state
  const [incomeShockPct, setIncomeShockPct] = useState<number>(0); // 0% loss = 100% income, 100% loss = zero income
  const [discretionaryCutPct, setDiscretionaryCutPct] = useState<number>(0);

  // Dynamic simulation math
  const daysInMonth = 30.417;
  const simulatedIncome = profile.monthlyIncome * (1 - incomeShockPct / 100);
  const simulatedDiscretionary = metrics.discretionaryMonthlyExpense * (1 - discretionaryCutPct / 100);
  const simulatedMonthlyExpense = metrics.essentialMonthlyExpense + simulatedDiscretionary;
  const simulatedDailyBurn = Math.max(1, simulatedMonthlyExpense / daysInMonth);

  // If simulatedIncome >= simulatedMonthlyExpense, net cashflow is positive -> sustainable
  const simulatedNet = simulatedIncome - simulatedMonthlyExpense;
  const isSustainable = simulatedNet >= 0;

  // Zero-income survival days under this discretionary cut
  const simulatedZeroIncomeSurvivalDays = Math.floor(profile.totalBalance / simulatedDailyBurn);

  // Days until depletion if in net monthly deficit
  const simulatedDepletionDays = !isSustainable
    ? Math.floor(profile.totalBalance / (Math.abs(simulatedNet) / daysInMonth))
    : null;

  const daysGainedFromCut = Math.max(0, simulatedZeroIncomeSurvivalDays - metrics.survivalDaysActual);

  const getStatusBadge = (days: number) => {
    if (days >= 180) {
      return {
        label: 'Fortress Secure (6+ Months)',
        color: 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40',
      };
    }
    if (days >= 120) {
      return {
        label: 'Stable Buffer (4-6 Months)',
        color: 'text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40',
      };
    }
    if (days >= 60) {
      return {
        label: 'Caution (2-4 Months)',
        color: 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40',
      };
    }
    return {
      label: 'Critical Runway (< 60 Days)',
      color: 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40',
    };
  };

  const statusInfo = getStatusBadge(metrics.survivalDaysActual);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs transition-colors">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Cash Runway & Survival Days Engine
            </h2>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>Dynamic Burn Rate Modeling</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Income Catastrophe Resistance</span>
            <span aria-hidden="true">·</span>
            <span>Budget Ceiling Pacing</span>
          </div>
        </div>

        <button
          onClick={() =>
            onTriggerSurvivalAction(
              'Analyze my survival days and activate an emergency budget trim to extend zero-income runway.'
            )
          }
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Extend Survival with AI</span>
        </button>
      </div>

      {/* Main 3 Pillar Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Card 1: Actual Pacing Survival */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-md p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Actual Pacing Survival</span>
              <Hourglass className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {metrics.survivalDaysActual}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Days</span>
            </div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1">
              Burn: ${metrics.dailyBurnActual.toFixed(2)}/day
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-850 pt-2">
            Based on current monthly outflow of ${profile.monthlyExpense.toLocaleString()} under sudden 0% income.
          </div>
        </div>

        {/* Card 2: Budget Plan Ceiling Survival */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-md p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Budget Plan Ceiling Survival</span>
              <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {metrics.survivalDaysBudget}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Days</span>
            </div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1">
              Budget Max: ${metrics.dailyBurnBudget.toFixed(2)}/day
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-850 pt-2">
            If you spend 100% of every allocated category ceiling every month.
          </div>
        </div>

        {/* Card 3: Essential-Only Survival Mode */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-md p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Survival Mode (Essentials Only)</span>
              <ShieldCheck className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {metrics.survivalDaysEssentialOnly}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Days</span>
            </div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1">
              Essential Burn: ${metrics.dailyEssentialBurn.toFixed(2)}/day
            </div>
          </div>
          <div className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium border-t border-slate-200 dark:border-slate-850 pt-2">
            +{metrics.survivalDaysEssentialOnly - metrics.survivalDaysActual} days gained by pausing non-essentials.
          </div>
        </div>
      </div>

      {/* Interactive Stress-Testing & Simulation Section */}
      <div className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Interactive Runway Stress-Tester
            </h3>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Liquid Reserve: ${profile.totalBalance.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Income Shock */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Simulate Income Disruption
              </span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">
                {incomeShockPct === 0
                  ? 'Normal (0% drop)'
                  : incomeShockPct === 100
                  ? 'Zero Income (-100%)'
                  : `-${incomeShockPct}% Income`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="25"
              value={incomeShockPct}
              onChange={(e) => setIncomeShockPct(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>100% Inflow (${profile.monthlyIncome.toLocaleString()})</span>
              <span>50% Drop</span>
              <span>Complete Stoppage ($0)</span>
            </div>
          </div>

          {/* Slider 2: Discretionary Expense Trim */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Trim Discretionary Overhead
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {discretionaryCutPct === 0 ? 'No Cuts (0%)' : `-${discretionaryCutPct}% Discretionary`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={discretionaryCutPct}
              onChange={(e) => setDiscretionaryCutPct(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Standard Spend</span>
              <span>Saves ${(metrics.discretionaryMonthlyExpense * (discretionaryCutPct / 100)).toFixed(0)}/mo</span>
              <span>100% Freeze</span>
            </div>
          </div>
        </div>

        {/* Dynamic Simulation Result Card */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Simulated Scenario Outcome:
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {isSustainable
                  ? 'Sustainable Indefinitely'
                  : `${simulatedDepletionDays ?? simulatedZeroIncomeSurvivalDays} Days Until Depletion`}
              </span>
              {!isSustainable && (
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  (${simulatedDailyBurn.toFixed(2)}/day burn)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              {isSustainable
                ? `Simulated net surplus: +$${simulatedNet.toFixed(0)}/mo safely reinforces your liquid balance.`
                : incomeShockPct === 100
                ? `Zero income catastrophe: Your $${profile.totalBalance.toLocaleString()} reserve lasts ${simulatedZeroIncomeSurvivalDays} days (${daysGainedFromCut > 0 ? `+${daysGainedFromCut} days gained from discretionary trim` : 'baseline'}).`
                : `Net deficit of -$${Math.abs(simulatedNet).toFixed(0)}/mo depletes current balance in ${simulatedDepletionDays} days.`}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setIncomeShockPct(0);
                setDiscretionaryCutPct(0);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-1 transition-colors"
            >
              Reset Slider
            </button>
            <button
              onClick={() =>
                onTriggerSurvivalAction(
                  `Optimize my daily burn rate: Trim discretionary expenses by ${discretionaryCutPct > 0 ? discretionaryCutPct : 40}% to extend survival runway to at least ${simulatedZeroIncomeSurvivalDays + 30} days.`
                )
              }
              className="text-xs font-semibold px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Apply in Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

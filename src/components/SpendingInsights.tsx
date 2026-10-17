import React from 'react';
import { Lightbulb, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FinancialInsight, FinancialProfile } from '../types/finance';

interface Props {
  profile: FinancialProfile;
  onSelectInsight: (insight: FinancialInsight) => void;
}

export const SpendingInsights: React.FC<Props> = ({ profile, onSelectInsight }) => {
  // Compute category breakdown percentage
  const totalSpent = profile.budgets.reduce((acc, b) => acc + b.spent, 0);

  const sortedCategories = [...profile.budgets]
    .filter((b) => b.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-6">
      {/* Financial Insights List */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Active Financial Copilot Insights</h2>
            <div className="text-xs text-slate-400 mt-1">
              Deterministic audits & opportunity detection based on synthetic cashflow
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {profile.insights.length} Signals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {profile.insights.map((ins) => {
            const isWarning = ins.type === 'warning';
            return (
              <div
                key={ins.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-md p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-white">{ins.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Impact: {ins.impactScore}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {ins.description}
                  </p>
                </div>

                {ins.actionRecommendation && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => onSelectInsight(ins)}
                      className="w-full flex items-center justify-between text-left text-xs text-emerald-400 hover:text-emerald-300 font-medium group transition-colors"
                    >
                      <span className="line-clamp-2">{ins.actionRecommendation}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Spending Breakdown by Category */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Spending Categorization Breakdown</h3>

        {/* Multi-segment visual bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 mb-6">
          {sortedCategories.map((cat, idx) => {
            const pct = totalSpent > 0 ? (cat.spent / totalSpent) * 100 : 0;
            const colors = [
              'bg-emerald-500',
              'bg-teal-500',
              'bg-cyan-500',
              'bg-indigo-500',
              'bg-violet-500',
              'bg-amber-500',
              'bg-rose-500',
              'bg-slate-500',
            ];
            const colorClass = colors[idx % colors.length];
            return (
              <div
                key={cat.category}
                style={{ width: `${pct}%` }}
                className={`${colorClass} h-full transition-all`}
                title={`${cat.category}: $${cat.spent.toLocaleString()} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sortedCategories.map((cat, idx) => {
            const pct = totalSpent > 0 ? (cat.spent / totalSpent) * 100 : 0;
            return (
              <div
                key={cat.category}
                className="bg-slate-950/40 border border-slate-850 p-2.5 rounded text-xs flex items-center justify-between"
              >
                <div className="truncate mr-2">
                  <div className="text-slate-300 truncate font-medium">{cat.category}</div>
                  <div className="text-slate-400 text-[11px] font-mono tabular-nums">
                    {pct.toFixed(1)}% of spend
                  </div>
                </div>
                <div className="text-right font-mono font-semibold text-white tabular-nums shrink-0">
                  ${cat.spent.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

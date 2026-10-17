import React, { useState } from 'react';
import { SlidersHorizontal, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { CategoryBudget, TransactionCategory } from '../types/finance';

interface Props {
  budgets: CategoryBudget[];
  onUpdateBudget: (category: TransactionCategory, newAllocated: number) => void;
  onAskCopilotAboutCategory: (category: TransactionCategory) => void;
}

export const CategoryBudgets: React.FC<Props> = ({
  budgets,
  onUpdateBudget,
  onAskCopilotAboutCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  const startEdit = (b: CategoryBudget) => {
    setEditingCategory(b.category);
    setEditAmount(b.allocated.toString());
  };

  const handleSaveEdit = (category: TransactionCategory) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(category, val);
    }
    setEditingCategory(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Category Budgets & Spending Limits</h2>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Total Planned: ${totalAllocated.toLocaleString()}</span>
            <span aria-hidden="true">·</span>
            <span>Spent: ${totalSpent.toLocaleString()}</span>
            <span aria-hidden="true">·</span>
            <span>Remaining: ${(totalAllocated - totalSpent).toLocaleString()}</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Monthly Billing Cycle
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {budgets.map((b) => {
          const ratio = b.allocated > 0 ? (b.spent / b.allocated) * 100 : 0;
          const isOver = b.spent > b.allocated;
          const isWarning = ratio >= 85 && !isOver;
          const remaining = b.allocated - b.spent;

          return (
            <div
              key={b.category}
              className="bg-slate-950/60 border border-slate-800/80 rounded-md p-4 transition-colors hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200">{b.category}</span>
                <div className="flex items-center gap-2">
                  {isOver ? (
                    <span className="flex items-center gap-1 text-xs text-rose-400 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Over by ${Math.abs(remaining).toFixed(0)}
                    </span>
                  ) : isWarning ? (
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Near limit
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      On track
                    </span>
                  )}
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(ratio, 100)}%` }}
                />
              </div>

              {/* Numbers and actions */}
              <div className="flex items-center justify-between text-xs mt-3">
                <div className="text-slate-400 font-mono tabular-nums">
                  <span className="text-white font-semibold">${b.spent.toLocaleString()}</span> /{' '}
                  {editingCategory === b.category ? (
                    <span className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-16 bg-slate-800 border border-slate-700 text-white px-1.5 py-0.5 rounded text-xs"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(b.category)}
                        className="text-emerald-400 hover:text-emerald-300 text-[11px] underline"
                      >
                        Save
                      </button>
                    </span>
                  ) : (
                    <span>${b.allocated.toLocaleString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEdit(b)}
                    className="text-slate-400 hover:text-slate-200 text-xs transition-colors"
                  >
                    Adjust
                  </button>
                  <span className="text-slate-700" aria-hidden="true">·</span>
                  <button
                    onClick={() => onAskCopilotAboutCategory(b.category)}
                    className="text-emerald-400 hover:text-emerald-300 text-xs transition-colors"
                  >
                    Ask Copilot
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

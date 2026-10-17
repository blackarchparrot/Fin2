import React, { useState } from 'react';
import { Target, Plus, CheckCircle, ArrowUpRight } from 'lucide-react';
import { SavingsGoal } from '../types/finance';

interface Props {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onAskCopilotToFundGoal: (goal: SavingsGoal) => void;
}

export const SavingsGoals: React.FC<Props> = ({
  goals,
  onAddGoal,
  onAskCopilotToFundGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('2027-01-01');
  const [category, setCategory] = useState<'emergency' | 'investment' | 'purchase' | 'travel'>('emergency');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    if (!name || isNaN(target) || target <= 0) return;

    onAddGoal({
      name,
      targetAmount: target,
      currentAmount: current,
      deadline,
      category,
      priority,
    });

    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setShowAddModal(false);
  };

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const aggregatePercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Autonomous Savings Goals</h2>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Total Target: ${totalTarget.toLocaleString()}</span>
            <span aria-hidden="true">·</span>
            <span>Current Saved: ${totalSaved.toLocaleString()} ({aggregatePercentage.toFixed(1)}%)</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {goals.map((goal) => {
          const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const shortfall = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="bg-slate-950/60 border border-slate-800/80 rounded-md p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{goal.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono capitalize">
                    {goal.priority} Priority
                  </span>
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  Target Date: <span className="font-mono">{goal.deadline}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-3">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-white font-medium">${goal.currentAmount.toLocaleString()}</span>
                  <span className="text-slate-400">${goal.targetAmount.toLocaleString()} ({pct.toFixed(1)}%)</span>
                </div>

                <div className="text-[11px] text-slate-400 mt-2">
                  Remaining shortfall: ${shortfall.toLocaleString()}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                <button
                  onClick={() => onAskCopilotToFundGoal(goal)}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <span>Propose Copilot Allocation</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-white mb-4">Create Simulated Savings Goal</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Down Payment or Travel Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="10000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Saved ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="emergency">Emergency</option>
                    <option value="investment">Investment</option>
                    <option value="purchase">Purchase</option>
                    <option value="travel">Travel</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

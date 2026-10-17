import React, { useState } from 'react';
import { Search, Plus, Filter, MessageSquare, Tag } from 'lucide-react';
import { Transaction, TransactionCategory } from '../types/finance';

interface Props {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onAskCopilotAboutTransaction: (tx: Transaction) => void;
}

export const TransactionList: React.FC<Props> = ({
  transactions,
  onAddTransaction,
  onAskCopilotAboutTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New tx form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<TransactionCategory>('Groceries & Dining');
  const [isRecurring, setIsRecurring] = useState(false);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!description || isNaN(val) || val <= 0) return;

    onAddTransaction({
      date: new Date().toISOString().split('T')[0],
      description,
      amount: val,
      type,
      category,
      isRecurring,
      status: 'cleared',
    });

    setDescription('');
    setAmount('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Recent Financial Transactions</h2>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Synthetic Ledger</span>
            <span aria-hidden="true">·</span>
            <span>{transactions.length} Total Records</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 my-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transactions by merchant, description, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="ALL">All Categories</option>
          <option value="Housing & Rent">Housing & Rent</option>
          <option value="Groceries & Dining">Groceries & Dining</option>
          <option value="Software & Subscriptions">Software & Subscriptions</option>
          <option value="Utilities & Internet">Utilities & Internet</option>
          <option value="Transport & Travel">Transport & Travel</option>
          <option value="Health & Wellness">Health & Wellness</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Salary & Revenue">Salary & Revenue</option>
          <option value="Investments & Dividends">Investments & Dividends</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No transactions match the filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-mono whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{tx.description}</div>
                      {tx.notes && <div className="text-[11px] text-slate-400 mt-0.5">{tx.notes}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      <span>{tx.category}</span>
                      {tx.isRecurring && (
                        <span className="ml-1.5 text-[10px] text-slate-400 font-mono">
                          (Recurring)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 capitalize whitespace-nowrap">
                      {tx.status}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                        isIncome ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isIncome ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onAskCopilotAboutTransaction(tx)}
                        className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] transition-colors"
                        title="Ask Copilot about this transaction"
                      >
                        Ask Copilot
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-white mb-4">Add Simulated Transaction</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Merchant</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloudflare DNS or Trader Joe's"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    placeholder="45.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Housing & Rent">Housing & Rent</option>
                  <option value="Groceries & Dining">Groceries & Dining</option>
                  <option value="Software & Subscriptions">Software & Subscriptions</option>
                  <option value="Utilities & Internet">Utilities & Internet</option>
                  <option value="Transport & Travel">Transport & Travel</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Salary & Revenue">Salary & Revenue</option>
                  <option value="Investments & Dividends">Investments & Dividends</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="recurringCheck" className="text-xs text-slate-300">
                  Mark as recurring monthly charge
                </label>
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

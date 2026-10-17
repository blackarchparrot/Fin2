import React, { useState } from 'react';
import {
  Bot,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { AgentApiResponse } from '../services/apiClient';
import { AgentPlanStep, FinancialProfile, ProposedAction } from '../types/finance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: FinancialProfile;
  initialPrompt?: string;
  onRequestPlan: (prompt: string) => Promise<AgentApiResponse>;
  onStageProposedAction: (action: ProposedAction) => void;
  onSwitchToReviewTab: () => void;
}

export const AgentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  initialPrompt = '',
  onRequestPlan,
  onStageProposedAction,
  onSwitchToReviewTab,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AgentApiResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await onRequestPlan(prompt.trim());
      setCurrentResponse(response);
      onStageProposedAction(response.proposedAction);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete agent plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                FinPilot Autonomous Copilot
              </h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>Plan → Act → Verify → Recover</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">Zero-Cost Policy Compliant</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Preset Prompts */}
          <div>
            <div className="text-xs text-slate-400 mb-2">Suggested Copilot Actions:</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset('Reallocate $100 from underutilized Transport budget into Groceries to prevent month-end overrun.')
                }
                className="text-xs px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition-colors text-left"
              >
                Rebalance Food Deficit
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset('Analyze liquid cashflow and recommend a safe allocation to my Emergency Runway goal.')
                }
                className="text-xs px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition-colors text-left"
              >
                Fund Emergency Runway
              </button>
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset('Audit active subscriptions and flag recurring items with zero utilization.')
                }
                className="text-xs px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition-colors text-left"
              >
                Audit Subscriptions
              </button>
            </div>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask FinPilot to analyze your portfolio, simulate a budget shift, or plan a savings transfer..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Requires explicit human approval prior to execution</span>
              </div>

              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded transition-colors ${
                  loading || !prompt.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 cursor-pointer'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Invariants...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Generate Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Plan Generation Interrupted:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* Agent Results Display */}
          {currentResponse && (
            <div className="space-y-4 pt-2">
              {/* Provider & Model status badge */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Engine: {currentResponse.provider}</span>
                </div>
                <span className="font-mono text-[11px]">
                  Model: {currentResponse.model}
                </span>
              </div>

              {/* Rationale */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-slate-300 mb-1">
                  Copilot Analysis & Strategy
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {currentResponse.rationale}
                </p>
              </div>

              {/* 4-Step Plan Visualization */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <div className="text-xs font-semibold text-slate-300 mb-3">
                  Autonomous Plan Lifecycle (Plan → Act → Verify → Recover)
                </div>

                <div className="space-y-3">
                  {currentResponse.planSteps.map((step) => {
                    return (
                      <div
                        key={step.stepNumber}
                        className="flex items-start gap-3 text-xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-[11px] text-slate-300 shrink-0 mt-0.5">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">{step.title}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {step.phase}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {step.detail}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proposed Action Callout */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-emerald-300">
                    Proposed Action Queued for Human Review
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">
                    {currentResponse.proposedAction.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {currentResponse.proposedAction.validationRules.length} Safety Invariant checks performed
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToReviewTab();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300 rounded transition-colors shrink-0"
                >
                  <span>Review & Approve</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

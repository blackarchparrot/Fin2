import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ProposedAction } from '../types/finance';

interface Props {
  actions: ProposedAction[];
  onApproveAction: (actionId: string) => void;
  onRejectAction: (actionId: string, reason: string) => void;
  onDismissAction: (actionId: string) => void;
}

export const ProposedActionReview: React.FC<Props> = ({
  actions,
  onApproveAction,
  onRejectAction,
  onDismissAction,
}) => {
  const pendingActions = actions.filter((a) => a.status === 'PROPOSED');
  const pastActions = actions.filter((a) => a.status !== 'PROPOSED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Proposed-Action Review (Human-in-the-Loop Gate)
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>Zero Silent Changes</span>
              <span aria-hidden="true">·</span>
              <span>Explicit Approval Required Before State Mutation</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {pendingActions.length} Pending Review
          </div>
        </div>

        {/* Pending Actions Section */}
        <div className="mt-6 space-y-6">
          {pendingActions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <ShieldCheck className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">No actions awaiting human approval</div>
              <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Ask FinPilot Copilot or click an insight recommendation to formulate a new verified action plan.
              </div>
            </div>
          ) : (
            pendingActions.map((action) => {
              return (
                <div
                  key={action.id}
                  className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg p-5 transition-all shadow-xs"
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">
                          Action Proposal
                        </span>
                        <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">·</span>
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                          {action.type}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                        {action.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                        Risk: {action.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Two column: Intended Action & Expected Effect */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded p-3.5">
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Intended Action
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded p-3.5">
                      <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                        Expected Effect & Projection
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {action.expectedEffect}
                      </p>
                    </div>
                  </div>

                  {/* Validation Rules Checklist */}
                  <div className="mb-5">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Automated Safety Guardrails & Validation Rules:
                    </div>
                    <div className="space-y-1.5">
                      {action.validationRules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs bg-white dark:bg-slate-900/40 p-2.5 rounded border border-slate-200 dark:border-slate-850"
                        >
                          {rule.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {rule.ruleName}:
                            </span>{' '}
                            <span className={rule.passed ? 'text-slate-600 dark:text-slate-400' : 'text-rose-600 dark:text-rose-300'}>
                              {rule.message}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-850">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Simulated change only. No external banking credentials or real money movement.
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onRejectAction(
                            action.id,
                            'User declined proposal during verification review.'
                          )
                        }
                        className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded transition-colors cursor-pointer"
                      >
                        Reject & Recover
                      </button>

                      <button
                        onClick={() => onApproveAction(action.id)}
                        disabled={!action.allRulesPassed}
                        className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors ${
                          action.allRulesPassed
                            ? 'text-white bg-emerald-600 hover:bg-emerald-700 dark:text-slate-950 dark:bg-emerald-400 dark:hover:bg-emerald-300 cursor-pointer shadow-xs'
                            : 'text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 cursor-not-allowed'
                        }`}
                      >
                        {action.allRulesPassed
                          ? 'Approve & Execute (Simulated)'
                          : 'Blocked by Safety Invariant'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Past Executed / Rejected Actions Audit */}
      {pastActions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs transition-colors">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Recent Action Decisions
          </h3>
          <div className="space-y-3">
            {pastActions.slice(0, 5).map((act) => {
              const isApproved = act.status === 'APPROVED';
              const isRejected = act.status === 'REJECTED';
              return (
                <div
                  key={act.id}
                  className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 p-3 rounded flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-4">
                    <div className="text-slate-900 dark:text-slate-200 font-medium">{act.title}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      {isApproved && 'Approved and executed in synthetic ledger'}
                      {isRejected && `Rejected: ${act.rejectionReason || 'User decline'}`}
                      {act.status === 'FAILED_RECOVERED' && `Aborted: ${act.recoveryNote}`}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                        isApproved
                          ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
                          : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800'
                      }`}
                    >
                      {act.status}
                    </span>
                    <button
                      onClick={() => onDismissAction(act.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs cursor-pointer"
                      title="Clear from view"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

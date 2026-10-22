import React from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { AgentExecutionLog } from '../types/finance';

interface Props {
  logs: AgentExecutionLog[];
  onClearLogs: () => void;
}

export const AgentAuditLog: React.FC<Props> = ({ logs, onClearLogs }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            Immutable Agent Audit Trail & Safety Log
          </h2>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>Server Invariant Verification</span>
            <span aria-hidden="true">·</span>
            <span>Plan → Act → Verify → Recover Telemetry</span>
          </div>
        </div>

        <button
          onClick={onClearLogs}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          Clear Display History
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No agent executions logged yet. Use the Copilot or approve a proposed action to create an audit record.
          </div>
        ) : (
          logs.map((log) => {
            const isSuccess = log.verificationOutcome === 'VERIFIED_SUCCESS';
            const isRecovered = log.verificationOutcome === 'RECOVERED_SAFELY';
            const isRejected = log.verificationOutcome === 'REJECTED_BY_USER';
            const isFailed = log.verificationOutcome === 'FAILED_VALIDATION';

            return (
              <div
                key={log.id}
                className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-850 rounded-lg p-4 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-850">
                  <div className="flex items-center gap-2">
                    {isSuccess && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Executed & Verified
                      </span>
                    )}
                    {isRejected && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <XCircle className="w-3.5 h-3.5" />
                        Declined by User
                      </span>
                    )}
                    {(isRecovered || isFailed) && (
                      <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Safely Recovered
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] block">
                      Context / Prompt:
                    </span>
                    <span className="text-slate-800 dark:text-slate-300 font-medium">{log.userPrompt}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] block">
                      Plan Formulated:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{log.planSummary}</span>
                  </div>
                </div>

                {log.actionTaken && (
                  <div className="mt-2 text-slate-600 dark:text-slate-400">
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mr-1">Action:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{log.actionTaken}</span>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-900 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span className="font-mono text-slate-500 dark:text-slate-400 mr-1">Verification Note:</span>
                  <span>{log.notes}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

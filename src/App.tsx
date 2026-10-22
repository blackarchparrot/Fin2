import React, { useEffect, useState } from 'react';
import { INITIAL_SYNTHETIC_PROFILES } from './data/mockData';
import {
  ActionPayload,
  AgentExecutionLog,
  FinancialInsight,
  FinancialProfile,
  ProposedAction,
  SavingsGoal,
  Transaction,
  TransactionCategory,
} from './types/finance';
import {
  calculateSurvivalMetrics,
  executeSimulatedAction,
  validateAction,
} from './services/agentEngine';
import {
  checkServerHealth,
  requestAgentPlan,
  HealthCheckResult,
} from './services/apiClient';
import { Navbar } from './components/Navbar';
import { DemoDisclaimerBanner } from './components/DemoDisclaimerBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { SurvivalRunwayCalculator } from './components/SurvivalRunwayCalculator';
import { CategoryBudgets } from './components/CategoryBudgets';
import { SavingsGoals } from './components/SavingsGoals';
import { TransactionList } from './components/TransactionList';
import { SpendingInsights } from './components/SpendingInsights';
import { ProposedActionReview } from './components/ProposedActionReview';
import { AgentModal } from './components/AgentModal';
import { AgentAuditLog } from './components/AgentAuditLog';
import userAvatarImg from './assets/images/avatar_finpilot_user_1792222787388.jpg';

export default function App() {
  // Theme state: dark | light, persisted in localStorage
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finpilot-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark'; // default to dark
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('finpilot-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [profileKey, setProfileKey] = useState<string>('founder');
  const [profile, setProfile] = useState<FinancialProfile>(() => {
    const initial = JSON.parse(JSON.stringify(INITIAL_SYNTHETIC_PROFILES.founder));
    initial.survivalMetrics = calculateSurvivalMetrics(initial);
    return initial;
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'budgets' | 'goals' | 'audit'>('overview');
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');

  // Server health state
  const [serverHealth, setServerHealth] = useState<HealthCheckResult | null>(null);

  // Proposed Actions list
  const [proposedActions, setProposedActions] = useState<ProposedAction[]>(() => {
    // Initialize with a realistic verified proposed action from initial insights
    const samplePayload: ActionPayload = {
      sourceCategory: 'Transport & Travel',
      targetCategory: 'Groceries & Dining',
      amount: 100,
      reason: 'Rebalance mid-month grocery variance from underutilized transport allowance.',
    };
    const rules = validateAction(INITIAL_SYNTHETIC_PROFILES.founder, 'REALLOCATE_BUDGET', samplePayload);
    return [
      {
        id: 'prop-init-1',
        timestamp: new Date().toISOString(),
        type: 'REALLOCATE_BUDGET',
        title: 'Reallocate $100 from Transport to Groceries & Dining',
        description: 'Shift $100 in unused travel budget to absorb recent groceries deficit without increasing overall burn.',
        expectedEffect: 'Groceries allocation increases to $950.00; Transport allocation adjusts to $350.00.',
        payload: samplePayload,
        validationRules: rules,
        allRulesPassed: rules.every((r) => r.passed),
        riskLevel: 'LOW',
        status: 'PROPOSED',
      },
    ];
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AgentExecutionLog[]>(() => [
    {
      id: 'log-seed-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userPrompt: 'System initialization & synthetic profile baseline load',
      planSummary: 'Loaded synthetic portfolio for Alex Mercer (Founder). Baseline survival longevity calibrated at 163 days.',
      verificationOutcome: 'VERIFIED_SUCCESS',
      notes: 'Initial ledger state calibrated. Ready for human-in-the-loop autonomous suggestions.',
    },
  ]);

  // Check server health on mount
  useEffect(() => {
    checkServerHealth().then((res) => {
      if (res) {
        setServerHealth(res);
      }
    });
  }, []);

  // Switch demo profile
  const handleSwitchProfile = (key: string) => {
    if (INITIAL_SYNTHETIC_PROFILES[key]) {
      setProfileKey(key);
      const newProf = JSON.parse(JSON.stringify(INITIAL_SYNTHETIC_PROFILES[key]));
      newProf.survivalMetrics = calculateSurvivalMetrics(newProf);
      setProfile(newProf);
    }
  };

  // Reset data to defaults
  const handleResetData = () => {
    const template = INITIAL_SYNTHETIC_PROFILES[profileKey] || INITIAL_SYNTHETIC_PROFILES.founder;
    const fresh = JSON.parse(JSON.stringify(template));
    fresh.survivalMetrics = calculateSurvivalMetrics(fresh);
    setProfile(fresh);
  };

  // Open copilot with specific prompt
  const handleOpenCopilot = (prompt = '') => {
    setCopilotInitialPrompt(prompt);
    setCopilotOpen(true);
  };

  // Stage a new proposed action from copilot
  const handleStageProposedAction = (action: ProposedAction) => {
    setProposedActions((prev) => [action, ...prev]);
  };

  // Approve and execute proposed action
  const handleApproveAction = (actionId: string) => {
    const targetAction = proposedActions.find((a) => a.id === actionId);
    if (!targetAction) return;

    const result = executeSimulatedAction(profile, targetAction);

    if (result.success) {
      setProfile(result.updatedProfile);
      setProposedActions((prev) =>
        prev.map((a) => (a.id === actionId ? { ...a, status: 'APPROVED' } : a))
      );

      // Add to immutable audit log
      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userPrompt: `Explicit Human Approval: "${targetAction.title}"`,
          planSummary: targetAction.description,
          actionTaken: targetAction.title,
          verificationOutcome: 'VERIFIED_SUCCESS',
          notes: result.message,
        },
        ...prev,
      ]);
    } else {
      // Failed verification -> safe recovery
      setProposedActions((prev) =>
        prev.map((a) =>
          a.id === actionId
            ? { ...a, status: 'FAILED_RECOVERED', recoveryNote: result.message }
            : a
        )
      );

      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userPrompt: `Attempted Action: "${targetAction.title}"`,
          planSummary: targetAction.description,
          actionTaken: 'EXECUTION_ABORTED',
          verificationOutcome: 'FAILED_VALIDATION',
          notes: `Safe recovery triggered: ${result.message}`,
        },
        ...prev,
      ]);
    }
  };

  // Reject proposed action
  const handleRejectAction = (actionId: string, reason: string) => {
    const targetAction = proposedActions.find((a) => a.id === actionId);
    if (!targetAction) return;

    setProposedActions((prev) =>
      prev.map((a) =>
        a.id === actionId
          ? { ...a, status: 'REJECTED', rejectionReason: reason }
          : a
      )
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userPrompt: `User rejected proposed plan: "${targetAction.title}"`,
        planSummary: targetAction.description,
        actionTaken: 'NO_CHANGES_APPLIED',
        verificationOutcome: 'REJECTED_BY_USER',
        notes: `User declined plan. Ledger state remains completely untouched. Reason: ${reason}`,
      },
      ...prev,
    ]);
  };

  // Dismiss an action from view
  const handleDismissAction = (actionId: string) => {
    setProposedActions((prev) => prev.filter((a) => a.id !== actionId));
  };

  // Direct manual budget update
  const handleUpdateBudget = (category: TransactionCategory, newAllocated: number) => {
    setProfile((prev) => {
      const updated = { ...prev };
      const b = updated.budgets.find((item) => item.category === category);
      if (b) {
        b.allocated = newAllocated;
      }
      updated.survivalMetrics = calculateSurvivalMetrics(updated);
      return { ...updated };
    });
  };

  // Add simulated transaction
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-user-${Date.now()}`,
    };

    setProfile((prev) => {
      const updated: FinancialProfile = JSON.parse(JSON.stringify(prev));
      updated.transactions.unshift(tx);

      if (tx.type === 'expense') {
        updated.totalBalance -= tx.amount;
        const b = updated.budgets.find((item) => item.category === tx.category);
        if (b) b.spent += tx.amount;
      } else {
        updated.totalBalance += tx.amount;
      }

      updated.survivalMetrics = calculateSurvivalMetrics(updated);
      return updated;
    });
  };

  // Add savings goal
  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const goal: SavingsGoal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
    };
    setProfile((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, goal],
    }));
  };

  // Handle insight click
  const handleSelectInsight = (insight: FinancialInsight) => {
    if (insight.actionRecommendation) {
      handleOpenCopilot(
        `Execute insight recommendation: ${insight.actionRecommendation}. Check all safety rules and stage a proposed action.`
      );
    }
  };

  const pendingCount = proposedActions.filter((a) => a.status === 'PROPOSED').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Disclaimer Banner */}
      <DemoDisclaimerBanner
        isLiveOpenRouter={Boolean(serverHealth?.hasServerApiKey)}
        modelName={serverHealth?.configuredModel || 'openrouter/free'}
      />

      {/* Top Bar Navigation with Sun/Moon theme toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingActionCount={pendingCount}
        currentProfileKey={profileKey}
        onSwitchProfile={handleSwitchProfile}
        onOpenCopilot={() => handleOpenCopilot()}
        onResetData={handleResetData}
        avatarSrc={userAvatarImg}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Context Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="text-slate-900 dark:text-white font-medium">{profile.name}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Currency: {profile.currency}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Simulated Safe Environment</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Inference Mode:</span>
            <span className="text-slate-700 dark:text-slate-200 font-mono">
              {serverHealth?.hasServerApiKey
                ? `OpenRouter Free (${serverHealth.configuredModel})`
                : 'Deterministic Copilot (Zero-Cost Safe Demo)'}
            </span>
          </div>
        </div>

        {/* Tab 1: Overview & Portfolio */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <DashboardOverview
              profile={profile}
              onQuickCopilotPrompt={(prompt) => handleOpenCopilot(prompt)}
            />

            {/* Survival & Cash Runway Calculator Engine */}
            <SurvivalRunwayCalculator
              profile={profile}
              onTriggerSurvivalAction={(prompt) => handleOpenCopilot(prompt)}
            />

            <SpendingInsights
              profile={profile}
              onSelectInsight={handleSelectInsight}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CategoryBudgets
                budgets={profile.budgets}
                onUpdateBudget={handleUpdateBudget}
                onAskCopilotAboutCategory={(category) =>
                  handleOpenCopilot(
                    `Analyze our spending in "${category}". Are we pacing appropriately, and should we adjust the ceiling?`
                  )
                }
              />

              <SavingsGoals
                goals={profile.savingsGoals}
                onAddGoal={handleAddGoal}
                onAskCopilotToFundGoal={(goal) =>
                  handleOpenCopilot(
                    `Calculate safe contribution amount from checking surplus to "${goal.name}". Check liquidity constraints.`
                  )
                }
              />
            </div>

            <TransactionList
              transactions={profile.transactions}
              onAddTransaction={handleAddTransaction}
              onAskCopilotAboutTransaction={(tx) =>
                handleOpenCopilot(
                  `Review transaction "${tx.description}" ($${tx.amount.toFixed(2)}, ${tx.category}). Is this categorized correctly or is it a recurring subscription leak?`
                )
              }
            />
          </div>
        )}

        {/* Tab 2: Proposed Action Review Screen */}
        {activeTab === 'actions' && (
          <ProposedActionReview
            actions={proposedActions}
            onApproveAction={handleApproveAction}
            onRejectAction={handleRejectAction}
            onDismissAction={handleDismissAction}
          />
        )}

        {/* Tab 3: Budgets & Limits */}
        {activeTab === 'budgets' && (
          <CategoryBudgets
            budgets={profile.budgets}
            onUpdateBudget={handleUpdateBudget}
            onAskCopilotAboutCategory={(category) =>
              handleOpenCopilot(
                `Audit my budget for ${category}. Propose rebalancing to avoid over-budget penalties.`
              )
            }
          />
        )}

        {/* Tab 4: Savings Goals */}
        {activeTab === 'goals' && (
          <SavingsGoals
            goals={profile.savingsGoals}
            onAddGoal={handleAddGoal}
            onAskCopilotToFundGoal={(goal) =>
              handleOpenCopilot(
                `Help me accelerate "${goal.name}". What is the fastest safe contribution path?`
              )
            }
          />
        )}

        {/* Tab 5: Agent Audit Log */}
        {activeTab === 'audit' && (
          <AgentAuditLog
            logs={auditLogs}
            onClearLogs={() => setAuditLogs([])}
          />
        )}
      </main>

      {/* AI Agent Modal */}
      <AgentModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        profile={profile}
        initialPrompt={copilotInitialPrompt}
        onRequestPlan={(promptText) => requestAgentPlan(profile, promptText)}
        onStageProposedAction={handleStageProposedAction}
        onSwitchToReviewTab={() => setActiveTab('actions')}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-6 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-400">FinPilot AI</span>
            <span>·</span>
            <span>FinTech Competition Edition</span>
            <span>·</span>
            <span>Synthetic Data Safe Sandbox</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Plan → Act → Verify → Recover</span>
            <span>·</span>
            <span>Zero Real Money Movement</span>
            <span>·</span>
            <span>OpenRouter Zero-Cost Model Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

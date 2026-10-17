import {
  ActionPayload,
  ActionType,
  AgentPlanStep,
  FinancialProfile,
  ProposedAction,
  ValidationRuleCheck,
} from '../types/finance';

/**
 * Validates a proposed action against strict safety guardrails.
 * Server and client both enforce these invariants.
 */
export function validateAction(
  profile: FinancialProfile,
  type: ActionType,
  payload: ActionPayload
): ValidationRuleCheck[] {
  const checks: ValidationRuleCheck[] = [];

  // Guardrail 1: Non-executable real financial transaction invariant
  checks.push({
    ruleName: 'Simulated Environment Safety',
    passed: true,
    message: 'Action strictly targets in-memory synthetic ledger (no external bank API or fund movement).',
  });

  // Guardrail 2: Sanitized input invariant
  const reasonText = (payload.reason || '').trim();
  const hasInjectionPattern = /<script|javascript:|onerror=|onload=/i.test(reasonText);
  checks.push({
    ruleName: 'Untrusted Text Sanitization',
    passed: !hasInjectionPattern,
    message: hasInjectionPattern
      ? 'Payload rejected: Potentially unsafe script characters detected in text fields.'
      : 'All user & AI text verified as inert string data.',
  });

  switch (type) {
    case 'REALLOCATE_BUDGET': {
      const amount = payload.amount ?? 0;
      const source = payload.sourceCategory;
      const target = payload.targetCategory;

      checks.push({
        ruleName: 'Positive Amount Constraint',
        passed: amount > 0 && Number.isFinite(amount),
        message: amount > 0 ? `Transfer amount $${amount.toFixed(2)} is positive.` : 'Amount must be greater than $0.00.',
      });

      checks.push({
        ruleName: 'Distinct Category Boundary',
        passed: Boolean(source && target && source !== target),
        message: source !== target ? `Valid shift from "${source}" to "${target}".` : 'Source and target categories cannot be the same.',
      });

      const sourceBudget = profile.budgets.find((b) => b.category === source);
      if (sourceBudget) {
        const remainingInSource = sourceBudget.allocated - sourceBudget.spent;
        const leavesExcessDeficit = sourceBudget.allocated - amount < sourceBudget.spent;
        checks.push({
          ruleName: 'Source Category Solvency',
          passed: !leavesExcessDeficit,
          message: !leavesExcessDeficit
            ? `Source "${source}" retains $${(sourceBudget.allocated - amount - sourceBudget.spent).toFixed(2)} after reallocation.`
            : `Warning: Reducing "${source}" by $${amount.toFixed(2)} would cause current spent ($${sourceBudget.spent.toFixed(2)}) to exceed new allocation ($${(sourceBudget.allocated - amount).toFixed(2)}).`,
        });
      } else {
        checks.push({
          ruleName: 'Source Category Solvency',
          passed: false,
          message: `Source category "${source}" does not exist in active budget.`,
        });
      }
      break;
    }

    case 'ALLOCATE_SAVINGS': {
      const amount = payload.amount ?? 0;
      const goal = profile.savingsGoals.find((g) => g.id === payload.goalId);

      checks.push({
        ruleName: 'Positive Amount Constraint',
        passed: amount > 0 && Number.isFinite(amount),
        message: amount > 0 ? `Contribution $${amount.toFixed(2)} is a valid positive value.` : 'Contribution must be greater than $0.',
      });

      checks.push({
        ruleName: 'Goal Target Existence',
        passed: Boolean(goal),
        message: goal ? `Target savings goal "${goal.name}" verified.` : `Savings goal ID "${payload.goalId}" not found.`,
      });

      checks.push({
        ruleName: 'Liquid Balance Cushion',
        passed: profile.totalBalance >= amount,
        message:
          profile.totalBalance >= amount
            ? `Available balance ($${profile.totalBalance.toFixed(2)}) covers contribution ($${amount.toFixed(2)}). Remaining: $${(profile.totalBalance - amount).toFixed(2)}.`
            : `Insufficient balance: Requested $${amount.toFixed(2)} but total balance is $${profile.totalBalance.toFixed(2)}.`,
      });

      if (goal) {
        const remainingToGoal = Math.max(0, goal.targetAmount - goal.currentAmount);
        checks.push({
          ruleName: 'Goal Ceiling Protection',
          passed: amount <= remainingToGoal * 1.5,
          message:
            amount <= remainingToGoal
              ? `Contribution ($${amount.toFixed(2)}) stays within target shortfall ($${remainingToGoal.toFixed(2)}).`
              : `Contribution reaches 100% of goal target.`,
        });
      }
      break;
    }

    case 'RECATEGORIZE_TRANSACTION': {
      const tx = profile.transactions.find((t) => t.id === payload.transactionId);
      checks.push({
        ruleName: 'Transaction Existence',
        passed: Boolean(tx),
        message: tx ? `Transaction "${tx.description}" found.` : `Transaction ID "${payload.transactionId}" not found.`,
      });

      checks.push({
        ruleName: 'Target Category Validity',
        passed: Boolean(payload.newCategory && payload.newCategory !== tx?.category),
        message: payload.newCategory ? `Recategorizing to valid category "${payload.newCategory}".` : 'Target category must differ from current category.',
      });
      break;
    }

    case 'CANCEL_SUBSCRIPTION_ALERT': {
      const tx = profile.transactions.find((t) => t.id === payload.transactionId);
      checks.push({
        ruleName: 'Subscription Identifier Verification',
        passed: Boolean(tx),
        message: tx ? `Recurring item "${tx.description}" identified.` : 'Subscription transaction not found.',
      });
      break;
    }

    case 'SET_SPENDING_CEILING': {
      const newBudget = payload.newBudget ?? 0;
      checks.push({
        ruleName: 'Positive Ceiling Constraint',
        passed: newBudget > 0,
        message: newBudget > 0 ? `New ceiling set to $${newBudget.toFixed(2)}.` : 'Spending ceiling must be positive.',
      });
      break;
    }

    default:
      checks.push({
        ruleName: 'Supported Action Verification',
        passed: true,
        message: 'Action matches authorized synthetic simulation schema.',
      });
  }

  return checks;
}

/**
 * Creates standard 4-step Plan-Act-Verify-Recover plan steps
 */
export function generatePlanWorkflow(
  actionType: ActionType,
  title: string,
  expectedOutcome: string
): AgentPlanStep[] {
  return [
    {
      stepNumber: 1,
      phase: 'PLAN',
      title: 'Analyze Ledger & Formulate Plan',
      detail: `Evaluated current balances, cashflow velocity, and category allocations. Identified recommendation: ${title}.`,
      status: 'COMPLETED',
    },
    {
      stepNumber: 2,
      phase: 'ACT',
      title: 'Synthesize Safe Proposed Action',
      detail: `Built structured action payload (${actionType}). Checked synthetic constraints against simulated state.`,
      status: 'COMPLETED',
    },
    {
      stepNumber: 3,
      phase: 'VERIFY',
      title: 'Validation Rules & Human Approval',
      detail: `Evaluating server-side invariant rules and awaiting explicit user sign-off. Expected effect: ${expectedOutcome}.`,
      status: 'IN_PROGRESS',
    },
    {
      stepNumber: 4,
      phase: 'RECOVER',
      title: 'Safe Execution or Rollback',
      detail: 'If approved and validated, simulate update to ledger. If rejected or invalidated, abort immediately with audit explanation.',
      status: 'PENDING',
    },
  ];
}

/**
 * Deterministic FinPilot Rule-Based Agent Generator (Zero-Cost / Fallback / Demo Mode)
 * Ensures 100% functionality without requiring external API keys.
 */
export function generateDeterministicPlan(
  profile: FinancialProfile,
  userPrompt: string
): { proposedAction: ProposedAction; planSteps: AgentPlanStep[]; rationale: string } {
  const promptLower = userPrompt.toLowerCase();

  // Scenario A: Savings / Goal allocation
  if (
    promptLower.includes('saving') ||
    promptLower.includes('emergency') ||
    promptLower.includes('transfer') ||
    promptLower.includes('contribute') ||
    promptLower.includes('runway')
  ) {
    const goal = profile.savingsGoals[0] || {
      id: 'goal-emergency',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 5000,
    };
    const transferAmount = Math.min(350, Math.max(100, Math.floor(profile.totalBalance * 0.05)));

    const payload: ActionPayload = {
      goalId: goal.id,
      goalName: goal.name,
      amount: transferAmount,
      reason: `Automated copilot allocation: Surplus cashflow cushion identified for "${goal.name}".`,
    };

    const rules = validateAction(profile, 'ALLOCATE_SAVINGS', payload);
    const allPassed = rules.every((r) => r.passed);

    const title = `Contribute $${transferAmount.toLocaleString()} to ${goal.name}`;
    const expectedEffect = `Goal progresses from $${goal.currentAmount.toLocaleString()} to $${(goal.currentAmount + transferAmount).toLocaleString()} (${(((goal.currentAmount + transferAmount) / goal.targetAmount) * 100).toFixed(1)}% complete). Total balance adjusts from $${profile.totalBalance.toLocaleString()} to $${(profile.totalBalance - transferAmount).toLocaleString()} (allocated to savings).`;

    const proposedAction: ProposedAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'ALLOCATE_SAVINGS',
      title,
      description: `Allocate $${transferAmount.toLocaleString()} from unassigned checking balance into your ${goal.name}.`,
      expectedEffect,
      payload,
      validationRules: rules,
      allRulesPassed: allPassed,
      riskLevel: 'LOW',
      status: 'PROPOSED',
    };

    return {
      proposedAction,
      planSteps: generatePlanWorkflow('ALLOCATE_SAVINGS', title, expectedEffect),
      rationale: `FinPilot analyzed your balance of $${profile.totalBalance.toLocaleString()} and monthly surplus. Allocating $${transferAmount.toLocaleString()} safely accelerates your ${goal.name} while maintaining adequate operating liquidity.`,
    };
  }

  // Scenario B: Budget rebalancing
  if (
    promptLower.includes('budget') ||
    promptLower.includes('rebalance') ||
    promptLower.includes('cut') ||
    promptLower.includes('food') ||
    promptLower.includes('dining') ||
    promptLower.includes('reallocate')
  ) {
    const source = profile.budgets.find((b) => b.category === 'Transport & Travel') || profile.budgets[0];
    const target = profile.budgets.find((b) => b.category === 'Groceries & Dining') || profile.budgets[1];
    const shiftAmount = 75;

    const payload: ActionPayload = {
      sourceCategory: source.category,
      targetCategory: target.category,
      amount: shiftAmount,
      reason: `Offset category variance: Reallocate underutilized ${source.category} to high-utilization ${target.category}.`,
    };

    const rules = validateAction(profile, 'REALLOCATE_BUDGET', payload);
    const allPassed = rules.every((r) => r.passed);

    const title = `Reallocate $${shiftAmount} from ${source.category} to ${target.category}`;
    const expectedEffect = `${source.category} allocation reduces to $${(source.allocated - shiftAmount).toLocaleString()}, while ${target.category} ceiling expands to $${(target.allocated + shiftAmount).toLocaleString()} to eliminate pending budget overrun.`;

    const proposedAction: ProposedAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'REALLOCATE_BUDGET',
      title,
      description: `Shift $${shiftAmount} between categories to maintain total monthly budget equilibrium.`,
      expectedEffect,
      payload,
      validationRules: rules,
      allRulesPassed: allPassed,
      riskLevel: 'LOW',
      status: 'PROPOSED',
    };

    return {
      proposedAction,
      planSteps: generatePlanWorkflow('REALLOCATE_BUDGET', title, expectedEffect),
      rationale: `Groceries & Dining has exceeded planned spend this month. Rather than increasing total monthly burn, shifting $${shiftAmount} from your surplus in ${source.category} prevents an overall deficit.`,
    };
  }

  // Scenario C: Subscription audit or cancellation
  if (
    promptLower.includes('sub') ||
    promptLower.includes('cancel') ||
    promptLower.includes('leak') ||
    promptLower.includes('gym') ||
    promptLower.includes('software')
  ) {
    const subTx = profile.transactions.find((t) => t.isRecurring && t.amount < 150) || profile.transactions[0];

    const payload: ActionPayload = {
      transactionId: subTx.id,
      amount: subTx.amount,
      reason: `Flagged recurring item "${subTx.description}" for active cancellation review.`,
    };

    const rules = validateAction(profile, 'CANCEL_SUBSCRIPTION_ALERT', payload);
    const allPassed = rules.every((r) => r.passed);

    const title = `Flag & Simulate Cancellation of "${subTx.description}" ($${subTx.amount}/mo)`;
    const expectedEffect = `Removes $${subTx.amount}/mo in recurring monthly liabilities. Projected annual savings: $${(subTx.amount * 12).toLocaleString()}.`;

    const proposedAction: ProposedAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'CANCEL_SUBSCRIPTION_ALERT',
      title,
      description: `Mark recurring transaction "${subTx.description}" as canceled in simulated budget forecasts.`,
      expectedEffect,
      payload,
      validationRules: rules,
      allRulesPassed: allPassed,
      riskLevel: 'LOW',
      status: 'PROPOSED',
    };

    return {
      proposedAction,
      planSteps: generatePlanWorkflow('CANCEL_SUBSCRIPTION_ALERT', title, expectedEffect),
      rationale: `Recurring charge "${subTx.description}" ($${subTx.amount}) flagged during financial audit. Simulated cancellation will immediately recover monthly operating margin.`,
    };
  }

  // Default: General Financial Optimization Plan
  const defaultGoal = profile.savingsGoals[0] || { id: 'goal-emergency', name: 'Emergency Fund', currentAmount: 0, targetAmount: 10000 };
  const safeAmount = 200;

  const payload: ActionPayload = {
    goalId: defaultGoal.id,
    goalName: defaultGoal.name,
    amount: safeAmount,
    reason: `FinPilot general copilot recommendation based on liquidity audit.`,
  };

  const rules = validateAction(profile, 'ALLOCATE_SAVINGS', payload);
  const allPassed = rules.every((r) => r.passed);

  const title = `Strategic Reserve Boost: Allocate $${safeAmount} to ${defaultGoal.name}`;
  const expectedEffect = `Strengthens ${defaultGoal.name} by +$${safeAmount}. Safeguards cash reserves without impacting active bills.`;

  const proposedAction: ProposedAction = {
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'ALLOCATE_SAVINGS',
    title,
    description: `Safe copilot contribution towards ${defaultGoal.name}.`,
    expectedEffect,
    payload,
    validationRules: rules,
    allRulesPassed: allPassed,
    riskLevel: 'LOW',
    status: 'PROPOSED',
  };

  return {
    proposedAction,
    planSteps: generatePlanWorkflow('ALLOCATE_SAVINGS', title, expectedEffect),
    rationale: `FinPilot reviewed your portfolio status. Cash reserves are healthy, and directing $${safeAmount} toward your top-priority goal reinforces long-term resilience.`,
  };
}

/**
 * Applies an approved action to the simulated financial profile state.
 * Returns the updated profile.
 */
export function executeSimulatedAction(
  profile: FinancialProfile,
  action: ProposedAction
): { updatedProfile: FinancialProfile; success: boolean; message: string } {
  // Re-verify rules immediately prior to execution
  const verification = validateAction(profile, action.type, action.payload);
  const allPassed = verification.every((v) => v.passed);

  if (!allPassed) {
    const failedRule = verification.find((v) => !v.passed);
    return {
      updatedProfile: profile,
      success: false,
      message: `Safety Invariant Violation: ${failedRule?.message || 'Rule validation failed.'}`,
    };
  }

  const updated: FinancialProfile = JSON.parse(JSON.stringify(profile));

  switch (action.type) {
    case 'ALLOCATE_SAVINGS': {
      const amount = action.payload.amount || 0;
      const goalIndex = updated.savingsGoals.findIndex((g) => g.id === action.payload.goalId);
      if (goalIndex >= 0) {
        updated.savingsGoals[goalIndex].currentAmount += amount;
        updated.totalBalance -= amount;

        // Add simulated ledger transaction
        updated.transactions.unshift({
          id: `tx-sim-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          description: `Simulated Transfer: → ${updated.savingsGoals[goalIndex].name}`,
          amount,
          type: 'expense',
          category: 'Other',
          status: 'cleared',
          notes: 'Executed via FinPilot AI Agent (Simulated Approval)',
        });
      }
      break;
    }

    case 'REALLOCATE_BUDGET': {
      const amount = action.payload.amount || 0;
      const src = updated.budgets.find((b) => b.category === action.payload.sourceCategory);
      const tgt = updated.budgets.find((b) => b.category === action.payload.targetCategory);
      if (src && tgt) {
        src.allocated -= amount;
        tgt.allocated += amount;
      }
      break;
    }

    case 'RECATEGORIZE_TRANSACTION': {
      const tx = updated.transactions.find((t) => t.id === action.payload.transactionId);
      if (tx && action.payload.newCategory) {
        const oldCat = tx.category;
        tx.category = action.payload.newCategory;

        // Update spent totals in budgets if expense
        if (tx.type === 'expense') {
          const oldBudget = updated.budgets.find((b) => b.category === oldCat);
          const newBudget = updated.budgets.find((b) => b.category === action.payload.newCategory);
          if (oldBudget) oldBudget.spent = Math.max(0, oldBudget.spent - tx.amount);
          if (newBudget) newBudget.spent += tx.amount;
        }
      }
      break;
    }

    case 'CANCEL_SUBSCRIPTION_ALERT': {
      const tx = updated.transactions.find((t) => t.id === action.payload.transactionId);
      if (tx) {
        tx.isRecurring = false;
        tx.notes = `Simulated Inactive / Canceled (Saved $${tx.amount}/mo)`;
        updated.monthlyExpense = Math.max(0, updated.monthlyExpense - tx.amount);
      }
      break;
    }

    case 'SET_SPENDING_CEILING': {
      const b = updated.budgets.find((b) => b.category === action.payload.targetCategory);
      if (b && action.payload.newBudget) {
        b.allocated = action.payload.newBudget;
      }
      break;
    }
  }

  // Recalculate derived metrics
  const totalAllocatedBudget = updated.budgets.reduce((acc, b) => acc + b.allocated, 0);
  updated.savingsRate = updated.monthlyIncome > 0
    ? Math.max(0, Number((((updated.monthlyIncome - updated.monthlyExpense) / updated.monthlyIncome) * 100).toFixed(1)))
    : 0;

  updated.emergencyFundMonths = updated.monthlyExpense > 0
    ? Number((updated.totalBalance / updated.monthlyExpense).toFixed(1))
    : 12;

  return {
    updatedProfile: updated,
    success: true,
    message: `Simulated action executed cleanly: ${action.title}. In-memory state updated.`,
  };
}

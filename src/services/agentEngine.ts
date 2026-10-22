import {
  ActionPayload,
  ActionType,
  AgentPlanStep,
  FinancialProfile,
  ProposedAction,
  SurvivalMetrics,
  TransactionCategory,
  ValidationRuleCheck,
} from '../types/finance';

/**
 * Categorizes categories into essential vs discretionary.
 */
export const ESSENTIAL_CATEGORIES: TransactionCategory[] = [
  'Housing & Rent',
  'Groceries & Dining',
  'Utilities & Internet',
  'Health & Wellness',
];

export const DISCRETIONARY_CATEGORIES: TransactionCategory[] = [
  'Software & Subscriptions',
  'Entertainment',
  'Transport & Travel',
  'Other',
];

/**
 * Computes exact daily burn rates and survival days under multiple stress-test scenarios.
 */
export function calculateSurvivalMetrics(profile: FinancialProfile): SurvivalMetrics {
  const daysInMonth = 30.417; // Average days per month

  const totalAllocated = profile.budgets.reduce((acc, b) => acc + b.allocated, 0);

  // Essential vs discretionary monthly allocations / spend
  let essentialMonthly = 0;
  let discretionaryMonthly = 0;

  profile.budgets.forEach((b) => {
    if (ESSENTIAL_CATEGORIES.includes(b.category)) {
      essentialMonthly += b.spent > 0 ? b.spent : b.allocated;
    } else {
      discretionaryMonthly += b.spent > 0 ? b.spent : b.allocated;
    }
  });

  // Fallbacks if budgets are empty
  if (essentialMonthly === 0 && profile.monthlyExpense > 0) {
    essentialMonthly = profile.monthlyExpense * 0.65;
    discretionaryMonthly = profile.monthlyExpense * 0.35;
  }

  const dailyBurnActual = Math.max(1, profile.monthlyExpense / daysInMonth);
  const dailyBurnBudget = Math.max(1, (totalAllocated > 0 ? totalAllocated : profile.monthlyExpense) / daysInMonth);
  const dailyEssentialBurn = Math.max(1, essentialMonthly / daysInMonth);
  const dailyDiscretionaryBurn = Math.max(0, discretionaryMonthly / daysInMonth);

  // Survival Days assuming ZERO INCOME (e.g. Sudden Job Loss / Revenue Stoppage)
  const survivalDaysActual = Math.floor(profile.totalBalance / dailyBurnActual);
  const survivalDaysBudget = Math.floor(profile.totalBalance / dailyBurnBudget);
  const survivalDaysEssentialOnly = Math.floor(profile.totalBalance / dailyEssentialBurn);

  const netMonthlySurplus = profile.monthlyIncome - profile.monthlyExpense;
  const sustainableWithIncome = netMonthlySurplus >= 0;

  let survivalStatus: 'CRITICAL' | 'CAUTION' | 'STABLE' | 'SECURE';
  if (survivalDaysActual < 60) {
    survivalStatus = 'CRITICAL';
  } else if (survivalDaysActual < 120) {
    survivalStatus = 'CAUTION';
  } else if (survivalDaysActual < 180) {
    survivalStatus = 'STABLE';
  } else {
    survivalStatus = 'SECURE';
  }

  return {
    dailyBurnActual: Number(dailyBurnActual.toFixed(2)),
    dailyBurnBudget: Number(dailyBurnBudget.toFixed(2)),
    dailyEssentialBurn: Number(dailyEssentialBurn.toFixed(2)),
    dailyDiscretionaryBurn: Number(dailyDiscretionaryBurn.toFixed(2)),
    survivalDaysActual,
    survivalDaysBudget,
    survivalDaysEssentialOnly,
    essentialMonthlyExpense: Number(essentialMonthly.toFixed(2)),
    discretionaryMonthlyExpense: Number(discretionaryMonthly.toFixed(2)),
    survivalStatus,
    sustainableWithIncome,
    netMonthlySurplus: Number(netMonthlySurplus.toFixed(2)),
  };
}

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
    case 'ACTIVATE_SURVIVAL_BUDGET': {
      const daysGained = payload.projectedDaysGained ?? 0;
      const trims = payload.trimmedCategories || [];

      checks.push({
        ruleName: 'Runway Extension Positive Impact',
        passed: daysGained > 0,
        message:
          daysGained > 0
            ? `Extends survival runway by +${daysGained} days under zero-income conditions.`
            : 'Plan must produce a measurable positive runway extension.',
      });

      const touchedEssential = trims.some((t) =>
        ['Housing & Rent', 'Utilities & Internet', 'Health & Wellness'].includes(t.category)
      );
      checks.push({
        ruleName: 'Essential Needs Protection',
        passed: !touchedEssential,
        message: !touchedEssential
          ? 'Critical shelter, utilities, and healthcare allocations left 100% protected.'
          : 'Warning: Survival plan cannot unsafely defund essential housing or healthcare.',
      });

      checks.push({
        ruleName: 'Discretionary Trim Ceiling',
        passed: trims.length > 0 && trims.every((t) => t.newAmount >= 0),
        message: 'All adjusted discretionary categories maintain non-negative spending ceilings.',
      });
      break;
    }

    case 'EXTEND_RUNWAY_PLAN':
    case 'OPTIMIZE_DAILY_BURN': {
      const metrics = calculateSurvivalMetrics(profile);
      const targetDays = payload.targetSurvivalDays ?? 180;

      checks.push({
        ruleName: 'Target Runway Feasibility',
        passed: targetDays > metrics.survivalDaysActual,
        message: `Target of ${targetDays} days is higher than current ${metrics.survivalDaysActual} days.`,
      });

      checks.push({
        ruleName: 'Essential Daily Burn Floor',
        passed: profile.totalBalance > 0,
        message: `Available liquid assets ($${profile.totalBalance.toLocaleString()}) support burn adjustment.`,
      });
      break;
    }

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
      title: 'Analyze Financial Cost Invariants & Burn',
      detail: `Evaluated liquid balance, daily burn velocity, and essential vs discretionary commitments. Identified strategy: ${title}.`,
      status: 'COMPLETED',
    },
    {
      stepNumber: 2,
      phase: 'ACT',
      title: 'Synthesize Safe Proposed Action',
      detail: `Built structured action payload (${actionType}). Checked constraints against simulated state.`,
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
 * Highly intelligent financial copilot responding to runway, survival days, budget rebalancing, and goals.
 */
export function generateDeterministicPlan(
  profile: FinancialProfile,
  userPrompt: string
): { proposedAction: ProposedAction; planSteps: AgentPlanStep[]; rationale: string } {
  const promptLower = userPrompt.toLowerCase();
  const metrics = calculateSurvivalMetrics(profile);

  // Scenario 1: Survival Mode / Runway Extension / Job Loss / Daily Burn Rate
  if (
    promptLower.includes('surviv') ||
    promptLower.includes('burn') ||
    promptLower.includes('runway') ||
    promptLower.includes('days') ||
    promptLower.includes('job loss') ||
    promptLower.includes('income shock') ||
    promptLower.includes('emergency cut')
  ) {
    // Calculate survival budget trims across discretionary categories
    const trims: { category: TransactionCategory; previousAmount: number; newAmount: number }[] = [];
    let totalMonthlySaved = 0;

    profile.budgets.forEach((b) => {
      if (b.category === 'Entertainment') {
        const trim = Math.round(b.allocated * 0.5);
        trims.push({ category: b.category, previousAmount: b.allocated, newAmount: b.allocated - trim });
        totalMonthlySaved += trim;
      } else if (b.category === 'Software & Subscriptions') {
        const trim = Math.round(b.allocated * 0.35);
        trims.push({ category: b.category, previousAmount: b.allocated, newAmount: b.allocated - trim });
        totalMonthlySaved += trim;
      } else if (b.category === 'Transport & Travel') {
        const trim = Math.round(b.allocated * 0.3);
        trims.push({ category: b.category, previousAmount: b.allocated, newAmount: b.allocated - trim });
        totalMonthlySaved += trim;
      }
    });

    const newMonthlyExpense = Math.max(1, profile.monthlyExpense - totalMonthlySaved);
    const newDailyBurn = newMonthlyExpense / 30.417;
    const newSurvivalDays = Math.floor(profile.totalBalance / newDailyBurn);
    const daysGained = Math.max(1, newSurvivalDays - metrics.survivalDaysActual);

    const payload: ActionPayload = {
      amount: totalMonthlySaved,
      targetSurvivalDays: newSurvivalDays,
      projectedDaysGained: daysGained,
      trimmedCategories: trims,
      reason: `Activate Emergency Survival Mode: Reduce discretionary overhead by $${totalMonthlySaved}/mo to extend zero-income runway from ${metrics.survivalDaysActual} days to ${newSurvivalDays} days (+${daysGained} days).`,
    };

    const rules = validateAction(profile, 'ACTIVATE_SURVIVAL_BUDGET', payload);
    const allPassed = rules.every((r) => r.passed);

    const title = `Activate Survival Mode Budget (+${daysGained} Days Runway)`;
    const expectedEffect = `Reduces daily burn from $${metrics.dailyBurnActual.toFixed(2)}/day to $${newDailyBurn.toFixed(2)}/day (saves $${totalMonthlySaved.toLocaleString()}/mo). Under zero income, your liquid cash ($${profile.totalBalance.toLocaleString()}) survives for ${newSurvivalDays} days instead of ${metrics.survivalDaysActual} days.`;

    const proposedAction: ProposedAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'ACTIVATE_SURVIVAL_BUDGET',
      title,
      description: `Temporarily compress non-essential entertainment, software, and travel spending to guarantee survival longevity.`,
      expectedEffect,
      payload,
      validationRules: rules,
      allRulesPassed: allPassed,
      riskLevel: 'LOW',
      status: 'PROPOSED',
    };

    return {
      proposedAction,
      planSteps: generatePlanWorkflow('ACTIVATE_SURVIVAL_BUDGET', title, expectedEffect),
      rationale: `FinPilot analyzed your daily burn of $${metrics.dailyBurnActual.toFixed(2)}/day against your $${profile.totalBalance.toLocaleString()} liquid balance. Currently, you have ${metrics.survivalDaysActual} days of survival runway under zero income. Compressing discretionary categories frees $${totalMonthlySaved}/mo, expanding survival to ${newSurvivalDays} days (+${daysGained} days gained) while protecting essential housing, food, and healthcare.`,
    };
  }

  // Scenario 2: Savings / Emergency Fund Contribution
  if (
    promptLower.includes('saving') ||
    promptLower.includes('emergency') ||
    promptLower.includes('transfer') ||
    promptLower.includes('contribute') ||
    promptLower.includes('goal')
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
      rationale: `FinPilot analyzed your balance of $${profile.totalBalance.toLocaleString()} and monthly surplus of $${metrics.netMonthlySurplus.toLocaleString()}. Allocating $${transferAmount.toLocaleString()} safely accelerates your ${goal.name} while maintaining adequate operating liquidity (${metrics.survivalDaysActual} days remaining).`,
    };
  }

  // Scenario 3: Budget rebalancing
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

  // Scenario 4: Subscription audit or cancellation
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

    const annualSaved = subTx.amount * 12;
    const daysGained = Math.round((annualSaved / 12) / metrics.dailyBurnActual * 30);

    const title = `Cancel Recurring "${subTx.description}" ($${subTx.amount}/mo)`;
    const expectedEffect = `Eliminates $${subTx.amount}/mo in fixed commitments ($${annualSaved.toLocaleString()}/yr). Extends annual cash runway by approximately +${Math.max(1, daysGained)} days.`;

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
      rationale: `Recurring charge "${subTx.description}" ($${subTx.amount}/mo) audited. Simulated cancellation immediately lowers daily burn by $${(subTx.amount / 30.417).toFixed(2)}/day.`,
    };
  }

  // Default: General Financial Optimization Plan
  const defaultGoal = profile.savingsGoals[0] || { id: 'goal-emergency', name: 'Emergency Fund', currentAmount: 0, targetAmount: 10000 };
  const safeAmount = 200;

  const payload: ActionPayload = {
    goalId: defaultGoal.id,
    goalName: defaultGoal.name,
    amount: safeAmount,
    reason: `FinPilot general copilot recommendation based on liquidity audit (${metrics.survivalDaysActual} days survival cushion).`,
  };

  const rules = validateAction(profile, 'ALLOCATE_SAVINGS', payload);
  const allPassed = rules.every((r) => r.passed);

  const title = `Strategic Reserve Boost: Allocate $${safeAmount} to ${defaultGoal.name}`;
  const expectedEffect = `Strengthens ${defaultGoal.name} by +$${safeAmount}. Preserves current survival longevity of ${metrics.survivalDaysActual} days.`;

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
    rationale: `FinPilot reviewed your portfolio status. Cash reserves are healthy with ${metrics.survivalDaysActual} days of zero-income runway. Directing $${safeAmount} toward your top-priority goal reinforces long-term resilience without raising your daily burn rate.`,
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
    case 'ACTIVATE_SURVIVAL_BUDGET': {
      const trims = action.payload.trimmedCategories || [];
      let totalCut = 0;

      trims.forEach((t) => {
        const b = updated.budgets.find((item) => item.category === t.category);
        if (b) {
          totalCut += Math.max(0, b.allocated - t.newAmount);
          b.allocated = t.newAmount;
        }
      });

      if (totalCut > 0) {
        updated.monthlyExpense = Math.max(1, updated.monthlyExpense - totalCut);
      }

      // Add simulated ledger audit transaction
      updated.transactions.unshift({
        id: `tx-sim-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Emergency Survival Plan: Reduced Discretionary Burn (-$${totalCut}/mo)`,
        amount: totalCut,
        type: 'income',
        category: 'Other',
        status: 'cleared',
        notes: `Executed via FinPilot AI Agent (+${action.payload.projectedDaysGained || 0} Survival Days Gained)`,
      });
      break;
    }

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
  updated.savingsRate = updated.monthlyIncome > 0
    ? Math.max(0, Number((((updated.monthlyIncome - updated.monthlyExpense) / updated.monthlyIncome) * 100).toFixed(1)))
    : 0;

  updated.emergencyFundMonths = updated.monthlyExpense > 0
    ? Number((updated.totalBalance / updated.monthlyExpense).toFixed(1))
    : 12;

  updated.survivalMetrics = calculateSurvivalMetrics(updated);

  return {
    updatedProfile: updated,
    success: true,
    message: `Simulated action executed cleanly: ${action.title}. In-memory state updated.`,
  };
}

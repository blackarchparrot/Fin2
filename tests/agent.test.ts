import { describe, expect, it } from 'vitest';
import { INITIAL_SYNTHETIC_PROFILES } from '../src/data/mockData';
import {
  calculateSurvivalMetrics,
  executeSimulatedAction,
  generateDeterministicPlan,
  generatePlanWorkflow,
  validateAction,
} from '../src/services/agentEngine';
import { FinancialProfile, ProposedAction } from '../src/types/finance';

describe('FinPilot AI - Safe Agent Guardrails & Invariants', () => {
  const baseProfile: FinancialProfile = JSON.parse(
    JSON.stringify(INITIAL_SYNTHETIC_PROFILES.founder)
  );

  it('validates Plan -> Act -> Verify -> Recover workflow structure', () => {
    const steps = generatePlanWorkflow(
      'ALLOCATE_SAVINGS',
      'Boost Emergency Runway',
      'Increases goal by $500'
    );
    expect(steps).toHaveLength(4);
    expect(steps[0].phase).toBe('PLAN');
    expect(steps[1].phase).toBe('ACT');
    expect(steps[2].phase).toBe('VERIFY');
    expect(steps[3].phase).toBe('RECOVER');
  });

  it('rejects non-positive contribution amounts', () => {
    const rules = validateAction(baseProfile, 'ALLOCATE_SAVINGS', {
      goalId: 'goal-emergency',
      amount: -150,
      reason: 'Malicious negative contribution test',
    });
    const posCheck = rules.find((r) => r.ruleName === 'Positive Amount Constraint');
    expect(posCheck?.passed).toBe(false);
  });

  it('rejects contributions exceeding available liquid balance', () => {
    const rules = validateAction(baseProfile, 'ALLOCATE_SAVINGS', {
      goalId: 'goal-emergency',
      amount: 999999, // way higher than total balance
      reason: 'Overdraft simulation test',
    });
    const balanceCheck = rules.find((r) => r.ruleName === 'Liquid Balance Cushion');
    expect(balanceCheck?.passed).toBe(false);
  });

  it('rejects budget reallocations where source and target are identical', () => {
    const rules = validateAction(baseProfile, 'REALLOCATE_BUDGET', {
      sourceCategory: 'Groceries & Dining',
      targetCategory: 'Groceries & Dining',
      amount: 100,
    });
    const distinctCheck = rules.find((r) => r.ruleName === 'Distinct Category Boundary');
    expect(distinctCheck?.passed).toBe(false);
  });

  it('detects and flags script injection in untrusted financial text', () => {
    const rules = validateAction(baseProfile, 'ALLOCATE_SAVINGS', {
      goalId: 'goal-emergency',
      amount: 100,
      reason: '<script>alert("hack")</script>',
    });
    const sanitizeCheck = rules.find((r) => r.ruleName === 'Untrusted Text Sanitization');
    expect(sanitizeCheck?.passed).toBe(false);
  });

  it('executes a verified simulated savings allocation accurately', () => {
    const initialBalance = baseProfile.totalBalance;
    const goal = baseProfile.savingsGoals.find((g) => g.id === 'goal-emergency')!;
    const initialGoalAmount = goal.currentAmount;
    const transferAmount = 300;

    const proposed: ProposedAction = {
      id: 'test-act-1',
      timestamp: new Date().toISOString(),
      type: 'ALLOCATE_SAVINGS',
      title: 'Test Allocation',
      description: 'Allocate $300 to goal',
      expectedEffect: 'Increases goal by $300',
      payload: {
        goalId: 'goal-emergency',
        goalName: goal.name,
        amount: transferAmount,
      },
      validationRules: [],
      allRulesPassed: true,
      riskLevel: 'LOW',
      status: 'PROPOSED',
    };

    const result = executeSimulatedAction(baseProfile, proposed);
    expect(result.success).toBe(true);
    expect(result.updatedProfile.totalBalance).toBe(initialBalance - transferAmount);

    const updatedGoal = result.updatedProfile.savingsGoals.find((g) => g.id === 'goal-emergency')!;
    expect(updatedGoal.currentAmount).toBe(initialGoalAmount + transferAmount);

    // Verifies synthetic ledger transaction was created
    const firstTx = result.updatedProfile.transactions[0];
    expect(firstTx.description).toContain('Simulated Transfer');
    expect(firstTx.amount).toBe(transferAmount);
  });

  it('guarantees deterministic plan generation in zero-cost demo mode', () => {
    const planResult = generateDeterministicPlan(
      baseProfile,
      'Help me rebalance my food budget and dining deficit'
    );
    expect(planResult.proposedAction).toBeDefined();
    expect(planResult.proposedAction.type).toBe('REALLOCATE_BUDGET');
    expect(planResult.proposedAction.allRulesPassed).toBe(true);
    expect(planResult.planSteps).toHaveLength(4);
  });

  it('prevents simulated execution if an action fails re-verification', () => {
    const corruptedAction: ProposedAction = {
      id: 'test-fail-1',
      timestamp: new Date().toISOString(),
      type: 'ALLOCATE_SAVINGS',
      title: 'Corrupted Action',
      description: 'Attempt overdraft',
      expectedEffect: 'Drains balance',
      payload: {
        goalId: 'goal-emergency',
        amount: 5000000, // Violates liquid balance
      },
      validationRules: [],
      allRulesPassed: true, // Falsely marked passed upstream
      riskLevel: 'HIGH',
      status: 'PROPOSED',
    };

    const result = executeSimulatedAction(baseProfile, corruptedAction);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Safety Invariant Violation');
  });

  it('accurately calculates daily burn rate and zero-income survival days', () => {
    const metrics = calculateSurvivalMetrics(baseProfile);
    expect(metrics.dailyBurnActual).toBeGreaterThan(0);
    expect(metrics.survivalDaysActual).toBeGreaterThan(0);
    // Survival days = totalBalance / dailyBurnActual
    const expectedDays = Math.floor(baseProfile.totalBalance / metrics.dailyBurnActual);
    expect(metrics.survivalDaysActual).toBe(expectedDays);
    expect(metrics.survivalDaysEssentialOnly).toBeGreaterThanOrEqual(metrics.survivalDaysActual);
  });

  it('generates a survival runway extension plan when prompted for survival or burn', () => {
    const planResult = generateDeterministicPlan(
      baseProfile,
      'How many days can I survive if I lose my job? Activate survival mode.'
    );
    expect(planResult.proposedAction.type).toBe('ACTIVATE_SURVIVAL_BUDGET');
    expect(planResult.proposedAction.payload.projectedDaysGained).toBeGreaterThan(0);
    expect(planResult.proposedAction.allRulesPassed).toBe(true);
    expect(planResult.rationale).toContain('survival');
  });

  it('safely applies ACTIVATE_SURVIVAL_BUDGET and expands survival runway', () => {
    const initialMetrics = calculateSurvivalMetrics(baseProfile);

    const proposed: ProposedAction = {
      id: 'test-survival-act',
      timestamp: new Date().toISOString(),
      type: 'ACTIVATE_SURVIVAL_BUDGET',
      title: 'Emergency Survival Trim',
      description: 'Trim discretionary budgets by $300/mo',
      expectedEffect: 'Extends survival runway by +20 days',
      payload: {
        projectedDaysGained: 20,
        trimmedCategories: [
          { category: 'Entertainment', previousAmount: 350, newAmount: 175 },
          { category: 'Software & Subscriptions', previousAmount: 380, newAmount: 250 },
        ],
      },
      validationRules: [],
      allRulesPassed: true,
      riskLevel: 'LOW',
      status: 'PROPOSED',
    };

    const res = executeSimulatedAction(baseProfile, proposed);
    expect(res.success).toBe(true);
    expect(res.updatedProfile.monthlyExpense).toBeLessThan(baseProfile.monthlyExpense);
    const updatedMetrics = calculateSurvivalMetrics(res.updatedProfile);
    expect(updatedMetrics.survivalDaysActual).toBeGreaterThan(initialMetrics.survivalDaysActual);
  });
});


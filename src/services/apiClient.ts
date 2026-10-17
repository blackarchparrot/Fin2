import {
  AgentPlanStep,
  FinancialProfile,
  ProposedAction,
} from '../types/finance';
import {
  generateDeterministicPlan,
  generatePlanWorkflow,
  validateAction,
} from './agentEngine';

export interface AgentApiResponse {
  proposedAction: ProposedAction;
  planSteps: AgentPlanStep[];
  rationale: string;
  isDemoFallback: boolean;
  provider: string;
  model: string;
  notice?: string;
}

export interface HealthCheckResult {
  status: string;
  app: string;
  hasServerApiKey: boolean;
  configuredModel: string;
  mode: string;
}

export async function checkServerHealth(): Promise<HealthCheckResult | null> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function requestAgentPlan(
  profile: FinancialProfile,
  userPrompt: string
): Promise<AgentApiResponse> {
  try {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: userPrompt,
        profile,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.isDemoFallback || !data.plan) {
      // Deterministic recovery & safe demo execution
      const fallback = generateDeterministicPlan(profile, userPrompt);
      return {
        ...fallback,
        isDemoFallback: true,
        provider: data.provider || 'FinPilot Deterministic Engine (Zero Cost)',
        model: data.model || 'simulated-zero-cost',
        notice: data.message || 'Operating safely in zero-cost demo mode.',
      };
    }

    // Process plan from upstream zero-cost OpenRouter model
    const rawPlan = data.plan;
    const actionType = rawPlan.actionType || 'ALLOCATE_SAVINGS';
    const payload = rawPlan.payload || {};
    const rules = validateAction(profile, actionType, payload);
    const allPassed = rules.every((r) => r.passed);

    const proposedAction: ProposedAction = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: actionType,
      title: rawPlan.title || 'Recommended Financial Optimization',
      description: rawPlan.rationale || 'FinPilot optimized allocation recommendation.',
      expectedEffect: rawPlan.expectedEffect || 'Safely adjusts portfolio balance and allocations.',
      payload,
      validationRules: rules,
      allRulesPassed: allPassed,
      riskLevel: rawPlan.riskLevel || 'LOW',
      status: 'PROPOSED',
    };

    const planSteps = generatePlanWorkflow(actionType, proposedAction.title, proposedAction.expectedEffect);

    return {
      proposedAction,
      planSteps,
      rationale: rawPlan.rationale || 'Analysis conducted on synthetic financial profile.',
      isDemoFallback: false,
      provider: data.provider || 'OpenRouter Zero-Cost Model',
      model: data.model || 'openrouter/free',
    };
  } catch (err: any) {
    // Network or client-side failure -> safe recovery
    const fallback = generateDeterministicPlan(profile, userPrompt);
    return {
      ...fallback,
      isDemoFallback: true,
      provider: 'FinPilot Deterministic Engine (Offline Safe Mode)',
      model: 'simulated-zero-cost',
      notice: `Local recovery engaged (${err.message || 'network unavailable'}). Full interactive simulation active.`,
    };
  }
}

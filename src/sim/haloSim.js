import { simulationStore } from './simulationStore.js';
import { scoreRiskPlan } from './riskScorer.js';
import { analyzeDataExposure } from './dataExposureAnalyzer.js';
import { generateAlternativePlans } from './alternativePlanner.js';
import { buildTrustPreview } from './trustPreviewBuilder.js';
import { HaloAudit } from '../audit/haloAudit.js';

export const HaloSim = {
  simulate({ riskPlan, userPrompt }) {
    const dataExposureReport = analyzeDataExposure(riskPlan); HaloAudit.record({ userId: riskPlan.user_id, taskId: riskPlan.task_id, type: 'data_exposure_analyzed' });
    const riskScore = scoreRiskPlan(riskPlan); HaloAudit.record({ userId: riskPlan.user_id, taskId: riskPlan.task_id, type: 'risk_scored', score: riskScore.score });
    const alternatives = generateAlternativePlans(riskPlan); HaloAudit.record({ userId: riskPlan.user_id, taskId: riskPlan.task_id, type: 'alternative_plan_generated' });
    const recommended = alternatives.find((a) => a.label === 'Privacy-preserving plan') || alternatives[0];
    const trustPreview = simulationStore.createPreview(buildTrustPreview({ task_id: riskPlan.task_id, summary: `AgentHalo simulated ${riskPlan.intent} and recommends the least-data path.`, risk: recommended.risk, recommended_plan_id: recommended.alternative_plan_id, proposed_action: riskPlan.proposed_actions[0], dataExposureReport, alternatives }));
    HaloAudit.record({ userId: riskPlan.user_id, taskId: riskPlan.task_id, type: 'trust_preview_shown', previewId: trustPreview.trust_preview_id });
    const simulation = simulationStore.create({ task_id: riskPlan.task_id, user_id: riskPlan.user_id, riskPlan, riskScore, dataExposureReport, alternatives, trustPreview, userPrompt, status: 'awaiting_plan_choice' });
    HaloAudit.record({ userId: riskPlan.user_id, taskId: riskPlan.task_id, type: 'simulation_created', simulationId: simulation.simulation_id });
    return simulation;
  }
};

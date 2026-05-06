import {
  USER_VAULT,
  planTask,
  getPrivateContext,
  evaluatePolicy,
  issueDelegationToken,
  discoverAndVerifyService,
  callExternalService,
  humanizeAnswer
} from "./domain.js";
import { recordAudit } from "./audit.js";

export function runMedicalCampFlow({ userId, prompt, eventId, consentGranted }) {
  const task = planTask({ userPrompt: prompt, eventId });
  const privateContext = getPrivateContext(userId, task.intent);
  const policy = evaluatePolicy(userId, task.intent);

  if (!policy.allowed) {
    throw new Error("Policy denied: intent not allowed");
  }

  if (policy.requiresConsent && !consentGranted) {
    const pending = {
      status: "consent_required",
      task,
      policy,
      consentQuestion:
        "May AgentHalo share your heat-sensitivity flag with a verified medical camp for better triage?"
    };

    recordAudit({
      type: "consent.requested",
      userId,
      taskId: task.taskId,
      intent: task.intent
    });

    return pending;
  }

  const token = issueDelegationToken(task.taskId, userId);
  const service = discoverAndVerifyService(eventId);
  const externalResult = callExternalService({
    service,
    limitedContext: privateContext.limitedContext
  });

  const answer = humanizeAnswer({
    userName: USER_VAULT[userId].displayName,
    result: externalResult
  });

  const response = {
    status: "completed",
    task,
    policy,
    consentGranted: Boolean(consentGranted),
    delegationToken: token,
    serviceAgentFacts: service.agentFacts,
    externalResult,
    answer
  };

  recordAudit({
    type: "task.completed",
    userId,
    taskId: task.taskId,
    tokenId: token.tokenId,
    serviceId: service.serviceId,
    scope: token.scope
  });

  return response;
}

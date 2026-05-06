export function buildTrustPreview({ task_id, summary, risk, recommended_plan_id, proposed_action, dataExposureReport, alternatives }) {
  return {
    task_id,
    summary,
    recommended_plan_id,
    risk,
    proposed_action,
    data_agenthalo_may_share: dataExposureReport.data_items.map((d) => d.field),
    data_agenthalo_will_protect: dataExposureReport.blocked_items.map((b) => b.field),
    optional_data_you_can_deny: dataExposureReport.data_items.filter((d) => !d.required).map((d) => d.field),
    alternatives,
    requires_user_approval: true,
    title: 'Trust Preview',
    subtitle: 'Before your agent acts, AgentHalo shows what will happen, what data may be shared, and which safer options exist.'
  };
}

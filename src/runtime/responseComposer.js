export function composeResponse({ intent, result, dataShared, dataNotShared, verifiedServiceId, delegationGrant, auditPath }) {
  const expiresAt = delegationGrant?.expires_at ?? 'not-applicable';
  return {
    intent, result, dataShared, dataNotShared, verifiedServiceId, permissionExpiresAt: expiresAt, auditPath,
    message: `Intent: ${intent}. Shared: ${dataShared.join(', ') || 'none'}. Not shared: ${dataNotShared.join(', ') || 'none'}. Verified service: ${verifiedServiceId ?? 'none (local-only)'}. Permission expires: ${expiresAt}. Audit trail: ${auditPath}. I shared approximate location only. I did not share medical history, exact location, identity documents, or full profile. The permission was limited to this task, expires in 10 minutes, and can be inspected or revoked in the Trust Inspector.`
  };
}

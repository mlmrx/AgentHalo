export function composeResponse({
  intent,
  result,
  dataShared,
  dataNotShared,
  verifiedServiceId,
  delegationGrant,
  auditPath
}) {
  const expiresAt = delegationGrant?.expiresAt ?? 'not-applicable';
  return {
    intent,
    result,
    dataShared,
    dataNotShared,
    verifiedServiceId,
    permissionExpiresAt: expiresAt,
    auditPath,
    message: [
      `Intent: ${intent}.`,
      `Shared: ${dataShared.join(', ') || 'none'}.`,
      `Not shared: ${dataNotShared.join(', ') || 'none'}.`,
      `Verified service: ${verifiedServiceId ?? 'none (local-only)'}.`,
      `Permission expires: ${expiresAt}.`,
      `Audit trail: ${auditPath}.`
    ].join(' ')
  };
}

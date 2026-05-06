const revoked = new Map();
export const RevocationRegistry = {
  revoke: (record) => revoked.set(record.target_id, record),
  getByTargetId: (id) => revoked.get(id),
  get: (id) => [...revoked.values()].find((r) => r.revocation_id === id)
};

import { nanoid } from 'nanoid';
const simulations = new Map();
const previews = new Map();
export const simulationStore = {
  create(simulation) { const id = simulation.simulation_id || `sim_${nanoid(8)}`; const r = { ...simulation, simulation_id: id, created_at: new Date().toISOString() }; simulations.set(id, r); return r; },
  update(id, patch) { const c = simulations.get(id); if (!c) return null; const n = { ...c, ...patch, updated_at: new Date().toISOString() }; simulations.set(id, n); return n; },
  get: (id) => simulations.get(id),
  byTask: (taskId) => [...simulations.values()].filter((x) => x.task_id === taskId),
  createPreview(preview) { const id = preview.trust_preview_id || `preview_${nanoid(8)}`; const r = { ...preview, trust_preview_id: id, created_at: new Date().toISOString() }; previews.set(id, r); return r; },
  getPreview: (id) => previews.get(id)
};

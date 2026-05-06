const promptEl = document.getElementById('prompt');
const scenarioEl = document.getElementById('scenario');
const outputEl = document.getElementById('output');
const previewEl = document.getElementById('trustPreview');
const defaults = { health: 'Help my mother find nearby verified medical help. She prefers Hindi and less crowded routes.', travel: 'My flight is delayed. Find safer rebooking options but do not purchase anything.', finance: 'Can I afford this $1,200 purchase this month?' };
promptEl.value = defaults.health;
scenarioEl.addEventListener('change', () => (promptEl.value = defaults[scenarioEl.value]));
function renderTrustPreview(preview){
  if(!preview){ previewEl.innerHTML=''; return; }
  previewEl.innerHTML = `<h3>Trust Preview</h3><p>${preview.subtitle}</p><p><strong>Risk:</strong> ${preview.risk}</p><p><strong>Data AgentHalo may share:</strong> ${(preview.data_agenthalo_may_share||[]).join(', ')}</p><p><strong>Data AgentHalo will protect:</strong> ${(preview.data_agenthalo_will_protect||[]).join(', ')}</p><p><strong>Recommended:</strong> ${preview.recommended_plan_id}</p>`;
}
document.getElementById('run').addEventListener('click', async () => {
  const first = await fetch('/api/v1/agent/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: 'user-001', prompt: promptEl.value }) });
  const firstJson = await first.json();
  renderTrustPreview(firstJson.trust_preview);
  outputEl.textContent = JSON.stringify(firstJson, null, 2);
});

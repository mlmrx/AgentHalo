const promptEl = document.getElementById('prompt');
const scenarioEl = document.getElementById('scenario');
const outputEl = document.getElementById('output');
const defaults = {
  health: 'Help my mother find nearby verified medical help. She prefers Hindi and less crowded routes.',
  travel: 'My flight is delayed. Find safer rebooking options but do not purchase anything.',
  finance: 'Can I afford this $1,200 purchase this month?'
};
promptEl.value = defaults.health;
scenarioEl.addEventListener('change', () => (promptEl.value = defaults[scenarioEl.value]));
document.getElementById('run').addEventListener('click', async () => {
  const body = { userId: 'user-001', prompt: promptEl.value, consentDecisions: scenarioEl.value === 'finance' ? undefined : { approximate_location: true, medical_constraint: false } };
  const res = await fetch('/api/v1/agent/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json();
  outputEl.textContent = JSON.stringify(json, null, 2);
});

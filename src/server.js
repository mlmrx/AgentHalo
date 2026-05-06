import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMedicalCampFlow } from "./orchestrator.js";
import { readAuditTail } from "./audit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.post("/api/agent/request", (req, res) => {
  try {
    const { userId = "user-001", prompt, eventId = "solstice-festival-2026", consentGranted = false } = req.body;
    const output = runMedicalCampFlow({ userId, prompt, eventId, consentGranted });
    res.json(output);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/audit", (_req, res) => {
  res.json({ events: readAuditTail(50) });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, product: "AgentHalo", tagline: "The trusted personal presence of your AI agent." });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`AgentHalo running on http://localhost:${port}`);
});

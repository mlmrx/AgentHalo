import fs from "node:fs";
import path from "node:path";

const auditPath = path.join(process.cwd(), "data", "audit-log.jsonl");

export function recordAudit(event) {
  const line = JSON.stringify({
    ...event,
    recordedAt: new Date().toISOString()
  });
  fs.appendFileSync(auditPath, `${line}\n`, "utf-8");
}

export function readAuditTail(limit = 20) {
  if (!fs.existsSync(auditPath)) return [];
  const lines = fs
    .readFileSync(auditPath, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean);
  return lines.slice(-limit).map((line) => JSON.parse(line));
}

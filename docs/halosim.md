# HaloSim

HaloSim is AgentHalo’s pre-action simulation and risk preview engine. It allows users to understand what an agent is about to do before it acts.

## 1. Why simulation matters
Simulation ensures users preview risk, data sharing, and alternatives before granting authority.

## 2. RiskPlan
RiskPlan describes proposed actions, targets, and requested data before execution.

## 3. DataExposureReport
DataExposureReport lists data that may be shared, why, and which fields are blocked by minimization.

## 4. RiskScore
HaloSim uses deterministic risk scoring (low/medium/high/blocked) for transparent policy decisions.

## 5. AlternativePlan
HaloSim generates safer options: privacy-preserving, richer-context, and local-only plans when possible.

## 6. TrustPreview
TrustPreview is shown before consent and includes risk, exposure, protected data, alternatives, and recommendation.

## 7. How HaloSim connects to HaloConsent
Consent is requested only after plan selection from TrustPreview.

## 8. How HaloSim connects to HaloProof
Chosen plan IDs and approved scopes are linked to downstream HaloProof records.

## 9. How HaloSim connects to HaloAudit
Simulation events are recorded with: simulation_created, risk_scored, data_exposure_analyzed, alternative_plan_generated, trust_preview_shown, and plan_selected/rejected.

## 10. Security limitations
Current implementation is deterministic MVP logic and should be backed by stronger policy engines and signed proofs in production.

## 11. Production roadmap
- Strong policy engine integration.
- Cryptographic plan attestation.
- Rich trust inspector views.
- Adaptive per-domain risk packs.

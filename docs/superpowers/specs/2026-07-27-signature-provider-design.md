# Modular signatures — SignatureProvider (FASE 7)

## Goal

Introduce a **pluggable signature architecture** so the product can grow from
on-screen drawing to external / advanced electronic providers without rewriting
the finalize UI.

This phase does **not** claim that a drawn signature equals a qualified digital
certificate or has automatic legal force.

## Current provider

| Id | Label | External flow |
|----|-------|---------------|
| `on_screen` | Assinatura na tela | no |

Future providers (stubs only in registry comments): DocuSign-like, ICP-Brasil, etc.

## On-screen record (`SignatureMeta`)

Stored alongside the PNG data-URL on `VehicleInfo`:

- `providerId`, `role` (`inspector` \| `client`)
- `signerName`, optional `signerDocument`
- `capturedAt`, `userAgent`, optional `sessionId`
- `contentHash` — SHA-256 of image payload
- optional `documentHash` when known at capture time

Persisted to cloud as `inspector_signature_meta` / `client_signature_meta` jsonb.

## Audit

`event_type: signature` with metadata `{ role, providerId, contentHash, signerName }`
(no full image in audit metadata).

## Code

- `src/lib/signatures/` — types, registry, `sealOnScreenSignature`
- `FinalizePanel` — name fields + seal on pad commit
- Migration `20260727070000_signature_meta.sql`

## Deferred

- External provider OAuth / redirect flows
- IP capture server-side (browser cannot reliably provide it)
- Dual-control (creator ≠ signer)

# QR Code & public verification (FASE 8)

## Goal

Strengthen the public `/verify` surface so each issued laudo can be checked by:

1. hash (QR / typed)
2. public code (`DA-YYYY-…`)
3. version / cancellation status

Outcomes (founder plan):

| Outcome | Title |
|---------|-------|
| confirmed | INTEGRIDADE CONFIRMADA |
| mismatch | INTEGRIDADE NÃO CONFIRMADA |
| missing | DOCUMENTO NÃO ENCONTRADO |
| cancelled | DOCUMENTO CANCELADO |
| old version | VERSÃO SUPERADA |

No “validade jurídica garantida” copy.

## Privacy

- Mask CPF-like strings if they appear in free text
- Optionally soften plate display on public card
- Do not add owner/phone/CPF fields to the public receipt

## Code

- `src/lib/verify/publicVerify.ts` — pure resolver + masks
- `src/views/Verify.tsx` — uses resolver; lookup by hash **or** `public_code`
- Loads `inspection.status` when `inspection_id` is present (cancelled)

## Deferred (FASE 9)

- PDF upload → recompute SHA-256 → compare (`integrity_not_confirmed` path)

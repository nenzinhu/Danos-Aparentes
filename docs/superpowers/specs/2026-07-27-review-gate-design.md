# Review gate before issue (FASE 6)

## Goal

Block `complete → issued` until a human explicitly confirms review of the
inspection snapshot. Records `reviewer_id`, `reviewed_at`, optional notes, and
a content hash of the reviewed payload.

This is an integrity / process control. It does **not** claim "validade jurídica
garantida", notarization, or court admissibility.

## Flow

1. Inspection is `complete` (editable).
2. Human clicks **Confirmar revisão** → `markAsReviewed` stores reviewer +
   `review_content_hash` of vehicle + damages + laudo version.
3. After review, vehicle/damage fields are frozen until **Reabrir revisão**
   (`clearReview`).
4. PDF issue / `markAsIssued` calls `assertCanIssue`. Missing review →
   `IssueBlockedWithoutReviewError`. Divergent content hash →
   `ReviewContentStaleError`.
5. Audit: `review_completed`, `issue_blocked_without_review`.

Status model unchanged (`draft` / `complete` / `issued` / `superseded` /
`cancelled`). Review is metadata on `complete`, not a new status.

## Columns (`vehicle_inspections`)

| Column | Notes |
|--------|-------|
| `reviewer_id` | auth user who confirmed |
| `reviewed_at` | timestamptz |
| `review_notes` | optional |
| `review_content_hash` | 32-hex SHA-256 prefix of review payload |

## Code

- `src/lib/pdf/reviewGate.ts` — pure gate + helpers
- `src/lib/pdf/reportIssuance.ts` — `markAsIssued` calls `assertCanIssue`
- Sync/mapping persist review columns
- UI: Confirmar / Reabrir revisão in export panel

## Deferred

- Separate reviewer role (RBAC FASE 13)
- Mandatory dual control (creator ≠ reviewer)
- Timeline UI (FASE 10)

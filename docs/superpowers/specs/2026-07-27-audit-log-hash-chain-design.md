# Append-only AUDIT_LOG with hash chain (FASE 3)

## Goal

Record key inspection lifecycle events in an **append-only** `audit_log`
table. Each event carries a SHA-256 `event_hash` that includes the previous
event’s hash for the same chain (per `inspection_id`, or a global stream when
`inspection_id` is null).

This is a technical audit trail. It does **not** claim “validade jurídica
garantida”, notarization, or court admissibility.

## Auth / tenancy mapping

| Field | Maps to |
|-------|---------|
| `user_id` | `auth.users.id` — account that owns the row (RLS boundary; same as `vehicle_inspections.user_id`) |
| `tenant_id` | Optional `companies.id` when the actor belongs to / owns a company team; otherwise `null`. Solo accounts use `user_id` as the tenancy boundary. |
| `actor_id` | Who performed the action (usually same UUID as `user_id`; may differ for future service actors) |
| `actor_type` | `user` \| `system` \| `service` |

Team managers (`companies.owner_id` via `is_team_manager_of`) may **select**
events for team members’ `user_id`s. They cannot insert as another user.

## Event shape

- `event_id` (uuid PK)
- `inspection_id` (text, nullable)
- `tenant_id` (uuid, nullable)
- `user_id` (uuid, not null)
- `actor_id` (text, not null)
- `actor_type` (text)
- `event_type` (text) — see catalog below
- `timestamp` (timestamptz)
- `ip` / `user_agent` / `device_id` (optional, best-effort)
- `metadata` (jsonb)
- `previous_event_hash` (text; empty string for genesis)
- `event_hash` (64-char lowercase hex SHA-256)

## Chain rule

```
event_hash = SHA-256(canonical JSON of all fields except event_hash,
                     including previous_event_hash)
```

Previous tip = latest row for the same chain key:

- with inspection → `inspection_id = X`
- without → `inspection_id IS NULL` (global stream)

## Event catalog (current + reserved)

Wired in this phase (best-effort): `hash_generation`, `pdf_generation`,
`issuance`, `correction`, `change` (sync upsert), `ai_analysis`.

Reserved for later wiring: `creation`, `start`, `damage_create`,
`photo_capture`, `human_decision`, `review`, `signature`, `gps`,
`verification`, `cancellation`, `unauthorized_access_attempt`,
`issued_mutation_attempt`.

## RLS / immutability

- Authenticated: **INSERT** own (`auth.uid() = user_id`); **SELECT** own + manager.
- No UPDATE / DELETE policies for authenticated clients.
- Trigger blocks UPDATE and DELETE (service role only via bypass if ever needed).

## Code

- `src/lib/audit/auditLog.ts` — payload, hash, append, list, verify
- Migration `src/supabase/migrations/20260727030000_audit_log.sql`
- Mirror in `supabase/schema.sql`

## Deferred

- Full IP / device capture from edge middleware
- Wiring every event type in the catalog
- UI Timeline (FASE 10)
- Concurrent-append locking (advisory lock / serializable)
- Offline queue of audit events (today: best-effort when online + session)

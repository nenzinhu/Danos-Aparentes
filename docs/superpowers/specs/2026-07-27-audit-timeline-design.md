# Inspection audit timeline (FASE 10)

## Goal

Show a read-only timeline of `audit_log` events for the active inspection in the Laudo tab.

## Code

- `src/lib/audit/timelinePresent.ts` — labels + CPF masking in metadata
- `src/components/InspectionAuditTimeline.tsx` — collapsible UI
- Wired in `InspectTab` when `inspectionId` is present

## Notes

- Consumes `listAuditEventsByInspection` (FASE 3)
- Does not claim legal validity
- Broader org-wide audit dashboard deferred to FASE 16

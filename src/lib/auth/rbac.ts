/**
 * FASE 13 — role-based permissions (client + server safe; no I/O).
 * On-screen signature ≠ qualified certificate; verify/issue are process controls only.
 */

export type AppRole = 'solo' | 'owner' | 'inspector'

export type Permission = 'issue' | 'review' | 'verify' | 'export_lgpd' | 'view_team_reports'

const ROLE_PERMISSIONS: Record<AppRole, ReadonlySet<Permission>> = {
  solo: new Set(['issue', 'review', 'verify', 'export_lgpd']),
  owner: new Set(['issue', 'review', 'verify', 'export_lgpd', 'view_team_reports']),
  /** Corporativo inspector: vistoria + emissão própria; revisão fica com o gestor. */
  inspector: new Set(['issue', 'verify', 'export_lgpd']),
}

export function roleHasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission)
}

export function assertPermission(
  role: AppRole,
  permission: Permission,
  message?: string,
): void {
  if (!roleHasPermission(role, permission)) {
    throw new Error(message || `Permissão negada: ${permission}`)
  }
}

/** Owner reviews team reports; solo reviews own; inspector cannot review. */
export function canReviewReport(
  role: AppRole,
  actorUserId: string,
  reportOwnerUserId: string,
): boolean {
  if (!roleHasPermission(role, 'review')) return false
  if (role === 'owner') return true
  return actorUserId === reportOwnerUserId
}

export function canExportLgpdForReport(
  role: AppRole,
  actorUserId: string,
  reportOwnerUserId: string,
): boolean {
  if (!roleHasPermission(role, 'export_lgpd')) return false
  if (role === 'owner') return true
  return actorUserId === reportOwnerUserId
}

export function canIssueReport(role: AppRole): boolean {
  return roleHasPermission(role, 'issue')
}

import { describe, expect, it } from 'vitest'
import {
  assertPermission,
  canExportLgpdForReport,
  canIssueReport,
  canReviewReport,
  roleHasPermission,
} from '../rbac'

describe('rbac', () => {
  it('solo has full self-service permissions', () => {
    expect(roleHasPermission('solo', 'issue')).toBe(true)
    expect(roleHasPermission('solo', 'review')).toBe(true)
    expect(roleHasPermission('solo', 'export_lgpd')).toBe(true)
    expect(roleHasPermission('solo', 'view_team_reports')).toBe(false)
  })

  it('inspector cannot review but can issue', () => {
    expect(canIssueReport('inspector')).toBe(true)
    expect(canReviewReport('inspector', 'u1', 'u1')).toBe(false)
    expect(assertPermission).toBeDefined()
  })

  it('owner can review team reports and export LGPD', () => {
    expect(canReviewReport('owner', 'owner-1', 'inspector-9')).toBe(true)
    expect(canExportLgpdForReport('owner', 'owner-1', 'inspector-9')).toBe(true)
  })

  it('inspector exports LGPD only for own reports', () => {
    expect(canExportLgpdForReport('inspector', 'u1', 'u1')).toBe(true)
    expect(canExportLgpdForReport('inspector', 'u1', 'u2')).toBe(false)
  })

  it('assertPermission throws when denied', () => {
    expect(() => assertPermission('inspector', 'view_team_reports')).toThrow(/negada/)
  })
})

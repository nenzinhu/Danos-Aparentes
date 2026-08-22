import { NextRequest, NextResponse } from 'next/server'
import {
  assertPermission,
  canExportLgpdForReport,
  canReviewReport,
  type AppRole,
  type Permission,
} from '../auth/rbac'
import { getUserFromRequest } from './auth'
import { resolveTenantContextForUser } from './tenantScope'

export type AuthzContext = {
  userId: string
  role: AppRole
  tenantId: string | null
}

export async function getAuthzFromRequest(req: NextRequest): Promise<AuthzContext | null> {
  const user = await getUserFromRequest(req)
  if (!user) return null
  const { role, tenantId } = await resolveTenantContextForUser(user.id)
  return { userId: user.id, role, tenantId }
}

export async function requirePermission(
  req: NextRequest,
  permission: Permission,
): Promise<AuthzContext | NextResponse> {
  const ctx = await getAuthzFromRequest(req)
  if (!ctx) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  try {
    assertPermission(ctx.role, permission)
  } catch {
    return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
  }
  return ctx
}

export function assertCanReviewOnServer(
  ctx: AuthzContext,
  reportOwnerUserId: string,
): void {
  if (!canReviewReport(ctx.role, ctx.userId, reportOwnerUserId)) {
    throw new Error('Somente o gestor da equipe pode confirmar revisão deste laudo')
  }
}

export function assertCanExportLgpdOnServer(
  ctx: AuthzContext,
  reportOwnerUserId: string,
): void {
  if (!canExportLgpdForReport(ctx.role, ctx.userId, reportOwnerUserId)) {
    throw new Error('Exportação LGPD não permitida para este laudo')
  }
}

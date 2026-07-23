'use client';
import { useState, useCallback, useEffect } from 'react'
import { SavedReport } from '../types'

export interface TeamMember {
  user_id: string | null
  invited_email: string
  status: 'pending' | 'accepted'
  invited_at: string
  joined_at: string | null
}

export interface TeamReport {
  inspectorEmail: string
  report: SavedReport
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    if (body && typeof body.error === 'string') return body.error
  } catch {
    // ignore parse failures, use fallback
  }
  return fallback
}

export function useTeam(accessToken?: string, enabled: boolean = true) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [reports, setReports] = useState<TeamReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled || !accessToken) return
    setLoading(true)
    try {
      const res = await fetch('/api/team-reports', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error(await readErrorMessage(res, 'Não foi possível carregar a equipe'))
      const data = await res.json()
      setMembers(data.members ?? [])
      setReports(data.reports ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipe')
    } finally {
      setLoading(false)
    }
  }, [accessToken, enabled])

  useEffect(() => { const id = setTimeout(refresh, 0); return () => clearTimeout(id); }, [refresh])

  const inviteMember = useCallback(async (email: string): Promise<string> => {
    if (!accessToken) throw new Error('Não autenticado')
    const res = await fetch('/api/team-invite', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error(await readErrorMessage(res, 'Não foi possível gerar o convite'))
    const { inviteUrl } = await res.json()
    await refresh()
    return inviteUrl as string
  }, [accessToken, refresh])

  return { members, reports, loading, error, refresh, inviteMember }
}

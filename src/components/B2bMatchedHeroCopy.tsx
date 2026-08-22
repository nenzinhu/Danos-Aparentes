'use client'

import { useEffect, useState } from 'react'
import { captureUtmParamsFromUrl, getStoredUtms } from '@/src/lib/analytics/utm'
import { trackEvent } from '@/src/lib/analytics/events'
import {
  resolveB2bMessageMatch,
  type MessageMatchVariant,
} from '@/src/lib/b2bMessageMatch'
import type { B2bVertical } from '@/src/lib/b2bPositioning'

type Props = {
  vertical: B2bVertical
  defaultKicker: string
  defaultHeadline: string
  defaultSub: string
  /** Classes do kicker (eyebrow) */
  kickerClassName?: string
  /** Classes do H1 */
  headlineClassName?: string
  /** Classes do subtítulo */
  subClassName?: string
}

/**
 * Hero copy com message match: se utm_content/term/campaign casar com um
 * conceito de anúncio, espelha a headline do ad. Sem UTM → defaults da página.
 */
export default function B2bMatchedHeroCopy({
  vertical,
  defaultKicker,
  defaultHeadline,
  defaultSub,
  kickerClassName = 'inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3',
  headlineClassName = 'font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]',
  subClassName = 'text-sm text-[var(--text-muted)] mt-3 max-w-lg',
}: Props) {
  const [match, setMatch] = useState<MessageMatchVariant | null>(null)

  useEffect(() => {
    captureUtmParamsFromUrl()
    const utms = getStoredUtms()
    // Também lê query atual (primeiro hit antes do AnalyticsScripts)
    const params = new URLSearchParams(window.location.search)
    const live = {
      source: params.get('utm_source') || utms.source,
      medium: params.get('utm_medium') || utms.medium,
      campaign: params.get('utm_campaign') || utms.campaign,
      content: params.get('utm_content') || utms.content,
      term: params.get('utm_term') || utms.term,
    }
    const resolved = resolveB2bMessageMatch(vertical, live)
    // Adia um tick para não chamar setState sincronamente dentro do effect.
    setTimeout(() => setMatch(resolved), 0)
    if (resolved) {
      trackEvent('message_match', {
        source: vertical,
        match_id: resolved.id,
        utm_content: live.content,
        utm_campaign: live.campaign,
        utm_term: live.term,
      })
    }
  }, [vertical])

  const kicker = match?.kicker ?? defaultKicker
  const headline = match?.headline ?? defaultHeadline
  const sub = match?.sub ?? defaultSub

  return (
    <>
      <span className={kickerClassName}>
        <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
        {kicker}
      </span>
      <h1 className={headlineClassName} suppressHydrationWarning>
        {headline}
      </h1>
      <p className={subClassName} suppressHydrationWarning>
        {sub}
      </p>
    </>
  )
}

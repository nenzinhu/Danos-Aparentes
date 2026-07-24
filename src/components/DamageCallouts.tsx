'use client';
import { useCallback, useLayoutEffect, useState, type RefObject } from 'react'
import type { Damage, DamageType, Severity } from '../types'

type SelectedPart = { id: string; name: string } | null

interface CalloutItem {
  key: string
  ax: number
  ay: number
  lx: number
  ly: number
  side: 'left' | 'right'
  title: string
  subtitle?: string
  tone: Severity | 'select'
}

interface Props {
  containerRef: RefObject<HTMLElement | null>
  damages: Damage[]
  selectedPart: SelectedPart
  /** Remeasure when zoom changes. */
  scale: number
  /** Remeasure when view/vehicle swaps. */
  layoutKey: string
}

const TYPE_SHORT: Record<DamageType, string> = {
  scratch: 'RISCO',
  dent: 'AMASSADO',
  broken: 'QUEBRADO',
}

const TONE: Record<Severity | 'select', { stroke: string; fill: string; text: string; border: string }> = {
  select: {
    stroke: '#67e8f9',
    fill: 'rgba(34, 211, 238, 0.18)',
    text: '#a5f3fc',
    border: 'rgba(103, 232, 249, 0.55)',
  },
  low: {
    stroke: '#94a3b8',
    fill: 'rgba(148, 163, 184, 0.16)',
    text: '#cbd5e1',
    border: 'rgba(148, 163, 184, 0.5)',
  },
  medium: {
    stroke: '#fb923c',
    fill: 'rgba(249, 115, 22, 0.16)',
    text: '#fdba74',
    border: 'rgba(251, 146, 60, 0.55)',
  },
  high: {
    stroke: '#f87171',
    fill: 'rgba(239, 68, 68, 0.18)',
    text: '#fca5a5',
    border: 'rgba(248, 113, 113, 0.55)',
  },
}

const LABEL_GAP = 28
const LABEL_H = 22
const MIN_STACK = 26

function findPartEl(root: HTMLElement, partId: string): Element | null {
  return root.querySelector(`[data-part-id="${CSS.escape(partId)}"]`)
}

function anchorInContainer(el: Element, cRect: DOMRect): { ax: number; ay: number } {
  const r = el.getBoundingClientRect()
  return {
    ax: r.left + r.width / 2 - cRect.left,
    ay: r.top + r.height / 2 - cRect.top,
  }
}

/**
 * Forensic-style callouts pinned to vehicle parts: anchor + leader + name tag.
 * Selection shows name only; saved damages show name · type.
 */
export default function DamageCallouts({
  containerRef,
  damages,
  selectedPart,
  scale,
  layoutKey,
}: Props) {
  const [items, setItems] = useState<CalloutItem[]>([])

  const measure = useCallback(() => {
    const root = containerRef.current
    if (!root) {
      setItems([])
      return
    }

    const cRect = root.getBoundingClientRect()
    if (cRect.width < 8 || cRect.height < 8) {
      setItems([])
      return
    }

    const next: CalloutItem[] = []
    const seen = new Set<string>()

    const push = (
      partId: string,
      title: string,
      tone: Severity | 'select',
      subtitle?: string,
    ) => {
      if (seen.has(partId)) return
      const el = findPartEl(root, partId)
      if (!el) return
      seen.add(partId)

      const { ax, ay } = anchorInContainer(el, cRect)
      const preferRight = ax < cRect.width * 0.58
      const side: 'left' | 'right' = preferRight ? 'right' : 'left'
      const lx = preferRight
        ? Math.min(ax + LABEL_GAP, cRect.width - 12)
        : Math.max(ax - LABEL_GAP, 12)
      const ly = Math.max(14, Math.min(ay, cRect.height - 14))

      next.push({ key: partId, ax, ay, lx, ly, side, title, subtitle, tone })
    }

    for (const d of damages) {
      push(d.partId, d.partName, d.severity, TYPE_SHORT[d.type] ?? d.typeName)
    }

    if (selectedPart) {
      // Selection callout wins visual priority; replace damage row for same part.
      const idx = next.findIndex(i => i.key === selectedPart.id)
      if (idx >= 0) {
        const existing = next[idx]
        next[idx] = {
          ...existing,
          title: selectedPart.name,
          tone: 'select',
          subtitle: existing.subtitle,
        }
      } else {
        push(selectedPart.id, selectedPart.name, 'select')
      }
    }

    // Nudge overlapping labels vertically.
    next.sort((a, b) => a.ly - b.ly)
    for (let i = 1; i < next.length; i++) {
      const prev = next[i - 1]
      const cur = next[i]
      if (Math.abs(cur.lx - prev.lx) < 120 && cur.ly - prev.ly < MIN_STACK) {
        cur.ly = prev.ly + MIN_STACK
      }
    }

    setItems(next)
  }, [containerRef, damages, selectedPart])

  useLayoutEffect(() => {
    measure()
    const root = containerRef.current
    const raf = requestAnimationFrame(measure)
    const onResize = () => measure()
    window.addEventListener('resize', onResize)

    let mo: MutationObserver | null = null
    if (root) {
      mo = new MutationObserver(() => measure())
      mo.observe(root, { childList: true, subtree: true })
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      mo?.disconnect()
    }
  }, [measure, scale, layoutKey, containerRef])

  if (!items.length) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-visible"
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {items.map(item => {
          const tone = TONE[item.tone]
          const labelX = item.side === 'right' ? item.lx : item.lx
          return (
            <g key={`line-${item.key}`}>
              <line
                x1={item.ax}
                y1={item.ay}
                x2={labelX}
                y2={item.ly}
                stroke={tone.stroke}
                strokeWidth={1.25}
                strokeOpacity={0.75}
                strokeLinecap="round"
              />
              <circle
                cx={item.ax}
                cy={item.ay}
                r={3.5}
                fill={tone.stroke}
                stroke="#020617"
                strokeWidth={1.25}
              />
              <circle
                cx={item.ax}
                cy={item.ay}
                r={7}
                fill="none"
                stroke={tone.stroke}
                strokeOpacity={0.35}
                strokeWidth={1}
              />
            </g>
          )
        })}
      </svg>

      {items.map(item => {
        const tone = TONE[item.tone]
        const transform = item.side === 'right'
          ? 'translate(0, -50%)'
          : 'translate(-100%, -50%)'
        return (
          <div
            key={`tag-${item.key}`}
            className="damage-tag absolute whitespace-nowrap px-2 py-0.5 rounded-md border backdrop-blur-sm shadow-sm"
            style={{
              left: item.lx,
              top: item.ly,
              transform,
              minHeight: LABEL_H,
              color: tone.text,
              background: tone.fill,
              borderColor: tone.border,
              boxShadow: `0 0 12px ${tone.stroke}33`,
            }}
          >
            <span>{item.title}</span>
            {item.subtitle ? (
              <span className="opacity-80"> · {item.subtitle}</span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

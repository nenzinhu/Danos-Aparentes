'use client';
import { useCallback, useLayoutEffect, useState, useEffect, type RefObject } from 'react'
import type { Damage, DamageType, Severity } from '../types'
import { gsap, prefersReducedMotion } from '../lib/gsap'

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
  /** Estimated chip width (px) for collision. */
  w: number
  h: number
  /** Modo comparação: 'in' = entrada (check-in), 'out' = saída nova (check-out). */
  compare?: 'in' | 'out'
}

interface Props {
  containerRef: RefObject<HTMLElement | null>
  damages: Damage[]
  selectedPart: SelectedPart
  /** Remeasure when zoom changes. */
  scale: number
  /** Remeasure when view/vehicle swaps. */
  layoutKey: string
  /** Modo comparação entrada (check-in) vs saída (check-out). */
  compareMode?: boolean
  /** Chaves (partId::type) da inspeção anterior (entrada). */
  baselineKeys?: Set<string> | null
  /**
   * Mobile / narrow: pins only on the SVG; text lives in DamageCalloutLegend
   * so labels don't smother the smaller diagram.
   */
  compact?: boolean
}

const TYPE_SHORT: Record<DamageType, string> = {
  scratch: 'RISCO',
  dent: 'AMASSADO',
  broken: 'QUEBRADO',
}

const TONE: Record<Severity | 'select', { stroke: string; fill: string; text: string; border: string }> = {
  select: {
    stroke: 'var(--damage-select-stroke)',
    fill: 'var(--damage-select-fill)',
    text: 'var(--damage-select-text)',
    border: 'var(--damage-select-border)',
  },
  low: {
    stroke: 'var(--damage-low-stroke)',
    fill: 'var(--damage-low-fill)',
    text: 'var(--damage-low-text)',
    border: 'var(--damage-low-border)',
  },
  medium: {
    stroke: 'var(--damage-medium-stroke)',
    fill: 'var(--damage-medium-fill)',
    text: 'var(--damage-medium-text)',
    border: 'var(--damage-medium-border)',
  },
  high: {
    stroke: 'var(--damage-high-stroke)',
    fill: 'var(--damage-high-fill)',
    text: 'var(--damage-high-text)',
    border: 'var(--damage-high-border)',
  },
}

const LABEL_GAP = 32
const LABEL_H = 22
const LABEL_PAD_X = 16
const CHAR_W = 6.2
const STACK_GAP = 6
const EDGE = 8
const MAX_PASSES = 12

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

function estimateWidth(title: string, subtitle?: string): number {
  const text = subtitle ? `${title} · ${subtitle}` : title
  return Math.min(220, Math.max(56, Math.ceil(text.length * CHAR_W) + LABEL_PAD_X))
}

/** Axis-aligned box of the chip (lx/ly = attachment point on the leader). */
function labelBox(item: Pick<CalloutItem, 'lx' | 'ly' | 'side' | 'w' | 'h'>) {
  const left = item.side === 'right' ? item.lx : item.lx - item.w
  const top = item.ly - item.h / 2
  return { left, right: left + item.w, top, bottom: top + item.h }
}

function boxesOverlap(
  a: ReturnType<typeof labelBox>,
  b: ReturnType<typeof labelBox>,
  pad = STACK_GAP,
): boolean {
  return !(
    a.right + pad <= b.left
    || b.right + pad <= a.left
    || a.bottom + pad <= b.top
    || b.bottom + pad <= a.top
  )
}

function clampLabel(item: CalloutItem, width: number, height: number) {
  const half = item.h / 2
  item.ly = Math.max(EDGE + half, Math.min(item.ly, height - EDGE - half))
  if (item.side === 'right') {
    item.lx = Math.max(EDGE, Math.min(item.lx, width - EDGE - item.w))
  } else {
    item.lx = Math.max(EDGE + item.w, Math.min(item.lx, width - EDGE))
  }
}

/**
 * Spread labels so chips never sit on top of each other.
 * Packs each side as a vertical column, flips overflow to the other side,
 * then runs a final pairwise separation.
 */
export function resolveCalloutCollisions(
  items: CalloutItem[],
  containerW: number,
  containerH: number,
): CalloutItem[] {
  if (items.length === 0) return items
  if (items.length === 1) {
    clampLabel(items[0], containerW, containerH)
    return items
  }

  const ordered = [...items].sort((a, b) => (a.ay - b.ay) || (a.ax - b.ax) || a.key.localeCompare(b.key))

  const packColumn = (col: CalloutItem[]) => {
    col.sort((a, b) => a.ay - b.ay || a.key.localeCompare(b.key))
    let cursor = EDGE
    for (const item of col) {
      const desiredTop = item.ay - item.h / 2
      const top = Math.max(cursor, desiredTop)
      item.ly = top + item.h / 2
      // Keep x in bounds, but allow temporary y overflow so we can shift as a group.
      if (item.side === 'right') {
        item.lx = Math.max(EDGE, Math.min(item.lx, containerW - EDGE - item.w))
      } else {
        item.lx = Math.max(EDGE + item.w, Math.min(item.lx, containerW - EDGE))
      }
      cursor = top + item.h + STACK_GAP
    }

    if (!col.length) return

    const last = col[col.length - 1]
    const overflow = (last.ly + last.h / 2) - (containerH - EDGE)
    if (overflow > 0) {
      for (const item of col) item.ly -= overflow
    }

    // Stack taller than the viewport: pack tight from the top.
    const first = col[0]
    if (first.ly - first.h / 2 < EDGE - 0.5) {
      cursor = EDGE
      for (const item of col) {
        item.ly = cursor + item.h / 2
        cursor += item.h + STACK_GAP
      }
    }

    for (const item of col) clampLabel(item, containerW, containerH)

    // If clamping re-introduced overlaps at the bottom, stagger horizontally.
    for (let i = 1; i < col.length; i++) {
      const prev = col[i - 1]
      const cur = col[i]
      if (!boxesOverlap(labelBox(prev), labelBox(cur), STACK_GAP)) continue
      const step = 14
      if (cur.side === 'right') {
        cur.lx = Math.min(containerW - EDGE - cur.w, Math.max(cur.lx, prev.lx) + step)
      } else {
        cur.lx = Math.max(EDGE + cur.w, Math.min(cur.lx, prev.lx) - step)
      }
      cur.ly = Math.min(
        containerH - EDGE - cur.h / 2,
        Math.max(cur.ly, labelBox(prev).bottom + STACK_GAP + cur.h / 2),
      )
      clampLabel(cur, containerW, containerH)
    }
  }

  const left: CalloutItem[] = []
  const right: CalloutItem[] = []
  for (const item of ordered) {
    ;(item.side === 'left' ? left : right).push(item)
  }

  packColumn(left)
  packColumn(right)

  // Move labels that still collide across sides (or that overflowed packing).
  const relocateOverflow = (from: CalloutItem[], to: CalloutItem[], toSide: 'left' | 'right') => {
    const stillTight: CalloutItem[] = []
    for (let i = 0; i < from.length; i++) {
      const item = from[i]
      const prev = stillTight[stillTight.length - 1]
      const collidesPrev = prev ? boxesOverlap(labelBox(item), labelBox(prev), STACK_GAP) : false
      const pastBottom = item.ly + item.h / 2 > containerH - EDGE + 0.5
      if (collidesPrev || pastBottom) {
        item.side = toSide
        item.lx = toSide === 'right'
          ? Math.min(item.ax + LABEL_GAP, containerW - EDGE - item.w)
          : Math.max(item.ax - LABEL_GAP, EDGE + item.w)
        item.ly = item.ay
        to.push(item)
      } else {
        stillTight.push(item)
      }
    }
    from.length = 0
    from.push(...stillTight)
  }

  relocateOverflow(right, left, 'left')
  relocateOverflow(left, right, 'right')
  packColumn(left)
  packColumn(right)

  // Final pairwise separation — guarantees no chip AABB overlap.
  const all = [...left, ...right].sort((a, b) => a.ly - b.ly || a.lx - b.lx)
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let moved = false
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i]
        const b = all[j]
        if (!boxesOverlap(labelBox(a), labelBox(b), STACK_GAP)) continue

        // Push the lower one further down; if that overflows, push the upper one up.
        const need = labelBox(a).bottom + STACK_GAP + b.h / 2
        if (need <= containerH - EDGE - b.h / 2) {
          b.ly = need
        } else {
          a.ly = Math.max(EDGE + a.h / 2, labelBox(b).top - STACK_GAP - a.h / 2)
        }

        // If still overlapping horizontally on opposite sides near center, nudge outward.
        if (boxesOverlap(labelBox(a), labelBox(b), STACK_GAP) && a.side !== b.side) {
          if (a.side === 'left') a.lx = Math.max(EDGE + a.w, a.lx - 12)
          else a.lx = Math.min(containerW - EDGE - a.w, a.lx + 12)
          if (b.side === 'left') b.lx = Math.max(EDGE + b.w, b.lx - 12)
          else b.lx = Math.min(containerW - EDGE - b.w, b.lx + 12)
        }

        clampLabel(a, containerW, containerH)
        clampLabel(b, containerW, containerH)
        moved = true
      }
    }
    if (!moved) break
  }

  return all
}

/**
 * Forensic-style callouts pinned to vehicle parts: anchor + leader + name tag.
 * Selection shows name only; saved damages show name · type.
 * Labels are deconflicted so chips never cover each other.
 * In compact (mobile) mode: numbered pins only — text goes to DamageCalloutLegend.
 */
export default function DamageCallouts({
  containerRef,
  damages,
  selectedPart,
  scale,
  layoutKey,
  compact = false,
  compareMode = false,
  baselineKeys,
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
    const baselineSet = compareMode && baselineKeys
      ? new Set([...baselineKeys].map((k) => k.split('::')[0]))
      : null

    const push = (
      partId: string,
      title: string,
      tone: Severity | 'select',
      subtitle?: string,
      compare?: 'in' | 'out',
    ) => {
      if (seen.has(partId)) return
      const el = findPartEl(root, partId)
      if (!el) return
      seen.add(partId)

      const { ax, ay } = anchorInContainer(el, cRect)
      const w = estimateWidth(title, subtitle)
      const h = LABEL_H
      const preferRight = ax < cRect.width * 0.55
      const side: 'left' | 'right' = preferRight ? 'right' : 'left'
      const lx = preferRight
        ? Math.min(ax + LABEL_GAP, cRect.width - EDGE - w)
        : Math.max(ax - LABEL_GAP, EDGE + w)
      const ly = Math.max(EDGE + h / 2, Math.min(ay, cRect.height - EDGE - h / 2))

      next.push({ key: partId, ax, ay, lx, ly, side, title, subtitle, tone, w, h, compare })
    }

    for (const d of damages) {
      const isNew = baselineSet ? !baselineSet.has(d.partId) : false
      const tone = compareMode
        ? (isNew ? 'high' : 'low')
        : d.severity
      const compare: 'in' | 'out' | undefined = compareMode
        ? (isNew ? 'out' : 'in')
        : undefined
      push(d.partId, d.partName, tone, TYPE_SHORT[d.type] ?? d.typeName, compare)
    }

    if (selectedPart) {
      const idx = next.findIndex(i => i.key === selectedPart.id)
      if (idx >= 0) {
        const existing = next[idx]
        const title = selectedPart.name
        const subtitle = existing.subtitle
        next[idx] = {
          ...existing,
          title,
          tone: 'select',
          subtitle,
          w: estimateWidth(title, subtitle),
        }
      } else {
        push(selectedPart.id, selectedPart.name, 'select')
      }
    }

    // Compact: keep anchors only (no leader geometry to resolve).
    if (compact) {
      setItems(next.map(i => ({ ...i, lx: i.ax, ly: i.ay })))
      return
    }

    setItems(resolveCalloutCollisions(next, cRect.width, cRect.height))
  }, [containerRef, damages, selectedPart, compact, compareMode, baselineKeys])

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

  // Animação "combinar" no modo comparação: entrada (azul) fixa, saída (vermelho)
  // cresce a partir dela; novos danos pulsam. Respeita prefers-reduced-motion.
  useEffect(() => {
    if (!compareMode) return
    if (prefersReducedMotion()) return
    const root = containerRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const pins = gsap.utils.toArray<SVGGElement>('[data-compare]', root)
      if (!pins.length) return
      gsap.fromTo(
        pins,
        { scale: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' },
        {
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          stagger: 0.08,
        },
      )
      const outs = pins.filter((p) => p.getAttribute('data-compare') === 'out')
      if (outs.length) {
        gsap.to(outs, {
          scale: 1.18,
          repeat: -1,
          yoyo: true,
          duration: 0.7,
          ease: 'sine.inOut',
          delay: 0.6,
          transformOrigin: '50% 50%',
          transformBox: 'fill-box',
        })
      }
    }, root)
    return () => ctx.revert()
  }, [compareMode, items, containerRef])

  if (!items.length) return null

  // Stable index for pin ↔ legend mapping (damages first, then bare selection).
  const indexByKey = new Map<string, number>()
  let n = 0
  for (const d of damages) {
    if (!indexByKey.has(d.partId)) indexByKey.set(d.partId, ++n)
  }
  if (selectedPart && !indexByKey.has(selectedPart.id)) {
    indexByKey.set(selectedPart.id, ++n)
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-visible"
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {items.map(item => {
          const tone = TONE[item.tone]
          const idx = indexByKey.get(item.key) ?? 0
          if (compact) {
            return (
              <g key={`pin-${item.key}`}>
                <circle
                  cx={item.ax}
                  cy={item.ay}
                  r={11}
                  fill={tone.fill}
                  stroke={tone.stroke}
                  strokeWidth={1.5}
                />
                <circle
                  cx={item.ax}
                  cy={item.ay}
                  r={11}
                  fill="#020617"
                  fillOpacity={0.55}
                />
                <text
                  x={item.ax}
                  y={item.ay + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--damage-pin-number)"
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="ui-monospace, monospace"
                >
                  {idx}
                </text>
              </g>
            )
          }
          return (
            <g key={`line-${item.key}`} data-compare={item.compare}>
              <line
                x1={item.ax}
                y1={item.ay}
                x2={item.lx}
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
              {item.compare === 'in' && (
                <path
                  d="M 0 0 l -3 -4 l 6 0 z"
                  transform={`translate(${item.ax}, ${item.ay - 15})`}
                  fill="var(--damage-low-stroke)"
                  stroke="#020617"
                  strokeWidth={0.75}
                />
              )}
              {item.compare === 'out' && (
                <path
                  d="M 0 0 l -3 4 l 6 0 z"
                  transform={`translate(${item.ax}, ${item.ay + 15})`}
                  fill="var(--damage-high-stroke)"
                  stroke="#020617"
                  strokeWidth={0.75}
                />
              )}
            </g>
          )
        })}
      </svg>

      {!compact && items.map(item => {
        const tone = TONE[item.tone]
        const transform = item.side === 'right'
          ? 'translate(0, -50%)'
          : 'translate(-100%, -50%)'
        return (
          <div
            key={`tag-${item.key}`}
            className="damage-tag absolute whitespace-nowrap px-2 py-0.5 rounded-md border backdrop-blur-md shadow-sm"
            style={{
              left: item.lx,
              top: item.ly,
              transform,
              width: item.w,
              minHeight: item.h,
              color: tone.text,
              background: 'var(--damage-tag-bg)',
              borderColor: tone.border,
              boxShadow: `0 0 12px color-mix(in srgb, ${tone.stroke} 20%, transparent)`,
            }}
          >
            <span className="truncate">{item.title}</span>
            {item.subtitle ? (
              <span className="opacity-90 shrink-0"> · {item.subtitle}</span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

interface LegendProps {
  damages: Damage[]
  selectedPart: SelectedPart
}

/**
 * Mobile legend: readable damage names under the SVG, matched to numbered pins.
 */
export function DamageCalloutLegend({ damages, selectedPart }: LegendProps) {
  const rows: { key: string; index: number; title: string; subtitle?: string; tone: Severity | 'select' }[] = []
  const seen = new Set<string>()

  damages.forEach((d) => {
    if (seen.has(d.partId)) return
    seen.add(d.partId)
    const isSelected = selectedPart?.id === d.partId
    rows.push({
      key: d.partId,
      index: rows.length + 1,
      title: d.partName,
      subtitle: TYPE_SHORT[d.type] ?? d.typeName,
      tone: isSelected ? 'select' : d.severity,
    })
  })

  if (selectedPart && !seen.has(selectedPart.id)) {
    rows.push({
      key: selectedPart.id,
      index: rows.length + 1,
      title: selectedPart.name,
      subtitle: 'SELECIONADO',
      tone: 'select',
    })
  }

  if (!rows.length) return null

  return (
    <div
      className="mt-2 px-1"
      role="list"
      aria-label="Avarias marcadas nesta vista"
    >
      <div className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5 px-0.5">
        Marcadores ({rows.length})
      </div>
      <ul className="flex flex-col gap-1.5 max-h-[132px] overflow-y-auto overscroll-contain pr-0.5">
        {rows.map(row => {
          const tone = TONE[row.tone]
          return (
            <li
              key={row.key}
              role="listitem"
              className="damage-tag flex items-center gap-2 rounded-lg border px-2 py-1.5"
              style={{
                color: tone.text,
                background: tone.fill,
                borderColor: tone.border,
              }}
            >
              <span
                className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem] font-black"
                style={{ background: '#02061799', color: 'var(--damage-pin-number)', border: `1px solid ${tone.border}` }}
              >
                {row.index}
              </span>
              <span className="min-w-0 flex-1 truncate normal-case tracking-normal text-[0.72rem] font-bold">
                {row.title}
                {row.subtitle ? (
                  <span className="opacity-90 font-semibold"> · {row.subtitle}</span>
                ) : null}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

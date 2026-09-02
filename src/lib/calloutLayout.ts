import type { Severity } from '../types'

export interface CalloutItem {
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

export const LABEL_GAP = 32
export const STACK_GAP = 6
export const EDGE = 8
export const MAX_PASSES = 12

/** Axis-aligned box of the chip (lx/ly = attachment point on the leader). */
export function labelBox(item: Pick<CalloutItem, 'lx' | 'ly' | 'side' | 'w' | 'h'>) {
  const left = item.side === 'right' ? item.lx : item.lx - item.w
  const top = item.ly - item.h / 2
  return { left, right: left + item.w, top, bottom: top + item.h }
}

export function boxesOverlap(
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

export function clampLabel(item: CalloutItem, width: number, height: number) {
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

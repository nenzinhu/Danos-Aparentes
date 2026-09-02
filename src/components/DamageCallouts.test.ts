import { describe, expect, it } from 'vitest'
import { resolveCalloutCollisions } from '../lib/calloutLayout'

type Item = Parameters<typeof resolveCalloutCollisions>[0][number]

function box(item: Item) {
  const left = item.side === 'right' ? item.lx : item.lx - item.w
  const top = item.ly - item.h / 2
  return { left, right: left + item.w, top, bottom: top + item.h }
}

function overlaps(a: Item, b: Item, pad = 6) {
  const A = box(a)
  const B = box(b)
  return !(
    A.right + pad <= B.left
    || B.right + pad <= A.left
    || A.bottom + pad <= B.top
    || B.bottom + pad <= A.top
  )
}

function make(
  key: string,
  ax: number,
  ay: number,
  overrides: Partial<Item> = {},
): Item {
  const w = 90
  const h = 22
  const side = ax < 200 ? 'right' : 'left'
  const lx = side === 'right' ? ax + 32 : ax - 32
  return {
    key,
    ax,
    ay,
    lx,
    ly: ay,
    side,
    title: key,
    tone: 'medium',
    w,
    h,
    ...overrides,
  }
}

describe('resolveCalloutCollisions', () => {
  it('keeps a single label near its anchor', () => {
    const [a] = resolveCalloutCollisions([make('capo', 120, 100)], 400, 300)
    expect(Math.abs(a.ly - 100)).toBeLessThan(2)
    expect(a.side).toBe('right')
  })

  it('stacks overlapping labels on the same side instead of covering', () => {
    const items = [
      make('porta', 140, 120),
      make('vidro', 145, 125),
      make('retro', 142, 118),
    ]
    const resolved = resolveCalloutCollisions(items, 400, 300)

    expect(resolved).toHaveLength(3)
    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        expect(overlaps(resolved[i], resolved[j])).toBe(false)
      }
    }
  })

  it('flips side when vertical stack would overflow', () => {
    // Cluster near the bottom-right of a short container forces flip/stack choices.
    const items = [
      make('a', 280, 260),
      make('b', 285, 262),
      make('c', 290, 264),
      make('d', 295, 266),
    ]
    const resolved = resolveCalloutCollisions(items, 400, 280)
    expect(resolved.every(i => i.ly >= 11 && i.ly <= 280 - 11)).toBe(true)
    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        expect(overlaps(resolved[i], resolved[j]), `${resolved[i].key} vs ${resolved[j].key}`).toBe(false)
      }
    }
  })
})

import { describe, expect, it } from 'vitest'
import { detectHorizontalSwipe } from './useZoomPan'

describe('detectHorizontalSwipe', () => {
  it('fires forward (1) when dragging left past the threshold', () => {
    expect(detectHorizontalSwipe(-80, 0, 400)).toBe(1)
  })

  it('fires backward (-1) when dragging right past the threshold', () => {
    expect(detectHorizontalSwipe(80, 0, 400)).toBe(-1)
  })

  it('does not fire below the threshold', () => {
    expect(detectHorizontalSwipe(30, 0, 400)).toBeNull()
  })

  it('does not fire when the movement is predominantly vertical', () => {
    expect(detectHorizontalSwipe(70, 60, 400)).toBeNull()
  })

  it('caps the threshold at 60px on wide containers', () => {
    // 25% of 1000px would be 250px; the 60px cap should still let this fire.
    expect(detectHorizontalSwipe(-65, 0, 1000)).toBe(1)
  })

  it('scales the threshold down on narrow containers', () => {
    // 25% of 160px = 40px; 45px should be enough to fire on a narrow container.
    expect(detectHorizontalSwipe(-45, 0, 160)).toBe(1)
    expect(detectHorizontalSwipe(-35, 0, 160)).toBeNull()
  })
})

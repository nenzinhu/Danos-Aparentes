'use client';
import { useRef, useState, useEffect, useCallback, RefObject } from 'react'

/**
 * Pure gesture classifier for drag-to-rotate (extracted for unit testing
 * without DOM/React — see docs/superpowers/specs/2026-07-26-drag-to-rotate-vehicle-viewer-design.md).
 * Returns the swipe direction once the accumulated drag from gesture start
 * crosses the threshold and is predominantly horizontal, otherwise null.
 */
export function detectHorizontalSwipe(
  totalDx: number,
  totalDy: number,
  containerWidth: number,
): 1 | -1 | null {
  const threshold = Math.min(60, containerWidth * 0.25)
  if (Math.abs(totalDx) > threshold && Math.abs(totalDx) > Math.abs(totalDy) * 1.5) {
    return totalDx < 0 ? 1 : -1
  }
  return null
}

export function useZoomPan(
  containerRef: RefObject<HTMLDivElement | null>,
  targetRef: RefObject<HTMLDivElement | null>,
  onHorizontalSwipe?: (direction: 1 | -1) => void,
  /** Bump this (e.g. a fullscreen toggle) to rebind listeners to whatever
   * DOM node containerRef.current points to right now. Needed whenever the
   * ref can end up attached to a different element than the one the
   * gesture effect originally bound to. */
  rebindKey?: unknown,
  /** When true, a drag never pans/offsets the vehicle — it's always treated
   * as a view-swipe attempt instead, regardless of zoom level. Lets people
   * rotate through views with a flick of the finger without ever nudging
   * the diagram out of place. */
  panLocked?: boolean
) {
  const [scale, setScale] = useState(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const scaleRef = useRef(1)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const pinchDist = useRef<number | null>(null)
  const panLockedRef = useRef(!!panLocked)
  useEffect(() => { panLockedRef.current = !!panLocked }, [panLocked])
  // Drag-to-rotate: only active near scale===1 (see docs/superpowers/specs/2026-07-26-drag-to-rotate-vehicle-viewer-design.md).
  // A tolerance (not strict equality) absorbs float drift from the wheel/pinch handlers below.
  const gestureStart = useRef({ x: 0, y: 0 })
  const swipeFired = useRef(false)
  const isAtDefaultZoom = () => Math.abs(scaleRef.current - 1) < 0.01
  const applyTransform = useCallback(() => {
    const target = targetRef.current;
    if (target) {
      target.style.transform = `translate3d(${offsetRef.current.x}px, ${offsetRef.current.y}px, 0) scale(${scaleRef.current})`;
    }
  }, [targetRef, offsetRef, scaleRef]);

  useEffect(() => {
    scaleRef.current = scale;
    applyTransform();
  }, [scale, applyTransform]);

  function reset() {
    offsetRef.current = { x: 0, y: 0 }
    setScale(1)
  }

  function zoomIn() {
    setScale(s => Math.min(4, s + 0.2))
  }

  function zoomOut() {
    setScale(s => Math.max(0.5, s - 0.2))
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      setScale(s => Math.min(4, Math.max(0.5, s - e.deltaY * 0.001)))
    }

    function onMouseDown(e: MouseEvent) {
      // Prevent drag initiation on controls or buttons
      if ((e.target as HTMLElement).closest('button')) return
      dragging.current = true
      last.current = { x: e.clientX, y: e.clientY }
      gestureStart.current = { x: e.clientX, y: e.clientY }
      swipeFired.current = false
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return

      if (panLockedRef.current || isAtDefaultZoom()) {
        maybeFireSwipe(e.clientX, e.clientY)
        return
      }

      offsetRef.current = {
        x: offsetRef.current.x + e.clientX - last.current.x,
        y: offsetRef.current.y + e.clientY - last.current.y
      }
      last.current = { x: e.clientX, y: e.clientY }
      applyTransform()
    }

    function onMouseUp() { dragging.current = false }

    function maybeFireSwipe(clientX: number, clientY: number) {
      if (!onHorizontalSwipe || swipeFired.current) return
      const totalDx = clientX - gestureStart.current.x
      const totalDy = clientY - gestureStart.current.y
      const direction = detectHorizontalSwipe(totalDx, totalDy, containerRef.current?.clientWidth ?? 0)
      if (direction !== null) {
        swipeFired.current = true
        onHorizontalSwipe(direction)
      }
    }

    function onTouchStart(e: TouchEvent) {
      if ((e.target as HTMLElement).closest('button')) return
      if (e.touches.length === 2) {
        pinchDist.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
      } else if (e.touches.length === 1) {
        dragging.current = true
        last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        gestureStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        swipeFired.current = false
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && pinchDist.current !== null) {
        e.preventDefault()
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        setScale(s => Math.min(4, Math.max(0.5, s * (dist / pinchDist.current!))))
        pinchDist.current = dist
      } else if (e.touches.length === 1 && dragging.current) {
        // Always suppress the browser's native scroll/pan for a drag that
        // started on the diagram — otherwise the slightest vertical finger
        // drift hands the gesture to the page instead of the vehicle.
        e.preventDefault()
        if (panLockedRef.current || isAtDefaultZoom()) {
          maybeFireSwipe(e.touches[0].clientX, e.touches[0].clientY)
          return
        }
        offsetRef.current = {
          x: offsetRef.current.x + e.touches[0].clientX - last.current.x,
          y: offsetRef.current.y + e.touches[0].clientY - last.current.y
        }
        last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        applyTransform()
      }
    }

    function onTouchEnd() { dragging.current = false; pinchDist.current = null }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [containerRef, applyTransform, onHorizontalSwipe, rebindKey])

  return { scale, reset, zoomIn, zoomOut }
}

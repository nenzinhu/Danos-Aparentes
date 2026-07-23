'use client';
import { useRef, useState, useEffect, useCallback, RefObject } from 'react'

export function useZoomPan(
  containerRef: RefObject<HTMLDivElement | null>,
  targetRef: RefObject<HTMLDivElement | null>
) {
  const [scale, setScale] = useState(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const scaleRef = useRef(1)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const pinchDist = useRef<number | null>(null)
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
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      offsetRef.current = {
        x: offsetRef.current.x + e.clientX - last.current.x,
        y: offsetRef.current.y + e.clientY - last.current.y
      }
      last.current = { x: e.clientX, y: e.clientY }
      applyTransform()
    }

    function onMouseUp() { dragging.current = false }

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
  }, [containerRef, applyTransform])

  return { scale, reset, zoomIn, zoomOut }
}

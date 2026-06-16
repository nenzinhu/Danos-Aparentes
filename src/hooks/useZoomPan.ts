import { useRef, useState, useEffect, RefObject } from 'react'

export function useZoomPan(containerRef: RefObject<HTMLDivElement>) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const pinchDist = useRef<number | null>(null)

  function reset() { setScale(1); setOffset({ x: 0, y: 0 }) }
  function zoomIn() { setScale(s => Math.min(4, s + 0.2)) }
  function zoomOut() { setScale(s => Math.max(0.5, s - 0.2)) }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onWheel(e: WheelEvent) {
      e.preventDefault()
      setScale(s => Math.min(4, Math.max(0.5, s - e.deltaY * 0.001)))
    }

    function onMouseDown(e: MouseEvent) {
      dragging.current = true
      last.current = { x: e.clientX, y: e.clientY }
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      setOffset(o => ({ x: o.x + e.clientX - last.current.x, y: o.y + e.clientY - last.current.y }))
      last.current = { x: e.clientX, y: e.clientY }
    }

    function onMouseUp() { dragging.current = false }

    function onTouchStart(e: TouchEvent) {
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
        setOffset(o => ({
          x: o.x + e.touches[0].clientX - last.current.x,
          y: o.y + e.touches[0].clientY - last.current.y
        }))
        last.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
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
  }, [containerRef])

  return { scale, offset, reset, zoomIn, zoomOut }
}

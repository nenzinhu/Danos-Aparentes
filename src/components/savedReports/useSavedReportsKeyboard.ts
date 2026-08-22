import { useEffect } from 'react'
import { SavedReport } from '../../types'

export function useSavedReportsKeyboard({
  isOpen,
  sorted,
  activeReportIndex,
  setActiveReportIndex,
  setExpandedReportIds,
  onClose,
  onLoad,
}: {
  isOpen: boolean
  sorted: SavedReport[]
  activeReportIndex: number
  setActiveReportIndex: React.Dispatch<React.SetStateAction<number>>
  setExpandedReportIds: React.Dispatch<React.SetStateAction<Set<string>>>
  onClose: () => void
  onLoad: (r: SavedReport) => void
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const inInput = document.activeElement?.tagName === 'INPUT'

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveReportIndex(prev => (prev < sorted.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveReportIndex(prev => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (activeReportIndex >= 0 && activeReportIndex < sorted.length) {
          const activeReport = sorted[activeReportIndex]
          setExpandedReportIds(prev => {
            const next = new Set(prev)
            if (next.has(activeReport.id)) {
              next.delete(activeReport.id)
            } else {
              next.add(activeReport.id)
            }
            return next
          })
        }
      } else if (e.key === ' ') {
        if (!inInput) {
          e.preventDefault()
          if (activeReportIndex >= 0 && activeReportIndex < sorted.length) {
            const activeReport = sorted[activeReportIndex]
            setExpandedReportIds(prev => {
              const next = new Set(prev)
              if (next.has(activeReport.id)) {
                next.delete(activeReport.id)
              } else {
                next.add(activeReport.id)
              }
              return next
            })
          }
        }
      } else if (e.key.toLowerCase() === 'l') {
        if (!inInput && activeReportIndex >= 0 && activeReportIndex < sorted.length) {
          e.preventDefault()
          onLoad(sorted[activeReportIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, sorted, activeReportIndex, onClose, onLoad, setActiveReportIndex, setExpandedReportIds])
}

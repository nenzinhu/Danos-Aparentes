'use client'

import { createContext, useContext, type ReactNode } from 'react'

/**
 * Estado e ações de revisão humana + emissão do laudo —
 * evita prop-drilling no InspectTab / ReportActions.
 */
export type InspectionReviewIssueValue = {
  reviewedAt?: number
  reviewNotes?: string
  reviewContentStale?: boolean
  reviewBusy?: boolean
  isReviewed?: boolean
  onCompleteReview?: (notes: string) => void | Promise<void>
  onReopenReview?: () => void | Promise<void>
  onConfirmReview?: () => void | Promise<void>
  onClearReview?: () => void | Promise<void>
  onIssued?: (hash: string) => void
}

const InspectionReviewIssueContext = createContext<InspectionReviewIssueValue | null>(null)

export function InspectionReviewIssueProvider({
  value,
  children,
}: {
  value: InspectionReviewIssueValue
  children: ReactNode
}) {
  return (
    <InspectionReviewIssueContext.Provider value={value}>
      {children}
    </InspectionReviewIssueContext.Provider>
  )
}

export function useInspectionReviewIssue(): InspectionReviewIssueValue {
  const ctx = useContext(InspectionReviewIssueContext)
  if (!ctx) {
    throw new Error('useInspectionReviewIssue deve ser usado dentro de InspectionReviewIssueProvider')
  }
  return ctx
}

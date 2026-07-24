'use client';
import ManageSubscriptionModal from '@/src/components/ManageSubscriptionModal'
import SavedReportsModal from '@/src/components/SavedReportsModal'
import CompanySettingsModal from '@/src/components/CompanySettingsModal'
import TermsModal from '@/src/components/TermsModal'
import FeaturesSlidesModal from '@/src/components/FeaturesSlidesModal'
import InspectionCoachMarks from '@/src/components/app/InspectionCoachMarks'
import AppToast from '@/src/components/app/AppToast'
import AppFooter from '@/src/components/app/AppFooter'
import TorchButton from '@/src/components/TorchButton'
import type { SavedReport } from '@/src/types'

interface AppShellOverlaysProps {
  savedModal: boolean
  onCloseSavedModal: () => void
  saved: SavedReport[]
  onSave: () => Promise<void>
  onLoad: (r: SavedReport) => void
  onDeleteReport: (id: string) => Promise<void>
  hasAccess: boolean
  accessToken?: string
  settingsModal: boolean
  onCloseSettingsModal: () => void
  termsOpen: boolean
  termsTab: 'terms' | 'privacy'
  onCloseTerms: () => void
  onOpenTerms: () => void
  onOpenPrivacy: () => void
  tutorialOpen: boolean
  onCloseTutorial: () => void
  coachMarksOpen: boolean
  onCloseCoachMarks: () => void
  toast: string | null
  onToastDone: () => void
  onToast: (msg: string) => void
  managePaymentModalOpen: boolean
  onCloseManagePayment: () => void
  onChooseCartao: () => Promise<void>
  onChoosePix: () => void
}

export default function AppShellOverlays({
  savedModal,
  onCloseSavedModal,
  saved,
  onSave,
  onLoad,
  onDeleteReport,
  hasAccess,
  accessToken,
  settingsModal,
  onCloseSettingsModal,
  termsOpen,
  termsTab,
  onCloseTerms,
  onOpenTerms,
  onOpenPrivacy,
  tutorialOpen,
  onCloseTutorial,
  coachMarksOpen,
  onCloseCoachMarks,
  toast,
  onToastDone,
  onToast,
  managePaymentModalOpen,
  onCloseManagePayment,
  onChooseCartao,
  onChoosePix,
}: AppShellOverlaysProps) {
  return (
    <>
      <SavedReportsModal
        isOpen={savedModal}
        saved={saved}
        onClose={onCloseSavedModal}
        onSave={onSave}
        onLoad={onLoad}
        onDelete={onDeleteReport}
        hasAccess={hasAccess}
        accessToken={accessToken}
      />

      <CompanySettingsModal
        isOpen={settingsModal}
        onClose={onCloseSettingsModal}
        hasAccess={hasAccess}
      />

      <AppFooter onOpenTerms={onOpenTerms} onOpenPrivacy={onOpenPrivacy} />

      <TermsModal isOpen={termsOpen} onClose={onCloseTerms} defaultTab={termsTab} />
      <FeaturesSlidesModal isOpen={tutorialOpen} onClose={onCloseTutorial} />
      <InspectionCoachMarks isOpen={coachMarksOpen} onClose={onCloseCoachMarks} />
      <TorchButton onToast={onToast} />
      {toast && <AppToast msg={toast} onDone={onToastDone} />}
      <ManageSubscriptionModal
        open={managePaymentModalOpen}
        onClose={onCloseManagePayment}
        onChooseCartao={onChooseCartao}
        onChoosePix={onChoosePix}
      />
    </>
  )
}

'use client';
import React, { useMemo, ViewTransition, useEffect, useRef, useCallback } from 'react'
import { DirectionalTransition } from '../DirectionalTransition'
import { useDamages } from '@/src/hooks/useDamages'
import { useTts } from '@/src/hooks/useTts'
import { useSavedReports } from '@/src/hooks/useSavedReports'
import { useAuth } from '@/src/hooks/useAuth'
import { useSubscription } from '@/src/hooks/useSubscription'
import { useSyncStatus, type DroppedSyncItem } from '@/src/lib/sync'
import { useAppShellState } from '@/src/hooks/useAppShellState'
import { useInspectionWorkflow } from '@/src/hooks/useInspectionWorkflow'
import { supabaseEnabled } from '@/src/lib/supabase'
import Header from '@/src/components/Header'
import DashboardView from '@/src/components/DashboardView'
import AppAuthGate from '@/src/components/app/AppAuthGate'
import AppTabBar from '@/src/components/app/AppTabBar'
import AppShellOverlays from '@/src/components/app/AppShellOverlays'
import InspectTab from '@/src/components/app/InspectTab'
import TeamTab from '@/src/components/app/TeamTab'
import PhotoUploadProgressBar from '@/src/components/PhotoUploadProgressBar'

function formatSyncFailureToast(dropped: DroppedSyncItem[]): string {
  const first = dropped[0]
  const shortId = first.reportId.slice(0, 8)
  const extra = dropped.length > 1 ? ` (+${dropped.length - 1} outro${dropped.length > 2 ? 's' : ''})` : ''
  return `❌ Falha permanente ao sincronizar laudo ${shortId}${extra}`
}

export default function AppMainPage() {
  const { session, loading: authLoading, signIn, signUp, signOut, resetPassword } = useAuth()
  const { damages, addDamage, removeDamage, updateDamage, clearDamages } = useDamages()
  const { config: ttsConfig, setConfig: setTtsConfig, speak, speakHover, voices } = useTts(session?.access_token)
  const { saved, saveReport, deleteReport, refreshRemote } = useSavedReports(session?.user.id)
  const { info: subscription, loading: subLoading, openPortal } = useSubscription(session?.user.id, session?.access_token)
  const shell = useAppShellState({ openPortal })

  const onSyncPermanentFailure = useCallback((dropped: DroppedSyncItem[]) => {
    if (dropped.length === 0) return
    shell.showToast(formatSyncFailureToast(dropped))
  }, [shell.showToast])

  const { status: syncStatus, lastError: syncLastError, tryFlush } = useSyncStatus(session?.user.id, {
    onPermanentFailure: onSyncPermanentFailure,
  })

  const hadAccessRef = useRef<boolean | null>(null)
  useEffect(() => {
    const hasAccess = subscription?.hasAccess ?? false
    if (hadAccessRef.current === false && hasAccess) {
      void (async () => {
        await tryFlush()
        await refreshRemote()
      })()
    }
    hadAccessRef.current = hasAccess
  }, [subscription?.hasAccess, tryFlush, refreshRemote])

  const inspection = useInspectionWorkflow({
    damages,
    addDamage,
    removeDamage,
    updateDamage,
    clearDamages,
    saveReport,
    accessToken: session?.access_token,
    showToast: shell.showToast,
  })

  const headerSubscription = useMemo(
    () => supabaseEnabled && subscription
      ? { status: subscription.status, trialDaysLeft: subscription.trialDaysLeft }
      : undefined,
    [subscription],
  )

  const handleLoad = (r: Parameters<typeof inspection.handleLoad>[0]) => {
    inspection.handleLoad(r)
    shell.setSavedModal(false)
  }

  return (
    <AppAuthGate
      session={session}
      authLoading={authLoading}
      subLoading={subLoading}
      subscription={subscription}
      syncStatus={syncStatus}
      onRetrySync={() => { void tryFlush() }}
      darkMode={shell.darkMode}
      toggleDarkMode={shell.toggleDarkMode}
      openSavedModal={shell.openSavedModal}
      onOpenSettings={() => shell.setSettingsModal(true)}
      signOut={signOut}
      onManageSubscription={shell.handleManageSubscription}
      onSignIn={signIn}
      onSignUp={signUp}
      onResetPassword={resetPassword}
    >
      <DirectionalTransition>
        <PhotoUploadProgressBar />
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center pb-12">
          <ViewTransition name="persistent-nav" default="none">
            <Header
              darkMode={shell.darkMode}
              onToggleDark={shell.toggleDarkMode}
              onOpenSaved={shell.openSavedModal}
              onOpenSettings={() => shell.setSettingsModal(true)}
              onSignOut={supabaseEnabled ? signOut : undefined}
              syncStatus={supabaseEnabled ? syncStatus : undefined}
              syncLastError={supabaseEnabled ? syncLastError : undefined}
              onRetrySync={supabaseEnabled ? () => { void tryFlush() } : undefined}
              subscription={headerSubscription}
              onManageSubscription={shell.handleManageSubscription}
            />
          </ViewTransition>

          <AppTabBar
            activeTab={shell.activeTab}
            onTabChange={shell.setActiveTab}
            onOpenSettings={() => shell.setSettingsModal(true)}
            onOpenTutorial={() => shell.setTutorialOpen(true)}
            showTeamTab={subscription?.isCorporate ?? false}
          />

          <main className="w-full max-w-7xl px-4 flex flex-col gap-6 mt-4">
            {shell.activeTab === 'dashboard' ? (
              <DashboardView saved={saved} />
            ) : shell.activeTab === 'team' ? (
              <TeamTab accessToken={session?.access_token} onToast={shell.showToast} />
            ) : (
              <InspectTab
                vehicleType={inspection.vehicleType}
                viewType={inspection.viewType}
                vehicleInfo={inspection.vehicleInfo}
                formCollapsed={inspection.formCollapsed}
                formResetToken={inspection.formResetToken}
                viewDamages={inspection.viewDamages}
                allVehicleDamages={inspection.allVehicleDamages}
                visitedViews={inspection.visitedViews}
                previousReport={inspection.previousReport}
                onPlateConfirmed={inspection.handlePlateConfirmed}
                ttsConfig={ttsConfig}
                voices={voices}
                hasAccess={subscription?.hasAccess ?? false}
                accessToken={session?.access_token}
                onVehicleTypeChange={inspection.handleVehicleTypeChange}
                onViewTypeChange={inspection.handleViewTypeChange}
                onVehicleInfoChange={inspection.setVehicleInfo}
                onToggleFormCollapse={inspection.toggleFormCollapse}
                onWizardComplete={shell.onWizardComplete}
                onSaveDraft={inspection.handleSaveDraft}
                onOpenSaved={shell.openSavedModal}
                onClearAll={inspection.handleClearAll}
                onClearDamages={inspection.handleClearDamages}
                onAddDamage={inspection.handleAddDamage}
                onAddDamageDetailed={inspection.handleAddDamageDetailed}
                onRemoveDamageFromPart={inspection.handleRemoveDamageFromPart}
                onRemoveDamage={removeDamage}
                onUpdateDamage={updateDamage}
                onTtsConfigChange={setTtsConfig}
                onTtsTest={() => speak('Teste de voz do sistema de vistoria veicular')}
                speak={speak}
                speakHover={speakHover}
                onToast={shell.showToast}
              />
            )}
          </main>

          <AppShellOverlays
            savedModal={shell.savedModal}
            onCloseSavedModal={() => shell.setSavedModal(false)}
            saved={saved}
            onSave={inspection.handleSave}
            onLoad={handleLoad}
            onDeleteReport={deleteReport}
            hasAccess={subscription?.hasAccess ?? false}
            accessToken={session?.access_token}
            settingsModal={shell.settingsModal}
            onCloseSettingsModal={() => shell.setSettingsModal(false)}
            termsOpen={shell.termsOpen}
            termsTab={shell.termsTab}
            onCloseTerms={() => shell.setTermsOpen(false)}
            onOpenTerms={() => { shell.setTermsTab('terms'); shell.setTermsOpen(true) }}
            onOpenPrivacy={() => { shell.setTermsTab('privacy'); shell.setTermsOpen(true) }}
            tutorialOpen={shell.tutorialOpen}
            onCloseTutorial={() => shell.setTutorialOpen(false)}
            coachMarksOpen={shell.coachMarksOpen}
            onCloseCoachMarks={shell.closeCoachMarks}
            toast={shell.toast}
            onToastDone={() => shell.setToast(null)}
            onToast={shell.showToast}
            managePaymentModalOpen={shell.managePaymentModalOpen}
            onCloseManagePayment={() => shell.setManagePaymentModalOpen(false)}
            onChooseCartao={shell.handleChooseCartaoPayment}
            onChoosePix={shell.handleChoosePixPayment}
          />
        </div>
      </DirectionalTransition>
    </AppAuthGate>
  )
}

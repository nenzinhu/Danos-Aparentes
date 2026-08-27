'use client'

import dynamic from 'next/dynamic'
import type { Session } from '@supabase/supabase-js'
import AppLoadingShell from '@/src/components/app/AppLoadingShell'
import type { AppTabValue } from '@/src/components/app/AppTabBar'
import type { InspectTabProps } from '@/src/components/app/InspectTab'
import {
  InspectionSessionProvider,
  type InspectionSessionValue,
} from '@/src/components/app/InspectionSessionContext'
import {
  InspectionDamageActionsProvider,
  type InspectionDamageActionsValue,
} from '@/src/components/app/InspectionDamageActionsContext'
import {
  InspectionReviewIssueProvider,
  type InspectionReviewIssueValue,
} from '@/src/components/app/InspectionReviewIssueContext'
import type { VehicleType, VehicleInfo, Damage, SavedReport } from '@/src/types'
import type { VehicleHistorySummaryWithCloud } from '@/src/lib/vehicleEvidence'

const DashboardView = dynamic(() => import('@/src/components/DashboardView'), {
  loading: () => <AppLoadingShell />,
})
const FleetHistoryDashboard = dynamic(
  () => import('@/src/components/FleetHistoryDashboard'),
  { loading: () => <AppLoadingShell /> },
)
const InspectTab = dynamic(() => import('@/src/components/app/InspectTab'), {
  loading: () => <AppLoadingShell />,
})
const IaTab = dynamic(() => import('@/src/components/app/IaTab'), {
  loading: () => <AppLoadingShell />,
})
const TeamTab = dynamic(() => import('@/src/components/app/TeamTab'), {
  loading: () => <AppLoadingShell />,
})
const VehiclesListView = dynamic(
  () => import('@/src/components/vehicles/VehiclesListView'),
  { loading: () => <AppLoadingShell /> },
)
const ClientsPage = dynamic(
  () => import('@/src/app/app/clients/page'),
  { loading: () => <AppLoadingShell /> },
)

export type AppShellMainTabsProps = {
  activeTab: AppTabValue
  session: Session | null
  tenantCanAudit: boolean
  showTeamAudit: boolean
  saved: SavedReport[]
  vehiclesByGroup: VehicleHistorySummaryWithCloud[]
  damages: Damage[]
  onToast: (msg: string) => void
  onGoInspectEntrada: () => void
  inspectProps: InspectTabProps
  inspectionSession: InspectionSessionValue
  damageActions: InspectionDamageActionsValue
  reviewIssue: InspectionReviewIssueValue
  ia: {
    vehicleInfo: VehicleInfo
    vehicleType: VehicleType
  }
}

/**
 * Painéis por aba — isolados do shell para reduzir o monólito de orquestração.
 */
export default function AppShellMainTabs({
  activeTab,
  session,
  tenantCanAudit,
  showTeamAudit,
  saved,
  vehiclesByGroup,
  damages,
  onToast,
  onGoInspectEntrada,
  inspectProps,
  inspectionSession,
  damageActions,
  reviewIssue,
  ia,
}: AppShellMainTabsProps) {
  if (activeTab === 'dashboard') {
    return (
      <>
        <DashboardView
          saved={saved}
          accessToken={session?.access_token}
          showAuditDashboard={tenantCanAudit}
          userName={
            (session?.user.user_metadata?.full_name as string | undefined) ||
            (session?.user.user_metadata?.name as string | undefined) ||
            session?.user.email?.split('@')[0] ||
            undefined
          }
          onNewInspection={onGoInspectEntrada}
        />
        <div className="mt-6">
          <FleetHistoryDashboard saved={saved} />
        </div>
      </>
    )
  }

  if (activeTab === 'vehicles') {
    return <VehiclesListView vehicles={vehiclesByGroup} />
  }

  if (activeTab === 'team') {
    return (
      <TeamTab
        accessToken={session?.access_token}
        onToast={onToast}
        showAuditDashboard={showTeamAudit}
      />
    )
  }

  if (activeTab === 'ia') {
    return (
      <IaTab
        vehicleInfo={ia.vehicleInfo}
        damages={damages}
        vehicleType={ia.vehicleType}
        onToast={onToast}
        accessToken={session?.access_token}
      />
    )
  }

  if (activeTab === 'clients') {
    return <ClientsPage userId={session?.user.id} />
  }

  return (
    <InspectionSessionProvider value={inspectionSession}>
      <InspectionDamageActionsProvider value={damageActions}>
        <InspectionReviewIssueProvider value={reviewIssue}>
          <InspectTab {...inspectProps} />
        </InspectionReviewIssueProvider>
      </InspectionDamageActionsProvider>
    </InspectionSessionProvider>
  )
}

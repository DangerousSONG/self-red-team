import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { RuntimeEnvironment } from '@/components/dashboard/RuntimeEnvironment'
import { AgentAttackConsole } from '@/components/dashboard/AgentAttackConsole'
import { AgentExploitArchive } from '@/components/dashboard/AgentExploitArchive'
import { EvidenceScoring } from '@/components/dashboard/EvidenceScoring'
import { AttackMissionTimeline } from '@/components/dashboard/AttackMissionTimeline'
import { AttackRuntimeProvider } from '@/hooks/useAttackRuntime'

export function DashboardPage() {
  return (
    <AttackRuntimeProvider>
      <main className="flex-1 overflow-x-hidden px-6 py-5">
        <div className="mx-auto flex max-w-[1560px] gap-4">
          <div className="min-w-0 flex-1 space-y-4 pb-8">
            <SummaryCards />
            <RuntimeEnvironment />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <AgentAttackConsole />
              <AgentExploitArchive />
            </div>
            <EvidenceScoring />
          </div>
          <AttackMissionTimeline />
        </div>
      </main>
    </AttackRuntimeProvider>
  )
}

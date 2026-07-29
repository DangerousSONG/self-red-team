import { FilePlus2 } from 'lucide-react'
import { AgentAttackConsole } from '@/components/dashboard/AgentAttackConsole'
import { AgentExploitArchive } from '@/components/dashboard/AgentExploitArchive'
import { AttackMissionTimeline } from '@/components/dashboard/AttackMissionTimeline'
import { EvidenceScoring } from '@/components/dashboard/EvidenceScoring'
import { RuntimeEnvironment } from '@/components/dashboard/RuntimeEnvironment'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AttackRuntimeProvider } from '@/hooks/useAttackRuntime'
import { useRangeTasks } from '@/hooks/useRangeTasks'

interface DashboardPageProps {
  onNavigate: (id: string) => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { currentRun } = useRangeTasks()

  if (!currentRun) {
    return (
      <main className="flex-1 overflow-x-hidden px-6 py-5">
        <div className="mx-auto max-w-[980px] pb-8">
          <Card>
            <CardContent className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                <FilePlus2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--color-ink)]">暂无正在运行的演练</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-ink-secondary)]">
                请先进入评测任务中心，选择任务、匹配资源并确认启动一条 Mock RangeRun。
              </p>
              <Button className="mt-5" onClick={() => onNavigate('tasks')}>
                <FilePlus2 className="h-4 w-4" />
                创建评测任务
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

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

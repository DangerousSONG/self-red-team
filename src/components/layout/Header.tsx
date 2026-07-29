import { useState } from 'react'
import { ArrowLeft, FilePlus2, Octagon, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRangeTasks } from '@/hooks/useRangeTasks'

interface HeaderProps {
  onNavigate: (id: string) => void
}

export function Header({ onNavigate }: HeaderProps) {
  const { currentRun, currentTask, stopRun } = useRangeTasks()
  const [notice, setNotice] = useState('')

  const handleStop = () => {
    stopRun()
    setNotice('当前任务已停止，Mock RangeRun 状态已更新为 Stopped。')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-md">
      <div className="flex items-start justify-between gap-6 px-6 py-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              <Shield className="h-3 w-3" />
              CONTROL PLANE
            </Badge>
            {currentRun ? (
              <Badge variant={currentRun.status === 'Running' ? 'success' : 'warning'}>
                {currentRun.status === 'Running' ? (
                  <span className="status-pulse h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                ) : null}
                {currentRun.status}
              </Badge>
            ) : (
              <Badge variant="muted">NO ACTIVE RUN</Badge>
            )}
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[var(--color-ink)]">
            RangeRun 运行控制台
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-secondary)]">
            AI Agent 攻防演练的运行总览、环境状态与证据流水
          </p>

          {currentRun ? (
            <div className="mt-3 grid gap-2 text-xs md:grid-cols-3 xl:grid-cols-6">
              <InfoItem label="任务名称" value={currentTask?.name ?? currentRun.taskName} />
              <InfoItem label="Run ID" value={currentRun.id} mono />
              <InfoItem label="环境" value={currentRun.environment} />
              <InfoItem label="Agent" value={currentRun.agent} />
              <InfoItem label="模型" value={currentRun.model} />
              <InfoItem label="状态" value={currentRun.status} />
            </div>
          ) : null}
          {notice ? (
            <div className="mt-3 inline-flex rounded-md border border-[var(--color-warning)]/20 bg-[var(--color-warning-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-warning)]">
              {notice}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2.5 pt-1">
          {currentRun ? (
            <>
              <Button variant="secondary" onClick={() => onNavigate('tasks')}>
                <ArrowLeft className="h-4 w-4" />
                返回任务
              </Button>
              <Button variant="outline" onClick={handleStop} disabled={currentRun.status === 'Stopped'}>
                <Octagon className="h-4 w-4" />
                停止任务
              </Button>
            </>
          ) : (
            <Button onClick={() => onNavigate('tasks')}>
              <FilePlus2 className="h-4 w-4" />
              创建评测任务
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

function InfoItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-2">
      <div className="text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className={mono ? 'mt-0.5 truncate font-mono text-[11px]' : 'mt-0.5 truncate font-semibold'}>
        {value}
      </div>
    </div>
  )
}

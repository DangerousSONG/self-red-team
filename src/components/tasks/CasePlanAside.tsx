import { CheckCircle2, CircleDashed, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AgentProfile, ModelProfile, RangeEnvironment, RunConfig, TaskTemplate } from '@/types/range'

interface CasePlanAsideProps {
  task?: TaskTemplate
  environment?: RangeEnvironment
  agent?: AgentProfile
  model?: ModelProfile
  runConfig: RunConfig
  step: number
  saveState: 'saving' | 'saved' | 'failed'
}

export function CasePlanAside({
  task,
  environment,
  agent,
  model,
  runConfig,
  step,
  saveState,
}: CasePlanAsideProps) {
  const completion = Math.round(((step + 1) / 4) * 100)

  return (
    <aside className="sticky top-[88px] space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>当前 CasePlan</CardTitle>
            <Badge variant={saveState === 'failed' ? 'danger' : saveState === 'saving' ? 'warning' : 'success'}>
              <Save className="h-3 w-3" />
              {saveState === 'saving' ? '保存中…' : saveState === 'failed' ? '保存失败' : '已保存'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
              <span>当前完成度</span>
              <span>{completion}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-muted)]">
              <div
                className="h-2 rounded-full bg-[var(--color-brand)] transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <AsideRow label="已选任务" value={task?.name} />
            <AsideRow label="任务类型" value={task?.type} />
            <AsideRow label="环境" value={environment?.name} />
            <AsideRow label="Agent" value={agent?.name} />
            <AsideRow label="模型" value={model?.name} />
            <AsideRow label="超时时间" value={`${runConfig.timeoutMinutes} 分钟`} />
            <AsideRow label="Token 预算" value={runConfig.tokenBudget.toLocaleString()} />
            <AsideRow label="成本预算" value={`${runConfig.costBudget} 元`} />
            <AsideRow label="并发数" value={String(runConfig.concurrency)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="mb-2 text-sm font-semibold text-[var(--color-ink)]">创建与运行区分</div>
          <div className="space-y-2 text-xs leading-5 text-[var(--color-ink-secondary)]">
            <div className="flex items-center gap-2">
              <CircleDashed className="h-4 w-4 text-[var(--color-brand)]" />
              新 CasePlan · Step {step + 1}/4
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
              仅在确认启动后覆盖当前运行任务
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

function AsideRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2">
      <div className="text-[11px] text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-0.5 truncate text-sm font-semibold text-[var(--color-ink)]">
        {value || '待选择'}
      </div>
    </div>
  )
}

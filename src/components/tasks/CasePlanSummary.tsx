import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { AgentProfile, ModelProfile, RangeEnvironment, RunConfig, TaskTemplate } from '@/types/range'

const executionChain = [
  '封存 CasePlan',
  '准备环境',
  '加载 Agent',
  '环境自检',
  '开始任务',
  '独立取证',
  '销毁环境',
  '离线评分',
]

interface CasePlanSummaryProps {
  task: TaskTemplate
  environment: RangeEnvironment
  agent: AgentProfile
  model: ModelProfile
  runConfig: RunConfig
  starting: boolean
  confirmed: boolean
  startupStage: string
  onConfirmedChange: (confirmed: boolean) => void
}

export function CasePlanSummary({
  task,
  environment,
  agent,
  model,
  runConfig,
  starting,
  confirmed,
  startupStage,
  onConfirmedChange,
}: CasePlanSummaryProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>CasePlan 配置摘要</CardTitle>
          <CardDescription>启动后，本次配置会被封存为一条 Mock CasePlan。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          <SummaryGroup
            title="任务"
            rows={[
              ['任务名称', task.name],
              ['任务类型', task.type],
              ['成功条件', task.successCriteria],
            ]}
          />
          <SummaryGroup
            title="运行资源"
            rows={[
              ['环境', environment.name],
              ['Agent', agent.name],
              ['模型', model.name],
              ['CPU / 内存', `${runConfig.cpuCores} vCPU / ${runConfig.memoryGb} GB`],
              ['并发', String(runConfig.concurrency)],
            ]}
          />
          <SummaryGroup
            title="预算"
            rows={[
              ['Token', runConfig.tokenBudget.toLocaleString()],
              ['成本', `${runConfig.costBudget} 元`],
              ['超时', `${runConfig.timeoutMinutes} 分钟`],
            ]}
          />
          <SummaryGroup
            title="安全"
            rows={[
              ['外网权限', runConfig.allowInternet ? '允许外网' : '受控入口'],
              ['独立取证', runConfig.enableForensics ? '启用' : '不启用'],
              ['离线评分', runConfig.enableOfflineScoring ? '启用' : '不启用'],
              ['自动停止条件', runConfig.autoStopCondition],
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>执行流程</CardTitle>
          <CardDescription>启动时会按以下本地 Mock 阶段推进。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            {executionChain.map((item, index) => (
              <div
                key={item}
                className="rounded-lg border border-[var(--color-border)] bg-white p-3 text-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline">Step {index + 1}</Badge>
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                </div>
                <div className="font-semibold text-[var(--color-ink)]">{item}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--color-warning)]" />
            风险与确认
          </CardTitle>
          <CardDescription>确认场景、预算与安全边界后才允许启动。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-white p-3">
            <input
              className="mt-1"
              checked={confirmed}
              type="checkbox"
              onChange={(event) => onConfirmedChange(event.target.checked)}
            />
            <span className="text-sm leading-6 text-[var(--color-ink-secondary)]">
              我已确认场景、预算与安全边界，启动后本次 CasePlan 将被封存。
            </span>
          </label>
          {starting ? (
            <div className="flex items-center gap-2 rounded-md border border-[var(--color-warning)]/20 bg-[var(--color-warning-soft)] px-3 py-2 text-sm text-[var(--color-warning)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {startupStage}
            </div>
          ) : null}
          {!confirmed ? (
            <div className="text-xs text-[var(--color-danger)]">请先确认风险与安全边界。</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryGroup({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
      <div className="mb-3 text-sm font-semibold text-[var(--color-ink)]">{title}</div>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[96px_1fr] gap-3 text-sm">
            <div className="text-[var(--color-ink-muted)]">{label}</div>
            <div className="font-medium text-[var(--color-ink)]">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

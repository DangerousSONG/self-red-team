import { ArrowDown, ArrowUpRight, ArrowDownRight, Fingerprint } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { evidencePipeline } from '@/lib/data'
import { cn } from '@/lib/utils'

const metrics = [
  { label: '攻击成功率', value: '62%', delta: '+4%', up: true, tone: 'brand' },
  { label: '漏洞数量', value: '18', delta: '+3', up: true, tone: 'warning' },
  { label: '风险等级', value: '高', delta: '↑', up: true, tone: 'danger' },
  { label: '任务完成度', value: '65%', delta: '+8%', up: true, tone: 'success' },
  { label: '综合评分', value: '78', delta: '+2', up: true, tone: 'brand' },
]

const toneClass: Record<string, string> = {
  brand: 'text-[var(--color-brand)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-danger)]',
  success: 'text-[var(--color-success)]',
}

export function EvidenceScoring() {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">证据与评分</CardTitle>
            <CardDescription className="mt-1">
              结果层 · Observer → Snapshot → Offline Verifier → Verdict
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono">
            <Fingerprint className="h-3 w-3" />
            TRUSTED
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {evidencePipeline.map((step, index) => (
            <div key={step.id} className="flex items-center gap-1.5">
              <div
                className={cn(
                  'rounded-md border px-2 py-1 text-[11px] font-medium',
                  index === evidencePipeline.length - 1
                    ? 'border-[var(--color-success)]/30 bg-[var(--color-success-soft)] text-[var(--color-success)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-ink)]',
                )}
              >
                {step.label}
              </div>
              {index < evidencePipeline.length - 1 ? (
                <ArrowDown className="h-3 w-3 rotate-[-90deg] text-[var(--color-ink-muted)]" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2"
            >
              <div className="text-[10px] text-[var(--color-ink-muted)]">{metric.label}</div>
              <div className={cn('mt-0.5 text-lg font-semibold', toneClass[metric.tone])}>
                {metric.value}
              </div>
              <div className="mt-0.5 flex items-center gap-0.5 text-[10px] text-[var(--color-success)]">
                {metric.up ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {metric.delta}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

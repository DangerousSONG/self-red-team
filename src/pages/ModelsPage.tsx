import { ArrowLeft, Copy, Cpu, Eye, Link2, PlayCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCapabilityAssets } from '@/hooks/useCapabilityAssets'
import { modelTypeText, statusText } from '@/pages/CapabilityCenterPage'
import type { ModelAsset } from '@/types/capability-asset'

interface ModelsPageProps {
  onOpenModel: (id: string) => void
  onNavigate: (id: string) => void
}

export function ModelsPage({ onOpenModel, onNavigate }: ModelsPageProps) {
  const { modelAssets } = useCapabilityAssets()

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">
              <Cpu className="h-3.5 w-3.5" />
              Model Assets
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold">模型资产</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">管理基础模型、安全增强模型、守卫模型和裁判模型</p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('capability-center')}>
            <ArrowLeft className="h-4 w-4" />
            返回能力中心
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {modelAssets.map((model) => (
            <ModelCard key={model.id} model={model} onOpen={() => onOpenModel(model.id)} onCreateTask={() => onNavigate('tasks')} />
          ))}
        </div>
      </div>
    </main>
  )
}

function ModelCard({ model, onOpen, onCreateTask }: { model: ModelAsset; onOpen: () => void; onCreateTask: () => void }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-panel)]">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge variant={model.status === 'ready' ? 'success' : model.status === 'updating' ? 'warning' : 'muted'}>{statusText(model.status)}</Badge>
              <Badge variant="outline">{modelTypeText(model.type)}</Badge>
              <Badge variant="muted">{sourceText(model.source)}</Badge>
            </div>
            <h3 className="mt-2 truncate text-base font-semibold">{model.name}</h3>
            <div className="mt-1 font-mono text-xs text-[var(--color-ink-muted)]">{model.id}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={onOpen}><Eye className="h-4 w-4" /></Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Mini label="版本" value={model.version} />
          <Mini label="Provider" value={model.provider} />
          <Mini label="基础模型" value={model.baseModel ?? '-'} />
          <Mini label="参数规模" value={model.parameterSize ?? '-'} />
          <Mini label="上下文长度" value={`${model.contextLength.toLocaleString()} tokens`} />
          <Mini label="Benchmark 综合分" value={String(avgScore(model.benchmarkScores))} />
          <Mini label="智能体引用" value={`${model.referencedAgentIds.length} 个`} />
          <Mini label="CasePlan 引用" value={`${model.referencedCasePlanIds.length} 个`} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {model.capabilities.slice(0, 4).map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onOpen}>查看详情</Button>
          <Button size="sm" variant="secondary" onClick={onCreateTask}><PlayCircle className="h-3.5 w-3.5" />创建评测任务</Button>
          <Button size="sm" variant="ghost" onClick={onOpen}><Link2 className="h-3.5 w-3.5" />查看引用</Button>
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(model.id)}><Copy className="h-3.5 w-3.5" />复制 ID</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-2">
      <div className="truncate text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 truncate font-semibold">{value}</div>
    </div>
  )
}

function avgScore(scores: Record<string, number>) {
  const values = Object.values(scores)
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : '-'
}

export function sourceText(source: string) {
  return {
    platform: '平台预置',
    external: '外部接入',
    training_artifact: '基模训练产物',
  }[source] ?? source
}

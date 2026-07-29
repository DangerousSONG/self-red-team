import { ArrowLeft, Boxes, Brain, ListChecks } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDataCenter } from '@/hooks/useDataCenter'
import type { ModelArtifact } from '@/types/model-artifact'

interface ModelArtifactsPageProps {
  onOpenArtifact: (artifactId: string) => void
  onOpenTraining: () => void
}

export function ModelArtifactsPage({ onOpenArtifact, onOpenTraining }: ModelArtifactsPageProps) {
  const { modelArtifacts } = useDataCenter()
  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">
              <Boxes className="h-3.5 w-3.5" />
              Model Artifacts
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold">模型产物</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">查看训练完成后的基模产物、评测分数和文件清单</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={onOpenTraining}>
              <ArrowLeft className="h-4 w-4" />
              返回基模训练
            </Button>
            <div className="flex rounded-lg border border-[var(--color-border)] bg-white p-1">
              <Button size="sm" variant="ghost" onClick={onOpenTraining}><ListChecks className="h-4 w-4" />训练任务</Button>
              <Button size="sm" variant="default"><Boxes className="h-4 w-4" />模型产物</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {modelArtifacts.map((artifact) => <ArtifactCard key={artifact.id} artifact={artifact} onOpenArtifact={onOpenArtifact} />)}
        </div>
      </div>
    </main>
  )
}

function ArtifactCard({ artifact, onOpenArtifact }: { artifact: ModelArtifact; onOpenArtifact: (artifactId: string) => void }) {
  const score = Math.round(Object.values(artifact.benchmarkScores).reduce((sum, value) => sum + value, 0) / Math.max(1, Object.values(artifact.benchmarkScores).length))
  return (
    <button
      type="button"
      onClick={() => onOpenArtifact(artifact.id)}
      className="group rounded-xl border border-[var(--color-border)] bg-white p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-panel)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant={artifact.status === 'ready' ? 'success' : artifact.status === 'generating' ? 'warning' : 'danger'}>{artifact.status}</Badge>
          <h3 className="mt-2 text-lg font-semibold">{artifact.name}</h3>
          <div className="mt-1 font-mono text-xs text-[var(--color-ink-muted)]">{artifact.id}</div>
        </div>
        <Brain className="h-5 w-5 text-[var(--color-brand)]" />
      </div>
      <p className="mt-3 min-h-[48px] text-sm leading-6 text-[var(--color-ink-secondary)]">{artifact.description}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Mini label="基础模型" value={artifact.baseModel} />
        <Mini label="模型版本" value={artifact.version} />
        <Mini label="模型大小" value={artifact.modelSize} />
        <Mini label="综合分" value={String(score)} />
        <Mini label="训练方式" value={artifact.trainingMethod} />
        <Mini label="创建时间" value={artifact.createdAt} />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{artifact.tags.map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}</div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-sm">
        <span className="font-mono text-xs text-[var(--color-ink-muted)]">{artifact.trainingJobId}</span>
        <span className="font-semibold text-[var(--color-brand)]">查看详情</span>
      </div>
    </button>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2">
      <div className="truncate text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
  )
}

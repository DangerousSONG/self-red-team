import { ArrowLeft, Bot, Copy, Eye, Link2, PlayCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCapabilityAssets } from '@/hooks/useCapabilityAssets'
import { agentTypeText, statusText } from '@/pages/CapabilityCenterPage'
import type { AgentAsset } from '@/types/capability-asset'

interface AgentsPageProps {
  onOpenAgent: (id: string) => void
  onOpenModel: (id: string) => void
  onNavigate: (id: string) => void
}

export function AgentsPage({ onOpenAgent, onOpenModel, onNavigate }: AgentsPageProps) {
  const { agentAssets, modelAssets } = useCapabilityAssets()
  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">
              <Bot className="h-3.5 w-3.5" />
              Agent Assets
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold">智能体资产</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">管理用于漏洞挖掘、利用、修复和场景演练的攻防智能体</p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('capability-center')}>
            <ArrowLeft className="h-4 w-4" />
            返回能力中心
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {agentAssets.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              modelName={modelAssets.find((model) => model.id === agent.modelAssetId)?.name ?? agent.modelAssetId}
              onOpen={() => onOpenAgent(agent.id)}
              onOpenModel={() => onOpenModel(agent.modelAssetId)}
              onCreateTask={() => onNavigate('tasks')}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

function AgentCard({ agent, modelName, onOpen, onOpenModel, onCreateTask }: { agent: AgentAsset; modelName: string; onOpen: () => void; onOpenModel: () => void; onCreateTask: () => void }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-panel)]">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge variant={agent.status === 'ready' ? 'success' : agent.status === 'updating' ? 'warning' : 'muted'}>{statusText(agent.status)}</Badge>
              <Badge variant="outline">{agentTypeText(agent.type)}</Badge>
            </div>
            <h3 className="mt-2 truncate text-base font-semibold">{agent.name}</h3>
            <div className="mt-1 font-mono text-xs text-[var(--color-ink-muted)]">{agent.id}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={onOpen}><Eye className="h-4 w-4" /></Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Mini label="版本" value={agent.version} />
          <Mini label="当前模型" value={modelName} />
          <Mini label="支持环境" value={agent.supportedEnvironments.slice(0, 2).join(' / ')} />
          <Mini label="支持 Benchmark" value={agent.supportedBenchmarks.join(' / ') || '-'} />
          <Mini label="工具数量" value={`${agent.toolIds.length} 个`} />
          <Mini label="最近成功率" value={`${agent.successRate ?? 0}%`} />
          <Mini label="平均耗时" value={agent.averageDurationSeconds ? `${Math.round(agent.averageDurationSeconds / 60)} min` : '-'} />
          <Mini label="CasePlan 引用" value={`${agent.referencedCasePlanIds.length} 个`} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {agent.capabilities.slice(0, 4).map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onOpen}>查看详情</Button>
          <Button size="sm" variant="secondary" onClick={onCreateTask}><PlayCircle className="h-3.5 w-3.5" />创建评测任务</Button>
          <Button size="sm" variant="ghost" onClick={onOpenModel}><Link2 className="h-3.5 w-3.5" />查看模型</Button>
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(agent.id)}><Copy className="h-3.5 w-3.5" />复制 ID</Button>
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

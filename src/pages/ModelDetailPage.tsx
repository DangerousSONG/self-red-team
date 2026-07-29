import { useState } from 'react'
import { ArrowLeft, Cpu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCapabilityAssets } from '@/hooks/useCapabilityAssets'
import { agentTypeText, modelTypeText, statusText } from '@/pages/CapabilityCenterPage'
import { sourceText } from '@/pages/ModelsPage'

interface ModelDetailPageProps {
  modelId: string
  onNavigate: (id: string) => void
  onOpenAgent: (id: string) => void
  onOpenArtifact: (id: string) => void
  onOpenTrainingJob: (id: string) => void
}

const tabs = ['模型介绍', '版本与配置', '能力评测', '使用情况', '关联资产']

export function ModelDetailPage({ modelId, onNavigate, onOpenAgent, onOpenArtifact, onOpenTrainingJob }: ModelDetailPageProps) {
  const { modelAssets, agentAssets } = useCapabilityAssets()
  const model = modelAssets.find((item) => item.id === modelId) ?? modelAssets[0]
  const relatedAgents = agentAssets.filter((item) => model.referencedAgentIds.includes(item.id) || item.modelAssetId === model.id)
  const [activeTab, setActiveTab] = useState(tabs[0])

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--color-ink-muted)]">
            模型与智能体中心 / 模型资产 / <span className="font-semibold text-[var(--color-ink)]">{model.name}</span>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('models')}><ArrowLeft className="h-4 w-4" />返回模型资产</Button>
        </div>

        <section className="rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-white via-[#f7f9ff] to-[#edf5ff] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={model.status === 'ready' ? 'success' : model.status === 'updating' ? 'warning' : 'muted'}>{statusText(model.status)}</Badge>
                <Badge variant="outline">{modelTypeText(model.type)}</Badge>
                <Badge variant="muted">{sourceText(model.source)}</Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold">{model.name}</h1>
              <p className="mt-2 font-mono text-sm text-[var(--color-ink-secondary)]">{model.id} / {model.version}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{model.capabilities.map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}</div>
            </div>
            <Cpu className="h-10 w-10 text-[var(--color-brand)]" />
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Mini label="类型" value={modelTypeText(model.type)} />
          <Mini label="状态" value={statusText(model.status)} />
          <Mini label="来源" value={sourceText(model.source)} />
          <Mini label="参数规模" value={model.parameterSize ?? '-'} />
          <Mini label="上下文长度" value={`${model.contextLength.toLocaleString()} tokens`} />
          <Mini label="Provider" value={model.provider} />
          <Mini label="关联智能体" value={`${relatedAgents.length} 个`} />
          <Mini label="CasePlan 引用" value={`${model.referencedCasePlanIds.length} 个`} />
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-white p-1">
          {tabs.map((tab) => (
            <button key={tab} className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === tab ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-soft)]'}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === '模型介绍' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Info title="模型说明" body={model.description} />
            <Info title="适用任务" body={model.recommendedScenarios.join('；')} />
            <Info title="能力增强方向" body={model.capabilities.join('；')} />
            <Info title="使用限制" body={model.limitations.join('；')} />
            <Info title="推荐场景" body={model.recommendedScenarios.join('；')} />
            <Info title="推荐智能体" body={relatedAgents.map((item) => item.name).join('；') || '-'} />
          </div>
        ) : null}

        {activeTab === '版本与配置' ? (
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-3">
              <Mini label="当前版本" value={model.version} />
              <Mini label="历史版本" value="1.0.0 / 0.9.0" />
              <Mini label="参数规模" value={model.parameterSize ?? '-'} />
              <Mini label="上下文长度" value={`${model.contextLength.toLocaleString()} tokens`} />
              <Mini label="支持工具调用" value="是" />
              <Mini label="支持结构化输出" value="是" />
              <Mini label="默认超时" value="120 min" />
              <Mini label="默认 Token 限制" value="800K" />
            </CardContent>
          </Card>
        ) : null}

        {activeTab === '能力评测' ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {Object.entries({ ...model.benchmarkScores, 场景演练成功率: relatedAgents[0]?.successRate ?? 70 }).map(([name, score]) => (
              <Card key={name}>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="mt-2 text-3xl font-semibold text-[var(--color-brand)]">{score}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {activeTab === '使用情况' ? (
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-3">
              <Mini label="关联智能体" value={`${relatedAgents.length} 个`} />
              <Mini label="关联 CasePlan" value={`${model.referencedCasePlanIds.length} 个`} />
              <Mini label="最近 RangeRun" value="RR-20260729-CYBER-002" />
              <Mini label="调用量" value="12,840" />
              <Mini label="Token 使用" value="9.8M" />
              <Mini label="预估成本" value="1,842 元" />
            </CardContent>
          </Card>
        ) : null}

        {activeTab === '关联资产' ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>来源关系</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <LinkLine label="来源训练任务" value={model.trainingJobId ?? '无'} onClick={model.trainingJobId ? () => onOpenTrainingJob(model.trainingJobId!) : undefined} />
                <LinkLine label="来源模型产物" value={model.artifactId ?? '无'} onClick={model.artifactId ? () => onOpenArtifact(model.artifactId!) : undefined} />
                <LinkLine label="来源数据集" value={model.datasetIds?.join('，') ?? '无'} />
                <LinkLine label="关联 Benchmark" value={Object.keys(model.benchmarkScores).join('，')} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>关联智能体</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {relatedAgents.map((agent) => <LinkLine key={agent.id} label={agentTypeText(agent.type)} value={agent.name} onClick={() => onOpenAgent(agent.id)} />)}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  )
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="text-sm leading-7 text-[var(--color-ink-secondary)]">{body}</CardContent>
    </Card>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2">
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold">{value}</div>
    </div>
  )
}

function LinkLine({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <button type="button" className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-left" onClick={onClick}>
      <span className="text-xs text-[var(--color-ink-muted)]">{label}</span>
      <span className={onClick ? 'font-semibold text-[var(--color-brand)]' : 'font-semibold'}>{value}</span>
    </button>
  )
}

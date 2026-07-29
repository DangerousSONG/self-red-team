import { useState } from 'react'
import { ArrowLeft, Boxes } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'

interface ModelArtifactDetailPageProps {
  artifactId: string
  onNavigate: (id: string) => void
  onOpenJob: (jobId: string) => void
  onOpenDataset: (type: 'cpt' | 'vulnerability', id: string) => void
}

const tabs = ['模型介绍', '训练信息', '评测结果', '产物文件', '使用说明']

export function ModelArtifactDetailPage({ artifactId, onNavigate, onOpenJob, onOpenDataset }: ModelArtifactDetailPageProps) {
  const { modelArtifacts, trainingJobs } = useDataCenter()
  const artifact = modelArtifacts.find((item) => item.id === artifactId) ?? modelArtifacts[0]
  const job = trainingJobs.find((item) => item.id === artifact.trainingJobId)
  const [activeTab, setActiveTab] = useState(tabs[0])

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--color-ink-muted)]">
            基模训练 / 模型产物 / <span className="font-semibold text-[var(--color-ink)]">{artifact.name}</span>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('training-artifacts')}><ArrowLeft className="h-4 w-4" />返回模型产物</Button>
        </div>

        <section className="rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-white via-[#f8f7ff] to-[#eef2ff] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={artifact.status === 'ready' ? 'success' : artifact.status === 'generating' ? 'warning' : 'danger'}>{artifact.status}</Badge>
                <Badge variant="outline">{artifact.baseModel}</Badge>
                <Badge variant="default">{artifact.trainingMethod}</Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold">{artifact.name}</h1>
              <p className="mt-2 text-sm text-[var(--color-ink-secondary)]">{artifact.id} / {artifact.version} / {artifact.modelSize}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{artifact.tags.map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}</div>
            </div>
            <Boxes className="h-10 w-10 text-[var(--color-brand)]" />
          </div>
        </section>

        <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-white p-1">
          {tabs.map((tab) => (
            <button key={tab} className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === tab ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-soft)]'}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === '模型介绍' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Info title="模型说明" body={artifact.description} />
            <Info title="适用场景" body={artifact.scenarios.join('；')} />
            <Info title="能力增强方向" body={artifact.enhancementDirections.join('；')} />
            <Info title="使用限制" body={artifact.limitations.join('；')} />
            <Info title="数据来源" body={artifact.datasetIds.join('，')} />
            <Info title="注意事项" body="该页面仅展示 Mock 模型产物，不提供真实模型权重、部署服务或在线推理。" />
          </div>
        ) : null}

        {activeTab === '训练信息' ? (
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-3">
              <Mini label="来源 TrainingJob" value={artifact.trainingJobId} action={() => onOpenJob(artifact.trainingJobId)} />
              <Mini label="训练步数" value="3200" />
              <Mini label="最佳 Checkpoint" value={job?.checkpointIds[0] ?? '-'} />
              <Mini label="总 Token" value={job?.datasets.reduce((sum, item) => sum + (item.tokenCount ?? 0), 0).toLocaleString() ?? '-'} />
              <Mini label="总训练时间" value={job?.elapsed ?? '-'} />
              <Mini label="训练成本" value="Mock 12,800 元" />
              {job?.datasets.map((dataset) => (
                <Mini key={dataset.datasetId} label={dataset.datasetType === 'cpt' ? 'CPT 数据集' : '漏洞数据集'} value={dataset.datasetName} action={() => onOpenDataset(dataset.datasetType, dataset.datasetId)} />
              ))}
            </CardContent>
          </Card>
        ) : null}

        {activeTab === '评测结果' ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(artifact.benchmarkScores).map(([name, score]) => (
              <Card key={name}>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="mt-2 text-3xl font-semibold text-[var(--color-brand)]">{score}</div>
                  <p className="mt-2 text-sm text-[var(--color-ink-secondary)]">训练前 61 / Checkpoint 72 / 训练后 {score}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {activeTab === '产物文件' ? (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                  <tr>{['文件名', '格式', '大小', '创建时间', '状态', '操作'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
                </thead>
                <tbody>
                  {artifact.files.map((file) => (
                    <tr key={file.id} className="border-t border-[var(--color-border)]">
                      <td className="px-3 py-3 font-semibold">{file.name}</td>
                      <td className="px-3 py-3">{file.format}</td>
                      <td className="px-3 py-3">{file.size}</td>
                      <td className="px-3 py-3">{file.createdAt}</td>
                      <td className="px-3 py-3">{file.status}</td>
                      <td className="px-3 py-3"><Button size="sm" variant="ghost">Mock 查看</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === '使用说明' ? (
          <Card>
            <CardContent className="space-y-3 p-4">
              <Info title="模型用途" body="用于安全领域基模能力增强的 Mock 产物展示，不用于真实部署。" />
              <Info title="版本引用" body={`${artifact.name}@${artifact.version}`} />
              <pre className="overflow-x-auto rounded-lg bg-[#0b1220] p-4 text-xs text-[#d1e7dd]">{`const model = await mockModelRegistry.load("${artifact.id}")`}</pre>
              <Info title="安全使用声明" body="本阶段不提供真实推理、API Key、部署或下载服务。" />
            </CardContent>
          </Card>
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

function Mini({ label, value, action }: { label: string; value: string; action?: () => void }) {
  return (
    <button type="button" onClick={action} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-left">
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className={`mt-1 break-words text-sm font-semibold ${action ? 'text-[var(--color-brand)]' : ''}`}>{value}</div>
    </button>
  )
}

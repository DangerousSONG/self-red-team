import { useMemo, useState } from 'react'
import { ArrowLeft, Download, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'
import type { TraceRecord } from '@/types/data-center'

interface TrajectoryDatasetDetailPageProps {
  datasetId: string
  onNavigate: (id: string) => void
}

export function TrajectoryDatasetDetailPage({ datasetId, onNavigate }: TrajectoryDatasetDetailPageProps) {
  const { trajectoryDatasets, traces } = useDataCenter()
  const dataset = trajectoryDatasets.find((item) => item.id === datasetId) ?? trajectoryDatasets[0]
  const datasetTraces = useMemo(() => traces.filter((trace) => trace.datasetId === dataset.id), [dataset.id, traces])
  const [selectedTraceId, setSelectedTraceId] = useState(datasetTraces[0]?.id ?? '')
  const selectedTrace = datasetTraces.find((trace) => trace.id === selectedTraceId) ?? datasetTraces[0]

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">Trajectory Dataset</Badge>
            <h1 className="mt-2 text-2xl font-semibold">{dataset.name}</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">{dataset.description}</p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('trajectories')}>
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Info label="用途" value={dataset.usage} />
          <Info label="标签" value={dataset.tags.join(', ')} />
          <Info label="条数" value={String(dataset.traceCount)} />
          <Info label="成功 / 失败" value={`${dataset.successCount} / ${dataset.failureCount}`} />
          <Info label="平均步骤" value="18" />
          <Info label="平均 Token" value="118k" />
          <Info label="平均成本" value="24 元" />
          <Info label="质量" value={dataset.quality} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>数据来源</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {dataset.sourceRunIds.map((runId) => <Badge key={runId} variant="muted">{runId}</Badge>)}
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <Card>
            <CardHeader>
              <CardTitle>轨迹列表</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                  <tr>
                    {['Trace ID', 'Run ID', '任务', 'Agent', '模型', 'Verdict', '步骤数', 'Token', '成本', '数据质量', '创建时间'].map((item) => <th key={item} className="px-3 py-2">{item}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {datasetTraces.map((trace) => (
                    <tr key={trace.id} className="cursor-pointer border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]" onClick={() => setSelectedTraceId(trace.id)}>
                      <td className="px-3 py-3 font-mono text-xs">{trace.id}</td>
                      <td className="px-3 py-3 font-mono text-xs">{trace.runId}</td>
                      <td className="px-3 py-3">{trace.task}</td>
                      <td className="px-3 py-3">{trace.agent}</td>
                      <td className="px-3 py-3">{trace.model}</td>
                      <td className="px-3 py-3"><Badge variant={trace.verdict === 'Success' ? 'success' : 'warning'}>{trace.verdict}</Badge></td>
                      <td className="px-3 py-3">{trace.steps}</td>
                      <td className="px-3 py-3">{trace.token}</td>
                      <td className="px-3 py-3">{trace.cost}</td>
                      <td className="px-3 py-3">{trace.quality}</td>
                      <td className="px-3 py-3">{trace.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {selectedTrace ? <TraceDetail trace={selectedTrace} /> : null}
        </div>
      </div>
    </main>
  )
}

function TraceDetail({ trace }: { trace: TraceRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>轨迹详情</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Info label="任务目标" value={trace.task} />
        <Info label="Observation" value={trace.observation} />
        <Info label="Planning 摘要" value={trace.planningSummary} />
        <Info label="Action" value={trace.action} />
        <Info label="Tool Call" value={trace.toolCall} />
        <Info label="Tool Result" value={trace.toolResult} />
        <Info label="Feedback" value={trace.feedback} />
        <Info label="最终结果" value={trace.finalResult} />
        <Info label="Reward / Score" value={String(trace.score)} />
        <Info label="证据引用" value={trace.evidenceRef} />
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary"><Sparkles className="h-4 w-4" />标记高质量</Button>
          <Button size="sm" variant="secondary">移出数据集</Button>
          <Button size="sm" variant="secondary">生成 CPT 候选</Button>
          <Button size="sm" variant="secondary"><Download className="h-4 w-4" />导出</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 break-words text-sm font-medium leading-6 text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

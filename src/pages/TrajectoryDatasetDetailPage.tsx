import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DatasetDetailPanel,
  DatasetFileList,
  DatasetHero,
  DatasetIntroPanel,
  DatasetMetadataSidebar,
  DatasetTabs,
  DatasetToast,
  DatasetUsagePanel,
  RecordTable,
} from '@/components/datasets/DatasetComponents'
import { useDataCenter } from '@/hooks/useDataCenter'
import { trajectoryToDatasetCard } from '@/lib/dataset-utils'
import type { TraceRecord } from '@/types/data-center'

interface TrajectoryDatasetDetailPageProps {
  datasetId: string
  onNavigate: (id: string) => void
}

const tabs = ['数据集介绍', '数据集详情', '轨迹记录', '数据文件', '使用说明']

export function TrajectoryDatasetDetailPage({ datasetId, onNavigate }: TrajectoryDatasetDetailPageProps) {
  const { trajectoryDatasets, traces } = useDataCenter()
  const rawDataset = trajectoryDatasets.find((item) => item.id === datasetId) ?? trajectoryDatasets[0]
  const dataset = useMemo(() => trajectoryToDatasetCard(rawDataset), [rawDataset])
  const records = traces.filter((trace) => trace.datasetId === rawDataset.id)
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(records[0] ?? null)
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--color-ink-muted)]">
            数据中心 / 轨迹数据集 / <span className="font-semibold text-[var(--color-ink)]">{dataset.name}</span>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('trajectories')}>
            <ArrowLeft className="h-4 w-4" />
            返回轨迹数据集
          </Button>
        </div>

        <DatasetHero dataset={dataset} dataTypeLabel="轨迹数据集" scaleLabel={`${dataset.traceTotal} 条轨迹`} onToast={showToast} />
        <DatasetTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            {activeTab === '数据集介绍' ? <DatasetIntroPanel dataset={dataset} /> : null}
            {activeTab === '数据集详情' ? <DatasetDetailPanel dataset={dataset} /> : null}
            {activeTab === '轨迹记录' ? (
              <div className="space-y-4">
                <TraceTable records={records} selectedId={selectedTrace?.id} onSelect={setSelectedTrace} />
                {selectedTrace ? <TraceDetail trace={selectedTrace} /> : null}
              </div>
            ) : null}
            {activeTab === '数据文件' ? <DatasetFileList files={dataset.files} onToast={showToast} /> : null}
            {activeTab === '使用说明' ? <DatasetUsagePanel dataset={dataset} /> : null}
          </div>
          <DatasetMetadataSidebar dataset={dataset} benchmark={dataset.benchmark} runCount={rawDataset.sourceRunIds.length} />
        </div>
      </div>
      <DatasetToast message={toast} />
    </main>
  )
}

function TraceTable({
  records,
  selectedId,
  onSelect,
}: {
  records: TraceRecord[]
  selectedId?: string
  onSelect: (trace: TraceRecord) => void
}) {
  return (
    <RecordTable
      heads={['Trace ID', 'Run ID', '任务名称', '任务分类', 'Benchmark', 'Agent', '模型', 'Verdict', '步骤数', 'Token', '成本', '数据质量', '创建时间']}
      rows={records.map((trace) => (
        <tr
          key={trace.id}
          className={selectedId === trace.id ? 'border-t border-[var(--color-border)] bg-[var(--color-brand-soft)]' : 'border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'}
          onClick={() => onSelect(trace)}
        >
          <td className="px-3 py-3 font-mono text-xs">{trace.id}</td>
          <td className="px-3 py-3 font-mono text-xs">{trace.runId}</td>
          <td className="px-3 py-3">{trace.task}</td>
          <td className="px-3 py-3">{trace.task.includes('CyberGym') || trace.task.includes('ExploitGym') || trace.task.includes('PatchEval') ? '基准评测' : '场景演练'}</td>
          <td className="px-3 py-3">{['CyberGym', 'ExploitGym', 'PatchEval'].find((name) => trace.task.includes(name)) ?? '-'}</td>
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
    />
  )
}

function TraceDetail({ trace }: { trace: TraceRecord }) {
  const rows = [
    ['任务目标', trace.task],
    ['结构化规划摘要', trace.planningSummary],
    ['Observation', trace.observation],
    ['Action', trace.action],
    ['Tool Call', trace.toolCall],
    ['Tool Result', trace.toolResult],
    ['Feedback', trace.feedback],
    ['最终结果', trace.finalResult],
    ['Reward / Score', String(trace.score)],
    ['Evidence References', trace.evidenceRef],
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>轨迹详情</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--color-border)] bg-white p-3">
            <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
            <div className="mt-1 break-words text-sm leading-6">{value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

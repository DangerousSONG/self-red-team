import { useEffect, useMemo, useState } from 'react'
import { Route } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DatasetAssetCard,
  DatasetEmpty,
  DatasetFilterBar,
  DatasetSkeleton,
  DatasetToast,
} from '@/components/datasets/DatasetComponents'
import { useDataCenter } from '@/hooks/useDataCenter'
import { useDatasetBrowserState } from '@/hooks/useDatasetBrowserState'
import { trajectoryToDatasetCard } from '@/lib/dataset-utils'
import type { TrajectoryDatasetCard } from '@/types/dataset'

interface TrajectoryDatasetsPageProps {
  onOpenDataset: (datasetId: string) => void
}

export function TrajectoryDatasetsPage({ onOpenDataset }: TrajectoryDatasetsPageProps) {
  const { trajectoryDatasets } = useDataCenter()
  const { state, update, clear } = useDatasetBrowserState('dataset-browser.trajectory')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const datasets = useMemo(() => trajectoryDatasets.map(trajectoryToDatasetCard), [trajectoryDatasets])
  const filtered = useMemo(() => filterDatasets(datasets, state), [datasets, state])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 220)
    return () => window.clearTimeout(timer)
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div>
          <Badge variant="outline">
            <Route className="h-3.5 w-3.5" />
            Trajectory Assets
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold">轨迹数据集</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">管理场景演练、基准评测和 Agent 执行过程中生成的轨迹数据</p>
        </div>

        <DatasetFilterBar
          search={state.search}
          onSearchChange={(value) => update('search', value)}
          source={state.source}
          onSourceChange={(value) => update('source', value)}
          dataType={state.dataType}
          onDataTypeChange={(value) => update('dataType', value)}
          status={state.status}
          onStatusChange={(value) => update('status', value)}
          tag={state.tag}
          onTagChange={(value) => update('tag', value)}
          sort={state.sort}
          onSortChange={(value) => update('sort', value)}
          view={state.view}
          onViewChange={(value) => update('view', value)}
          count={filtered.length}
          sources={Array.from(new Set(datasets.map((item) => item.source)))}
          dataTypes={Array.from(new Set(datasets.map((item) => item.taskType)))}
          tags={Array.from(new Set(datasets.flatMap((item) => item.tags)))}
          onClear={clear}
        />

        {loading ? <DatasetSkeleton /> : filtered.length === 0 ? <DatasetEmpty onClear={clear} /> : state.view === 'card' ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((dataset) => (
              <DatasetAssetCard
                key={dataset.id}
                dataset={dataset}
                eyebrow={dataset.source}
                metrics={[
                  { label: '轨迹总数', value: dataset.traceTotal },
                  { label: '成功轨迹', value: dataset.successTraceCount, tone: 'success' },
                  { label: '失败轨迹', value: dataset.failureTraceCount, tone: 'warning' },
                  { label: '平均步骤数', value: dataset.averageSteps },
                  { label: '数据质量', value: dataset.quality, tone: 'success' },
                  { label: '可见状态', value: dataset.visibilityLabel },
                ]}
                onOpen={() => onOpenDataset(dataset.id)}
                onToast={showToast}
              />
            ))}
          </div>
        ) : (
          <DatasetList datasets={filtered} onOpenDataset={onOpenDataset} />
        )}
      </div>
      <DatasetToast message={toast} />
    </main>
  )
}

function DatasetList({ datasets, onOpenDataset }: { datasets: TrajectoryDatasetCard[]; onOpenDataset: (datasetId: string) => void }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>
              {['数据集名称', 'Dataset ID', '数据来源', '任务类型', 'Benchmark', 'Agent 类型', '轨迹总数', '成功轨迹', '失败轨迹', '平均步骤', '数据质量', '最近更新', '操作'].map((item) => <th key={item} className="px-3 py-2">{item}</th>)}
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => (
              <tr key={dataset.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-3 font-semibold">{dataset.name}</td>
                <td className="px-3 py-3 font-mono text-xs">{dataset.id}</td>
                <td className="px-3 py-3">{dataset.source}</td>
                <td className="px-3 py-3">{dataset.taskType}</td>
                <td className="px-3 py-3">{dataset.benchmark ?? '-'}</td>
                <td className="px-3 py-3">{dataset.agentType}</td>
                <td className="px-3 py-3">{dataset.traceTotal}</td>
                <td className="px-3 py-3 text-[var(--color-success)]">{dataset.successTraceCount}</td>
                <td className="px-3 py-3 text-[var(--color-warning)]">{dataset.failureTraceCount}</td>
                <td className="px-3 py-3">{dataset.averageSteps}</td>
                <td className="px-3 py-3"><Badge variant="success">{dataset.quality}</Badge></td>
                <td className="px-3 py-3">{dataset.updatedAt}</td>
                <td className="px-3 py-3"><Button size="sm" variant="secondary" onClick={() => onOpenDataset(dataset.id)}>进入数据集</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function filterDatasets(datasets: TrajectoryDatasetCard[], state: ReturnType<typeof useDatasetBrowserState>['state']) {
  const search = state.search.trim().toLowerCase()
  const filtered = datasets.filter((dataset) => {
    const matchedSearch = !search || [dataset.name, dataset.id, dataset.description, ...dataset.tags].join(' ').toLowerCase().includes(search)
    const matchedSource = !state.source || dataset.source === state.source
    const matchedType = !state.dataType || dataset.taskType === state.dataType
    const matchedStatus = !state.status || dataset.status === state.status
    const matchedTag = !state.tag || dataset.tags.includes(state.tag)
    return matchedSearch && matchedSource && matchedType && matchedStatus && matchedTag
  })
  return sortDatasets(filtered, state.sort)
}

function sortDatasets<T extends TrajectoryDatasetCard>(datasets: T[], sort: string) {
  return [...datasets].sort((a, b) => {
    if (sort === '数据量最多') return b.recordCount - a.recordCount
    if (sort === '质量最高') return b.qualityScore - a.qualityScore
    if (sort === '名称') return a.name.localeCompare(b.name, 'zh-CN')
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

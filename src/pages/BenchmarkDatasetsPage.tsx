import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Target } from 'lucide-react'
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
import type { BenchmarkDataset } from '@/types/dataset'

interface BenchmarkDatasetsPageProps {
  onOpenBenchmark: (datasetId: string) => void
  onNavigate: (id: string) => void
}

export function BenchmarkDatasetsPage({ onOpenBenchmark, onNavigate }: BenchmarkDatasetsPageProps) {
  const { benchmarkDatasets } = useDataCenter()
  const { state, update, clear } = useDatasetBrowserState('dataset-browser.benchmark')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const filtered = useMemo(() => filterDatasets(benchmarkDatasets, state), [benchmarkDatasets, state])

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">
              <Target className="h-3.5 w-3.5" />
              Benchmark Dataset
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold">Benchmark 数据集</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">管理用于漏洞挖掘、漏洞利用与漏洞修复能力评测的标准数据集</p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('data-center')}>
            <ArrowLeft className="h-4 w-4" />
            返回数据中心
          </Button>
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
          sources={Array.from(new Set(benchmarkDatasets.map((item) => item.benchmarkType)))}
          dataTypes={Array.from(new Set(benchmarkDatasets.map((item) => item.evaluationTarget)))}
          tags={Array.from(new Set(benchmarkDatasets.flatMap((item) => item.tags)))}
          onClear={clear}
        />

        {loading ? <DatasetSkeleton /> : filtered.length === 0 ? <DatasetEmpty onClear={clear} /> : state.view === 'card' ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((dataset) => (
              <DatasetAssetCard
                key={dataset.id}
                dataset={dataset}
                eyebrow={dataset.benchmarkType}
                metrics={[
                  { label: '评测对象', value: dataset.evaluationTarget },
                  { label: '任务数量', value: dataset.taskCount },
                  { label: '项目数量', value: dataset.projectCount },
                  { label: '语言', value: dataset.languages.join(' / ') },
                  { label: '数据版本', value: dataset.version },
                  { label: '质量评分', value: dataset.qualityScore, tone: 'success' },
                ]}
                onOpen={() => onOpenBenchmark(dataset.id)}
                onToast={showToast}
              />
            ))}
          </div>
        ) : (
          <BenchmarkList datasets={filtered} onOpenBenchmark={onOpenBenchmark} />
        )}
      </div>
      <DatasetToast message={toast} />
    </main>
  )
}

function BenchmarkList({ datasets, onOpenBenchmark }: { datasets: BenchmarkDataset[]; onOpenBenchmark: (datasetId: string) => void }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>
              {['数据集名称', 'Dataset ID', 'Benchmark 类型', '评测对象', '任务数量', '项目数量', '语言', '难度分布', '数据版本', '最近更新', '操作'].map((item) => <th key={item} className="px-3 py-2">{item}</th>)}
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => (
              <tr key={dataset.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-3 font-semibold">{dataset.name}</td>
                <td className="px-3 py-3 font-mono text-xs">{dataset.id}</td>
                <td className="px-3 py-3">{dataset.benchmarkType}</td>
                <td className="px-3 py-3">{dataset.evaluationTarget}</td>
                <td className="px-3 py-3">{dataset.taskCount}</td>
                <td className="px-3 py-3">{dataset.projectCount}</td>
                <td className="px-3 py-3">{dataset.languages.join(' / ')}</td>
                <td className="px-3 py-3">{Object.entries(dataset.difficultyDistribution).map(([key, value]) => `${key}:${value}%`).join(' / ')}</td>
                <td className="px-3 py-3">{dataset.version}</td>
                <td className="px-3 py-3">{dataset.updatedAt}</td>
                <td className="px-3 py-3"><Button size="sm" variant="secondary" onClick={() => onOpenBenchmark(dataset.id)}>进入数据集</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function filterDatasets(datasets: BenchmarkDataset[], state: ReturnType<typeof useDatasetBrowserState>['state']) {
  const search = state.search.trim().toLowerCase()
  const filtered = datasets.filter((dataset) => {
    const matchedSearch = !search || [dataset.name, dataset.id, dataset.description, dataset.benchmarkType, dataset.evaluationTarget, ...dataset.tags].join(' ').toLowerCase().includes(search)
    const matchedSource = !state.source || dataset.benchmarkType === state.source
    const matchedType = !state.dataType || dataset.evaluationTarget === state.dataType
    const matchedStatus = !state.status || dataset.status === state.status
    const matchedTag = !state.tag || dataset.tags.includes(state.tag)
    return matchedSearch && matchedSource && matchedType && matchedStatus && matchedTag
  })
  return [...filtered].sort((a, b) => {
    if (state.sort === '数据量最多') return b.taskCount - a.taskCount
    if (state.sort === '质量最高') return b.qualityScore - a.qualityScore
    if (state.sort === '名称') return a.name.localeCompare(b.name, 'zh-CN')
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

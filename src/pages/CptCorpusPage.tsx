import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Brain, FileText } from 'lucide-react'
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
import { TrainingLaunchDialog } from '@/components/training/TrainingLaunchDialog'
import type { CptCorpusDataset } from '@/types/dataset'

interface CptCorpusPageProps {
  onOpenCorpus: (id: string) => void
  onOpenTrainingJob: (jobId: string) => void
  onNavigate: (id: string) => void
}

export function CptCorpusPage({ onOpenCorpus, onOpenTrainingJob, onNavigate }: CptCorpusPageProps) {
  const { cptDatasets } = useDataCenter()
  const { state, update, clear } = useDatasetBrowserState('dataset-browser.cpt')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [trainingMode, setTrainingMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const filtered = useMemo(() => filterDatasets(cptDatasets, state), [cptDatasets, state])
  const selectedDatasets = useMemo(() => cptDatasets.filter((dataset) => selectedIds.includes(dataset.id)), [cptDatasets, selectedIds])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 220)
    return () => window.clearTimeout(timer)
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const toggleDataset = (id: string) => {
    setSelectedIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">
              <FileText className="h-3.5 w-3.5" />
              CPT Corpus
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold">CPT 语料库</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">管理漏洞知识、攻击方法、修复经验与安全领域持续预训练语料</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => onNavigate('data-center')}>
              <ArrowLeft className="h-4 w-4" />
              返回数据中心
            </Button>
            <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={trainingMode}
                onChange={(event) => {
                  setTrainingMode(event.target.checked)
                  if (!event.target.checked) setSelectedIds([])
                }}
              />
              训练选择模式
            </label>
          </div>
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
          sources={Array.from(new Set(cptDatasets.map((item) => item.source)))}
          dataTypes={Array.from(new Set(cptDatasets.flatMap((item) => item.corpusTypes)))}
          tags={Array.from(new Set(cptDatasets.flatMap((item) => item.tags)))}
          onClear={clear}
        />

        {loading ? <DatasetSkeleton /> : filtered.length === 0 ? <DatasetEmpty onClear={clear} /> : state.view === 'card' ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((dataset) => (
              <SelectableDatasetCard
                key={dataset.id}
                dataset={dataset}
                trainingMode={trainingMode}
                checked={selectedIds.includes(dataset.id)}
                onToggle={() => toggleDataset(dataset.id)}
                onOpenCorpus={onOpenCorpus}
                onToast={showToast}
              />
            ))}
          </div>
        ) : (
          <DatasetList datasets={filtered} onOpenCorpus={onOpenCorpus} trainingMode={trainingMode} selectedIds={selectedIds} onToggle={toggleDataset} />
        )}
      </div>
      {trainingMode && selectedDatasets.length ? (
        <TrainingSelectionBar datasets={selectedDatasets} onClear={() => setSelectedIds([])} onLaunch={() => setDialogOpen(true)} />
      ) : null}
      <TrainingLaunchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cptDatasets={selectedDatasets}
        vulnerabilityDatasets={[]}
        onCreated={(job) => {
          showToast('训练任务已创建')
          onOpenTrainingJob(job.id)
        }}
      />
      <DatasetToast message={toast} />
    </main>
  )
}

function SelectableDatasetCard({
  dataset,
  trainingMode,
  checked,
  onToggle,
  onOpenCorpus,
  onToast,
}: {
  dataset: CptCorpusDataset
  trainingMode: boolean
  checked: boolean
  onToggle: () => void
  onOpenCorpus: (id: string) => void
  onToast: (message: string) => void
}) {
  return (
    <div className="relative h-full">
      {trainingMode ? (
        <label className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-brand)] bg-white shadow-sm">
          <input type="checkbox" checked={checked} onChange={onToggle} />
        </label>
      ) : null}
      <DatasetAssetCard
        dataset={dataset}
        eyebrow={dataset.domain}
        selected={checked}
        metrics={[
          { label: '文档数量', value: dataset.documentCount },
          { label: 'Token 总量', value: dataset.tokenTotal.toLocaleString() },
          { label: '质量评分', value: dataset.qualityScore, tone: 'success' },
          { label: '训练引用', value: dataset.trainingRefCount ?? 0, tone: 'warning' },
          { label: '最近产物', value: dataset.latestArtifact ?? '-' },
          { label: '脱敏状态', value: dataset.desensitizationStatus, tone: 'success' },
        ]}
        onOpen={() => trainingMode ? onToggle() : onOpenCorpus(dataset.id)}
        onToast={onToast}
      />
    </div>
  )
}

function TrainingSelectionBar({ datasets, onClear, onLaunch }: { datasets: CptCorpusDataset[]; onClear: () => void; onLaunch: () => void }) {
  const documents = datasets.reduce((sum, item) => sum + item.documentCount, 0)
  const tokens = datasets.reduce((sum, item) => sum + item.tokenTotal, 0)
  const quality = Math.round(datasets.reduce((sum, item) => sum + item.qualityScore, 0) / datasets.length)
  return (
    <div className="fixed bottom-4 left-[244px] right-6 z-40 rounded-xl border border-[var(--color-brand)]/25 bg-white p-3 shadow-[var(--shadow-panel)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="default"><Brain className="h-3.5 w-3.5" />已选择 {datasets.length} 个数据集</Badge>
          <Badge variant="muted">文档 {documents} 篇</Badge>
          <Badge variant="muted">Token {tokens.toLocaleString()}</Badge>
          <Badge variant="muted">大小约 {Math.round(tokens / 1800)} MB</Badge>
          <Badge variant="success">质量 {quality}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClear}>取消选择</Button>
          <Button onClick={onLaunch}>用于基模训练</Button>
        </div>
      </div>
    </div>
  )
}

function DatasetList({
  datasets,
  onOpenCorpus,
  trainingMode,
  selectedIds,
  onToggle,
}: {
  datasets: CptCorpusDataset[]
  onOpenCorpus: (id: string) => void
  trainingMode: boolean
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>
              {[trainingMode ? '选择' : '', '数据集名称', 'Corpus Dataset ID', '主题领域', '语料类型', '来源', '语言', '文档数量', 'Token 总量', '质量评分', '训练引用', '最近产物', '脱敏状态', '最近更新', '操作'].filter(Boolean).map((item) => <th key={item} className="px-3 py-2">{item}</th>)}
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => (
              <tr key={dataset.id} className="border-t border-[var(--color-border)]">
                {trainingMode ? <td className="px-3 py-3"><input type="checkbox" checked={selectedIds.includes(dataset.id)} onChange={() => onToggle(dataset.id)} /></td> : null}
                <td className="px-3 py-3 font-semibold">{dataset.name}</td>
                <td className="px-3 py-3 font-mono text-xs">{dataset.id}</td>
                <td className="px-3 py-3">{dataset.domain}</td>
                <td className="px-3 py-3">{dataset.corpusTypes.join(', ')}</td>
                <td className="px-3 py-3">{dataset.source}</td>
                <td className="px-3 py-3">{dataset.language}</td>
                <td className="px-3 py-3">{dataset.documentCount}</td>
                <td className="px-3 py-3">{dataset.tokenTotal.toLocaleString()}</td>
                <td className="px-3 py-3 text-[var(--color-success)]">{dataset.qualityScore}</td>
                <td className="px-3 py-3">{dataset.trainingRefCount ?? 0}</td>
                <td className="px-3 py-3">{dataset.latestArtifact ?? '-'}</td>
                <td className="px-3 py-3">{dataset.desensitizationStatus}</td>
                <td className="px-3 py-3">{dataset.updatedAt}</td>
                <td className="px-3 py-3"><Button size="sm" variant="secondary" onClick={() => onOpenCorpus(dataset.id)}>进入数据集</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function filterDatasets(datasets: CptCorpusDataset[], state: ReturnType<typeof useDatasetBrowserState>['state']) {
  const search = state.search.trim().toLowerCase()
  const filtered = datasets.filter((dataset) => {
    const matchedSearch = !search || [dataset.name, dataset.id, dataset.description, dataset.domain, ...dataset.tags].join(' ').toLowerCase().includes(search)
    const matchedSource = !state.source || dataset.source === state.source
    const matchedType = !state.dataType || dataset.corpusTypes.includes(state.dataType)
    const matchedStatus = !state.status || dataset.status === state.status
    const matchedTag = !state.tag || dataset.tags.includes(state.tag)
    return matchedSearch && matchedSource && matchedType && matchedStatus && matchedTag
  })
  return [...filtered].sort((a, b) => {
    if (state.sort === '数据量最多') return b.documentCount - a.documentCount
    if (state.sort === '质量最高') return b.qualityScore - a.qualityScore
    if (state.sort === '名称') return a.name.localeCompare(b.name, 'zh-CN')
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

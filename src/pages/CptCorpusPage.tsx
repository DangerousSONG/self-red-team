import { useEffect, useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
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
import type { CptCorpusDataset } from '@/types/dataset'

interface CptCorpusPageProps {
  onOpenCorpus: (id: string) => void
}

export function CptCorpusPage({ onOpenCorpus }: CptCorpusPageProps) {
  const { cptDatasets } = useDataCenter()
  const { state, update, clear } = useDatasetBrowserState('dataset-browser.cpt')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const filtered = useMemo(() => filterDatasets(cptDatasets, state), [cptDatasets, state])

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
            <FileText className="h-3.5 w-3.5" />
            CPT Corpus
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold">CPT 语料库</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">管理漏洞知识、攻击方法、修复经验与安全领域持续预训练语料</p>
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
              <DatasetAssetCard
                key={dataset.id}
                dataset={dataset}
                eyebrow={dataset.domain}
                metrics={[
                  { label: '文档数量', value: dataset.documentCount },
                  { label: 'Token 总量', value: dataset.tokenTotal.toLocaleString() },
                  { label: '质量评分', value: dataset.qualityScore, tone: 'success' },
                  { label: '审核进度', value: `${dataset.reviewProgress}%`, tone: 'warning' },
                  { label: '脱敏状态', value: dataset.desensitizationStatus, tone: 'success' },
                  { label: '语言', value: dataset.language },
                ]}
                onOpen={() => onOpenCorpus(dataset.id)}
                onToast={showToast}
              />
            ))}
          </div>
        ) : (
          <DatasetList datasets={filtered} onOpenCorpus={onOpenCorpus} />
        )}
      </div>
      <DatasetToast message={toast} />
    </main>
  )
}

function DatasetList({ datasets, onOpenCorpus }: { datasets: CptCorpusDataset[]; onOpenCorpus: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>
              {['数据集名称', 'Corpus Dataset ID', '主题领域', '语料类型', '来源', '语言', '文档数量', 'Token 总量', '质量评分', '审核进度', '脱敏状态', '许可证', '最近更新', '操作'].map((item) => <th key={item} className="px-3 py-2">{item}</th>)}
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => (
              <tr key={dataset.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-3 font-semibold">{dataset.name}</td>
                <td className="px-3 py-3 font-mono text-xs">{dataset.id}</td>
                <td className="px-3 py-3">{dataset.domain}</td>
                <td className="px-3 py-3">{dataset.corpusTypes.join(', ')}</td>
                <td className="px-3 py-3">{dataset.source}</td>
                <td className="px-3 py-3">{dataset.language}</td>
                <td className="px-3 py-3">{dataset.documentCount}</td>
                <td className="px-3 py-3">{dataset.tokenTotal.toLocaleString()}</td>
                <td className="px-3 py-3 text-[var(--color-success)]">{dataset.qualityScore}</td>
                <td className="px-3 py-3">{dataset.reviewProgress}%</td>
                <td className="px-3 py-3">{dataset.desensitizationStatus}</td>
                <td className="px-3 py-3">{dataset.license.name}</td>
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

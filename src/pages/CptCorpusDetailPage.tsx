import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CopyButton,
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
import { corpusForDataset } from '@/lib/dataset-utils'
import type { CptCorpusItem } from '@/types/data-center'

interface CptCorpusDetailPageProps {
  id: string
  onNavigate: (id: string) => void
}

const tabs = ['数据集介绍', '数据集详情', '语料条目', '数据文件', '使用说明']

export function CptCorpusDetailPage({ id, onNavigate }: CptCorpusDetailPageProps) {
  const { cptDatasets, cptCorpus } = useDataCenter()
  const dataset = cptDatasets.find((item) => item.id === id) ?? cptDatasets[0]
  const records = useMemo(() => corpusForDataset(dataset.id, cptCorpus), [cptCorpus, dataset.id])
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [selectedCorpus, setSelectedCorpus] = useState<CptCorpusItem | null>(records[0] ?? null)
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
            数据中心 / CPT 语料库 / <span className="font-semibold text-[var(--color-ink)]">{dataset.name}</span>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('cpt')}>
            <ArrowLeft className="h-4 w-4" />
            返回 CPT 语料库
          </Button>
        </div>

        <DatasetHero dataset={dataset} dataTypeLabel="CPT 语料数据集" scaleLabel={`${dataset.documentCount} 篇 / ${dataset.tokenTotal.toLocaleString()} tokens`} onToast={showToast} />
        <DatasetTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            {activeTab === '数据集介绍' ? <DatasetIntroPanel dataset={dataset} /> : null}
            {activeTab === '数据集详情' ? <DatasetDetailPanel dataset={dataset} /> : null}
            {activeTab === '语料条目' ? (
              <div className="space-y-4">
                <CorpusTable records={records} selectedId={selectedCorpus?.id} onSelect={setSelectedCorpus} />
                {selectedCorpus ? <CorpusDetail item={selectedCorpus} onToast={showToast} /> : null}
              </div>
            ) : null}
            {activeTab === '数据文件' ? <DatasetFileList files={dataset.files} onToast={showToast} /> : null}
            {activeTab === '使用说明' ? <DatasetUsagePanel dataset={dataset} /> : null}
          </div>
          <DatasetMetadataSidebar dataset={dataset} benchmark={dataset.source.includes('Gym') ? dataset.source : undefined} runCount={dataset.detail.relatedRuns.length} />
        </div>
      </div>
      <DatasetToast message={toast} />
    </main>
  )
}

function CorpusTable({
  records,
  selectedId,
  onSelect,
}: {
  records: CptCorpusItem[]
  selectedId?: string
  onSelect: (item: CptCorpusItem) => void
}) {
  return (
    <RecordTable
      heads={['Corpus ID', '标题', '语料类型', '来源', '关联漏洞', '关联 Run', '语言', 'Token 数', '质量评分', '脱敏状态', '审核状态', '创建时间']}
      rows={records.map((item) => (
        <tr
          key={item.id}
          className={selectedId === item.id ? 'border-t border-[var(--color-border)] bg-[var(--color-brand-soft)]' : 'border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'}
          onClick={() => onSelect(item)}
        >
          <td className="px-3 py-3 font-mono text-xs">{item.id}</td>
          <td className="px-3 py-3 font-semibold">{item.title}</td>
          <td className="px-3 py-3">{item.type}</td>
          <td className="px-3 py-3">{item.source}</td>
          <td className="px-3 py-3">{item.relatedVulnerability ?? '-'}</td>
          <td className="px-3 py-3">{item.relatedRunId ?? '-'}</td>
          <td className="px-3 py-3">{item.language}</td>
          <td className="px-3 py-3">{item.tokenCount}</td>
          <td className="px-3 py-3 text-[var(--color-success)]">{item.qualityScore}</td>
          <td className="px-3 py-3">{item.desensitized ? '已脱敏' : '未脱敏'}</td>
          <td className="px-3 py-3"><Badge variant={item.status === '候选' ? 'warning' : 'success'}>{item.status}</Badge></td>
          <td className="px-3 py-3">{item.createdAt}</td>
        </tr>
      ))}
    />
  )
}

function CorpusDetail({ item, onToast }: { item: CptCorpusItem; onToast: (message: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>语料详情</CardTitle>
          <CopyButton value={item.body} onToast={onToast} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Info label="标题" value={item.title} />
          <Info label="来源" value={item.source} />
          <Info label="关联漏洞" value={item.relatedVulnerability ?? '-'} />
          <Info label="关联轨迹" value={item.relatedTraceId ?? '-'} />
          <Info label="关联 Run" value={item.relatedRunId ?? '-'} />
          <Info label="Token 数" value={String(item.tokenCount)} />
          <Info label="数据质量" value={String(item.qualityScore)} />
          <Info label="脱敏记录" value={item.desensitized ? '已脱敏' : '未脱敏'} />
        </div>
        <article className="rounded-lg border border-[var(--color-border)] bg-white p-4 text-sm leading-7 text-[var(--color-ink-secondary)]">{item.body}</article>
        <div className="flex flex-wrap gap-2">{item.tags.map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}</div>
        <Info label="审核记录" value={`当前状态：${item.status}；Mock 审核链路保留创建时间和质量评分。`} />
      </CardContent>
    </Card>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold">{value}</div>
    </div>
  )
}

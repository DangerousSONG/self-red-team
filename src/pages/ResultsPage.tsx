import { useMemo, useState } from 'react'
import { BarChart3, Database, Eye, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatasetToast } from '@/components/datasets/DatasetComponents'
import { useDataCenter } from '@/hooks/useDataCenter'
import { cn } from '@/lib/utils'
import type { EvaluationResult } from '@/types/data-center'

interface ResultsPageProps {
  onOpenResult: (runId: string) => void
  onProcessData: (runId: string) => void
  onOpenDataset: (datasetId: string) => void
  onNavigate: (id: string) => void
}

type ResultTab = '基准评测' | '场景演练'

export function ResultsPage({ onOpenResult, onProcessData, onOpenDataset, onNavigate }: ResultsPageProps) {
  const { results } = useDataCenter()
  const [activeTab, setActiveTab] = useState<ResultTab>('基准评测')
  const [toast, setToast] = useState('')
  const visibleResults = useMemo(() => results.filter((item) => item.taskCategory === activeTab), [activeTab, results])
  const stats = buildStats(activeTab, visibleResults)

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1560px] space-y-5 pb-8">
        <div>
          <Badge variant="outline">
            <BarChart3 className="h-3.5 w-3.5" />
            Results
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">评测结果</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">
            查看基准评测与场景演练的结果、证据和数据产物
          </p>
        </div>

        <div className="flex w-fit rounded-lg border border-[var(--color-border)] bg-white p-1">
          {(['基准评测', '场景演练'] as ResultTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn('rounded-md px-4 py-2 text-sm font-medium', activeTab === tab ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-soft)]')}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => <Stat key={stat.label} {...stat} />)}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{activeTab}结果</CardTitle>
              <Badge variant="muted">
                <Filter className="h-3.5 w-3.5" />
                {activeTab === '基准评测'
                  ? '支持评测基准 / Agent / Verdict / 数据状态 / 时间范围筛选'
                  : '支持场景 / 环境类型 / Agent / Verdict / 数据状态 / 时间范围筛选'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
              {activeTab === '基准评测' ? (
                <BenchmarkTable
                  results={visibleResults}
                  onOpenResult={onOpenResult}
                  onProcessData={onProcessData}
                  onOpenDataset={onOpenDataset}
                  onNavigate={onNavigate}
                  onToast={showToast}
                />
              ) : (
                <ScenarioTable
                  results={visibleResults}
                  onOpenResult={onOpenResult}
                  onProcessData={onProcessData}
                  onOpenDataset={onOpenDataset}
                  onNavigate={onNavigate}
                  onToast={showToast}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <DatasetToast message={toast} />
    </main>
  )
}

function BenchmarkTable({
  results,
  onOpenResult,
  onProcessData,
  onOpenDataset,
  onNavigate,
  onToast,
}: ResultTableProps) {
  return (
    <table className="w-full min-w-[1260px] text-left text-sm">
      <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
        <tr>
          {['Run ID', '任务名称', '评测基准', '评测对象', 'Agent', '模型', 'Verdict', '评分', '完成进度', '耗时', '成本', '数据状态', '完成时间', '操作'].map((head) => (
            <th key={head} className="px-3 py-3 font-semibold">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.runId} className="border-t border-[var(--color-border)]">
            <td className="px-3 py-3 font-mono text-xs">{result.runId}</td>
            <td className="px-3 py-3 font-semibold">{result.taskName}</td>
            <td className="px-3 py-3"><Badge variant="outline">{result.benchmark}</Badge></td>
            <td className="px-3 py-3">{result.evaluationTarget}</td>
            <td className="px-3 py-3">{result.agent}</td>
            <td className="px-3 py-3">{result.model}</td>
            <td className="px-3 py-3"><VerdictBadge verdict={result.verdict} /></td>
            <td className="px-3 py-3 font-semibold text-[var(--color-brand)]">{result.score}</td>
            <td className="px-3 py-3">{result.progress}%</td>
            <td className="px-3 py-3">{result.duration}</td>
            <td className="px-3 py-3">{result.cost} 元</td>
            <td className="px-3 py-3"><DataStatus result={result} onOpenDataset={onOpenDataset} onToast={onToast} /></td>
            <td className="px-3 py-3">{result.completedAt}</td>
            <td className="px-3 py-3"><ResultActions result={result} onOpenResult={onOpenResult} onProcessData={onProcessData} onNavigate={onNavigate} rangeLabel="返回运行" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ScenarioTable({
  results,
  onOpenResult,
  onProcessData,
  onOpenDataset,
  onNavigate,
  onToast,
}: ResultTableProps) {
  return (
    <table className="w-full min-w-[1260px] text-left text-sm">
      <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
        <tr>
          {['Run ID', '演练名称', '场景', '环境类型', 'Agent', '模型', 'Verdict', '任务完成度', '攻击阶段', '发现风险', '耗时', '成本', '数据状态', '完成时间', '操作'].map((head) => (
            <th key={head} className="px-3 py-3 font-semibold">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.runId} className="border-t border-[var(--color-border)]">
            <td className="px-3 py-3 font-mono text-xs">{result.runId}</td>
            <td className="px-3 py-3 font-semibold">{result.taskName}</td>
            <td className="px-3 py-3">{result.scenario ?? '企业内网横向移动'}</td>
            <td className="px-3 py-3">{result.environmentKind ?? 'VM + Docker'}</td>
            <td className="px-3 py-3">{result.agent}</td>
            <td className="px-3 py-3">{result.model}</td>
            <td className="px-3 py-3"><VerdictBadge verdict={result.verdict} /></td>
            <td className="px-3 py-3">{result.progress}%</td>
            <td className="px-3 py-3">{result.attackStage ?? 'Impact'}</td>
            <td className="px-3 py-3">{result.riskCount ?? 0}</td>
            <td className="px-3 py-3">{result.duration}</td>
            <td className="px-3 py-3">{result.cost} 元</td>
            <td className="px-3 py-3"><DataStatus result={result} onOpenDataset={onOpenDataset} onToast={onToast} /></td>
            <td className="px-3 py-3">{result.completedAt}</td>
            <td className="px-3 py-3"><ResultActions result={result} onOpenResult={onOpenResult} onProcessData={onProcessData} onNavigate={onNavigate} rangeLabel="查看 RangeRun" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type ResultTableProps = {
  results: EvaluationResult[]
  onOpenResult: (runId: string) => void
  onProcessData: (runId: string) => void
  onOpenDataset: (datasetId: string) => void
  onNavigate: (id: string) => void
  onToast: (message: string) => void
}

function DataStatus({
  result,
  onOpenDataset,
  onToast,
}: {
  result: EvaluationResult
  onOpenDataset: (datasetId: string) => void
  onToast: (message: string) => void
}) {
  const text = statusText(result.dataDispositionStatus)
  if (!result.dispositionDatasetId) return <Badge variant={result.dataDispositionStatus === 'unhandled' ? 'warning' : 'muted'}>{text}</Badge>
  return (
    <button
      type="button"
      onClick={() => {
        onToast(`正在打开「${result.dispositionDatasetName ?? result.dispositionDatasetId}」`)
        onOpenDataset(result.dispositionDatasetId!)
      }}
      className="rounded-md text-left text-[var(--color-brand)] hover:underline"
    >
      {text}
      <div className="max-w-[160px] truncate text-xs text-[var(--color-ink-muted)]">{result.dispositionDatasetName}</div>
    </button>
  )
}

function ResultActions({
  result,
  onOpenResult,
  onProcessData,
  onNavigate,
  rangeLabel,
}: {
  result: EvaluationResult
  onOpenResult: (runId: string) => void
  onProcessData: (runId: string) => void
  onNavigate: (id: string) => void
  rangeLabel: string
}) {
  return (
    <div className="flex gap-1.5">
      <Button size="sm" variant="ghost" onClick={() => onOpenResult(result.runId)}>
        <Eye className="h-3.5 w-3.5" />
        查看报告
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onProcessData(result.runId)}>
        <Database className="h-3.5 w-3.5" />
        处理数据
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onNavigate('rangerun')}>
        {rangeLabel}
      </Button>
    </div>
  )
}

export function VerdictBadge({ verdict }: { verdict: EvaluationResult['verdict'] }) {
  const variant = verdict === 'Success' ? 'success' : verdict === 'Partial' ? 'warning' : 'danger'
  return <Badge variant={variant}>{verdict}</Badge>
}

function statusText(status: EvaluationResult['dataDispositionStatus']) {
  return {
    unhandled: '未处理',
    created_dataset: '已生成新数据集',
    appended_dataset: '已加入已有数据集',
    ignored: '已忽略',
  }[status]
}

function buildStats(tab: ResultTab, results: EvaluationResult[]) {
  const success = results.filter((item) => item.verdict === 'Success').length
  const partial = results.filter((item) => item.verdict === 'Partial').length
  const avgScore = Math.round(results.reduce((sum, item) => sum + item.score, 0) / Math.max(1, results.length))
  const avgProgress = Math.round(results.reduce((sum, item) => sum + item.progress, 0) / Math.max(1, results.length))
  const avgCost = Math.round(results.reduce((sum, item) => sum + item.cost, 0) / Math.max(1, results.length))
  if (tab === '基准评测') {
    return [
      { label: '已完成评测', value: String(results.length) },
      { label: '评测成功', value: String(success), tone: 'success' as const },
      { label: '部分完成', value: String(partial), tone: 'warning' as const },
      { label: '平均得分', value: String(avgScore) },
      { label: '平均耗时', value: '65 min' },
      { label: '平均成本', value: `${avgCost} 元` },
    ]
  }
  return [
    { label: '已完成演练', value: String(results.length) },
    { label: '成功演练', value: String(success), tone: 'success' as const },
    { label: '部分完成', value: String(partial), tone: 'warning' as const },
    { label: '平均任务进度', value: `${avgProgress}%` },
    { label: '平均耗时', value: '94 min' },
    { label: '平均成本', value: `${avgCost} 元` },
  ]
}

function Stat({ label, value, tone = 'brand' }: { label: string; value: string; tone?: 'brand' | 'success' | 'warning' }) {
  const color = tone === 'success' ? 'text-[var(--color-success)]' : tone === 'warning' ? 'text-[var(--color-warning)]' : 'text-[var(--color-brand)]'
  return (
    <Card>
      <CardContent className="p-3.5">
        <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
        <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

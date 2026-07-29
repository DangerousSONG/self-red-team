import { BarChart3, Database, Eye, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'
import type { EvaluationResult } from '@/types/data-center'

interface ResultsPageProps {
  onOpenResult: (runId: string) => void
  onProcessData: (runId: string) => void
  onNavigate: (id: string) => void
}

export function ResultsPage({ onOpenResult, onProcessData, onNavigate }: ResultsPageProps) {
  const { results } = useDataCenter()
  const completed = results.length
  const success = results.filter((item) => item.verdict === 'Success').length
  const partial = results.filter((item) => item.verdict === 'Partial').length
  const avgScore = Math.round(results.reduce((sum, item) => sum + item.score, 0) / Math.max(1, results.length))
  const avgCost = Math.round(results.reduce((sum, item) => sum + item.cost, 0) / Math.max(1, results.length))

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
            查看场景演练与 Benchmark 评测的结果、证据和数据产物
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="已完成任务" value={String(completed)} />
          <Stat label="成功任务" value={String(success)} tone="success" />
          <Stat label="部分完成" value={String(partial)} tone="warning" />
          <Stat label="平均评分" value={String(avgScore)} />
          <Stat label="平均耗时" value="63 min" />
          <Stat label="平均成本" value={`${avgCost} 元`} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>结果列表</CardTitle>
              <Badge variant="muted">
                <Filter className="h-3.5 w-3.5" />
                支持分类 / Benchmark / Verdict / Agent / 数据状态筛选
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                  <tr>
                    {['Run ID', '任务名称', '任务分类', 'Benchmark', 'Agent', '模型', 'Verdict', '评分', '进度', '耗时', '成本', '完成时间', '数据状态', '操作'].map((head) => (
                      <th key={head} className="px-3 py-3 font-semibold">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <ResultRow
                      key={result.runId}
                      result={result}
                      onOpenResult={onOpenResult}
                      onProcessData={onProcessData}
                      onNavigate={onNavigate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function ResultRow({
  result,
  onOpenResult,
  onProcessData,
  onNavigate,
}: {
  result: EvaluationResult
  onOpenResult: (runId: string) => void
  onProcessData: (runId: string) => void
  onNavigate: (id: string) => void
}) {
  return (
    <tr className="border-t border-[var(--color-border)]">
      <td className="px-3 py-3 font-mono text-xs">{result.runId}</td>
      <td className="px-3 py-3 font-semibold">{result.taskName}</td>
      <td className="px-3 py-3">{result.taskCategory}</td>
      <td className="px-3 py-3">{result.benchmark || '-'}</td>
      <td className="px-3 py-3">{result.agent}</td>
      <td className="px-3 py-3">{result.model}</td>
      <td className="px-3 py-3"><VerdictBadge verdict={result.verdict} /></td>
      <td className="px-3 py-3 font-semibold text-[var(--color-brand)]">{result.score}</td>
      <td className="px-3 py-3">{result.progress}%</td>
      <td className="px-3 py-3">{result.duration}</td>
      <td className="px-3 py-3">{result.cost} 元</td>
      <td className="px-3 py-3">{result.completedAt}</td>
      <td className="px-3 py-3">{statusText(result.dataDispositionStatus)}</td>
      <td className="px-3 py-3">
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
            返回运行
          </Button>
        </div>
      </td>
    </tr>
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

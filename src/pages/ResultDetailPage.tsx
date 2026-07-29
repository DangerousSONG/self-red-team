import type { ReactNode } from 'react'
import { ArrowLeft, Database, Download, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'
import { VerdictBadge } from '@/pages/ResultsPage'

interface ResultDetailPageProps {
  runId: string
  onNavigate: (id: string) => void
  onProcessData: (runId: string) => void
  onOpenDataset: (datasetId: string) => void
}

export function ResultDetailPage({ runId, onNavigate, onProcessData, onOpenDataset }: ResultDetailPageProps) {
  const { results, trajectoryDatasets } = useDataCenter()
  const result = results.find((item) => item.runId === runId) ?? results[0]
  const relatedDataset =
    result.dispositionDatasetId
      ? trajectoryDatasets.find((dataset) => dataset.id === result.dispositionDatasetId)
      : trajectoryDatasets.find((dataset) => dataset.sourceRunIds.includes(result.runId))

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">
              <FileText className="h-3.5 w-3.5" />
              Evaluation Report
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold">{result.taskName}</h1>
            <p className="mt-1 font-mono text-xs text-[var(--color-ink-muted)]">{result.runId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => onNavigate('rangerun')}>
              <ArrowLeft className="h-4 w-4" />
              返回 RangeRun
            </Button>
            <Button variant="outline" onClick={() => window.alert('Mock：报告导出请求已记录。')}>
              <Download className="h-4 w-4" />
              导出报告
            </Button>
            <Button onClick={() => onProcessData(result.runId)}>
              <Database className="h-4 w-4" />
              处理数据产物
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>{result.taskCategory === '基准评测' ? '基准评测总览' : '场景演练总览'}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
            <Metric label="Verdict" value={<VerdictBadge verdict={result.verdict} />} />
            <Metric label="综合评分" value={String(result.score)} />
            <Metric label="任务完成度" value={`${result.progress}%`} />
            <Metric label="总耗时" value={result.duration} />
            <Metric label="Token 使用" value={result.metrics.find((item) => item.label.includes('Token'))?.value ?? '280k'} />
            <Metric label="总成本" value={`${result.cost} 元`} />
            <Metric label={result.taskCategory === '基准评测' ? '评测基准' : '场景'} value={result.benchmark ?? result.scenario ?? '-'} />
            <Metric label={result.taskCategory === '基准评测' ? '评测对象' : '最终攻击阶段'} value={result.evaluationTarget ?? result.attackStage ?? '-'} />
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>{result.benchmark ? `${result.benchmark} 指标` : '场景演练指标'}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {result.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                  <div className="text-xs text-[var(--color-ink-muted)]">{metric.label}</div>
                  <div className="mt-1 text-lg font-semibold text-[var(--color-brand)]">{metric.value}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>任务过程</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {result.process.map((step, index) => (
                  <li key={step} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-white p-2.5">
                    <Badge variant={index === result.process.length - 1 ? 'success' : 'outline'}>{index + 1}</Badge>
                    <span className="text-sm font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>关键证据</CardTitle></CardHeader>
          <CardContent className="grid gap-3 xl:grid-cols-2">
            {result.evidence.map((item) => (
              <div key={item.id} className="rounded-lg border border-[var(--color-border)] bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="mt-1 text-xs text-[var(--color-ink-muted)]">{item.type} / {item.snapshotId}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(item.raw)}>复制内容</Button>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-secondary)]">{item.summary}</p>
                <pre className="mt-2 overflow-x-auto rounded-md bg-[#0b1220] p-3 text-xs text-[#d1e7dd]">{item.raw}</pre>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>结果归因</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Reason title="成功原因" items={result.attribution.successReasons} />
              <Reason title="失败原因" items={result.attribution.failureReasons} />
              <Reason title="关键决策" items={result.attribution.keyDecisions} />
              <Reason title="无效尝试" items={result.attribution.invalidAttempts} />
              <Reason title="风险点" items={result.attribution.risks} />
              <Reason title="修复建议" items={result.attribution.suggestions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>数据产物与沉淀状态</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {result.artifacts.map((artifact) => (
                <div key={artifact.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white p-3">
                  <div>
                    <div className="text-sm font-semibold">{artifact.name}</div>
                    <div className="text-xs text-[var(--color-ink-muted)]">{artifact.type} / {artifact.count} 条 / 质量 {artifact.quality}</div>
                  </div>
                  <Badge variant="muted">{artifact.type}</Badge>
                </div>
              ))}
              {result.dataDispositionStatus === 'unhandled' ? (
                <div className="rounded-lg border border-[var(--color-warning)]/25 bg-[var(--color-warning-soft)] p-3">
                  <div className="font-semibold text-[var(--color-warning)]">本次运行产生了可沉淀的数据产物</div>
                  <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">可以新建轨迹数据集、加入已有数据集，或暂不处理。</p>
                  <Button className="mt-2" size="sm" onClick={() => onProcessData(result.runId)}>进入数据处理</Button>
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--color-success)]/25 bg-[var(--color-success-soft)] p-3">
                  <div className="font-semibold text-[var(--color-success)]">数据已处理：{statusText(result.dataDispositionStatus)}</div>
                  <div className="mt-1 text-sm text-[var(--color-ink-secondary)]">
                    {result.dispositionDatasetName ? `目标数据集：${result.dispositionDatasetName}` : `数据条数：${result.artifacts.reduce((sum, item) => sum + item.count, 0)}`}
                  </div>
                  {relatedDataset ? (
                    <Button className="mt-2" size="sm" variant="secondary" onClick={() => onOpenDataset(relatedDataset.id)}>查看数据集</Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

function Reason({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <ul className="space-y-1 text-sm text-[var(--color-ink-secondary)]">{items.map((item) => <li key={item}>- {item}</li>)}</ul>
    </div>
  )
}

function statusText(status: string) {
  return {
    unhandled: '未处理',
    created_dataset: '已生成新数据集',
    appended_dataset: '已加入已有数据集',
    ignored: '已忽略',
  }[status] ?? status
}

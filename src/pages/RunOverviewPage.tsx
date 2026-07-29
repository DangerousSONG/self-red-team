import type { ReactNode } from 'react'
import { BarChart3, ClipboardList, Database, FilePlus2, PlayCircle, Route, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'
import { useRangeTasks } from '@/hooks/useRangeTasks'

interface RunOverviewPageProps {
  onNavigate: (id: string) => void
  onOpenResult: (runId: string) => void
}

export function RunOverviewPage({ onNavigate, onOpenResult }: RunOverviewPageProps) {
  const { taskList, currentRun } = useRangeTasks()
  const { results, trajectoryDatasets, traces, cptCorpus, vulnerabilityRecords } = useDataCenter()
  const runningTasks = taskList.filter((task) => task.status === 'running').length
  const completedTasks = taskList.filter((task) => task.status === 'completed').length
  const pendingDisposition = results.filter((result) => result.dataDispositionStatus === 'unhandled').length
  const latestResults = results.slice(0, 4)

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="outline">
              <ShieldCheck className="h-3.5 w-3.5" />
              Overview
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">运行总览</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">
              汇总评测任务、当前 RangeRun、评分结果和数据沉淀状态。
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onNavigate('tasks')}>
              <FilePlus2 className="h-4 w-4" />
              创建评测任务
            </Button>
            <Button onClick={() => onNavigate('rangerun')}>
              <PlayCircle className="h-4 w-4" />
              进入 RangeRun
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="任务总数" value={String(taskList.length)} icon={<ClipboardList className="h-4 w-4" />} />
          <Stat label="运行中" value={String(runningTasks)} tone="success" icon={<PlayCircle className="h-4 w-4" />} />
          <Stat label="已完成" value={String(completedTasks)} icon={<ShieldCheck className="h-4 w-4" />} />
          <Stat label="评分结果" value={String(results.length)} icon={<BarChart3 className="h-4 w-4" />} />
          <Stat label="轨迹数据" value={String(traces.length)} icon={<Route className="h-4 w-4" />} />
          <Stat label="待沉淀" value={String(pendingDisposition)} tone="warning" icon={<Database className="h-4 w-4" />} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>当前 RangeRun</CardTitle>
            </CardHeader>
            <CardContent>
              {currentRun ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <Info label="任务名称" value={currentRun.taskName} />
                  <Info label="Run ID" value={currentRun.id} mono />
                  <Info label="环境" value={currentRun.environment} />
                  <Info label="Agent" value={currentRun.agent} />
                  <Info label="模型" value={currentRun.model} />
                  <Info label="状态" value={currentRun.status} />
                  <div className="md:col-span-2">
                    <Button onClick={() => onNavigate('rangerun')}>
                      <PlayCircle className="h-4 w-4" />
                      打开运行控制台
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-6 text-center">
                  <div className="text-sm font-semibold">暂无正在运行的 RangeRun</div>
                  <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">可以先进入评测任务中心创建并启动一次 Mock 演练。</p>
                  <Button className="mt-4" onClick={() => onNavigate('tasks')}>创建评测任务</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>数据中心摘要</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Info label="轨迹数据集" value={`${trajectoryDatasets.length} 个`} />
              <Info label="轨迹总条数" value={`${traces.length} 条`} />
              <Info label="CPT 语料" value={`${cptCorpus.length} 条`} />
              <Info label="漏洞记录" value={`${vulnerabilityRecords.length} 条`} />
              <div className="md:col-span-2">
                <Button variant="secondary" onClick={() => onNavigate('data-center')}>
                  <Database className="h-4 w-4" />
                  进入数据中心
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>最近评测结果</CardTitle>
              <Button size="sm" variant="secondary" onClick={() => onNavigate('results')}>查看全部</Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                <tr>
                  {['Run ID', '任务名称', '分类', 'Benchmark', 'Verdict', '评分', '数据沉淀', '操作'].map((head) => (
                    <th key={head} className="px-3 py-2 font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latestResults.map((result) => (
                  <tr key={result.runId} className="border-t border-[var(--color-border)]">
                    <td className="px-3 py-3 font-mono text-xs">{result.runId}</td>
                    <td className="px-3 py-3 font-semibold">{result.taskName}</td>
                    <td className="px-3 py-3">{result.taskCategory}</td>
                    <td className="px-3 py-3">{result.benchmark ?? '-'}</td>
                    <td className="px-3 py-3"><Badge variant={result.verdict === 'Success' ? 'success' : 'warning'}>{result.verdict}</Badge></td>
                    <td className="px-3 py-3 text-[var(--color-brand)]">{result.score}</td>
                    <td className="px-3 py-3">{dispositionText(result.dataDispositionStatus)}</td>
                    <td className="px-3 py-3"><Button size="sm" variant="ghost" onClick={() => onOpenResult(result.runId)}>查看报告</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function Stat({
  label,
  value,
  icon,
  tone = 'brand',
}: {
  label: string
  value: string
  icon: ReactNode
  tone?: 'brand' | 'success' | 'warning'
}) {
  const color = tone === 'success' ? 'text-[var(--color-success)]' : tone === 'warning' ? 'text-[var(--color-warning)]' : 'text-[var(--color-brand)]'
  return (
    <Card>
      <CardContent className="p-3.5">
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-ink-muted)]">
          {label}
          <span className={color}>{icon}</span>
        </div>
        <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className={mono ? 'mt-1 truncate font-mono text-xs font-semibold' : 'mt-1 text-sm font-semibold'}>{value}</div>
    </div>
  )
}

function dispositionText(status: string) {
  return {
    unhandled: '未处理',
    created_dataset: '已生成新数据集',
    appended_dataset: '已加入已有数据集',
    ignored: '已忽略',
  }[status] ?? status
}

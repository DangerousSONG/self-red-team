import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Database,
  FilePlus2,
  PlayCircle,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useDataCenter } from '@/hooks/useDataCenter'
import { useRangeTasks } from '@/hooks/useRangeTasks'
import type { DataDispositionStatus, EvaluationResult } from '@/types/data-center'
import type { RangeRunSummary } from '@/types/range'

interface RunOverviewPageProps {
  onNavigate: (id: string) => void
  onOpenResult: (runId: string) => void
  onOpenDataset: (datasetId: string) => void
}

type FilterKey = 'all' | 'scenario' | 'benchmark' | 'running' | 'queued' | 'evaluating' | 'abnormal'
type ViewMode = 'card' | 'list'

const maxConcurrency = 10
const runningStatuses: RangeRunSummary['status'][] = ['preparing', 'provisioning', 'self_check', 'running']
const evaluatingStatuses: RangeRunSummary['status'][] = ['evidence_sealing', 'destroying', 'scoring', 'evaluating']
const activeStatuses: RangeRunSummary['status'][] = [...runningStatuses, ...evaluatingStatuses]

export function RunOverviewPage({ onNavigate, onOpenResult, onOpenDataset }: RunOverviewPageProps) {
  const {
    runSummaries,
    focusedRunId,
    setFocusedRun,
    advanceRunSummaries,
    stopRunSummary,
  } = useRangeTasks()
  const { results } = useDataCenter()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [view, setView] = useState<ViewMode>('card')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = window.setInterval(advanceRunSummaries, 4200)
    return () => window.clearInterval(timer)
  }, [advanceRunSummaries])

  useEffect(() => {
    if (!focusedRunId) {
      const fallback = [...runSummaries]
        .filter((run) => run.status === 'running')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
      if (fallback) setFocusedRun(fallback.id)
    }
  }, [focusedRunId, runSummaries, setFocusedRun])

  const stats = useMemo(() => summarize(runSummaries), [runSummaries])
  const filteredRuns = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return sortRuns(runSummaries).filter((run) => {
      const matchedSearch = !keyword || [run.id, run.taskName, run.benchmark ?? '', run.currentStage].join(' ').toLowerCase().includes(keyword)
      const matchedFilter =
        filter === 'all' ||
        (filter === 'scenario' && run.category === 'scenario') ||
        (filter === 'benchmark' && run.category === 'benchmark') ||
        (filter === 'running' && runningStatuses.includes(run.status)) ||
        (filter === 'queued' && run.status === 'queued') ||
        (filter === 'evaluating' && evaluatingStatuses.includes(run.status)) ||
        (filter === 'abnormal' && ['failed', 'stopped'].includes(run.status))
      return matchedSearch && matchedFilter
    })
  }, [filter, runSummaries, search])
  const visibleRuns = filteredRuns.slice(0, 6)
  const latestResults = results.slice(0, 5)
  const resources = useMemo(() => resourceSummary(runSummaries), [runSummaries])

  const enterConsole = (run: RangeRunSummary) => {
    setFocusedRun(run.id)
    onNavigate('rangerun')
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1560px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="outline">
              <ShieldCheck className="h-3.5 w-3.5" />
              Overview
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">运行总览</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">
              统一查看并发任务、当前 RangeRun、评测进度与数据沉淀状态
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onNavigate('tasks')}>
              <FilePlus2 className="h-4 w-4" />
              创建评测任务
            </Button>
            <Button onClick={() => {
              const focused = runSummaries.find((run) => run.id === focusedRunId) ?? visibleRuns[0]
              if (focused) enterConsole(focused)
              else onNavigate('rangerun')
            }}>
              <PlayCircle className="h-4 w-4" />
              进入 RangeRun
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          <Stat label="任务总数" value={String(stats.total)} icon={<ClipboardList className="h-4 w-4" />} />
          <Stat label="运行中" value={String(stats.running)} tone="success" icon={<PlayCircle className="h-4 w-4" />} />
          <Stat label="排队中" value={String(stats.queued)} tone="muted" icon={<ClipboardList className="h-4 w-4" />} />
          <Stat label="评测中" value={String(stats.evaluating)} tone="warning" icon={<BarChart3 className="h-4 w-4" />} />
          <Stat label="已完成" value={String(stats.completed)} tone="success" icon={<ShieldCheck className="h-4 w-4" />} />
          <Stat label="异常任务" value={String(stats.abnormal)} tone="danger" icon={<AlertTriangle className="h-4 w-4" />} />
          <Stat label="当前并发" value={`${stats.concurrency} / ${maxConcurrency}`} icon={<Database className="h-4 w-4" />} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle>运行中任务</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-ink-muted)]" />
                      <input
                        className="h-9 w-[240px] rounded-md border border-[var(--color-border-strong)] bg-white pl-8 pr-3 text-sm"
                        placeholder="搜索任务名称或 Run ID"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
                    <div className="flex rounded-lg border border-[var(--color-border)] bg-white p-1">
                      <SmallToggle active={view === 'card'} onClick={() => setView('card')}>卡片视图</SmallToggle>
                      <SmallToggle active={view === 'list'} onClick={() => setView('list')}>紧凑列表</SmallToggle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((item) => (
                    <button
                      key={item.key}
                      className={cn('rounded-full border px-3 py-1.5 text-xs font-medium', filter === item.key ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]' : 'border-[var(--color-border)] bg-white text-[var(--color-ink-secondary)]')}
                      onClick={() => setFilter(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {filteredRuns.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] p-8 text-center text-sm text-[var(--color-ink-secondary)]">
                    没有匹配的运行任务
                  </div>
                ) : view === 'card' ? (
                  <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                    {visibleRuns.map((run) => (
                      <RunCard
                        key={run.id}
                        run={run}
                        focused={run.id === focusedRunId}
                        onFocus={() => setFocusedRun(run.id)}
                        onEnter={() => enterConsole(run)}
                        onStop={() => stopRunSummary(run.id)}
                        onOpenResult={onOpenResult}
                      />
                    ))}
                  </div>
                ) : (
                  <CompactRunList runs={filteredRuns} focusedRunId={focusedRunId} onFocus={setFocusedRun} onEnter={enterConsole} onStop={stopRunSummary} />
                )}

                {filteredRuns.length > 6 && view === 'card' ? (
                  <Button variant="secondary" onClick={() => setView('list')}>查看全部运行任务</Button>
                ) : null}
              </CardContent>
            </Card>
          </section>

          <ResourcePanel stats={stats} resources={resources} />
        </div>

        <RecentResults results={latestResults} onNavigate={onNavigate} onOpenResult={onOpenResult} onOpenDataset={onOpenDataset} />
      </div>
    </main>
  )
}

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'scenario', label: '场景演练' },
  { key: 'benchmark', label: '基准评测' },
  { key: 'running', label: '运行中' },
  { key: 'queued', label: '排队中' },
  { key: 'evaluating', label: '评测中' },
  { key: 'abnormal', label: '异常' },
]

function RunCard({
  run,
  focused,
  onFocus,
  onEnter,
  onStop,
  onOpenResult,
}: {
  run: RangeRunSummary
  focused: boolean
  onFocus: () => void
  onEnter: () => void
  onStop: () => void
  onOpenResult: (runId: string) => void
}) {
  return (
    <div className={cn('group relative overflow-hidden rounded-xl border bg-white p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-panel)]', focused ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/10' : 'border-[var(--color-border)]')}>
      <div className={cn('absolute inset-y-0 left-0 w-1', statusColor(run.status))} />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={run.category === 'benchmark' ? 'default' : 'outline'}>{run.category === 'benchmark' ? '基准评测' : '场景演练'}</Badge>
            {run.benchmark ? <Badge variant="muted">{run.benchmark}</Badge> : null}
            <StatusBadge status={run.status} />
            {focused ? <Badge variant="success"><Star className="h-3 w-3" />当前关注</Badge> : null}
          </div>
          <h3 className="mt-2 truncate text-base font-semibold">{run.taskName}</h3>
          <div className="mt-1 font-mono text-xs text-[var(--color-ink-muted)]">{run.id}</div>
        </div>
        <button className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)]" title="设为关注" onClick={onFocus}>
          <Star className={cn('h-4 w-4', focused && 'fill-[var(--color-brand)] text-[var(--color-brand)]')} />
        </button>
      </div>

      <div className="mt-4 pl-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[var(--color-ink)]">{run.progress}%</span>
          <span className="text-[var(--color-ink-muted)]">{run.currentStage}</span>
        </div>
        <ProgressBar value={run.progress} />
        <p className="mt-2 min-h-[40px] text-xs leading-5 text-[var(--color-ink-secondary)]">{run.stageDescription}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 pl-2 text-xs">
        <Mini label="Agent" value={run.agent} />
        <Mini label="模型" value={run.model} />
        <Mini label="环境" value={run.environment} />
        <Mini label="并发数" value={String(run.concurrency)} />
        <Mini label="已运行" value={formatDuration(run.elapsedSeconds)} />
        <Mini label="预计剩余" value={run.estimatedRemainingSeconds ? formatDuration(run.estimatedRemainingSeconds) : '-'} />
        <Mini label="Token" value={`${compactNumber(run.tokenUsed)} / ${compactNumber(run.tokenBudget)}`} />
        <Mini label="成本" value={`${run.costUsed} / ${run.costBudget} 元`} />
      </div>

      <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs text-[var(--color-ink-secondary)]">
        {statusInfo(run)}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pl-2">
        <Button size="sm" onClick={onEnter}>进入控制台</Button>
        <Button size="sm" variant="secondary" onClick={onFocus}>查看 CasePlan</Button>
        {!['completed', 'failed', 'stopped'].includes(run.status) ? <Button size="sm" variant="ghost" onClick={onStop}>停止任务</Button> : null}
        {run.status === 'completed' ? <Button size="sm" variant="ghost" onClick={() => onOpenResult(run.id)}>查看结果</Button> : null}
      </div>
    </div>
  )
}

function CompactRunList({
  runs,
  focusedRunId,
  onFocus,
  onEnter,
  onStop,
}: {
  runs: RangeRunSummary[]
  focusedRunId: string | null
  onFocus: (runId: string) => void
  onEnter: (run: RangeRunSummary) => void
  onStop: (runId: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full min-w-[1080px] text-left text-sm">
        <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
          <tr>
            {['Run ID', '任务名称', '分类', '当前阶段', '进度', 'Agent', '环境', '已运行时间', '资源', '状态', '操作'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id} className={cn('border-t border-[var(--color-border)]', focusedRunId === run.id && 'bg-[var(--color-brand-soft)]')}>
              <td className="px-3 py-3 font-mono text-xs">{run.id}</td>
              <td className="px-3 py-3 font-semibold">{run.taskName}</td>
              <td className="px-3 py-3">{run.category === 'benchmark' ? `基准评测 / ${run.benchmark ?? '-'}` : '场景演练'}</td>
              <td className="px-3 py-3">{run.currentStage}</td>
              <td className="px-3 py-3"><div className="w-28"><ProgressBar value={run.progress} /></div></td>
              <td className="px-3 py-3">{run.agent}</td>
              <td className="px-3 py-3">{run.environment}</td>
              <td className="px-3 py-3">{formatDuration(run.elapsedSeconds)}</td>
              <td className="px-3 py-3">{run.cpuCores}C / {run.memoryGb}GB</td>
              <td className="px-3 py-3"><StatusBadge status={run.status} /></td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" onClick={() => onEnter(run)}>进入</Button>
                  <Button size="sm" variant="ghost" onClick={() => onFocus(run.id)}>关注</Button>
                  {!['completed', 'failed', 'stopped'].includes(run.status) ? <Button size="sm" variant="ghost" onClick={() => onStop(run.id)}>停止</Button> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ResourcePanel({ stats, resources }: { stats: ReturnType<typeof summarize>; resources: ReturnType<typeof resourceSummary> }) {
  const resourceTight = resources.vm.used / resources.vm.total > 0.8
  return (
    <aside className="space-y-4">
      <Card>
        <CardHeader><CardTitle>并发与资源态势</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">并发槽位 {stats.concurrency} / {maxConcurrency}</span>
              <span className="text-[var(--color-ink-muted)]">可用 {Math.max(0, maxConcurrency - stats.concurrency)}</span>
            </div>
            <ProgressBar value={(stats.concurrency / maxConcurrency) * 100} tone="brand" />
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <Mini label="当前并发" value={String(stats.concurrency)} />
              <Mini label="最大并发" value={String(maxConcurrency)} />
              <Mini label="可用并发" value={String(Math.max(0, maxConcurrency - stats.concurrency))} />
              <Mini label="排队任务" value={String(stats.queued)} />
            </div>
          </div>

          <ResourceBar label="CPU" used={resources.cpu.used} total={resources.cpu.total} unit="Core" />
          <ResourceBar label="内存" used={resources.memory.used} total={resources.memory.total} unit="GB" />
          <ResourceBar label="VM" used={resources.vm.used} total={resources.vm.total} unit="" />
          <ResourceBar label="Docker 容器" used={resources.container.used} total={resources.container.total} unit="" />

          <div className="grid grid-cols-3 gap-2 text-xs">
            <Mini label="Token 已使用" value={compactNumber(resources.tokenUsed)} />
            <Mini label="模型请求数" value={String(resources.modelRequests)} />
            <Mini label="本日预估成本" value={`${resources.costUsed} 元`} />
          </div>

          <div className={cn('rounded-lg border px-3 py-2 text-sm', resourceTight ? 'border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)] text-[var(--color-warning)]' : 'border-[var(--color-success)]/30 bg-[var(--color-success-soft)] text-[var(--color-success)]')}>
            {resourceTight ? 'VM 资源使用率超过 80%，新任务可能进入排队' : '资源充足，可继续启动并行任务'}
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

function RecentResults({ results, onNavigate, onOpenResult, onOpenDataset }: { results: EvaluationResult[]; onNavigate: (id: string) => void; onOpenResult: (runId: string) => void; onOpenDataset: (datasetId: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>最近评测结果</CardTitle>
          <Button size="sm" variant="secondary" onClick={() => onNavigate('results')}>查看全部</Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>
              {['Run ID', '任务名称', '分类', 'Benchmark', 'Verdict', '评分', '完成时间', '数据沉淀', '操作'].map((head) => (
                <th key={head} className="px-3 py-2 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.runId} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-3 font-mono text-xs">{result.runId}</td>
                <td className="px-3 py-3 font-semibold">{result.taskName}</td>
                <td className="px-3 py-3">{result.taskCategory}</td>
                <td className="px-3 py-3">{result.benchmark ?? '-'}</td>
                <td className="px-3 py-3"><Badge variant={result.verdict === 'Success' ? 'success' : 'warning'}>{result.verdict}</Badge></td>
                <td className="px-3 py-3 text-[var(--color-brand)]">{result.score}</td>
                <td className="px-3 py-3">{result.completedAt}</td>
                <td className="px-3 py-3">
                  {result.dispositionDatasetId ? (
                    <button className="font-medium text-[var(--color-brand)] hover:underline" onClick={() => onOpenDataset(result.dispositionDatasetId!)}>
                      {dispositionText(result.dataDispositionStatus)}
                    </button>
                  ) : dispositionText(result.dataDispositionStatus)}
                </td>
                <td className="px-3 py-3"><Button size="sm" variant="ghost" onClick={() => onOpenResult(result.runId)}>查看报告</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
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
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'muted'
}) {
  const color = {
    brand: 'text-[var(--color-brand)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    danger: 'text-[var(--color-danger)]',
    muted: 'text-[var(--color-ink-muted)]',
  }[tone]
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

function SmallToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={cn('rounded-md px-3 py-1.5 text-sm', active ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-secondary)]')} onClick={onClick}>
      {children}
    </button>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-2">
      <div className="truncate text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 truncate font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

function ResourceBar({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-[var(--color-ink-muted)]">{used} / {total} {unit}</span>
      </div>
      <ProgressBar value={(used / total) * 100} tone={used / total > 0.8 ? 'warning' : 'brand'} />
    </div>
  )
}

function ProgressBar({ value, tone = 'brand' }: { value: number; tone?: 'brand' | 'warning' }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
      <div className={cn('h-full rounded-full transition-all', tone === 'warning' ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-brand)]')} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function StatusBadge({ status }: { status: RangeRunSummary['status'] }) {
  const variant = status === 'completed' ? 'success' : status === 'failed' || status === 'stopped' ? 'danger' : status === 'queued' ? 'muted' : evaluatingStatuses.includes(status) ? 'warning' : 'success'
  return <Badge variant={variant}>{statusText(status)}</Badge>
}

function statusText(status: RangeRunSummary['status']) {
  return {
    queued: 'Queued',
    preparing: 'Preparing',
    provisioning: 'Provisioning',
    self_check: 'SelfCheck',
    running: 'Running',
    evidence_sealing: 'EvidenceSealing',
    destroying: 'Destroying',
    scoring: 'Scoring',
    evaluating: 'Evaluating',
    completed: 'Completed',
    failed: 'Failed',
    stopped: 'Stopped',
  }[status]
}

function statusInfo(run: RangeRunSummary) {
  if (run.status === 'running') return run.currentAction ?? '当前动作更新中'
  if (run.status === 'queued') return `排队位置：${run.queuePosition ?? 1}，预计启动时间：${run.estimatedRemainingSeconds ? formatDuration(run.estimatedRemainingSeconds) : '-'}`
  if (run.status === 'scoring' || run.status === 'evaluating') return run.currentAction ?? '评分进度和 Verifier 状态更新中'
  if (run.status === 'failed') return `失败阶段：${run.currentStage}；原因：${run.errorMessage ?? '未知'}`
  return run.currentAction ?? run.stageDescription ?? '状态更新中'
}

function statusColor(status: RangeRunSummary['status']) {
  if (status === 'queued') return 'bg-slate-400'
  if (status === 'preparing' || status === 'provisioning' || status === 'self_check') return 'bg-[var(--color-brand)]'
  if (status === 'running' || status === 'completed') return 'bg-[var(--color-success)]'
  if (evaluatingStatuses.includes(status)) return 'bg-[var(--color-warning)]'
  if (status === 'failed') return 'bg-[var(--color-danger)]'
  return 'bg-rose-300'
}

function summarize(runs: RangeRunSummary[]) {
  const concurrency = runs.filter((run) => activeStatuses.includes(run.status)).reduce((sum, run) => sum + run.concurrency, 0)
  return {
    total: runs.length,
    running: runs.filter((run) => runningStatuses.includes(run.status)).length,
    queued: runs.filter((run) => run.status === 'queued').length,
    evaluating: runs.filter((run) => evaluatingStatuses.includes(run.status)).length,
    completed: runs.filter((run) => run.status === 'completed').length,
    abnormal: runs.filter((run) => run.status === 'failed' || run.status === 'stopped').length,
    concurrency,
  }
}

function resourceSummary(runs: RangeRunSummary[]) {
  const active = runs.filter((run) => activeStatuses.includes(run.status))
  return {
    cpu: { used: active.reduce((sum, run) => sum + run.cpuCores, 0), total: 64 },
    memory: { used: active.reduce((sum, run) => sum + run.memoryGb, 0), total: 256 },
    vm: { used: active.reduce((sum, run) => sum + run.vmCount, 0), total: 20 },
    container: { used: active.reduce((sum, run) => sum + run.containerCount, 0), total: 80 },
    tokenUsed: runs.reduce((sum, run) => sum + run.tokenUsed, 0),
    modelRequests: active.length * 3 + runs.filter((run) => evaluatingStatuses.includes(run.status)).length,
    costUsed: runs.reduce((sum, run) => sum + run.costUsed, 0),
  }
}

function sortRuns(runs: RangeRunSummary[]) {
  const order: Record<RangeRunSummary['status'], number> = {
    failed: 0,
    running: 1,
    self_check: 2,
    preparing: 3,
    provisioning: 3,
    scoring: 4,
    evaluating: 4,
    evidence_sealing: 4,
    destroying: 4,
    queued: 5,
    completed: 6,
    stopped: 7,
  }
  return [...runs].sort((a, b) => order[a.status] - order[b.status] || b.updatedAt.localeCompare(a.updatedAt))
}

function formatDuration(seconds: number) {
  const minutes = Math.max(0, Math.floor(seconds / 60))
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h}h ${m}m` : `${m}m`
}

function compactNumber(value: number) {
  if (value >= 1000000) return `${Math.round(value / 100000) / 10}M`
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return String(value)
}

function dispositionText(status: DataDispositionStatus) {
  return {
    unhandled: '未处理',
    created_dataset: '已生成新数据集',
    appended_dataset: '已加入已有数据集',
    ignored: '已忽略',
  }[status]
}

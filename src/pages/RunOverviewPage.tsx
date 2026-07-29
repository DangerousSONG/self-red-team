import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  Brain,
  ClipboardList,
  FilePlus2,
  PlayCircle,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'
import { usePlatformFocus } from '@/hooks/usePlatformFocus'
import { useRangeTasks } from '@/hooks/useRangeTasks'
import { cn } from '@/lib/utils'
import { isActivePlatformTask, platformTasksFrom } from '@/lib/platform-tasks'
import type { DataDispositionStatus, EvaluationResult } from '@/types/data-center'
import type { PlatformTaskSummary, PlatformTaskType } from '@/types/platform'
import type { TaskCategory } from '@/types/range'

interface RunOverviewPageProps {
  onNavigate: (id: string) => void
  onOpenResult: (runId: string) => void
  onOpenDataset: (datasetId: string) => void
  onOpenRun: (runId: string) => void
  onOpenTrainingJob: (jobId: string) => void
  onOpenCorpus: (id: string) => void
  onOpenVulnerability: (id: string) => void
  onOpenBenchmark: (id: string) => void
  onOpenArtifact: (id: string) => void
  onOpenCapabilityCenter: () => void
  onQuickStartTask: (category: TaskCategory) => void
}

type FilterKey = 'all' | PlatformTaskType | 'abnormal'
type ViewMode = 'card' | 'list'
type AssetItem = {
  id: string
  name: string
  type: string
  source: string
  meta: string
  createdAt: string
  status: string
  onOpen: () => void
}

export function RunOverviewPage({
  onNavigate,
  onOpenResult,
  onOpenDataset,
  onOpenRun,
  onOpenTrainingJob,
  onOpenCorpus,
  onOpenVulnerability,
  onOpenBenchmark,
  onOpenArtifact,
  onOpenCapabilityCenter,
  onQuickStartTask,
}: RunOverviewPageProps) {
  const { runSummaries, advanceRunSummaries, setFocusedRun } = useRangeTasks()
  const {
    results,
    trainingJobs,
    trajectoryDatasets,
    cptDatasets,
    vulnerabilityDatasets,
    benchmarkDatasets,
    modelArtifacts,
    advanceTrainingJob,
  } = useDataCenter()
  const { focus, focusTask } = usePlatformFocus()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>('card')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = window.setInterval(() => {
      advanceRunSummaries()
      trainingJobs
        .filter((job) => job.status === 'running')
        .slice(0, 2)
        .forEach((job) => advanceTrainingJob(job.id))
    }, 4200)
    return () => window.clearInterval(timer)
  }, [advanceRunSummaries, advanceTrainingJob, trainingJobs])

  const platformTasks = useMemo(
    () => platformTasksFrom({ runs: runSummaries, trainingJobs }),
    [runSummaries, trainingJobs],
  )
  const activeTasks = platformTasks.filter(isActivePlatformTask)
  const stats = useMemo(() => summarize(platformTasks), [platformTasks])
  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return platformTasks.filter((task) => {
      const matchedFilter =
        filter === 'all' ||
        task.type === filter ||
        (filter === 'abnormal' && ['failed', 'stopped'].includes(task.status))
      const matchedSearch =
        !keyword ||
        [task.id, task.name, task.runId ?? '', task.trainingJobId ?? '', task.currentStage]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      return matchedFilter && matchedSearch
    })
  }, [filter, platformTasks, search])
  const pageSize = view === 'card' ? 6 : 8
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visibleTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const latestAssets = useMemo(
    () =>
      buildLatestAssets({
        trajectoryDatasets,
        cptDatasets,
        vulnerabilityDatasets,
        benchmarkDatasets,
        modelArtifacts,
        onOpenDataset,
        onOpenCorpus,
        onOpenVulnerability,
        onOpenBenchmark,
        onOpenArtifact,
      }),
    [
      benchmarkDatasets,
      cptDatasets,
      modelArtifacts,
      onOpenArtifact,
      onOpenBenchmark,
      onOpenCorpus,
      onOpenDataset,
      onOpenVulnerability,
      trajectoryDatasets,
      vulnerabilityDatasets,
    ],
  )

  useEffect(() => {
    setPage(1)
  }, [filter, search, view])

  const openTask = (task: PlatformTaskSummary) => {
    focusTask(task.id, task.type)
    if (task.runId) {
      setFocusedRun(task.runId)
      onOpenRun(task.runId)
      return
    }
    if (task.trainingJobId) onOpenTrainingJob(task.trainingJobId)
  }

  const handleSecondaryTopAction = () => {
    if (activeTasks.length === 1) {
      openTask(activeTasks[0])
      return
    }
    document.getElementById('platform-task-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1560px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="outline">
              <ShieldCheck className="h-3.5 w-3.5" />
              Platform Overview
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">运行总览</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">
              统一发起场景演练、基准评测和基模训练，查看平台任务与数据产出
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onNavigate('tasks')}>
              <FilePlus2 className="h-4 w-4" />
              创建评测任务
            </Button>
            {activeTasks.length ? (
              <Button variant="secondary" onClick={handleSecondaryTopAction}>
                <PlayCircle className="h-4 w-4" />
                {activeTasks.length === 1 ? '进入当前运行' : '查看全部运行'}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Stat label="平台任务" value={stats.total} icon={<ClipboardList className="h-4 w-4" />} />
          <Stat label="活跃任务" value={stats.active} tone="success" icon={<PlayCircle className="h-4 w-4" />} />
          <Stat label="场景演练" value={stats.scenario} icon={<ShieldCheck className="h-4 w-4" />} />
          <Stat label="基准评测" value={stats.benchmark} tone="purple" icon={<BarChart3 className="h-4 w-4" />} />
          <Stat label="基模训练" value={stats.training} tone="cyan" icon={<Brain className="h-4 w-4" />} />
          <Stat label="已完成" value={stats.completed} tone="success" icon={<Boxes className="h-4 w-4" />} />
          <Stat label="异常任务" value={stats.abnormal} tone="danger" icon={<AlertTriangle className="h-4 w-4" />} />
        </div>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">快速开始</h2>
            <Button variant="secondary" onClick={onOpenCapabilityCenter}>
              查看模型、守卫模型与攻防智能体能力资产
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <QuickStartCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="发起场景演练"
              description="在多节点靶场中验证 Agent 的长程攻击、横向移动与目标达成能力。"
              button="创建场景演练"
              onClick={() => onQuickStartTask('scenario')}
            />
            <QuickStartCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="发起基准评测"
              description="使用 CyberGym、ExploitGym、PatchEval 评测漏洞挖掘、利用与修复能力。"
              button="创建基准评测"
              tone="purple"
              onClick={() => onQuickStartTask('benchmark')}
            />
            <QuickStartCard
              icon={<Brain className="h-5 w-5" />}
              title="使用数据训练基模"
              description="选择 CPT 语料与漏洞数据，创建安全领域基模训练任务。"
              button="创建训练任务"
              tone="cyan"
              onClick={() => onNavigate('training')}
            />
          </div>
        </section>

        <section id="platform-task-section" className="space-y-3 scroll-mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">平台任务态势</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">从这里进入具体 RangeRun 或基模训练实例。</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-[var(--color-border)] bg-white p-1">
                <SmallToggle active={view === 'card'} onClick={() => setView('card')}>卡片视图</SmallToggle>
                <SmallToggle active={view === 'list'} onClick={() => setView('list')}>列表视图</SmallToggle>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-[var(--color-ink-muted)]" />
                <input
                  className="h-9 w-[260px] rounded-md border border-[var(--color-border-strong)] bg-white pl-8 pr-3 text-sm"
                  placeholder="搜索任务名称、Run ID 或 Training ID"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium',
                  filter === item.key
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                    : 'border-[var(--color-border)] bg-white text-[var(--color-ink-secondary)] hover:border-[var(--color-brand)]/40',
                )}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredTasks.length && view === 'card' ? (
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {visibleTasks.map((task) => (
                <PlatformTaskCard
                  key={`${task.type}-${task.id}`}
                  task={task}
                  focused={focus?.id === task.id && focus.type === task.type}
                  onFocus={() => {
                    focusTask(task.id, task.type)
                    if (task.runId) setFocusedRun(task.runId)
                  }}
                  onOpen={() => openTask(task)}
                />
              ))}
            </div>
          ) : filteredTasks.length ? (
            <PlatformTaskTable
              tasks={visibleTasks}
              focusedTaskId={focus?.id}
              focusedTaskType={focus?.type}
              onFocus={(task) => {
                focusTask(task.id, task.type)
                if (task.runId) setFocusedRun(task.runId)
              }}
              onOpen={openTask}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-[var(--color-ink-secondary)]">
                没有匹配的平台任务。
              </CardContent>
            </Card>
          )}

          {filteredTasks.length ? (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={filteredTasks.length}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          ) : null}
        </section>

        <div className="grid items-stretch gap-5 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
          <RecentResults
            results={results.slice(0, 3)}
            onNavigate={onNavigate}
            onOpenResult={onOpenResult}
            onOpenRun={onOpenRun}
            onOpenDataset={onOpenDataset}
          />
          <RecentAssets assets={latestAssets} onViewAll={() => onNavigate('data-center')} />
        </div>
      </div>
    </main>
  )
}

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'scenario_run', label: '场景演练' },
  { key: 'benchmark_run', label: '基准评测' },
  { key: 'base_model_training', label: '基模训练' },
  { key: 'abnormal', label: '异常' },
]

function QuickStartCard({
  icon,
  title,
  description,
  button,
  tone = 'brand',
  onClick,
}: {
  icon: ReactNode
  title: string
  description: string
  button: string
  tone?: 'brand' | 'purple' | 'cyan'
  onClick: () => void
}) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-panel)]">
      <CardContent className="flex h-full flex-col p-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', toneClass(tone, 'soft'))}>{icon}</div>
        <h3 className="mt-3 text-base font-semibold">{title}</h3>
        <p className="mt-2 min-h-[48px] text-sm leading-6 text-[var(--color-ink-secondary)]">{description}</p>
        <Button className="mt-4 w-fit" variant={tone === 'brand' ? 'default' : 'secondary'} onClick={onClick}>
          {button}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

function PlatformTaskCard({
  task,
  focused,
  onFocus,
  onOpen,
}: {
  task: PlatformTaskSummary
  focused: boolean
  onFocus: () => void
  onOpen: () => void
}) {
  return (
    <Card className={cn('group relative overflow-hidden transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-panel)]', focused && 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/10')}>
      <div className={cn('absolute inset-y-0 left-0 w-1', statusColor(task.status))} />
      <CardContent className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={typeBadgeClass(task.type)}>{typeText(task.type)}</Badge>
              <StatusBadge status={task.status} />
              {focused ? <Badge variant="success"><Star className="h-3 w-3" />当前关注</Badge> : null}
            </div>
            <h3 className="mt-2 truncate text-base font-semibold">{task.name}</h3>
            <div className="mt-1 font-mono text-xs text-[var(--color-ink-muted)]">{task.runId ?? task.trainingJobId}</div>
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)]"
            title="设为当前关注"
            onClick={onFocus}
          >
            <Star className={cn('h-4 w-4', focused && 'fill-[var(--color-brand)] text-[var(--color-brand)]')} />
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[var(--color-ink)]">{task.progress}%</span>
            <span className="text-[var(--color-ink-muted)]">{task.currentStage}</span>
          </div>
          <ProgressBar value={task.progress} />
          <p className="mt-2 min-h-[40px] text-xs leading-5 text-[var(--color-ink-secondary)]">
            {task.stageDescription ?? '任务状态正在按 Mock 流程更新。'}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Mini label={task.type === 'base_model_training' ? '基础模型' : 'Agent'} value={task.type === 'base_model_training' ? task.model ?? '-' : task.agent ?? '-'} />
          <Mini label={task.type === 'base_model_training' ? '训练数据' : '模型'} value={task.type === 'base_model_training' ? compactList(task.datasetNames) : task.model ?? '-'} />
          <Mini label={task.type === 'base_model_training' ? '任务类型' : '环境'} value={task.type === 'base_model_training' ? '安全领域基模训练' : task.environment ?? '-'} />
          <Mini label="预计剩余" value={task.estimatedRemainingSeconds ? formatDuration(task.estimatedRemainingSeconds) : '-'} />
          <Mini label="已运行" value={task.elapsedSeconds ? formatDuration(task.elapsedSeconds) : '-'} />
          <Mini label="最近更新" value={task.updatedAt} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={onOpen}>
            {task.type === 'base_model_training'
              ? '查看训练'
              : task.status === 'scoring' || task.status === 'evaluating'
                ? '查看评测进度'
                : '进入控制台'}
          </Button>
          {task.runId ? <Button size="sm" variant="secondary" onClick={onFocus}>设为关注</Button> : null}
        </div>
      </CardContent>
    </Card>
  )
}

function PlatformTaskTable({
  tasks,
  focusedTaskId,
  focusedTaskType,
  onFocus,
  onOpen,
}: {
  tasks: PlatformTaskSummary[]
  focusedTaskId?: string
  focusedTaskType?: PlatformTaskType
  onFocus: (task: PlatformTaskSummary) => void
  onOpen: (task: PlatformTaskSummary) => void
}) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>
              {['ID', '任务名称', '类型', '状态', '当前阶段', '进度', '主体', '环境 / 数据', '已运行', '最近更新', '操作'].map((head) => (
                <th key={head} className="px-3 py-2 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const focused = focusedTaskId === task.id && focusedTaskType === task.type
              return (
                <tr key={`${task.type}-${task.id}`} className={cn('border-t border-[var(--color-border)]', focused && 'bg-[var(--color-brand-soft)]')}>
                  <td className="px-3 py-3 font-mono text-xs">{task.runId ?? task.trainingJobId}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold">{task.name}</div>
                    <div className="mt-1 max-w-[280px] truncate text-xs text-[var(--color-ink-muted)]">{task.stageDescription ?? '-'}</div>
                  </td>
                  <td className="px-3 py-3"><Badge variant="outline" className={typeBadgeClass(task.type)}>{typeText(task.type)}</Badge></td>
                  <td className="px-3 py-3"><StatusBadge status={task.status} /></td>
                  <td className="px-3 py-3">{task.currentStage}</td>
                  <td className="px-3 py-3">
                    <div className="flex w-32 items-center gap-2">
                      <ProgressBar value={task.progress} />
                      <span className="w-9 text-xs font-semibold">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">{task.type === 'base_model_training' ? task.model ?? '-' : task.agent ?? '-'}</td>
                  <td className="px-3 py-3">{task.type === 'base_model_training' ? compactList(task.datasetNames) : task.environment ?? '-'}</td>
                  <td className="px-3 py-3">{task.elapsedSeconds ? formatDuration(task.elapsedSeconds) : '-'}</td>
                  <td className="px-3 py-3">{task.updatedAt}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => onOpen(task)}>
                        {task.type === 'base_model_training' ? '查看训练' : '进入'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onFocus(task)}>关注</Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function RecentResults({
  results,
  onNavigate,
  onOpenResult,
  onOpenRun,
  onOpenDataset,
}: {
  results: EvaluationResult[]
  onNavigate: (id: string) => void
  onOpenResult: (runId: string) => void
  onOpenRun: (runId: string) => void
  onOpenDataset: (datasetId: string) => void
}) {
  return (
    <Card className="h-full w-full min-w-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>最近评测结果</CardTitle>
          <Button size="sm" variant="secondary" onClick={() => onNavigate('results')}>查看全部</Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>
              {['Run ID', '任务名称', '分类', 'Verdict', '评分', '完成时间', '数据状态', '操作'].map((head) => (
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
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onOpenResult(result.runId)}>查看报告</Button>
                    <Button size="sm" variant="ghost" onClick={() => onOpenRun(result.runId)}>查看来源运行</Button>
                    {result.dispositionDatasetId ? <Button size="sm" variant="ghost" onClick={() => onOpenDataset(result.dispositionDatasetId!)}>查看数据集</Button> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function RecentAssets({ assets, onViewAll }: { assets: AssetItem[]; onViewAll: () => void }) {
  return (
    <Card className="h-full w-full min-w-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>最近数据与模型产物</CardTitle>
          <Button size="sm" variant="secondary" onClick={onViewAll}>查看全部</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {assets.map((asset) => (
          <button
            key={`${asset.type}-${asset.id}`}
            type="button"
            className="rounded-lg border border-[var(--color-border)] bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-card)]"
            onClick={asset.onOpen}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Badge variant="muted">{asset.type}</Badge>
                <div className="mt-2 truncate font-semibold">{asset.name}</div>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{asset.source} / {asset.meta}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-ink-muted)]" />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
              <span>{asset.createdAt}</span>
              <span>{asset.status}</span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

function SmallToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-soft)]',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2">
      <div className="text-sm text-[var(--color-ink-secondary)]">
        显示 {start}-{end} / 共 {total} 个任务
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>上一页</Button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            className={cn(
              'h-8 min-w-8 rounded-md border px-2 text-sm font-medium',
              item === page
                ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
                : 'border-[var(--color-border)] bg-white text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-soft)]',
            )}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ))}
        <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>下一页</Button>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
  tone = 'brand',
}: {
  label: string
  value: number
  icon: ReactNode
  tone?: 'brand' | 'success' | 'danger' | 'purple' | 'cyan'
}) {
  const color = {
    brand: 'text-[var(--color-brand)]',
    success: 'text-[var(--color-success)]',
    danger: 'text-[var(--color-danger)]',
    purple: 'text-violet-600',
    cyan: 'text-cyan-700',
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-2">
      <div className="truncate text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 truncate font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
      <div className="h-full rounded-full bg-[var(--color-brand)] transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function StatusBadge({ status }: { status: PlatformTaskSummary['status'] }) {
  const variant = status === 'completed' ? 'success' : status === 'failed' || status === 'stopped' ? 'danger' : status === 'queued' ? 'muted' : status === 'scoring' || status === 'evaluating' ? 'warning' : 'success'
  return <Badge variant={variant}>{statusText(status)}</Badge>
}

function summarize(tasks: PlatformTaskSummary[]) {
  return {
    total: tasks.length,
    active: tasks.filter(isActivePlatformTask).length,
    scenario: tasks.filter((task) => task.type === 'scenario_run').length,
    benchmark: tasks.filter((task) => task.type === 'benchmark_run').length,
    training: tasks.filter((task) => task.type === 'base_model_training').length,
    completed: tasks.filter((task) => task.status === 'completed').length,
    abnormal: tasks.filter((task) => task.status === 'failed' || task.status === 'stopped').length,
  }
}

function buildLatestAssets({
  trajectoryDatasets,
  cptDatasets,
  vulnerabilityDatasets,
  benchmarkDatasets,
  modelArtifacts,
  onOpenDataset,
  onOpenCorpus,
  onOpenVulnerability,
  onOpenBenchmark,
  onOpenArtifact,
}: {
  trajectoryDatasets: ReturnType<typeof useDataCenter>['trajectoryDatasets']
  cptDatasets: ReturnType<typeof useDataCenter>['cptDatasets']
  vulnerabilityDatasets: ReturnType<typeof useDataCenter>['vulnerabilityDatasets']
  benchmarkDatasets: ReturnType<typeof useDataCenter>['benchmarkDatasets']
  modelArtifacts: ReturnType<typeof useDataCenter>['modelArtifacts']
  onOpenDataset: (id: string) => void
  onOpenCorpus: (id: string) => void
  onOpenVulnerability: (id: string) => void
  onOpenBenchmark: (id: string) => void
  onOpenArtifact: (id: string) => void
}): AssetItem[] {
  return [
    ...trajectoryDatasets.map((item) => ({
      id: item.id,
      name: item.name,
      type: '轨迹数据集',
      source: item.source,
      meta: `${item.traceCount} 条轨迹`,
      createdAt: item.updatedAt,
      status: item.quality,
      onOpen: () => onOpenDataset(item.id),
    })),
    ...cptDatasets.map((item) => ({
      id: item.id,
      name: item.name,
      type: 'CPT 语料集',
      source: item.source,
      meta: `${item.documentCount} 篇 / ${compactNumber(item.tokenTotal)} tokens`,
      createdAt: item.updatedAt,
      status: item.status,
      onOpen: () => onOpenCorpus(item.id),
    })),
    ...vulnerabilityDatasets.map((item) => ({
      id: item.id,
      name: item.name,
      type: '漏洞数据集',
      source: item.source,
      meta: `${item.vulnerabilityCount} 条记录`,
      createdAt: item.updatedAt,
      status: item.status,
      onOpen: () => onOpenVulnerability(item.id),
    })),
    ...benchmarkDatasets.map((item) => ({
      id: item.id,
      name: item.name,
      type: 'Benchmark 数据集',
      source: item.benchmarkType,
      meta: `${item.taskCount} 个任务`,
      createdAt: item.updatedAt,
      status: item.status,
      onOpen: () => onOpenBenchmark(item.id),
    })),
    ...modelArtifacts.map((item) => ({
      id: item.id,
      name: item.name,
      type: '基模产物',
      source: item.baseModel,
      meta: `${item.version} / ${item.modelSize}`,
      createdAt: item.createdAt,
      status: item.status,
      onOpen: () => onOpenArtifact(item.id),
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)
}

function statusText(status: PlatformTaskSummary['status']) {
  return {
    queued: 'Queued',
    preparing: 'Preparing',
    running: 'Running',
    scoring: 'Scoring',
    evaluating: 'Evaluating',
    completed: 'Completed',
    failed: 'Failed',
    stopped: 'Stopped',
  }[status]
}

function typeText(type: PlatformTaskType) {
  return {
    scenario_run: '场景演练',
    benchmark_run: '基准评测',
    base_model_training: '基模训练',
  }[type]
}

function typeBadgeClass(type: PlatformTaskType) {
  if (type === 'benchmark_run') return 'border-violet-200 bg-violet-50 text-violet-700'
  if (type === 'base_model_training') return 'border-cyan-200 bg-cyan-50 text-cyan-700'
  return 'border-blue-200 bg-blue-50 text-blue-700'
}

function toneClass(tone: 'brand' | 'purple' | 'cyan', mode: 'soft') {
  if (mode === 'soft' && tone === 'purple') return 'bg-violet-50 text-violet-700'
  if (mode === 'soft' && tone === 'cyan') return 'bg-cyan-50 text-cyan-700'
  return 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
}

function statusColor(status: PlatformTaskSummary['status']) {
  if (status === 'queued') return 'bg-slate-400'
  if (status === 'running' || status === 'completed') return 'bg-[var(--color-success)]'
  if (status === 'scoring' || status === 'evaluating') return 'bg-[var(--color-warning)]'
  if (status === 'failed') return 'bg-[var(--color-danger)]'
  if (status === 'stopped') return 'bg-rose-300'
  return 'bg-[var(--color-brand)]'
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

function compactList(values?: string[]) {
  if (!values?.length) return '-'
  if (values.length === 1) return values[0]
  return `${values[0]} 等 ${values.length} 个`
}

function dispositionText(status: DataDispositionStatus) {
  return {
    unhandled: '未处理',
    created_dataset: '已生成新数据集',
    appended_dataset: '已加入已有数据集',
    ignored: '已忽略',
  }[status]
}

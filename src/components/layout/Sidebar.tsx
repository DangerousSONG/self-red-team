import { useState } from 'react'
import { BarChart3, Brain, Database, FileText, LayoutDashboard, Network, Sparkles, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRangeTasks } from '@/hooks/useRangeTasks'
import { useDataCenter } from '@/hooks/useDataCenter'
import { usePlatformFocus } from '@/hooks/usePlatformFocus'
import { isActivePlatformTask, platformTasksFrom } from '@/lib/platform-tasks'
import type { PlatformTaskSummary } from '@/types/platform'

const stageNavItems = [
  { id: 'home', label: '运行总览', icon: 'LayoutDashboard' },
  { id: 'tasks', label: '评测任务', icon: 'FileText' },
  { id: 'results', label: '评分结果', icon: 'BarChart3' },
  { id: 'data-center', label: '数据中心', icon: 'Database' },
  { id: 'capability-center', label: '模型与智能体中心', icon: 'Sparkles' },
  { id: 'training', label: '基模训练', icon: 'Brain' },
] as const

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  BarChart3,
  Database,
  Sparkles,
  Brain,
}

interface SidebarProps {
  activeId: string
  onNavigate: (id: string) => void
  onOpenRun: (runId: string) => void
  onOpenTrainingJob: (jobId: string) => void
}

export function Sidebar({ activeId, onNavigate, onOpenRun, onOpenTrainingJob }: SidebarProps) {
  const { draftProgress, runSummaries, setFocusedRun } = useRangeTasks()
  const { trainingJobs } = useDataCenter()
  const { focus, focusTask } = usePlatformFocus()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const platformTasks = platformTasksFrom({ runs: runSummaries, trainingJobs })
  const activeTasks = platformTasks.filter(isActivePlatformTask)
  const focusedTask =
    (focus ? platformTasks.find((task) => task.id === focus.id && task.type === focus.type) : undefined) ??
    activeTasks[0] ??
    platformTasks[0]

  const activeGroup = activeId.startsWith('result') || activeId === 'run-data'
    ? 'results'
    : activeId.startsWith('trajectory') || activeId.startsWith('cpt') || activeId.startsWith('vulnerability') || activeId.startsWith('benchmark')
      ? 'data-center'
      : activeId === 'capability-center' || activeId === 'models' || activeId === 'model-detail' || activeId === 'agents' || activeId === 'agent-detail'
        ? 'capability-center'
      : activeId.startsWith('training') || activeId.startsWith('artifact')
        ? 'training'
      : activeId === 'run-detail' || activeId === 'rangerun'
        ? 'home'
      : activeId

  const openFocusedTask = (task?: PlatformTaskSummary) => {
    if (!task) return
    focusTask(task.id, task.type)
    if (task.runId) {
      setFocusedRun(task.runId)
      onOpenRun(task.runId)
      return
    }
    if (task.trainingJobId) onOpenTrainingJob(task.trainingJobId)
  }

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col bg-[#0f2744] text-white">
      <div className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a5fbf] shadow-sm">
            <Network className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-tight">AI 安全面场</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
              Cyber Range Console
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        <ul className="space-y-0.5">
          {stageNavItems.map((item) => {
            const Icon = iconMap[item.icon]
            const active = activeGroup === item.id
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                    active
                      ? 'bg-[#1a5fbf] font-medium text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <div className="relative rounded-lg border border-white/10 bg-white/5 p-3 text-left">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
            当前关注
          </div>
          {focusedTask ? (
            <>
              <div className="mt-1.5 text-[12px] font-medium leading-snug text-white">
                {focusedTask.name}
              </div>
              <div className={cn('mt-2 flex items-center gap-1.5 text-[11px]', focusedTask.status === 'failed' ? 'text-rose-300' : focusedTask.status === 'queued' ? 'text-slate-300' : 'text-emerald-300')}>
                <span className={cn('h-1.5 w-1.5 rounded-full', focusedTask.status === 'failed' ? 'bg-rose-400' : focusedTask.status === 'queued' ? 'bg-slate-400' : 'bg-emerald-400', focusedTask.status === 'running' && 'status-pulse')} />
                {typeText(focusedTask.type)} / {statusText(focusedTask.status)}
              </div>
              <div className="mt-1 truncate text-[10px] text-white/45">{focusedTask.currentStage}</div>
              <div className="mt-1 font-mono text-[10px] text-white/40">{focusedTask.runId ?? focusedTask.trainingJobId}</div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/80 hover:bg-white/15"
                  onClick={() => openFocusedTask(focusedTask)}
                >
                  进入
                </button>
                <button
                  type="button"
                  className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/80 hover:bg-white/15"
                  onClick={() => setSwitcherOpen((open) => !open)}
                >
                  切换
                </button>
              </div>
            </>
          ) : (
            <div className="mt-2 text-[12px] leading-5 text-white/60">暂无关注任务</div>
          )}
          {switcherOpen ? (
            <div className="absolute bottom-full left-0 z-30 mb-2 max-h-[320px] w-[300px] overflow-y-auto rounded-xl border border-white/10 bg-[#102b4a] p-2 shadow-xl">
              {activeTasks.map((task) => (
                <button
                  key={`${task.type}-${task.id}`}
                  type="button"
                  className="w-full rounded-lg px-2.5 py-2 text-left hover:bg-white/10"
                  onClick={() => {
                    focusTask(task.id, task.type)
                    if (task.runId) setFocusedRun(task.runId)
                    setSwitcherOpen(false)
                  }}
                >
                  <div className="line-clamp-1 text-[12px] font-medium text-white">{task.name}</div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-white/55">
                    <span>{typeText(task.type)} / {statusText(task.status)}</span>
                    <span>{task.progress}%</span>
                  </div>
                </button>
              ))}
              {activeTasks.length === 0 ? (
                <div className="px-2.5 py-3 text-[12px] text-white/60">暂无活跃任务</div>
              ) : null}
            </div>
          ) : null}
        </div>

        {activeId === 'tasks' ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
              正在创建
            </div>
            <div className="mt-1.5 text-[12px] font-medium leading-snug text-white">
              新 CasePlan / Step {(draftProgress.step ?? 0) + 1}/4
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}

function statusText(status: string) {
  return {
    queued: 'Queued',
    preparing: 'Preparing',
    provisioning: 'Provisioning',
    self_check: 'SelfCheck',
    running: 'Running',
    evidence_sealing: 'Evidence',
    destroying: 'Destroying',
    scoring: 'Scoring',
    evaluating: 'Evaluating',
    completed: 'Completed',
    failed: 'Failed',
    stopped: 'Stopped',
  }[status] ?? status
}

function typeText(type: PlatformTaskSummary['type']) {
  return {
    scenario_run: '场景演练',
    benchmark_run: '基准评测',
    base_model_training: '基模训练',
  }[type]
}

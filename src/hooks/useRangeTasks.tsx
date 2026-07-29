import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialTasks } from '@/lib/mock-data/tasks'
import { initialRangeRunSummaries } from '@/lib/mock-data/range-runs'
import { agentProfiles, modelProfiles, rangeEnvironments } from '@/lib/mock-data/resources'
import type {
  AgentProfile,
  CasePlan,
  DraftProgress,
  ModelProfile,
  RangeEnvironment,
  RangeRun,
  RangeRunSummary,
  RunConfig,
  Task,
  TaskStatus,
  TaskTemplate,
} from '@/types/range'

const TASKS_KEY = 'self-red-team.tasks'
const CURRENT_TASK_KEY = 'self-red-team.current-task'
const CURRENT_CASE_PLAN_KEY = 'self-red-team.current-case-plan'
const CURRENT_RUN_KEY = 'self-red-team.current-run'
const DRAFT_PROGRESS_KEY = 'self-red-team.draft-progress'
const RUN_SUMMARIES_KEY = 'self-red-team.run-summaries.v2'
const FOCUSED_RUN_KEY = 'self-red-team.focused-run-id.v2'

export const defaultRunConfig: RunConfig = {
  runName: '横向移动攻防演练',
  timeoutMinutes: 120,
  tokenBudget: 800000,
  costBudget: 200,
  concurrency: 1,
  maxSteps: 80,
  cpuCores: 4,
  memoryGb: 8,
  allowInternet: false,
  enableForensics: true,
  enableOfflineScoring: true,
  autoStopCondition: '超时、预算耗尽或触发安全策略',
}

interface TaskBuildInput {
  template: TaskTemplate
  environment: RangeEnvironment
  agent: AgentProfile
  model: ModelProfile
  runConfig: RunConfig
}

interface RangeTaskContextValue {
  taskList: Task[]
  currentTask: Task | null
  currentCasePlan: CasePlan | null
  currentRun: RangeRun | null
  runSummaries: RangeRunSummary[]
  focusedRunId: string | null
  draftProgress: DraftProgress
  setDraftProgress: (progress: DraftProgress) => void
  createTask: (input: TaskBuildInput, status?: TaskStatus) => { task: Task; casePlan: CasePlan }
  saveDraft: (input: TaskBuildInput) => Task
  startRun: (input: TaskBuildInput) => Promise<RangeRun>
  startExistingTask: (taskId: string) => Promise<RangeRun | null>
  stopRun: () => RangeRun | null
  completeRun: () => RangeRun | null
  duplicateTask: (taskId: string) => Task | null
  setFocusedRun: (runId: string, fallback?: Partial<RangeRunSummary>) => RangeRunSummary | null
  advanceRunSummaries: () => void
  stopRunSummary: (runId: string) => void
}

const RangeTaskContext = createContext<RangeTaskContextValue | null>(null)

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    if (parsed == null && fallback != null) return fallback
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback
    if (typeof fallback === 'object' && fallback !== null && !Array.isArray(fallback) && typeof parsed !== 'object') {
      return fallback
    }
    return parsed
  } catch {
    return fallback
  }
}

function normalizeRunConfig(config?: Partial<RunConfig>): RunConfig {
  return {
    ...defaultRunConfig,
    ...(config ?? {}),
    runName: config?.runName?.trim() ? config.runName : defaultRunConfig.runName,
    timeoutMinutes: Number.isFinite(config?.timeoutMinutes) ? Number(config?.timeoutMinutes) : defaultRunConfig.timeoutMinutes,
    tokenBudget: Number.isFinite(config?.tokenBudget) ? Number(config?.tokenBudget) : defaultRunConfig.tokenBudget,
    costBudget: Number.isFinite(config?.costBudget) ? Number(config?.costBudget) : defaultRunConfig.costBudget,
    concurrency: Number.isFinite(config?.concurrency) ? Number(config?.concurrency) : defaultRunConfig.concurrency,
    maxSteps: Number.isFinite(config?.maxSteps) ? Number(config?.maxSteps) : defaultRunConfig.maxSteps,
    cpuCores: Number.isFinite(config?.cpuCores) ? Number(config?.cpuCores) : defaultRunConfig.cpuCores,
    memoryGb: Number.isFinite(config?.memoryGb) ? Number(config?.memoryGb) : defaultRunConfig.memoryGb,
    autoStopCondition: config?.autoStopCondition?.trim() ? config.autoStopCondition : defaultRunConfig.autoStopCondition,
  }
}

function normalizeDraftProgress(progress?: Partial<DraftProgress> | null): DraftProgress {
  const safeStep =
    typeof progress?.step === 'number' && Number.isFinite(progress.step)
      ? Math.min(3, Math.max(0, progress.step))
      : 0
  return {
    step: safeStep,
    selectedTemplateId: typeof progress?.selectedTemplateId === 'string' ? progress.selectedTemplateId : undefined,
    environmentId: typeof progress?.environmentId === 'string' ? progress.environmentId : undefined,
    agentId: typeof progress?.agentId === 'string' ? progress.agentId : undefined,
    modelId: typeof progress?.modelId === 'string' ? progress.modelId : undefined,
    runConfig: normalizeRunConfig(progress?.runConfig),
  }
}

function writeStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function nowText() {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .replaceAll('/', '-')
}

function makeId(prefix: string) {
  const stamp = new Date()
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace(/\.\d{3}Z$/, '')
  return `${prefix}-${stamp}`
}

function buildTask(input: TaskBuildInput, status: TaskStatus): Task {
  return {
    id: makeId('task'),
    templateId: input.template.id,
    name: input.runConfig.runName || input.template.name,
    type: input.template.type,
    environment: input.environment.name,
    agent: input.agent.name,
    model: input.model.name,
    status,
    createdAt: nowText(),
    objective: input.template.objective,
    benchmark: input.template.benchmark,
  }
}

function buildCasePlan(input: TaskBuildInput, task: Task): CasePlan {
  return {
    id: makeId('CP'),
    taskId: task.id,
    taskName: task.name,
    environmentId: input.environment.id,
    environmentName: input.environment.name,
    agentId: input.agent.id,
    agentName: input.agent.name,
    modelId: input.model.id,
    modelName: input.model.name,
    runName: input.runConfig.runName,
    timeoutMinutes: input.runConfig.timeoutMinutes,
    tokenBudget: input.runConfig.tokenBudget,
    costBudget: input.runConfig.costBudget,
    concurrency: input.runConfig.concurrency,
    maxSteps: input.runConfig.maxSteps,
    cpuCores: input.runConfig.cpuCores,
    memoryGb: input.runConfig.memoryGb,
    allowInternet: input.runConfig.allowInternet,
    enableForensics: input.runConfig.enableForensics,
    enableOfflineScoring: input.runConfig.enableOfflineScoring,
    autoStopCondition: input.runConfig.autoStopCondition,
    createdAt: nowText(),
  }
}

function buildRun(task: Task, casePlan: CasePlan): RangeRun {
  return {
    id: makeId('RR'),
    taskId: task.id,
    casePlanId: casePlan.id,
    taskName: task.name,
    environment: task.environment,
    agent: task.agent,
    model: task.model,
    status: 'Running',
    startedAt: nowText(),
  }
}

function buildRunFromSummary(summary: RangeRunSummary): RangeRun {
  return {
    id: summary.id,
    taskId: `task-${summary.id}`,
    casePlanId: `CP-${summary.id}`,
    taskName: summary.taskName,
    environment: summary.environment,
    agent: summary.agent,
    model: summary.model,
    status: summary.status === 'completed' ? 'Completed' : summary.status === 'failed' || summary.status === 'stopped' ? 'Stopped' : 'Running',
    startedAt: summary.updatedAt,
  }
}

function taskFromSummary(summary: RangeRunSummary): Task {
  return {
    id: `task-${summary.id}`,
    templateId: summary.benchmark ? summary.benchmark : 'enterprise-lateral',
    name: summary.taskName,
    type: summary.category === 'benchmark' ? '基准评测' : '场景演练',
    environment: summary.environment,
    agent: summary.agent,
    model: summary.model,
    status: summary.status === 'completed' ? 'completed' : ['failed', 'stopped'].includes(summary.status) ? 'configured' : 'running',
    createdAt: summary.updatedAt,
    objective: summary.stageDescription ?? summary.currentStage,
    benchmark: summary.benchmark,
  }
}

function nextStatus(summary: RangeRunSummary): RangeRunSummary['status'] {
  if (summary.status === 'failed' || summary.status === 'stopped' || summary.status === 'completed') return summary.status
  if (summary.status === 'queued' && summary.progress >= 2) return 'preparing'
  if (summary.status === 'preparing' && summary.progress >= 22) return 'provisioning'
  if (summary.status === 'provisioning' && summary.progress >= 34) return 'self_check'
  if (summary.status === 'self_check' && summary.progress >= 45) return 'running'
  if (summary.status === 'running' && summary.progress >= 78) return 'evidence_sealing'
  if (summary.status === 'evidence_sealing' && summary.progress >= 84) return 'destroying'
  if (summary.status === 'destroying' && summary.progress >= 89) return 'scoring'
  if (summary.status === 'scoring' && summary.progress >= 96) return 'completed'
  return summary.status
}

function stageForStatus(status: RangeRunSummary['status'], summary: RangeRunSummary) {
  if (status === 'queued') return ['Queued', `排队位置：${summary.queuePosition ?? 1}，等待资源释放`]
  if (status === 'preparing') return ['Preparing', '正在校验 CasePlan 与资源配额']
  if (status === 'provisioning') return ['Provisioning', '正在准备靶场资源、网络和容器']
  if (status === 'self_check') return ['SelfCheck', '正在执行环境和工具链健康检查']
  if (status === 'running') {
    if (summary.benchmark === 'CyberGym') return ['PoC Validation', '正在验证生成的漏洞利用脚本']
    if (summary.benchmark === 'ExploitGym') return ['Exploit Execution', '正在执行受控 Exploit 并核验目标状态']
    if (summary.benchmark === 'PatchEval') return ['Patch Testing', '正在运行功能测试与安全测试']
    return ['Lateral Movement', 'Agent 正在从 DMZ 横向进入 Service Zone']
  }
  if (status === 'evidence_sealing') return ['EvidenceSealing', '正在封存证据快照与工具调用记录']
  if (status === 'destroying') return ['Destroying', '正在销毁临时靶场资源']
  if (status === 'scoring') return ['Verifier', '离线 Verifier 正在核验证据与评分']
  if (status === 'completed') return ['Completed', '评分完成，可查看评测结果']
  if (status === 'failed') return [summary.currentStage, summary.errorMessage ?? '任务异常，需要人工处理']
  return [summary.currentStage, summary.stageDescription ?? '任务已停止']
}

function findResourceFallback(task: Task) {
  const environment = rangeEnvironments.find((item) => item.name === task.environment) ?? rangeEnvironments[0]
  const agent = agentProfiles.find((item) => item.name === task.agent) ?? agentProfiles[0]
  const model = modelProfiles.find((item) => item.name === task.model) ?? modelProfiles[0]
  return { environment, agent, model }
}

export function RangeTaskProvider({ children }: { children: ReactNode }) {
  const [taskList, setTaskList] = useState<Task[]>(() => {
    const storedTasks = readStorage<Task[]>(TASKS_KEY, initialTasks)
    return Array.isArray(storedTasks) && storedTasks.length > 0 ? storedTasks : initialTasks
  })
  const [currentTask, setCurrentTask] = useState<Task | null>(() => readStorage(CURRENT_TASK_KEY, null))
  const [currentCasePlan, setCurrentCasePlan] = useState<CasePlan | null>(() => readStorage(CURRENT_CASE_PLAN_KEY, null))
  const [currentRun, setCurrentRun] = useState<RangeRun | null>(() => readStorage(CURRENT_RUN_KEY, null))
  const [runSummaries, setRunSummaries] = useState<RangeRunSummary[]>(() => readStorage(RUN_SUMMARIES_KEY, initialRangeRunSummaries))
  const [focusedRunId, setFocusedRunId] = useState<string | null>(() =>
    readStorage(
      FOCUSED_RUN_KEY,
      [...initialRangeRunSummaries]
        .filter((run) => run.status === 'running')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.id ?? initialRangeRunSummaries[0]?.id ?? null,
    ),
  )
  const [draftProgress, setDraftProgressState] = useState<DraftProgress>(() =>
    normalizeDraftProgress(readStorage<Partial<DraftProgress> | null>(DRAFT_PROGRESS_KEY, null)),
  )

  useEffect(() => writeStorage(TASKS_KEY, taskList), [taskList])
  useEffect(() => writeStorage(CURRENT_TASK_KEY, currentTask), [currentTask])
  useEffect(() => writeStorage(CURRENT_CASE_PLAN_KEY, currentCasePlan), [currentCasePlan])
  useEffect(() => writeStorage(CURRENT_RUN_KEY, currentRun), [currentRun])
  useEffect(() => writeStorage(RUN_SUMMARIES_KEY, runSummaries), [runSummaries])
  useEffect(() => writeStorage(FOCUSED_RUN_KEY, focusedRunId), [focusedRunId])
  useEffect(() => writeStorage(DRAFT_PROGRESS_KEY, draftProgress), [draftProgress])

  const setDraftProgress = useCallback((progress: DraftProgress) => {
    setDraftProgressState(normalizeDraftProgress(progress))
  }, [])

  const createTask = useCallback((input: TaskBuildInput, status: TaskStatus = 'configured') => {
    const task = buildTask(input, status)
    const casePlan = buildCasePlan(input, task)
    setTaskList((items) => [task, ...items])
    setCurrentTask(task)
    setCurrentCasePlan(casePlan)
    return { task, casePlan }
  }, [])

  const saveDraft = useCallback((input: TaskBuildInput) => createTask(input, 'draft').task, [createTask])

  const startRun = useCallback(async (input: TaskBuildInput) => {
    const { task, casePlan } = createTask(input, 'running')
    const run = buildRun(task, casePlan)
    setCurrentRun(run)
    setFocusedRunId(run.id)
    setRunSummaries((items) => [
      {
        id: run.id,
        taskName: task.name,
        category: task.benchmark ? 'benchmark' : 'scenario',
        benchmark: task.benchmark as RangeRunSummary['benchmark'],
        status: 'running',
        progress: 8,
        currentStage: 'Preparing',
        stageDescription: '刚刚启动，正在准备 Mock RangeRun。',
        environment: task.environment,
        agent: task.agent,
        model: task.model,
        concurrency: input.runConfig.concurrency,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: input.runConfig.timeoutMinutes * 60,
        tokenUsed: 0,
        tokenBudget: input.runConfig.tokenBudget,
        costUsed: 0,
        costBudget: input.runConfig.costBudget,
        cpuCores: input.runConfig.cpuCores,
        memoryGb: input.runConfig.memoryGb,
        vmCount: task.benchmark ? 1 : 3,
        containerCount: task.benchmark ? 4 : 8,
        currentAction: '当前动作：初始化运行环境',
        updatedAt: nowText(),
      },
      ...items.filter((item) => item.id !== run.id),
    ])
    setTaskList((items) => items.map((item) => (item.id === task.id ? { ...item, status: 'running' } : item)))
    setDraftProgressState({ step: 0, runConfig: defaultRunConfig })
    return run
  }, [createTask])

  const startExistingTask = useCallback(async (taskId: string) => {
    const task = taskList.find((item) => item.id === taskId)
    if (!task) return null
    const resources = findResourceFallback(task)
    const casePlan = buildCasePlan(
      {
        template: {
          id: task.templateId,
          category: task.benchmark ? 'benchmark' : 'scenario',
          name: task.name,
          type: task.type,
          environmentKind: resources.environment.environmentType,
          difficulty: '中级',
          objective: task.objective,
          evaluationTarget: task.benchmark ? 'Benchmark Agent' : '攻防 Agent',
          scoringMethod: 'Mock 综合评分',
          estimatedDuration: `${defaultRunConfig.timeoutMinutes} 分钟`,
          description: task.objective,
          input: '本地 Mock 输入',
          output: '本地 Mock 输出',
          successCriteria: task.objective,
          benchmark: task.benchmark,
          runnable: true,
        },
        ...resources,
        runConfig: { ...defaultRunConfig, runName: task.name },
      },
      task,
    )
    const run = buildRun(task, casePlan)
    setCurrentTask({ ...task, status: 'running' })
    setCurrentCasePlan(casePlan)
    setCurrentRun(run)
    setFocusedRunId(run.id)
    setRunSummaries((items) => [
      {
        id: run.id,
        taskName: task.name,
        category: task.benchmark ? 'benchmark' : 'scenario',
        benchmark: task.benchmark as RangeRunSummary['benchmark'],
        status: 'running',
        progress: 8,
        currentStage: 'Preparing',
        stageDescription: '从任务列表启动，正在准备 Mock RangeRun。',
        environment: task.environment,
        agent: task.agent,
        model: task.model,
        concurrency: defaultRunConfig.concurrency,
        elapsedSeconds: 0,
        estimatedRemainingSeconds: defaultRunConfig.timeoutMinutes * 60,
        tokenUsed: 0,
        tokenBudget: defaultRunConfig.tokenBudget,
        costUsed: 0,
        costBudget: defaultRunConfig.costBudget,
        cpuCores: defaultRunConfig.cpuCores,
        memoryGb: defaultRunConfig.memoryGb,
        vmCount: task.benchmark ? 1 : 3,
        containerCount: task.benchmark ? 4 : 8,
        currentAction: '当前动作：初始化运行环境',
        updatedAt: nowText(),
      },
      ...items.filter((item) => item.id !== run.id),
    ])
    setTaskList((items) => items.map((item) => (item.id === task.id ? { ...item, status: 'running' } : item)))
    return run
  }, [taskList])

  const stopRun = useCallback(() => {
    if (!currentRun) return null
    const stoppedRun: RangeRun = { ...currentRun, status: 'Stopped' }
    setCurrentRun(stoppedRun)
    setRunSummaries((items) => items.map((item) => item.id === currentRun.id ? { ...item, status: 'stopped', currentStage: 'Stopped', stageDescription: '任务已手动停止', updatedAt: nowText() } : item))
    setTaskList((items) => items.map((item) => (item.id === currentRun.taskId ? { ...item, status: 'configured' } : item)))
    return stoppedRun
  }, [currentRun])

  const completeRun = useCallback(() => {
    if (!currentRun) return null
    const completedRun: RangeRun = { ...currentRun, status: 'Completed' }
    setCurrentRun(completedRun)
    setRunSummaries((items) => items.map((item) => item.id === currentRun.id ? { ...item, status: 'completed', progress: 100, currentStage: 'Completed', stageDescription: '评分完成，可查看评测结果', updatedAt: nowText() } : item))
    setTaskList((items) => items.map((item) => (item.id === currentRun.taskId ? { ...item, status: 'completed' } : item)))
    return completedRun
  }, [currentRun])

  const duplicateTask = useCallback((taskId: string) => {
    const task = taskList.find((item) => item.id === taskId)
    if (!task) return null
    const copy: Task = { ...task, id: makeId('task-copy'), name: `${task.name} 副本`, status: 'draft', createdAt: nowText() }
    setTaskList((items) => [copy, ...items])
    return copy
  }, [taskList])

  const setFocusedRun = useCallback((runId: string, fallback?: Partial<RangeRunSummary>) => {
    const summary = runSummaries.find((item) => item.id === runId) ?? (
      fallback?.taskName
        ? {
            id: runId,
            taskName: fallback.taskName,
            category: fallback.category ?? 'scenario',
            benchmark: fallback.benchmark,
            status: fallback.status ?? 'completed',
            progress: fallback.progress ?? 100,
            currentStage: fallback.currentStage ?? 'Completed',
            stageDescription: fallback.stageDescription ?? '历史运行记录，已完成评分并生成报告。',
            environment: fallback.environment ?? 'historical-mock-range',
            agent: fallback.agent ?? 'Mock Agent',
            model: fallback.model ?? 'Mock Model',
            concurrency: fallback.concurrency ?? 0,
            elapsedSeconds: fallback.elapsedSeconds ?? 0,
            estimatedRemainingSeconds: fallback.estimatedRemainingSeconds,
            tokenUsed: fallback.tokenUsed ?? 0,
            tokenBudget: fallback.tokenBudget ?? 1,
            costUsed: fallback.costUsed ?? 0,
            costBudget: fallback.costBudget ?? 1,
            cpuCores: fallback.cpuCores ?? 0,
            memoryGb: fallback.memoryGb ?? 0,
            vmCount: fallback.vmCount ?? 0,
            containerCount: fallback.containerCount ?? 0,
            updatedAt: fallback.updatedAt ?? nowText(),
          }
        : undefined
    )
    if (!summary) return null
    if (!runSummaries.some((item) => item.id === runId)) {
      setRunSummaries((items) => [summary, ...items])
    }
    setFocusedRunId(runId)
    setCurrentRun(buildRunFromSummary(summary))
    setCurrentTask(taskFromSummary(summary))
    setCurrentCasePlan({
      id: `CP-${summary.id}`,
      taskId: `task-${summary.id}`,
      taskName: summary.taskName,
      environmentId: summary.environment,
      environmentName: summary.environment,
      agentId: summary.agent,
      agentName: summary.agent,
      modelId: summary.model,
      modelName: summary.model,
      runName: summary.taskName,
      timeoutMinutes: Math.ceil((summary.elapsedSeconds + (summary.estimatedRemainingSeconds ?? 0)) / 60),
      tokenBudget: summary.tokenBudget,
      costBudget: summary.costBudget,
      concurrency: summary.concurrency,
      maxSteps: 80,
      cpuCores: summary.cpuCores,
      memoryGb: summary.memoryGb,
      allowInternet: false,
      enableForensics: true,
      enableOfflineScoring: true,
      autoStopCondition: 'Mock 多任务总览切换进入',
      createdAt: summary.updatedAt,
    })
    return summary
  }, [runSummaries])

  const advanceRunSummaries = useCallback(() => {
    setRunSummaries((items) => items.map((item) => {
      if (item.status === 'failed' || item.status === 'stopped' || item.status === 'completed') return item
      const active = item.status !== 'queued'
      const progress = Math.min(100, item.progress + (item.status === 'queued' ? 0 : 1))
      const status = nextStatus({ ...item, progress })
      const [stage, description] = stageForStatus(status, item)
      return {
        ...item,
        status,
        progress: status === 'completed' ? 100 : progress,
        currentStage: stage,
        stageDescription: description,
        elapsedSeconds: active ? item.elapsedSeconds + 240 : item.elapsedSeconds,
        estimatedRemainingSeconds: item.estimatedRemainingSeconds ? Math.max(0, item.estimatedRemainingSeconds - 120) : item.estimatedRemainingSeconds,
        tokenUsed: active ? Math.min(item.tokenBudget, item.tokenUsed + 4500) : item.tokenUsed,
        costUsed: active ? Math.min(item.costBudget, item.costUsed + 2) : item.costUsed,
        currentAction: status === 'queued' ? `排队位置：${item.queuePosition ?? 1}，预计启动时间更新中` : status === 'scoring' ? '评分进度：Verifier 正在核验证据' : item.currentAction,
        updatedAt: nowText(),
      }
    }))
  }, [])

  const stopRunSummary = useCallback((runId: string) => {
    setRunSummaries((items) => items.map((item) => item.id === runId ? { ...item, status: 'stopped', currentStage: 'Stopped', stageDescription: '任务已手动停止', updatedAt: nowText() } : item))
    if (currentRun?.id === runId) setCurrentRun({ ...currentRun, status: 'Stopped' })
  }, [currentRun])

  const value = useMemo(
    () => ({
      taskList,
      currentTask,
      currentCasePlan,
      currentRun,
      runSummaries,
      focusedRunId,
      draftProgress,
      setDraftProgress,
      createTask,
      saveDraft,
      startRun,
      startExistingTask,
      stopRun,
      completeRun,
      duplicateTask,
      setFocusedRun,
      advanceRunSummaries,
      stopRunSummary,
    }),
    [
      taskList,
      currentTask,
      currentCasePlan,
      currentRun,
      runSummaries,
      focusedRunId,
      draftProgress,
      setDraftProgress,
      createTask,
      saveDraft,
      startRun,
      startExistingTask,
      stopRun,
      completeRun,
      duplicateTask,
      setFocusedRun,
      advanceRunSummaries,
      stopRunSummary,
    ],
  )

  return <RangeTaskContext.Provider value={value}>{children}</RangeTaskContext.Provider>
}

export function useRangeTasks() {
  const context = useContext(RangeTaskContext)
  if (!context) throw new Error('useRangeTasks must be used within RangeTaskProvider')
  return context
}

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
import {
  agentProfiles,
  modelProfiles,
  rangeEnvironments,
} from '@/lib/mock-data/resources'
import type {
  AgentProfile,
  CasePlan,
  DraftProgress,
  ModelProfile,
  RangeEnvironment,
  RangeRun,
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
  draftProgress: DraftProgress
  setDraftProgress: (progress: DraftProgress) => void
  createTask: (input: TaskBuildInput, status?: TaskStatus) => { task: Task; casePlan: CasePlan }
  saveDraft: (input: TaskBuildInput) => Task
  startRun: (input: TaskBuildInput) => Promise<RangeRun>
  startExistingTask: (taskId: string) => Promise<RangeRun | null>
  stopRun: () => RangeRun | null
  duplicateTask: (taskId: string) => Task | null
}

const RangeTaskContext = createContext<RangeTaskContextValue | null>(null)

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    if (parsed == null && fallback != null) return fallback
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback
    if (
      typeof fallback === 'object' &&
      fallback !== null &&
      !Array.isArray(fallback) &&
      typeof parsed !== 'object'
    ) {
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
    timeoutMinutes: Number.isFinite(config?.timeoutMinutes)
      ? Number(config?.timeoutMinutes)
      : defaultRunConfig.timeoutMinutes,
    tokenBudget: Number.isFinite(config?.tokenBudget)
      ? Number(config?.tokenBudget)
      : defaultRunConfig.tokenBudget,
    costBudget: Number.isFinite(config?.costBudget)
      ? Number(config?.costBudget)
      : defaultRunConfig.costBudget,
    concurrency: Number.isFinite(config?.concurrency)
      ? Number(config?.concurrency)
      : defaultRunConfig.concurrency,
    maxSteps: Number.isFinite(config?.maxSteps)
      ? Number(config?.maxSteps)
      : defaultRunConfig.maxSteps,
    cpuCores: Number.isFinite(config?.cpuCores)
      ? Number(config?.cpuCores)
      : defaultRunConfig.cpuCores,
    memoryGb: Number.isFinite(config?.memoryGb)
      ? Number(config?.memoryGb)
      : defaultRunConfig.memoryGb,
    autoStopCondition: config?.autoStopCondition?.trim()
      ? config.autoStopCondition
      : defaultRunConfig.autoStopCondition,
  }
}

function normalizeDraftProgress(progress?: Partial<DraftProgress> | null): DraftProgress {
  const safeStep =
    typeof progress?.step === 'number' && Number.isFinite(progress.step)
      ? Math.min(3, Math.max(0, progress.step))
      : 0
  return {
    step: safeStep,
    selectedTemplateId:
      typeof progress?.selectedTemplateId === 'string' ? progress.selectedTemplateId : undefined,
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

function findResourceFallback(task: Task) {
  const environment =
    rangeEnvironments.find((item) => item.name === task.environment) ?? rangeEnvironments[0]
  const agent = agentProfiles.find((item) => item.name === task.agent) ?? agentProfiles[0]
  const model = modelProfiles.find((item) => item.name === task.model) ?? modelProfiles[0]
  return { environment, agent, model }
}

export function RangeTaskProvider({ children }: { children: ReactNode }) {
  const [taskList, setTaskList] = useState<Task[]>(() => {
    const storedTasks = readStorage<Task[]>(TASKS_KEY, initialTasks)
    return Array.isArray(storedTasks) && storedTasks.length > 0 ? storedTasks : initialTasks
  })
  const [currentTask, setCurrentTask] = useState<Task | null>(() =>
    readStorage(CURRENT_TASK_KEY, null),
  )
  const [currentCasePlan, setCurrentCasePlan] = useState<CasePlan | null>(() =>
    readStorage(CURRENT_CASE_PLAN_KEY, null),
  )
  const [currentRun, setCurrentRun] = useState<RangeRun | null>(() =>
    readStorage(CURRENT_RUN_KEY, null),
  )
  const [draftProgress, setDraftProgressState] = useState<DraftProgress>(() =>
    normalizeDraftProgress(readStorage<Partial<DraftProgress> | null>(DRAFT_PROGRESS_KEY, null)),
  )

  useEffect(() => writeStorage(TASKS_KEY, taskList), [taskList])
  useEffect(() => writeStorage(CURRENT_TASK_KEY, currentTask), [currentTask])
  useEffect(() => writeStorage(CURRENT_CASE_PLAN_KEY, currentCasePlan), [currentCasePlan])
  useEffect(() => writeStorage(CURRENT_RUN_KEY, currentRun), [currentRun])
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

  const saveDraft = useCallback(
    (input: TaskBuildInput) => {
      const { task } = createTask(input, 'draft')
      return task
    },
    [createTask],
  )

  const startRun = useCallback(
    async (input: TaskBuildInput) => {
      const { task, casePlan } = createTask(input, 'running')
      const run = buildRun(task, casePlan)
      setCurrentRun(run)
      setTaskList((items) =>
        items.map((item) => (item.id === task.id ? { ...item, status: 'running' } : item)),
      )
      setDraftProgressState({ step: 0, runConfig: defaultRunConfig })
      return run
    },
    [createTask],
  )

  const startExistingTask = useCallback(async (taskId: string) => {
    const task = taskList.find((item) => item.id === taskId)
    if (!task) return null
    const resources = findResourceFallback(task)
    const casePlan = buildCasePlan(
      {
        template: {
          id: task.templateId,
          name: task.name,
          type: task.type,
          environmentKind: resources.environment.environmentType,
          difficulty: '中级',
          objective: task.objective,
          estimatedDuration: `${defaultRunConfig.timeoutMinutes} 分钟`,
          description: task.objective,
          input: '本地 Mock 输入',
          output: '本地 Mock 输出',
          successCriteria: task.objective,
          benchmark: task.benchmark,
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
    setTaskList((items) =>
      items.map((item) => (item.id === task.id ? { ...item, status: 'running' } : item)),
    )
    return run
  }, [taskList])

  const stopRun = useCallback(() => {
    if (!currentRun) return null
    const stoppedRun: RangeRun = { ...currentRun, status: 'Stopped' }
    setCurrentRun(stoppedRun)
    setTaskList((items) =>
      items.map((item) =>
        item.id === currentRun.taskId ? { ...item, status: 'configured' } : item,
      ),
    )
    return stoppedRun
  }, [currentRun])

  const duplicateTask = useCallback((taskId: string) => {
    const task = taskList.find((item) => item.id === taskId)
    if (!task) return null
    const copy: Task = {
      ...task,
      id: makeId('task-copy'),
      name: `${task.name} 副本`,
      status: 'draft',
      createdAt: nowText(),
    }
    setTaskList((items) => [copy, ...items])
    return copy
  }, [taskList])

  const value = useMemo(
    () => ({
      taskList,
      currentTask,
      currentCasePlan,
      currentRun,
      draftProgress,
      setDraftProgress,
      createTask,
      saveDraft,
      startRun,
      startExistingTask,
      stopRun,
      duplicateTask,
    }),
    [
      taskList,
      currentTask,
      currentCasePlan,
      currentRun,
      draftProgress,
      setDraftProgress,
      createTask,
      saveDraft,
      startRun,
      startExistingTask,
      stopRun,
      duplicateTask,
    ],
  )

  return <RangeTaskContext.Provider value={value}>{children}</RangeTaskContext.Provider>
}

export function useRangeTasks() {
  const context = useContext(RangeTaskContext)
  if (!context) {
    throw new Error('useRangeTasks must be used within RangeTaskProvider')
  }
  return context
}

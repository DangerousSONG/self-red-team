import type { RangeRunSummary } from '@/types/range'
import type { TrainingJob, TrainingStage } from '@/types/training'
import type { PlatformTaskStatus, PlatformTaskSummary } from '@/types/platform'

export function platformTasksFrom({
  runs,
  trainingJobs,
}: {
  runs: RangeRunSummary[]
  trainingJobs: TrainingJob[]
}): PlatformTaskSummary[] {
  return sortPlatformTasks([
    ...runs.map(runToPlatformTask),
    ...trainingJobs.map(trainingToPlatformTask),
  ])
}

export function runToPlatformTask(run: RangeRunSummary): PlatformTaskSummary {
  return {
    id: run.id,
    type: run.category === 'benchmark' ? 'benchmark_run' : 'scenario_run',
    name: run.taskName,
    status: normalizeRunStatus(run.status),
    progress: run.progress,
    currentStage: run.currentStage,
    stageDescription: run.stageDescription,
    startedAt: run.updatedAt,
    elapsedSeconds: run.elapsedSeconds,
    estimatedRemainingSeconds: run.estimatedRemainingSeconds,
    runId: run.id,
    agent: run.agent,
    model: run.model,
    environment: run.environment,
    updatedAt: run.updatedAt,
  }
}

export function trainingToPlatformTask(job: TrainingJob): PlatformTaskSummary {
  return {
    id: job.id,
    type: 'base_model_training',
    name: job.name,
    status: normalizeTrainingStatus(job.status),
    progress: job.progress,
    currentStage: trainingStageText(job.stage),
    stageDescription: job.note ?? '安全领域基模训练任务正在按 Mock 流程推进。',
    startedAt: job.startedAt ?? job.createdAt,
    elapsedSeconds: parseElapsed(job.elapsed),
    estimatedRemainingSeconds: job.eta === '-' || job.eta === '等待调度' ? undefined : parseElapsed(job.eta),
    trainingJobId: job.id,
    model: job.baseModel,
    datasetNames: job.datasets.map((dataset) => dataset.datasetName),
    updatedAt: job.completedAt ?? job.startedAt ?? job.createdAt,
  }
}

export function sortPlatformTasks(tasks: PlatformTaskSummary[]) {
  const order: Record<PlatformTaskStatus, number> = {
    failed: 0,
    running: 1,
    preparing: 2,
    scoring: 3,
    evaluating: 3,
    queued: 4,
    completed: 5,
    stopped: 6,
  }
  return [...tasks].sort((a, b) => order[a.status] - order[b.status] || b.updatedAt.localeCompare(a.updatedAt))
}

export function isActivePlatformTask(task: PlatformTaskSummary) {
  return !['completed', 'failed', 'stopped'].includes(task.status)
}

function normalizeRunStatus(status: RangeRunSummary['status']): PlatformTaskStatus {
  if (status === 'queued') return 'queued'
  if (status === 'preparing' || status === 'provisioning' || status === 'self_check' || status === 'running') return 'running'
  if (status === 'scoring') return 'scoring'
  if (status === 'evidence_sealing' || status === 'destroying' || status === 'evaluating') return 'evaluating'
  if (status === 'completed') return 'completed'
  if (status === 'failed') return 'failed'
  return 'stopped'
}

function normalizeTrainingStatus(status: TrainingJob['status']): PlatformTaskStatus {
  if (status === 'queued' || status === 'draft') return 'queued'
  if (status === 'preparing' || status === 'running') return 'running'
  if (status === 'evaluating') return 'evaluating'
  if (status === 'completed') return 'completed'
  if (status === 'failed') return 'failed'
  return 'stopped'
}

function parseElapsed(text: string) {
  const hourMatch = text.match(/(\d+)h/)
  const minuteMatch = text.match(/(\d+)m/)
  return (Number(hourMatch?.[1] ?? 0) * 3600) + (Number(minuteMatch?.[1] ?? 0) * 60)
}

function trainingStageText(stage: TrainingStage) {
  return {
    data_validation: '数据校验',
    data_preprocessing: '数据预处理',
    data_loading: '数据加载',
    rollout: 'Rollout',
    training: '模型训练',
    checkpoint: 'Checkpoint 保存',
    benchmark_evaluation: '基准评测',
    artifact_generation: '产物生成',
  }[stage]
}

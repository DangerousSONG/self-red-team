export type PlatformTaskType =
  | 'scenario_run'
  | 'benchmark_run'
  | 'base_model_training'

export type PlatformTaskStatus =
  | 'queued'
  | 'preparing'
  | 'running'
  | 'scoring'
  | 'evaluating'
  | 'completed'
  | 'failed'
  | 'stopped'

export type PlatformTaskSummary = {
  id: string
  type: PlatformTaskType
  name: string
  status: PlatformTaskStatus
  progress: number
  currentStage: string
  stageDescription?: string
  startedAt?: string
  elapsedSeconds?: number
  estimatedRemainingSeconds?: number
  runId?: string
  trainingJobId?: string
  agent?: string
  model?: string
  environment?: string
  datasetNames?: string[]
  updatedAt: string
}

export type PlatformFocus = {
  id: string
  type: PlatformTaskType
}

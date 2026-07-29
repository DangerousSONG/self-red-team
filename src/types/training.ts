export type TrainingStatus =
  | 'draft'
  | 'queued'
  | 'preparing'
  | 'running'
  | 'evaluating'
  | 'completed'
  | 'failed'
  | 'stopped'

export type TrainingStage =
  | 'data_validation'
  | 'data_preprocessing'
  | 'data_loading'
  | 'rollout'
  | 'training'
  | 'checkpoint'
  | 'benchmark_evaluation'
  | 'artifact_generation'

export type TrainingMetricCategory =
  | 'training_effect'
  | 'data_quality'
  | 'training_stability'
  | 'training_efficiency'

export type TrainingMetricPoint = {
  step: number
  value: number
  timestamp: string
}

export type TrainingMetricSeries = {
  key: string
  name: string
  category: TrainingMetricCategory
  xAxis: 'rollout_step' | 'train_step'
  points: TrainingMetricPoint[]
  unit?: string
  description: string
}

export type TrainingDatasetReference = {
  datasetId: string
  datasetType: 'cpt' | 'vulnerability'
  datasetName: string
  version: string
  recordCount: number
  tokenCount?: number
  qualityScore: number
  samplingWeight?: number
}

export type TrainingStageState = {
  stage: TrainingStage
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt?: string
  endedAt?: string
  duration?: string
  note: string
}

export type TrainingCheckpoint = {
  id: string
  trainingJobId: string
  trainStep: number
  createdAt: string
  modelSize: string
  trainingLoss: number
  rawReward: number
  benchmarkScore: number
  status: 'saved' | 'evaluating' | 'best' | 'archived'
}

export type TrainingLogEntry = {
  id: string
  trainingJobId: string
  time: string
  stage: TrainingStage
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'
  message: string
}

export type BenchmarkComparison = {
  benchmark: 'CyberGym' | 'ExploitGym' | 'PatchEval' | '自研综合评测集'
  metrics: Array<{
    name: string
    before: number
    checkpoint: number
    after: number
  }>
}

export type TrainingJob = {
  id: string
  name: string
  baseModel: string
  trainingMethod: 'cpt' | 'cpt_vulnerability_enhancement'
  note?: string
  datasets: TrainingDatasetReference[]
  benchmarkDatasetIds: string[]
  status: TrainingStatus
  stage: TrainingStage
  progress: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  elapsed: string
  eta: string
  dataScale: string
  metrics: TrainingMetricSeries[]
  stageStates: TrainingStageState[]
  checkpointIds: string[]
  artifactId?: string
  benchmarkComparisons: BenchmarkComparison[]
  dataUsage: {
    rawRecords: number
    cleanedRecords: number
    dedupedRecords: number
    usedRecords: number
    eliminationRate: string
    sourceShare: Array<{ label: string; value: string }>
  }
}

export type ResultVerdict = 'Success' | 'Partial' | 'Failed' | 'Stopped'
export type DataDispositionStatus =
  | 'unhandled'
  | 'created_dataset'
  | 'appended_dataset'
  | 'ignored'

export interface EvaluationResult {
  runId: string
  taskName: string
  taskCategory: '场景演练' | '基准评测'
  benchmark?: 'CyberGym' | 'ExploitGym' | 'PatchEval'
  evaluationTarget?: string
  scenario?: string
  environmentKind?: string
  attackStage?: string
  riskCount?: number
  targetImpact?: string
  agent: string
  model: string
  verdict: ResultVerdict
  score: number
  progress: number
  duration: string
  cost: number
  completedAt: string
  dataDispositionStatus: DataDispositionStatus
  dispositionDatasetId?: string
  dispositionDatasetName?: string
  metrics: Array<{ label: string; value: string; tone: 'brand' | 'success' | 'warning' | 'danger' }>
  process: string[]
  evidence: EvidenceItem[]
  attribution: {
    successReasons: string[]
    failureReasons: string[]
    keyDecisions: string[]
    invalidAttempts: string[]
    risks: string[]
    suggestions: string[]
  }
  artifacts: DataArtifact[]
}

export interface EvidenceItem {
  id: string
  type: string
  title: string
  summary: string
  raw: string
  cutoff: string
  snapshotId: string
}

export interface DataArtifact {
  id: string
  type: string
  name: string
  count: number
  quality: string
}

export interface TrajectoryDataset {
  id: string
  name: string
  description: string
  taskType: string
  source: string
  benchmark?: string
  agentType: string
  usage: string
  tags: string[]
  visibility: string
  traceCount: number
  successCount: number
  failureCount: number
  quality: string
  createdAt: string
  updatedAt: string
  sourceRunIds: string[]
}

export interface TraceRecord {
  id: string
  datasetId: string
  runId: string
  task: string
  agent: string
  model: string
  verdict: ResultVerdict
  steps: number
  token: number
  cost: number
  quality: string
  createdAt: string
  observation: string
  planningSummary: string
  action: string
  toolCall: string
  toolResult: string
  feedback: string
  finalResult: string
  score: number
  evidenceRef: string
}

export interface CptCorpusItem {
  id: string
  title: string
  type: string
  source: string
  language: string
  tokenCount: number
  qualityScore: number
  desensitized: boolean
  createdAt: string
  status: '候选' | '已审核' | '已入库' | '已废弃'
  body: string
  relatedVulnerability?: string
  relatedRunId?: string
  relatedTraceId?: string
  tags: string[]
}

export interface DataDispositionJob {
  id: string
  runId: string
  method: 'create' | 'append' | 'skip'
  targetDatasetId?: string
  selectedArtifacts: string[]
  options: Record<string, boolean>
  status: 'draft' | 'processing' | 'completed'
  createdAt: string
}

export interface DataCenterState {
  results: EvaluationResult[]
  trajectoryDatasets: TrajectoryDataset[]
  cptDatasets: import('@/types/dataset').CptCorpusDataset[]
  vulnerabilityDatasets: import('@/types/dataset').VulnerabilityDataset[]
  benchmarkDatasets: import('@/types/dataset').BenchmarkDataset[]
  benchmarkTasks: import('@/types/dataset').BenchmarkTaskRecord[]
  traces: TraceRecord[]
  cptCorpus: CptCorpusItem[]
  vulnerabilityRecords: import('@/types/vulnerability').VulnerabilityRecord[]
  dataDispositionJobs: DataDispositionJob[]
  trainingJobs: import('@/types/training').TrainingJob[]
  checkpoints: import('@/types/training').TrainingCheckpoint[]
  trainingLogs: import('@/types/training').TrainingLogEntry[]
  modelArtifacts: import('@/types/model-artifact').ModelArtifact[]
}

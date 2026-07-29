import type { CptCorpusItem, TraceRecord, TrajectoryDataset } from '@/types/data-center'
import type { VulnerabilityRecord } from '@/types/vulnerability'

export type DatasetVisibility = 'public' | 'internal' | 'private'
export type DatasetStatus = 'draft' | 'published' | 'updating' | 'archived'

export type DatasetLicense = {
  name: string
  url?: string
  summary?: string
}

export type DatasetFile = {
  id: string
  name: string
  format: 'json' | 'jsonl' | 'csv' | 'parquet' | 'markdown'
  size: number
  recordCount: number
  checksum?: string
  createdAt: string
  status: 'ready' | 'processing' | 'failed'
}

export type DatasetMetadata = {
  id: string
  name: string
  description: string
  type: 'trajectory' | 'cpt' | 'vulnerability' | 'benchmark'
  visibility: DatasetVisibility
  status: DatasetStatus
  owner: string
  organization: string
  version: string
  tags: string[]
  license: DatasetLicense
  createdAt: string
  updatedAt: string
  files: DatasetFile[]
  sourceTypes: string[]
  project: string
  contact: string
  recordCount: number
  weeklyAdded: number
  qualityScore: number
  introduction: DatasetIntroduction
  detail: DatasetDetail
  usage: DatasetUsage
}

export type DatasetIntroduction = {
  summary: string
  sources: string
  purpose: string
  buildMethod: string
  quality: string
  licenseNote: string
  cautions: string
  citation: string
}

export type DatasetDetail = {
  scale: string
  schema: Array<{ field: string; type: string; description: string }>
  distribution: Array<{ label: string; value: string }>
  qualityStats: Array<{ label: string; value: string }>
  sourceComposition: Array<{ label: string; value: string }>
  updatePolicy: string
  processingFlow: string[]
  relatedRuns: string[]
}

export type DatasetUsage = {
  fields: string[]
  scenarios: string[]
  loadExample: string
  cliExample: string
  versionNote: string
  citation: string
}

export type TrajectoryDatasetCard = DatasetMetadata & {
  type: 'trajectory'
  source: string
  taskType: string
  benchmark?: string
  agentType: string
  traceTotal: number
  successTraceCount: number
  failureTraceCount: number
  averageSteps: number
  quality: string
  visibilityLabel: string
}

export type CptCorpusDataset = DatasetMetadata & {
  type: 'cpt'
  domain: string
  corpusTypes: string[]
  source: string
  language: string
  documentCount: number
  tokenTotal: number
  reviewProgress: number
  desensitizationStatus: string
  trainingRefCount?: number
  lastTrainingAt?: string
  latestArtifact?: string
}

export type VulnerabilityDataset = DatasetMetadata & {
  type: 'vulnerability'
  source: string
  vulnerabilityCount: number
  cveLinkedCount: number
  cveUnlinkedCount: number
  severityDistribution: Record<string, number>
  cweCount: number
  sandboxCount: number
  trainingRefCount?: number
  lastTrainingAt?: string
  latestArtifact?: string
}

export type BenchmarkDataset = DatasetMetadata & {
  type: 'benchmark'
  benchmarkType: 'CyberGym' | 'ExploitGym' | 'PatchEval' | 'Internal'
  evaluationTarget: string
  taskForm: string
  outputs: string[]
  taskCount: number
  projectCount: number
  languages: string[]
  difficultyDistribution: Record<string, number>
  baselineSuccessRate: number
  split: string
  evaluationMetrics: string[]
}

export type BenchmarkTaskRecord = {
  id: string
  datasetId: string
  project: string
  vulnerabilityType: string
  cveOrCwe: string
  taskType: string
  difficulty: string
  inputType: string
  outputRequirement: string
  verificationMethod: string
  status: 'ready' | 'reviewing' | 'deprecated'
}

export type DatasetAsset = TrajectoryDatasetCard | CptCorpusDataset | VulnerabilityDataset | BenchmarkDataset

export type DatasetRecords = {
  trajectory: {
    dataset: TrajectoryDataset
    traces: TraceRecord[]
  }
  cpt: {
    dataset: CptCorpusDataset
    corpus: CptCorpusItem[]
  }
  vulnerability: {
    dataset: VulnerabilityDataset
    vulnerabilities: VulnerabilityRecord[]
  }
  benchmark: {
    dataset: BenchmarkDataset
    tasks: BenchmarkTaskRecord[]
  }
}

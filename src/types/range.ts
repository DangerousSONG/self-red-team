export type TaskStatus = 'draft' | 'configured' | 'running' | 'completed'

export interface TaskTemplate {
  id: string
  name: string
  type: string
  environmentKind: string
  benchmark?: string
  difficulty: string
  objective: string
  estimatedDuration: string
  description: string
  input: string
  output: string
  successCriteria: string
}

export interface Task {
  id: string
  templateId: string
  name: string
  type: string
  environment: string
  agent: string
  model: string
  status: TaskStatus
  createdAt: string
  objective: string
  benchmark?: string
}

export interface AgentProfile {
  id: string
  name: string
  mode: string
  description: string
  capabilityTags: string[]
  successRate: string
  compatibleTaskTypes: string[]
  incompatibleReason?: string
  recommendationReason: string
}

export interface ModelProfile {
  id: string
  name: string
  provider: string
  contextWindow: string
  modelType: string
  estimatedCost: string
  compatibleTaskTypes: string[]
  incompatibleReason?: string
  recommendationReason: string
}

export interface RangeEnvironment {
  id: string
  name: string
  environmentType: string
  resourceEstimate: string
  status: 'available' | 'busy'
  nodeCount: string
  networkZones: string
  startupTime: string
  compatibleTaskTypes: string[]
  incompatibleReason?: string
  recommendationReason: string
}

export interface CasePlan {
  id: string
  taskId: string
  taskName: string
  environmentId: string
  environmentName: string
  agentId: string
  agentName: string
  modelId: string
  modelName: string
  runName: string
  timeoutMinutes: number
  tokenBudget: number
  costBudget: number
  concurrency: number
  maxSteps: number
  cpuCores: number
  memoryGb: number
  allowInternet: boolean
  enableForensics: boolean
  enableOfflineScoring: boolean
  autoStopCondition: string
  createdAt: string
}

export type RangeRunStatus = 'Queued' | 'Running' | 'Completed' | 'Stopped'

export interface RangeRun {
  id: string
  taskId: string
  casePlanId: string
  taskName: string
  environment: string
  agent: string
  model: string
  status: RangeRunStatus
  startedAt: string
}

export interface RunConfig {
  runName: string
  timeoutMinutes: number
  tokenBudget: number
  costBudget: number
  concurrency: number
  maxSteps: number
  cpuCores: number
  memoryGb: number
  allowInternet: boolean
  enableForensics: boolean
  enableOfflineScoring: boolean
  autoStopCondition: string
}

export interface DraftProgress {
  step: number
  selectedTemplateId?: string
  environmentId?: string
  agentId?: string
  modelId?: string
  runConfig?: RunConfig
}

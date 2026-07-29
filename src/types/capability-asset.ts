export type AssetStatus =
  | 'ready'
  | 'updating'
  | 'offline'
  | 'deprecated'

export type ModelAsset = {
  id: string
  name: string
  version: string
  type:
    | 'foundation'
    | 'security_enhanced'
    | 'attack'
    | 'guard'
    | 'judge'
  source:
    | 'platform'
    | 'external'
    | 'training_artifact'
  status: AssetStatus
  provider: string
  baseModel?: string
  parameterSize?: string
  contextLength: number
  capabilities: string[]
  benchmarkScores: Record<string, number>
  trainingJobId?: string
  artifactId?: string
  datasetIds?: string[]
  referencedAgentIds: string[]
  referencedCasePlanIds: string[]
  createdAt: string
  updatedAt: string
  description: string
  recommendedScenarios: string[]
  limitations: string[]
}

export type AgentAsset = {
  id: string
  name: string
  version: string
  type:
    | 'general_attack'
    | 'whitebox_discovery'
    | 'greybox_exploitation'
    | 'whitebox_patch'
    | 'pentest'
    | 'defense'
    | 'judge'
    | 'tool'
  status: AssetStatus
  modelAssetId: string
  capabilities: string[]
  supportedBenchmarks: string[]
  supportedEnvironments: string[]
  toolIds: string[]
  successRate?: number
  averageDurationSeconds?: number
  referencedCasePlanIds: string[]
  createdAt: string
  updatedAt: string
  description: string
  inputs: string[]
  outputs: string[]
  limitations: string[]
}

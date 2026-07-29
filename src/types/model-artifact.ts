export type ModelArtifactStatus = 'generating' | 'ready' | 'failed' | 'archived'

export type ModelArtifactFile = {
  id: string
  name: string
  format: 'json' | 'safetensors' | 'txt' | 'markdown'
  size: string
  createdAt: string
  status: 'ready' | 'generating' | 'failed'
}

export type ModelArtifact = {
  id: string
  name: string
  version: string
  baseModel: string
  trainingJobId: string
  trainingMethod: string
  datasetIds: string[]
  benchmarkScores: Record<string, number>
  modelSize: string
  status: ModelArtifactStatus
  createdAt: string
  tags: string[]
  description: string
  scenarios: string[]
  enhancementDirections: string[]
  limitations: string[]
  files: ModelArtifactFile[]
}

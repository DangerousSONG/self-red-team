import type { CptCorpusItem, TrajectoryDataset } from '@/types/data-center'
import type { TrajectoryDatasetCard, VulnerabilityDataset } from '@/types/dataset'
import type { VulnerabilityRecord } from '@/types/vulnerability'

const license = {
  name: 'Internal Research License',
  summary: '仅用于受控安全评测、研究复现和内部模型数据治理演示。',
}

export function trajectoryToDatasetCard(dataset: TrajectoryDataset): TrajectoryDatasetCard {
  const averageSteps = dataset.benchmark === 'CyberGym' ? 21 : dataset.benchmark === 'ExploitGym' ? 18 : 16
  return {
    id: dataset.id,
    name: dataset.name,
    description: dataset.description,
    type: 'trajectory',
    visibility: dataset.visibility === 'Private' ? 'private' : 'internal',
    status: 'published',
    owner: 'Trajectory Data Team',
    organization: 'Self Red Team Lab',
    version: '1.0.0',
    tags: dataset.tags,
    license,
    createdAt: dataset.createdAt,
    updatedAt: dataset.updatedAt,
    files: [
      {
        id: `${dataset.id}-traces`,
        name: `${dataset.id}_traces.jsonl`,
        format: 'jsonl',
        size: dataset.traceCount * 5200,
        recordCount: dataset.traceCount,
        checksum: `sha256:mock-${dataset.id}`,
        createdAt: dataset.updatedAt,
        status: 'ready',
      },
      {
        id: `${dataset.id}-summary`,
        name: `${dataset.id}_summary.md`,
        format: 'markdown',
        size: 18000,
        recordCount: 1,
        checksum: `sha256:mock-${dataset.id}-summary`,
        createdAt: dataset.updatedAt,
        status: 'ready',
      },
    ],
    sourceTypes: [dataset.source],
    project: 'Trajectory Dataset Hub',
    contact: 'trajectory@example.invalid',
    recordCount: dataset.traceCount,
    weeklyAdded: Math.max(2, Math.round(dataset.traceCount / 8)),
    qualityScore: dataset.quality === '高' ? 90 : 82,
    introduction: {
      summary: dataset.description,
      sources: `数据来源为 ${dataset.source}，关联 Run：${dataset.sourceRunIds.join(', ')}。`,
      purpose: dataset.usage,
      buildMethod: '从运行轨迹中抽取 Observation、Action、Tool Call、Tool Result、Feedback 和评分引用，并执行脱敏。',
      quality: `数据质量标记为 ${dataset.quality}，包含成功与失败轨迹分布。`,
      licenseNote: license.summary,
      cautions: '轨迹详情仅展示结构化任务规划、已执行步骤和可观测工具行为，不展示隐藏思维链。',
      citation: `Self Red Team Trajectory Dataset: ${dataset.id}, v1.0.0.`,
    },
    detail: {
      scale: `${dataset.traceCount} 条轨迹，成功 ${dataset.successCount} 条，失败 ${dataset.failureCount} 条。`,
      schema: [
        { field: 'traceId', type: 'string', description: '轨迹唯一标识' },
        { field: 'planningSummary', type: 'string', description: '结构化规划摘要，不包含隐藏思维链' },
        { field: 'toolCall', type: 'string', description: '受控工具调用记录' },
        { field: 'evidenceRef', type: 'string', description: '证据快照引用' },
      ],
      distribution: [
        { label: '成功轨迹', value: String(dataset.successCount) },
        { label: '失败轨迹', value: String(dataset.failureCount) },
        { label: '平均步骤数', value: String(averageSteps) },
      ],
      qualityStats: [
        { label: '证据引用完整率', value: '96%' },
        { label: '脱敏覆盖率', value: '100%' },
        { label: '可回放比例', value: '88%' },
      ],
      sourceComposition: [
        { label: dataset.source, value: '100%' },
      ],
      updatePolicy: '数据处理完成后会追加新轨迹、更新统计和最近更新时间。',
      processingFlow: ['识别运行产物', '抽取轨迹事件', '脱敏敏感字段', '计算质量分', '封装为数据集文件'],
      relatedRuns: dataset.sourceRunIds,
    },
    usage: {
      fields: ['Trace ID', 'Run ID', 'Observation', 'Action', 'Tool Call', 'Tool Result', 'Feedback', 'Reward / Score'],
      scenarios: ['评测回放', 'Agent 能力画像', '失败轨迹分析', 'CPT 候选生成'],
      loadExample: `const traces = await loadTrajectoryDataset("${dataset.id}")`,
      cliExample: `self-red-team dataset traces "${dataset.id}" --limit 10`,
      versionNote: 'v1.0.0 为 Mock 数据集门户版本。',
      citation: `@dataset{${dataset.id}, type={trajectory}, year={2026}}`,
    },
    source: dataset.source,
    taskType: dataset.taskType,
    benchmark: dataset.benchmark,
    agentType: dataset.agentType,
    traceTotal: dataset.traceCount,
    successTraceCount: dataset.successCount,
    failureTraceCount: dataset.failureCount,
    averageSteps,
    quality: dataset.quality,
    visibilityLabel: dataset.visibility === 'Private' ? '私有' : '内部可见',
  }
}

export function corpusForDataset(datasetId: string, corpus: CptCorpusItem[]) {
  if (datasetId.includes('exploit')) return corpus.filter((item) => item.type.includes('利用') || item.type.includes('攻击'))
  if (datasetId.includes('patch')) return corpus.filter((item) => item.type.includes('修复') || item.source === 'PatchEval')
  if (datasetId.includes('range')) return corpus.filter((item) => item.type.includes('演练') || item.relatedRunId)
  if (datasetId.includes('expert')) return corpus.filter((item) => item.source === '专家录入' || item.type.includes('专家'))
  return corpus.filter((item) => item.type.includes('漏洞'))
}

export function vulnerabilitiesForDataset(dataset: VulnerabilityDataset, records: VulnerabilityRecord[]) {
  if (dataset.id === 'vds-master-001') return records
  return records.filter((record) => record.extra.sources.some((source) => dataset.source.includes(source.name)))
}

import type { ModelArtifact } from '@/types/model-artifact'
import type {
  BenchmarkComparison,
  TrainingCheckpoint,
  TrainingDatasetReference,
  TrainingJob,
  TrainingLogEntry,
  TrainingMetricSeries,
  TrainingStage,
  TrainingStageState,
  TrainingStatus,
} from '@/types/training'

const stages: TrainingStage[] = [
  'data_validation',
  'data_preprocessing',
  'data_loading',
  'rollout',
  'training',
  'checkpoint',
  'benchmark_evaluation',
  'artifact_generation',
]

const cptRefs: TrainingDatasetReference[] = [
  { datasetId: 'cpt-vuln-root-001', datasetType: 'cpt', datasetName: '漏洞原理与成因语料集', version: '1.0.0', recordCount: 42, tokenCount: 126000, qualityScore: 82, samplingWeight: 0.34 },
  { datasetId: 'cpt-exploit-analysis-001', datasetType: 'cpt', datasetName: '漏洞利用分析语料集', version: '1.0.0', recordCount: 36, tokenCount: 112000, qualityScore: 78, samplingWeight: 0.28 },
]

const vulnRefs: TrainingDatasetReference[] = [
  { datasetId: 'vds-master-001', datasetType: 'vulnerability', datasetName: '融合漏洞主数据集', version: '1.0.0', recordCount: 86, tokenCount: 43000, qualityScore: 82, samplingWeight: 0.24 },
  { datasetId: 'vds-cybergym-001', datasetType: 'vulnerability', datasetName: 'CyberGym 漏洞任务集', version: '1.0.0', recordCount: 18, tokenCount: 9000, qualityScore: 84, samplingWeight: 0.14 },
]

function points(count: number, start: number, delta: number, every = 20) {
  return Array.from({ length: count }, (_, index) => ({
    step: (index + 1) * every,
    value: Number((start + delta * index + Math.sin(index / 2) * Math.abs(delta || 0.01) * 1.8).toFixed(4)),
    timestamp: `2026-07-29 ${String(10 + Math.floor(index / 3)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}`,
  }))
}

function metricSeries(): TrainingMetricSeries[] {
  return [
    { key: 'rollout/raw_reward', name: 'rollout/raw_reward', category: 'training_effect', xAxis: 'rollout_step', points: points(18, 0.52, 0.018), description: '在线 rollout 的原始奖励，反映当前模型采样质量。整体趋势越高通常越好。' },
    { key: 'rollout/truncated_ratio', name: 'rollout/truncated_ratio', category: 'training_effect', xAxis: 'rollout_step', points: points(18, 0.19, -0.004), unit: '%', description: '策略模型 rollout 的截断率，通常越低越好。' },
    { key: 'rollout/response_len/min', name: 'response_len/min', category: 'training_effect', xAxis: 'rollout_step', points: points(18, 420, 6), description: '策略模型 rollout 回复长度下界。' },
    { key: 'rollout/response_len/max', name: 'response_len/max', category: 'training_effect', xAxis: 'rollout_step', points: points(18, 1320, 18), description: '策略模型 rollout 回复长度上界。' },
    { key: 'rollout/response_len/mean', name: 'response_len/mean', category: 'training_effect', xAxis: 'rollout_step', points: points(18, 760, 10), description: '策略模型 rollout 回复长度均值。' },
    { key: 'fetched/reward', name: 'fetched/reward', category: 'data_quality', xAxis: 'rollout_step', points: points(18, 0.58, 0.012), description: '样本池中被拉取训练样本的质量。' },
    { key: 'used/reward', name: 'used/reward', category: 'data_quality', xAxis: 'rollout_step', points: points(18, 0.63, 0.014), description: '最终实际参与训练样本的质量，用于观察数据筛选增益。' },
    { key: 'train/ppo_kl', name: 'train/ppo_kl', category: 'training_stability', xAxis: 'train_step', points: points(18, 0.018, 0.0002, 50), description: '策略模型偏离参考模型的程度，通常应稳定在合理的小值范围内。' },
    { key: 'train/pg_clipfrac', name: 'train/pg_clipfrac', category: 'training_stability', xAxis: 'train_step', points: points(18, 0.12, -0.001, 50), description: '更新中被 clip 的比例，长期过高可能说明更新过猛。' },
    { key: 'train/entropy_loss', name: 'train/entropy_loss', category: 'training_stability', xAxis: 'train_step', points: points(18, 0.42, -0.006, 50), description: '反映模型探索程度，下降通常说明策略逐步收敛。' },
    { key: 'perf/wait_time_ratio', name: 'perf/wait_time_ratio', category: 'training_efficiency', xAxis: 'rollout_step', points: points(18, 0.22, -0.003), unit: '%', description: '等待时间占整个 step 的比例，越大表示训练效率越低。' },
    { key: 'perf/train_wait_time', name: 'perf/train_wait_time', category: 'training_efficiency', xAxis: 'rollout_step', points: points(18, 18, -0.3), unit: 's', description: '训练侧等待时间，越大表示 rollout 侧供给较慢。' },
    { key: 'perf/train_time', name: 'perf/train_time', category: 'training_efficiency', xAxis: 'rollout_step', points: points(18, 42, 0.5), unit: 's', description: '真正训练相关耗时。' },
    { key: 'perf/step_time', name: 'perf/step_time', category: 'training_efficiency', xAxis: 'rollout_step', points: points(18, 68, 0.4), unit: 's', description: '完成一个训练 step 的总耗时。' },
  ]
}

function stageStates(active: TrainingStage, status: TrainingStatus): TrainingStageState[] {
  const activeIndex = stages.indexOf(active)
  return stages.map((stage, index) => ({
    stage,
    status: status === 'failed' && index === activeIndex ? 'failed' : index < activeIndex || status === 'completed' ? 'completed' : index === activeIndex && ['running', 'evaluating', 'preparing'].includes(status) ? 'running' : 'pending',
    startedAt: index <= activeIndex ? `2026-07-29 ${String(9 + index).padStart(2, '0')}:00` : undefined,
    endedAt: index < activeIndex || status === 'completed' ? `2026-07-29 ${String(9 + index).padStart(2, '0')}:35` : undefined,
    duration: index < activeIndex || status === 'completed' ? '35 min' : undefined,
    note: stageNote(stage),
  }))
}

function stageNote(stage: TrainingStage) {
  return {
    data_validation: '校验数据版本、许可证、脱敏状态和字段完整性。',
    data_preprocessing: '执行去重、清洗和安全抽象文本标准化。',
    data_loading: '构建 Mock 数据加载索引和采样权重。',
    rollout: '追加 rollout 指标，观察 raw_reward 和截断率。',
    training: '执行持续预训练 Mock 过程并记录稳定性指标。',
    checkpoint: '保存 checkpoint 并触发轻量评测。',
    benchmark_evaluation: '关联 Benchmark 数据集进行训练前后对比。',
    artifact_generation: '生成模型产物清单和评测报告。',
  }[stage]
}

function comparisons(): BenchmarkComparison[] {
  return [
    {
      benchmark: 'CyberGym',
      metrics: [
        { name: '漏洞定位正确率', before: 61, checkpoint: 70, after: 76 },
        { name: '漏洞验证成功率', before: 58, checkpoint: 66, after: 72 },
        { name: 'PoC 有效性', before: 60, checkpoint: 68, after: 74 },
        { name: '综合评分', before: 61, checkpoint: 70, after: 77 },
      ],
    },
    {
      benchmark: 'ExploitGym',
      metrics: [
        { name: 'Exploit 成功率', before: 55, checkpoint: 62, after: 68 },
        { name: 'Payload 有效性', before: 59, checkpoint: 66, after: 71 },
        { name: '目标达成率', before: 57, checkpoint: 65, after: 70 },
        { name: '综合评分', before: 58, checkpoint: 66, after: 72 },
      ],
    },
    {
      benchmark: 'PatchEval',
      metrics: [
        { name: '漏洞修复率', before: 63, checkpoint: 70, after: 78 },
        { name: '功能测试通过率', before: 72, checkpoint: 78, after: 83 },
        { name: '安全测试通过率', before: 60, checkpoint: 68, after: 75 },
        { name: '回归测试通过率', before: 70, checkpoint: 76, after: 81 },
        { name: '综合评分', before: 65, checkpoint: 72, after: 78 },
      ],
    },
  ]
}

function job(index: number, status: TrainingStatus, stage: TrainingStage, progress: number, artifactId?: string): TrainingJob {
  const datasets = index % 2 === 0 ? [...cptRefs, ...vulnRefs.slice(0, 1)] : [cptRefs[index % cptRefs.length], ...vulnRefs]
  return {
    id: `TRAIN-20260729-${String(index + 1).padStart(3, '0')}`,
    name: index === 0 ? 'Shusheng-35B 安全 CPT 增强' : index === 1 ? 'InternLM-35B 漏洞知识增强' : `安全基模训练任务 ${index + 1}`,
    baseModel: index % 3 === 0 ? 'Shusheng-35B' : index % 3 === 1 ? 'InternLM-35B' : 'InternLM-7B',
    trainingMethod: index % 2 === 0 ? 'cpt_vulnerability_enhancement' : 'cpt',
    note: 'Mock 训练任务，用于演示安全领域持续预训练链路。',
    datasets,
    benchmarkDatasetIds: ['bds-cybergym-001', 'bds-exploitgym-001', 'bds-patcheval-001'],
    status,
    stage,
    progress,
    createdAt: `2026-07-${24 + index} 10:20`,
    startedAt: ['running', 'evaluating', 'completed', 'failed', 'stopped'].includes(status) ? `2026-07-${24 + index} 10:40` : undefined,
    completedAt: status === 'completed' ? `2026-07-${24 + index} 18:30` : undefined,
    elapsed: status === 'queued' ? '-' : `${2 + index}h ${20 + index * 3}m`,
    eta: status === 'completed' || status === 'failed' || status === 'stopped' ? '-' : `${4 + index}h`,
    dataScale: `${datasets.reduce((sum, item) => sum + item.recordCount, 0)} 条 / ${datasets.reduce((sum, item) => sum + (item.tokenCount ?? 0), 0).toLocaleString()} tokens`,
    metrics: metricSeries(),
    stageStates: stageStates(stage, status),
    checkpointIds: [`ckpt-${index + 1}-001`, `ckpt-${index + 1}-002`],
    artifactId,
    benchmarkComparisons: comparisons(),
    dataUsage: {
      rawRecords: 182 + index * 24,
      cleanedRecords: 168 + index * 20,
      dedupedRecords: 154 + index * 18,
      usedRecords: 140 + index * 16,
      eliminationRate: '18%',
      sourceShare: [
        { label: 'CPT 语料库', value: '62%' },
        { label: '漏洞数据', value: '38%' },
      ],
    },
  }
}

export const initialTrainingJobs: TrainingJob[] = [
  job(0, 'queued', 'data_validation', 4),
  job(1, 'running', 'training', 56),
  job(2, 'evaluating', 'benchmark_evaluation', 78),
  job(3, 'completed', 'artifact_generation', 100, 'artifact-shusheng-cyber-cpt-v1'),
  job(4, 'failed', 'data_preprocessing', 22),
  job(5, 'stopped', 'rollout', 38),
]

export const initialTrainingCheckpoints: TrainingCheckpoint[] = initialTrainingJobs.flatMap((trainingJob, jobIndex) =>
  Array.from({ length: 2 }, (_, index) => ({
    id: `ckpt-${jobIndex + 1}-${String(index + 1).padStart(3, '0')}`,
    trainingJobId: trainingJob.id,
    trainStep: (index + 1) * 800 + jobIndex * 120,
    createdAt: `2026-07-${24 + jobIndex} ${13 + index}:20`,
    modelSize: trainingJob.baseModel.includes('35B') ? '71 GB' : '15 GB',
    trainingLoss: Number((1.4 - index * 0.14 - jobIndex * 0.03).toFixed(3)),
    rawReward: Number((0.62 + index * 0.05 + jobIndex * 0.01).toFixed(3)),
    benchmarkScore: 68 + index * 4 + jobIndex,
    status: jobIndex === 3 && index === 1 ? 'best' : trainingJob.status === 'evaluating' && index === 1 ? 'evaluating' : 'saved',
  })),
)

export const initialTrainingLogs: TrainingLogEntry[] = initialTrainingJobs.flatMap((trainingJob) => [
  { id: `${trainingJob.id}-log-1`, trainingJobId: trainingJob.id, time: '10:42:10', stage: 'data_validation', level: 'SUCCESS', message: '数据校验完成' },
  { id: `${trainingJob.id}-log-2`, trainingJobId: trainingJob.id, time: '11:05:28', stage: 'data_preprocessing', level: 'INFO', message: 'CPT 语料去重完成' },
  { id: `${trainingJob.id}-log-3`, trainingJobId: trainingJob.id, time: '11:26:45', stage: 'data_loading', level: 'SUCCESS', message: '漏洞数据索引完成' },
  { id: `${trainingJob.id}-log-4`, trainingJobId: trainingJob.id, time: '13:10:12', stage: 'rollout', level: 'INFO', message: 'rollout step 240 完成' },
  { id: `${trainingJob.id}-log-5`, trainingJobId: trainingJob.id, time: '14:22:06', stage: 'checkpoint', level: 'SUCCESS', message: 'checkpoint-002 已保存' },
  { id: `${trainingJob.id}-log-6`, trainingJobId: trainingJob.id, time: '15:40:00', stage: 'benchmark_evaluation', level: 'SUCCESS', message: 'CyberGym 评测完成' },
])

export const initialModelArtifacts: ModelArtifact[] = [
  {
    id: 'artifact-shusheng-cyber-cpt-v1',
    name: 'Shusheng-35B-Cyber-CPT-v1',
    version: '1.0.0',
    baseModel: 'Shusheng-35B',
    trainingJobId: 'TRAIN-20260729-004',
    trainingMethod: 'CPT + 漏洞知识增强',
    datasetIds: ['cpt-vuln-root-001', 'cpt-exploit-analysis-001', 'vds-master-001'],
    benchmarkScores: { CyberGym: 77, ExploitGym: 72, PatchEval: 78 },
    modelSize: '71 GB',
    status: 'ready',
    createdAt: '2026-07-27 18:30',
    tags: ['cpt', 'cyber', 'ready'],
    description: '面向安全知识理解增强的 Mock 基模产物，来源于 CPT 语料和漏洞数据。',
    scenarios: ['安全知识理解', '漏洞描述归纳', '评测前后对比'],
    enhancementDirections: ['漏洞原理理解', 'CVE/CWE 关系建模', '安全报告摘要'],
    limitations: ['不可用于真实在线推理', '不包含真实部署配置', '仅为前端 Mock 产物'],
    files: [
      { id: 'cfg', name: 'config.json', format: 'json', size: '18 KB', createdAt: '2026-07-27 18:30', status: 'ready' },
      { id: 'tok', name: 'tokenizer files', format: 'txt', size: '6 MB', createdAt: '2026-07-27 18:31', status: 'ready' },
      { id: 'shard', name: 'model shards', format: 'safetensors', size: '71 GB', createdAt: '2026-07-27 18:35', status: 'ready' },
      { id: 'manifest', name: 'training_manifest.json', format: 'json', size: '42 KB', createdAt: '2026-07-27 18:38', status: 'ready' },
      { id: 'eval', name: 'evaluation_report.json', format: 'json', size: '88 KB', createdAt: '2026-07-27 18:40', status: 'ready' },
    ],
  },
  {
    id: 'artifact-internlm-vuln-v1',
    name: 'InternLM-35B-Vuln-CPT-v1',
    version: '1.0.0',
    baseModel: 'InternLM-35B',
    trainingJobId: 'TRAIN-20260720-008',
    trainingMethod: 'CPT + 漏洞知识增强',
    datasetIds: ['cpt-vuln-root-001', 'vds-nvd-001'],
    benchmarkScores: { CyberGym: 74, ExploitGym: 69, PatchEval: 75 },
    modelSize: '70 GB',
    status: 'ready',
    createdAt: '2026-07-20 16:10',
    tags: ['vulnerability', 'knowledge'],
    description: '强化漏洞描述、CVE/CWE 和安全知识理解的 Mock 模型产物。',
    scenarios: ['漏洞知识归纳', '安全文本生成', '数据治理验证'],
    enhancementDirections: ['漏洞关系理解', '安全术语覆盖', '报告结构化'],
    limitations: ['不提供真实权重下载', '不支持在线服务'],
    files: [
      { id: 'cfg', name: 'config.json', format: 'json', size: '18 KB', createdAt: '2026-07-20 16:10', status: 'ready' },
      { id: 'shard', name: 'model shards', format: 'safetensors', size: '70 GB', createdAt: '2026-07-20 16:13', status: 'ready' },
      { id: 'manifest', name: 'training_manifest.json', format: 'json', size: '39 KB', createdAt: '2026-07-20 16:15', status: 'ready' },
    ],
  },
  {
    id: 'artifact-internlm-7b-cpt-v1',
    name: 'InternLM-7B-Security-CPT-v1',
    version: '1.0.0',
    baseModel: 'InternLM-7B',
    trainingJobId: 'TRAIN-20260718-003',
    trainingMethod: 'CPT 持续预训练',
    datasetIds: ['cpt-expert-knowledge-001', 'cpt-range-summary-001'],
    benchmarkScores: { CyberGym: 70, ExploitGym: 64, PatchEval: 71 },
    modelSize: '15 GB',
    status: 'ready',
    createdAt: '2026-07-18 19:05',
    tags: ['7b', 'cpt', 'security'],
    description: '轻量安全 CPT Mock 产物，用于展示模型资产门户。',
    scenarios: ['安全知识预训练验证', '小模型对比'],
    enhancementDirections: ['术语覆盖', '安全摘要能力'],
    limitations: ['仅用于前端演示'],
    files: [
      { id: 'cfg', name: 'config.json', format: 'json', size: '14 KB', createdAt: '2026-07-18 19:05', status: 'ready' },
      { id: 'shard', name: 'model shards', format: 'safetensors', size: '15 GB', createdAt: '2026-07-18 19:08', status: 'ready' },
    ],
  },
  {
    id: 'artifact-generating-cyber-v2',
    name: 'Shusheng-35B-Cyber-CPT-v2',
    version: '1.1.0',
    baseModel: 'Shusheng-35B',
    trainingJobId: 'TRAIN-20260729-003',
    trainingMethod: 'CPT + 漏洞知识增强',
    datasetIds: ['cpt-vuln-root-001', 'vds-cybergym-001'],
    benchmarkScores: { CyberGym: 72, ExploitGym: 66, PatchEval: 72 },
    modelSize: '71 GB',
    status: 'generating',
    createdAt: '2026-07-29 15:00',
    tags: ['generating', 'checkpoint'],
    description: '正在生成中的 Mock 模型产物。',
    scenarios: ['训练中产物预览'],
    enhancementDirections: ['漏洞定位', '安全知识理解'],
    limitations: ['尚未 ready'],
    files: [
      { id: 'manifest', name: 'training_manifest.json', format: 'json', size: '36 KB', createdAt: '2026-07-29 15:00', status: 'ready' },
      { id: 'shard', name: 'model shards', format: 'safetensors', size: '71 GB', createdAt: '2026-07-29 15:10', status: 'generating' },
    ],
  },
]

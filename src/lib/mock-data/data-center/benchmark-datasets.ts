import type { BenchmarkDataset, BenchmarkTaskRecord, DatasetFile, DatasetLicense } from '@/types/dataset'

const license: DatasetLicense = {
  name: 'Internal Benchmark License',
  summary: '仅用于受控评测、训练前后对比和产品体验演示。',
}

function files(prefix: string, count: number): DatasetFile[] {
  return [
    {
      id: `${prefix}-tasks`,
      name: `${prefix}_tasks.jsonl`,
      format: 'jsonl',
      size: count * 6100,
      recordCount: count,
      checksum: `sha256:mock-${prefix}-tasks`,
      createdAt: '2026-07-29 10:00',
      status: 'ready',
    },
    {
      id: `${prefix}-manifest`,
      name: `${prefix}_benchmark_manifest.json`,
      format: 'json',
      size: 28000,
      recordCount: 1,
      checksum: `sha256:mock-${prefix}-manifest`,
      createdAt: '2026-07-29 10:05',
      status: 'ready',
    },
    {
      id: `${prefix}-guide`,
      name: `${prefix}_evaluation_guide.md`,
      format: 'markdown',
      size: 16000,
      recordCount: 1,
      checksum: `sha256:mock-${prefix}-guide`,
      createdAt: '2026-07-29 10:08',
      status: 'ready',
    },
  ]
}

function benchmarkDataset({
  id,
  name,
  benchmarkType,
  evaluationTarget,
  taskForm,
  outputs,
  taskCount,
  projectCount,
  languages,
  tags,
}: {
  id: string
  name: string
  benchmarkType: BenchmarkDataset['benchmarkType']
  evaluationTarget: string
  taskForm: string
  outputs: string[]
  taskCount: number
  projectCount: number
  languages: string[]
  tags: string[]
}): BenchmarkDataset {
  return {
    id,
    name,
    description: `${name} 用于训练前后能力评测，覆盖任务输入、输出要求、验证方式和评分指标。`,
    type: 'benchmark',
    visibility: 'internal',
    status: 'published',
    owner: 'Benchmark Governance Team',
    organization: 'Self Red Team Lab',
    version: '1.0.0',
    tags,
    license,
    createdAt: '2026-07-24 10:00',
    updatedAt: '2026-07-29 11:30',
    files: files(id, taskCount),
    sourceTypes: [benchmarkType],
    project: 'Security Benchmark Hub',
    contact: 'benchmark@example.invalid',
    recordCount: taskCount,
    weeklyAdded: Math.max(3, Math.round(taskCount / 10)),
    qualityScore: 86,
    introduction: {
      summary: `${name} 是标准化安全评测数据集，支持训练前基线、训练中 checkpoint 和训练后模型的能力对比。`,
      sources: `数据来源为 ${benchmarkType} Mock 任务、公开安全样例和内部评测模板。`,
      purpose: `用于评测 ${evaluationTarget} 在 ${taskForm} 下的任务完成质量。`,
      buildMethod: '通过任务模板、验证脚本要求、评分 rubrics 和脱敏输入样例组合构建。',
      quality: '每个任务包含输入类型、输出要求、验证方式、难度和状态字段。',
      licenseNote: license.summary ?? '',
      cautions: '本阶段仅展示安全抽象任务，不包含可直接滥用的真实攻击载荷或真实评测执行。',
      citation: `Self Red Team Benchmark Dataset: ${id}, v1.0.0, 2026.`,
    },
    detail: {
      scale: `${taskCount} 个评测任务，${projectCount} 个项目，语言覆盖 ${languages.join(' / ')}。`,
      schema: [
        { field: 'taskId', type: 'string', description: '评测任务唯一标识' },
        { field: 'inputType', type: 'string', description: '源码、漏洞程序、测试集或安全上下文' },
        { field: 'outputRequirement', type: 'string', description: '漏洞定位、PoC、Exploit、Patch 或验证结果' },
        { field: 'verificationMethod', type: 'string', description: 'Mock 验证脚本、功能测试或安全测试' },
      ],
      distribution: [
        { label: 'Easy', value: String(Math.round(taskCount * 0.25)) },
        { label: 'Medium', value: String(Math.round(taskCount * 0.45)) },
        { label: 'Hard', value: String(Math.round(taskCount * 0.3)) },
      ],
      qualityStats: [
        { label: '任务字段完整率', value: '98%' },
        { label: '验证说明覆盖率', value: '95%' },
        { label: '安全抽象覆盖率', value: '100%' },
      ],
      sourceComposition: [
        { label: benchmarkType, value: '82%' },
        { label: '内部模板', value: '18%' },
      ],
      updatePolicy: 'Benchmark 数据集本阶段为 Mock 版本，训练任务会引用其版本但不会改写原始数据。',
      processingFlow: ['任务模板整理', '输入输出字段校验', '验证方式标注', '难度归一化', '发布为 Benchmark 数据集'],
      relatedRuns: ['TRAIN-20260729-001'],
    },
    usage: {
      fields: ['Task ID', '项目', '漏洞类型', 'CVE / CWE', '输入类型', '输出要求', '验证方式', '状态'],
      scenarios: ['训练前基线评测', 'Checkpoint 对比', '训练后模型评测', '能力回归检查'],
      loadExample: `const benchmark = await loadBenchmarkDataset("${id}")`,
      cliExample: `self-red-team benchmark inspect "${id}" --split validation`,
      versionNote: 'v1.0.0 为 Mock Benchmark 数据集门户版本。',
      citation: `@dataset{${id}, type={benchmark}, year={2026}}`,
    },
    benchmarkType,
    evaluationTarget,
    taskForm,
    outputs,
    taskCount,
    projectCount,
    languages,
    difficultyDistribution: { Easy: 25, Medium: 45, Hard: 30 },
    baselineSuccessRate: 0.61,
    split: 'train 70% / validation 15% / test 15%',
    evaluationMetrics: outputs.includes('Patch')
      ? ['漏洞修复率', '功能测试通过率', '安全测试通过率', '回归测试通过率', '综合评分']
      : outputs.includes('Exploit')
        ? ['Exploit 成功率', 'Payload 有效性', '目标达成率', '综合评分']
        : ['漏洞定位正确率', '漏洞验证成功率', 'PoC 有效性', '综合评分'],
  }
}

export const initialBenchmarkDatasets: BenchmarkDataset[] = [
  benchmarkDataset({
    id: 'bds-cybergym-001',
    name: 'CyberGym 漏洞挖掘评测集',
    benchmarkType: 'CyberGym',
    evaluationTarget: '漏洞挖掘 Agent',
    taskForm: '白盒源码分析',
    outputs: ['漏洞定位', 'PoC', '验证结果'],
    taskCount: 86,
    projectCount: 34,
    languages: ['Python', 'JavaScript', 'Go'],
    tags: ['cybergym', 'whitebox', 'vuln-discovery'],
  }),
  benchmarkDataset({
    id: 'bds-exploitgym-001',
    name: 'ExploitGym 漏洞利用评测集',
    benchmarkType: 'ExploitGym',
    evaluationTarget: '漏洞利用 Agent',
    taskForm: '漏洞利用与目标达成',
    outputs: ['Exploit', 'Payload', '利用结果'],
    taskCount: 72,
    projectCount: 28,
    languages: ['C', 'Python', 'Java'],
    tags: ['exploitgym', 'payload-safe', 'graybox'],
  }),
  benchmarkDataset({
    id: 'bds-patcheval-001',
    name: 'PatchEval 漏洞修复评测集',
    benchmarkType: 'PatchEval',
    evaluationTarget: '漏洞修复 Agent',
    taskForm: '源码修复与回归验证',
    outputs: ['Patch', '功能测试', '安全测试'],
    taskCount: 64,
    projectCount: 26,
    languages: ['Python', 'JavaScript', 'Java'],
    tags: ['patcheval', 'patch', 'regression'],
  }),
  benchmarkDataset({
    id: 'bds-internal-redteam-001',
    name: '自研综合攻防能力评测集',
    benchmarkType: 'Internal',
    evaluationTarget: '通用攻防 Agent',
    taskForm: '多类型安全任务',
    outputs: ['任务结果', '证据链', '安全报告'],
    taskCount: 48,
    projectCount: 18,
    languages: ['Python', 'Go', 'Shell'],
    tags: ['internal', 'scenario', 'capability'],
  }),
]

export const initialBenchmarkTasks: BenchmarkTaskRecord[] = initialBenchmarkDatasets.flatMap((dataset) =>
  Array.from({ length: Math.min(12, dataset.taskCount) }, (_, index) => ({
    id: `${dataset.id}-task-${String(index + 1).padStart(3, '0')}`,
    datasetId: dataset.id,
    project: `${dataset.benchmarkType.toLowerCase()}-project-${index + 1}`,
    vulnerabilityType: index % 3 === 0 ? '输入校验缺陷' : index % 3 === 1 ? '权限边界错误' : '依赖组件风险',
    cveOrCwe: index % 2 === 0 ? `CWE-${79 + index}` : `CVE-2024-${1200 + index}`,
    taskType: dataset.taskForm,
    difficulty: index % 3 === 0 ? 'Hard' : index % 3 === 1 ? 'Medium' : 'Easy',
    inputType: dataset.benchmarkType === 'PatchEval' ? '源码 + 测试集' : dataset.benchmarkType === 'ExploitGym' ? '漏洞程序 + 运行环境' : '源码 + 项目上下文',
    outputRequirement: dataset.outputs.join(' / '),
    verificationMethod: dataset.benchmarkType === 'PatchEval' ? '功能测试 + 安全测试' : 'Mock 验证脚本',
    status: index % 7 === 0 ? 'reviewing' : 'ready',
  })),
)

import type { AgentProfile, ModelProfile, RangeEnvironment } from '@/types/range'
import { agentAssets, modelAssets } from '@/lib/mock-data/capability-assets'

export const rangeEnvironments: RangeEnvironment[] = [
  {
    id: 'enterprise-lateral-range',
    name: 'enterprise-lateral-range',
    environmentType: 'VM + Docker 混合',
    resourceEstimate: '4 VM / 2 h / 200 元',
    status: 'available',
    nodeCount: '7 节点',
    networkZones: 'External / DMZ / Service / Protected',
    startupTime: '约 6 分钟',
    compatibleTaskTypes: ['enterprise-lateral'],
    recommendationReason: '与多节点横向移动任务匹配，覆盖 DMZ、业务区和保护区。',
  },
  {
    id: 'exploitgym-sandbox',
    name: 'ExploitGym Sandbox',
    environmentType: 'Docker',
    resourceEstimate: '1 sandbox / 60 min / 40 元',
    status: 'available',
    nodeCount: '1 沙箱',
    networkZones: 'Isolated App',
    startupTime: '约 90 秒',
    compatibleTaskTypes: ['web-exploit'],
    recommendationReason: '支持 ExploitGym Benchmark，适合可复现 PoC 评测。',
  },
  {
    id: 'cybergym-sandbox',
    name: 'CyberGym Sandbox',
    environmentType: 'Docker',
    resourceEstimate: '1 sandbox / 90 min / 60 元',
    status: 'available',
    nodeCount: '1 代码沙箱',
    networkZones: 'Source / Test Runner',
    startupTime: '约 2 分钟',
    compatibleTaskTypes: ['whitebox-mining'],
    recommendationReason: '支持源码挂载和验证脚本执行，适合白盒漏洞挖掘。',
  },
  {
    id: 'patcheval-sandbox',
    name: 'PatchEval Sandbox',
    environmentType: 'Docker',
    resourceEstimate: '1 sandbox / 90 min / 55 元',
    status: 'available',
    nodeCount: '1 修复沙箱',
    networkZones: 'Patch / Regression Test',
    startupTime: '约 2 分钟',
    compatibleTaskTypes: ['patch-verify'],
    recommendationReason: '内置功能回归与安全测试，适合补丁验证任务。',
  },
]

export const agentProfiles: AgentProfile[] = agentAssets
  .filter((asset) => asset.status === 'ready')
  .map((asset) => ({
    id: asset.id,
    name: asset.name,
    mode: agentModeText(asset.type),
    description: asset.description,
    capabilityTags: asset.capabilities,
    successRate: `${asset.successRate ?? 0}%`,
    compatibleTaskTypes: compatibleTaskTypesForAgent(asset.supportedBenchmarks, asset.supportedEnvironments),
    recommendationReason: `来自模型与智能体中心 Ready 资产，当前模型为 ${modelAssets.find((model) => model.id === asset.modelAssetId)?.name ?? asset.modelAssetId}。`,
  }))

export const modelProfiles: ModelProfile[] = modelAssets
  .filter((asset) => asset.status === 'ready')
  .map((asset) => ({
    id: asset.id,
    name: asset.name,
    provider: asset.provider,
    contextWindow: `${Math.round(asset.contextLength / 1000)}k`,
    modelType: modelTypeText(asset.type),
    estimatedCost: asset.parameterSize?.includes('35B') ? '约 0.18 元 / 1k tokens' : '约 0.08 元 / 1k tokens',
    compatibleTaskTypes: compatibleTaskTypesForModel(asset.capabilities, asset.type),
    recommendationReason: `来自模型与智能体中心 Ready 资产，来源：${modelSourceText(asset.source)}。`,
  }))

export const defaultResourceMatches: Record<
  string,
  { environmentId: string; agentId: string; modelId: string }
> = {
  'enterprise-lateral': {
    environmentId: 'enterprise-lateral-range',
    agentId: 'agent-general-attack',
    modelId: 'model-shusheng-35b',
  },
  'web-exploit': {
    environmentId: 'exploitgym-sandbox',
    agentId: 'agent-greybox-exploit',
    modelId: 'model-shusheng-35b-cyber-cpt-v1',
  },
  'whitebox-mining': {
    environmentId: 'cybergym-sandbox',
    agentId: 'agent-whitebox-discovery',
    modelId: 'model-shusheng-35b-cyber-cpt-v1',
  },
  'patch-verify': {
    environmentId: 'patcheval-sandbox',
    agentId: 'agent-whitebox-patch',
    modelId: 'model-judge-7b',
  },
}

function compatibleTaskTypesForAgent(benchmarks: string[], environments: string[]) {
  const types = new Set<string>()
  if (benchmarks.includes('CyberGym')) types.add('whitebox-mining')
  if (benchmarks.includes('ExploitGym')) types.add('web-exploit')
  if (benchmarks.includes('PatchEval')) types.add('patch-verify')
  if (benchmarks.includes('自研综合评测集') || environments.some((item) => item.includes('enterprise') || item.includes('database'))) {
    types.add('enterprise-lateral')
  }
  return Array.from(types)
}

function compatibleTaskTypesForModel(capabilities: string[], type: string) {
  const text = capabilities.join(' ')
  const types = new Set<string>(['enterprise-lateral'])
  if (text.includes('漏洞') || type === 'judge') {
    types.add('whitebox-mining')
    types.add('web-exploit')
  }
  if (text.includes('补丁') || type === 'judge') types.add('patch-verify')
  return Array.from(types)
}

function agentModeText(type: string) {
  return {
    general_attack: 'Black-box',
    whitebox_discovery: 'White-box',
    greybox_exploitation: 'Grey-box',
    whitebox_patch: 'White-box',
    pentest: 'Pentest',
    defense: 'Defense',
    judge: 'Judge',
    tool: 'Tool',
  }[type] ?? type
}

function modelTypeText(type: string) {
  return {
    foundation: '基础模型',
    security_enhanced: '安全增强模型',
    attack: '攻击模型',
    guard: '守卫模型',
    judge: '裁判模型',
  }[type] ?? type
}

function modelSourceText(source: string) {
  return {
    platform: '平台预置',
    external: '外部接入',
    training_artifact: '基模训练产物',
  }[source] ?? source
}

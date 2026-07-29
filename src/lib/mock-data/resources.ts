import type { AgentProfile, ModelProfile, RangeEnvironment } from '@/types/range'

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

export const agentProfiles: AgentProfile[] = [
  {
    id: 'blackbox-general-agent',
    name: '通用黑盒攻击智能体',
    mode: 'Black-box',
    description: '面向多节点靶场的探测、利用与横向移动智能体。',
    capabilityTags: ['资产探测', '凭证复用', '横向移动'],
    successRate: '73%',
    compatibleTaskTypes: ['enterprise-lateral', 'web-exploit'],
    recommendationReason: '历史横向移动成功率较高，支持受控入口探测。',
  },
  {
    id: 'greybox-exploit-agent',
    name: '灰盒漏洞利用智能体',
    mode: 'Grey-box',
    description: '面向漏洞沙箱的 PoC 生成与目标验证智能体。',
    capabilityTags: ['漏洞利用', 'PoC 生成', '目标验证'],
    successRate: '81%',
    compatibleTaskTypes: ['web-exploit'],
    recommendationReason: '与漏洞沙箱任务匹配，支持 ExploitGym 输入输出格式。',
  },
  {
    id: 'whitebox-mining-agent',
    name: '白盒漏洞挖掘智能体',
    mode: 'White-box',
    description: '分析源码、定位漏洞并生成验证脚本。',
    capabilityTags: ['源码分析', '漏洞定位', '验证脚本'],
    successRate: '68%',
    compatibleTaskTypes: ['whitebox-mining'],
    recommendationReason: '支持白盒源码任务，能产出可执行验证脚本。',
  },
  {
    id: 'whitebox-patch-agent',
    name: '白盒漏洞修复智能体',
    mode: 'White-box',
    description: '生成修复补丁并执行功能与安全验证。',
    capabilityTags: ['补丁生成', '回归测试', '安全验证'],
    successRate: '76%',
    compatibleTaskTypes: ['patch-verify'],
    recommendationReason: '支持 PatchEval 修复验证流程，预计成本较低。',
  },
]

export const modelProfiles: ModelProfile[] = [
  {
    id: 'mock-internlm',
    name: 'Mock InternLM',
    provider: 'Local Mock',
    contextWindow: '128k',
    modelType: '通用安全推理',
    estimatedCost: '约 0.18 元 / 1k tokens',
    compatibleTaskTypes: ['enterprise-lateral', 'web-exploit', 'whitebox-mining', 'patch-verify'],
    recommendationReason: '上下文长度充足，覆盖本阶段全部 Mock 任务。',
  },
  {
    id: 'mock-qwen',
    name: 'Mock Qwen Security',
    provider: 'Local Mock',
    contextWindow: '64k',
    modelType: '灰盒利用',
    estimatedCost: '约 0.12 元 / 1k tokens',
    compatibleTaskTypes: ['web-exploit', 'patch-verify'],
    recommendationReason: '预计成本较低，适合漏洞利用和修复验证。',
  },
  {
    id: 'mock-deepseek',
    name: 'Mock DeepSeek Coder',
    provider: 'Local Mock',
    contextWindow: '64k',
    modelType: '代码分析',
    estimatedCost: '约 0.15 元 / 1k tokens',
    compatibleTaskTypes: ['whitebox-mining', 'patch-verify'],
    recommendationReason: '代码理解能力更强，适合白盒源码类任务。',
  },
]

export const defaultResourceMatches: Record<
  string,
  { environmentId: string; agentId: string; modelId: string }
> = {
  'enterprise-lateral': {
    environmentId: 'enterprise-lateral-range',
    agentId: 'blackbox-general-agent',
    modelId: 'mock-internlm',
  },
  'web-exploit': {
    environmentId: 'exploitgym-sandbox',
    agentId: 'greybox-exploit-agent',
    modelId: 'mock-internlm',
  },
  'whitebox-mining': {
    environmentId: 'cybergym-sandbox',
    agentId: 'whitebox-mining-agent',
    modelId: 'mock-internlm',
  },
  'patch-verify': {
    environmentId: 'patcheval-sandbox',
    agentId: 'whitebox-patch-agent',
    modelId: 'mock-internlm',
  },
}

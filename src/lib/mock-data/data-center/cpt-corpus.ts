import type { CptCorpusItem } from '@/types/data-center'

const types = ['漏洞描述', '漏洞原理', '攻击方法', '利用分析', '修复说明', '安全报告', '攻击链摘要', '专家知识', '演练过程摘要']
const sources = ['演练自动生成', 'CyberGym', 'ExploitGym', 'PatchEval', '漏洞数据库', '专家录入']

export const initialCptCorpus: CptCorpusItem[] = Array.from({ length: 10 }, (_, index) => ({
  id: `cpt-${String(index + 1).padStart(3, '0')}`,
  title: index === 0 ? '远程代码执行漏洞的常见成因与利用条件' : `安全领域语料样本 ${index + 1}`,
  type: types[index % types.length],
  source: sources[index % sources.length],
  language: index % 3 === 0 ? 'en-US' : 'zh-CN',
  tokenCount: 1200 + index * 360,
  qualityScore: 70 + (index % 5) * 5,
  desensitized: index % 4 !== 0,
  createdAt: `2026-07-${String(18 + index).padStart(2, '0')} 10:30`,
  status: index % 4 === 0 ? '候选' : index % 4 === 1 ? '已审核' : index % 4 === 2 ? '已入库' : '已废弃',
  body:
    index === 0
      ? 'A remote code execution vulnerability exists in a controlled benchmark service when untrusted input reaches a privileged execution boundary without adequate validation. This mock corpus describes root causes, preconditions, defensive observations, and remediation patterns without including a working exploit payload.'
      : '该语料为安全领域持续预训练候选文本，抽象描述漏洞成因、影响范围、验证线索和修复经验，不包含可直接用于恶意利用的完整载荷。',
  relatedVulnerability: index % 2 === 0 ? `CVE:CVE-2024-${String(1000 + index).padStart(4, '0')}:a8f9c${index}` : undefined,
  relatedRunId: index % 3 === 0 ? 'RR-20260728-CYBER-001' : undefined,
  relatedTraceId: index % 2 === 1 ? `trace-${String(index + 1).padStart(3, '0')}` : undefined,
  tags: ['security', types[index % types.length]],
}))

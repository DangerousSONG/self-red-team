import type { VulnerabilityRecord } from '@/types/vulnerability'

const sourceNames = ['Nvd', 'Osv', 'GitHubAdvisory', 'CyberGym', 'ExploitGym', 'RangeRun'] as const

export const initialVulnerabilityRecords: VulnerabilityRecord[] = Array.from({ length: 15 }, (_, index) => {
  const hasCve = index % 3 !== 1
  const cve = hasCve ? `CVE-2024-${String(1000 + index).padStart(4, '0')}` : ''
  const source = sourceNames[index % sourceNames.length]
  const originId = hasCve ? cve : `${source}-MOCK-${index + 1}`

  return {
    uuid: hasCve
      ? `CVE:${cve}:a8f9c${index.toString(16)}`
      : `${source}:${originId}:b7e4d${index.toString(16)}`,
    description:
      index % 2 === 0
        ? 'Mock vulnerability record describing unsafe input handling in a controlled benchmark service.'
        : 'Mock 漏洞记录：受控沙箱中的路径校验不足，可能导致越权读取测试文件。',
    datePublished: `2024-${String((index % 9) + 1).padStart(2, '0')}-01T00:00:00Z`,
    dateUpdated: `2026-07-${String((index % 20) + 1).padStart(2, '0')}T00:00:00Z`,
    relations: hasCve
      ? [
          {
            type: 'alias',
            origin: originId,
            cve,
          },
        ]
      : [],
    extra: {
      severity: ['Low', 'Medium', 'High', 'Critical'][index % 4],
      cwe: ['CWE-79', 'CWE-89', 'CWE-22', 'CWE-787'][index % 4],
      sandboxStatus: index % 2 === 0 ? '已生成沙箱' : '未生成沙箱',
      fromExercise: source === 'RangeRun' || source === 'CyberGym' || source === 'ExploitGym',
      benchmark: source === 'CyberGym' || source === 'ExploitGym' ? source : undefined,
      sandboxId: index % 2 === 0 ? `sandbox-${index + 1}` : undefined,
      sources: [
        {
          name: source,
          originId,
          data: {
            title: `Mock vulnerability ${index + 1}`,
            score: 5 + (index % 5),
            references: [`https://example.invalid/vuln/${index + 1}`],
          },
        },
      ],
    },
  }
})

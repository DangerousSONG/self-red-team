import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'

interface CptCorpusPageProps {
  onOpenCorpus: (id: string) => void
}

export function CptCorpusPage({ onOpenCorpus }: CptCorpusPageProps) {
  const { cptCorpus } = useDataCenter()

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div>
          <Badge variant="outline">
            <FileText className="h-3.5 w-3.5" />
            CPT Corpus
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold">CPT 语料库</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">沉淀漏洞知识、攻击方法、修复经验与安全领域语料</p>
        </div>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                <tr>
                  {['Corpus ID', '标题', '语料类型', '来源', '语言', 'Token 数', '质量评分', '脱敏状态', '创建时间', '状态', '操作'].map((item) => <th key={item} className="px-3 py-2">{item}</th>)}
                </tr>
              </thead>
              <tbody>
                {cptCorpus.map((item) => (
                  <tr key={item.id} className="border-t border-[var(--color-border)]">
                    <td className="px-3 py-3 font-mono text-xs">{item.id}</td>
                    <td className="px-3 py-3 font-semibold">{item.title}</td>
                    <td className="px-3 py-3">{item.type}</td>
                    <td className="px-3 py-3">{item.source}</td>
                    <td className="px-3 py-3">{item.language}</td>
                    <td className="px-3 py-3">{item.tokenCount}</td>
                    <td className="px-3 py-3 text-[var(--color-brand)]">{item.qualityScore}</td>
                    <td className="px-3 py-3">{item.desensitized ? '已脱敏' : '未脱敏'}</td>
                    <td className="px-3 py-3">{item.createdAt}</td>
                    <td className="px-3 py-3"><Badge variant={item.status.includes('候选') ? 'warning' : 'success'}>{item.status}</Badge></td>
                    <td className="px-3 py-3"><Button size="sm" variant="secondary" onClick={() => onOpenCorpus(item.id)}>查看详情</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

import { ArrowLeft, Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'

interface CptCorpusDetailPageProps {
  id: string
  onNavigate: (id: string) => void
}

export function CptCorpusDetailPage({ id, onNavigate }: CptCorpusDetailPageProps) {
  const { cptCorpus } = useDataCenter()
  const item = cptCorpus.find((corpus) => corpus.id === id) ?? cptCorpus[0]

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1200px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">Corpus Detail</Badge>
            <h1 className="mt-2 text-2xl font-semibold">{item.title}</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">CPT 语料不是问答数据，而是用于持续预训练的领域文本。</p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('cpt')}>
            <ArrowLeft className="h-4 w-4" />
            返回语料库
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Info label="来源" value={item.source} />
          <Info label="关联漏洞" value={item.relatedVulnerability ?? '-'} />
          <Info label="关联 Run" value={item.relatedRunId ?? '-'} />
          <Info label="关联轨迹" value={item.relatedTraceId ?? '-'} />
          <Info label="Token 数" value={String(item.tokenCount)} />
          <Info label="数据质量" value={String(item.qualityScore)} />
          <Info label="脱敏记录" value={item.desensitized ? '已脱敏' : '未脱敏'} />
          <Info label="审核状态" value={item.status} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>正文</CardTitle>
              <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(item.body)}>
                <Copy className="h-4 w-4" />
                复制
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <article className="rounded-lg border border-[var(--color-border)] bg-white p-4 text-sm leading-7 text-[var(--color-ink-secondary)]">
              {item.body}
            </article>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold">{value}</div>
    </div>
  )
}

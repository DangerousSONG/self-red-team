import type { ReactNode } from 'react'
import { Database, FileText, Route, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'

interface DataCenterPageProps {
  onNavigate: (id: string) => void
}

export function DataCenterPage({ onNavigate }: DataCenterPageProps) {
  const { trajectoryDatasets, traces, cptCorpus, vulnerabilityRecords, results } = useDataCenter()
  const pending = results.filter((item) => item.dataDispositionStatus === 'unhandled').length

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1450px] space-y-5 pb-8">
        <div>
          <Badge variant="outline">
            <Database className="h-3.5 w-3.5" />
            Data Center
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold">数据中心</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">沉淀评测运行产生的轨迹、CPT 语料和漏洞数据资产</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="轨迹数据集数量" value={String(trajectoryDatasets.length)} />
          <Stat label="轨迹总条数" value={String(traces.length)} />
          <Stat label="CPT 语料条数" value={String(cptCorpus.length)} />
          <Stat label="漏洞记录数量" value={String(vulnerabilityRecords.length)} />
          <Stat label="本周新增" value="18" tone="success" />
          <Stat label="待处理数据" value={String(pending)} tone="warning" />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <EntryCard
            icon={<Route className="h-5 w-5" />}
            title="轨迹数据集"
            description="管理攻防演练、Benchmark 评测和 Agent 执行过程中生成的轨迹数据。"
            stats={`${trajectoryDatasets.length} 个数据集 / ${traces.length} 条轨迹`}
            onClick={() => onNavigate('trajectories')}
          />
          <EntryCard
            icon={<FileText className="h-5 w-5" />}
            title="CPT 语料库"
            description="沉淀漏洞知识、攻击方法、修复经验与安全领域语料。"
            stats={`${cptCorpus.length} 条语料 / 候选与已审核`}
            onClick={() => onNavigate('cpt')}
          />
          <EntryCard
            icon={<ShieldAlert className="h-5 w-5" />}
            title="漏洞数据"
            description="统一管理来自 NVD、OSV、GitHub Advisory、演练和 Benchmark 的漏洞记录。"
            stats={`${vulnerabilityRecords.length} 条漏洞记录`}
            onClick={() => onNavigate('vulnerabilities')}
          />
        </div>
      </div>
    </main>
  )
}

function EntryCard({
  icon,
  title,
  description,
  stats,
  onClick,
}: {
  icon: ReactNode
  title: string
  description: string
  stats: string
  onClick: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-[var(--color-brand)]">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="min-h-[72px] text-sm leading-6 text-[var(--color-ink-secondary)]">{description}</p>
        <div className="mt-3 rounded-lg bg-[var(--color-surface-muted)] px-3 py-2 text-sm font-semibold">{stats}</div>
        <Button className="mt-4 w-full" onClick={onClick}>进入</Button>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, tone = 'brand' }: { label: string; value: string; tone?: 'brand' | 'success' | 'warning' }) {
  const color = tone === 'success' ? 'text-[var(--color-success)]' : tone === 'warning' ? 'text-[var(--color-warning)]' : 'text-[var(--color-brand)]'
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
        <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

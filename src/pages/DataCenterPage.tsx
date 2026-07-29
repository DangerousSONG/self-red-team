import type { ReactNode } from 'react'
import { Database, FileText, Route, ShieldAlert, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'

interface DataCenterPageProps {
  onNavigate: (id: string) => void
}

export function DataCenterPage({ onNavigate }: DataCenterPageProps) {
  const { trajectoryDatasets, cptDatasets, vulnerabilityDatasets, benchmarkDatasets, traces, cptCorpus, vulnerabilityRecords, benchmarkTasks, results, trainingJobs } = useDataCenter()
  const pending = results.filter((item) => item.dataDispositionStatus === 'unhandled').length
  const trainingActive = trainingJobs.filter((item) => ['queued', 'preparing', 'running', 'evaluating'].includes(item.status)).length
  const weeklyAdded =
    trajectoryDatasets.length +
    cptDatasets.reduce((sum, item) => sum + item.weeklyAdded, 0) +
    vulnerabilityDatasets.reduce((sum, item) => sum + item.weeklyAdded, 0) +
    benchmarkDatasets.reduce((sum, item) => sum + item.weeklyAdded, 0)

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1450px] space-y-5 pb-8">
        <div>
          <Badge variant="outline">
            <Database className="h-3.5 w-3.5" />
            Data Center
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold">数据中心</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">以数据集为单位管理评测轨迹、CPT 语料、漏洞数据和 Benchmark 数据资产</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
          <Stat label="轨迹数据集数量" value={String(trajectoryDatasets.length)} />
          <Stat label="CPT 语料集数量" value={String(cptDatasets.length)} />
          <Stat label="漏洞数据集数量" value={String(vulnerabilityDatasets.length)} />
          <Stat label="Benchmark 数据集数量" value={String(benchmarkDatasets.length)} />
          <Stat label="本周新增" value={String(weeklyAdded)} tone="success" />
          <Stat label="训练中任务" value={String(trainingActive)} tone="warning" />
          <Stat label="待处理数据" value={String(pending)} tone="warning" />
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <EntryCard
            icon={<Route className="h-5 w-5" />}
            title="轨迹数据集"
            description="管理场景演练、基准评测和 Agent 执行过程中生成的轨迹数据。"
            datasetCount={trajectoryDatasets.length}
            recordCount={traces.length}
            weeklyAdded={trajectoryDatasets.length}
            updatedAt={latest(trajectoryDatasets.map((item) => item.updatedAt))}
            onClick={() => onNavigate('trajectories')}
          />
          <EntryCard
            icon={<FileText className="h-5 w-5" />}
            title="CPT 语料库"
            description="管理漏洞知识、攻击方法、修复经验与安全领域持续预训练语料。"
            datasetCount={cptDatasets.length}
            recordCount={cptCorpus.length}
            weeklyAdded={cptDatasets.reduce((sum, item) => sum + item.weeklyAdded, 0)}
            updatedAt={latest(cptDatasets.map((item) => item.updatedAt))}
            onClick={() => onNavigate('cpt')}
          />
          <EntryCard
            icon={<ShieldAlert className="h-5 w-5" />}
            title="漏洞数据"
            description="统一管理来自公开数据源、基准评测与场景演练的漏洞数据资产。"
            datasetCount={vulnerabilityDatasets.length}
            recordCount={vulnerabilityRecords.length}
            weeklyAdded={vulnerabilityDatasets.reduce((sum, item) => sum + item.weeklyAdded, 0)}
            updatedAt={latest(vulnerabilityDatasets.map((item) => item.updatedAt))}
            onClick={() => onNavigate('vulnerabilities')}
          />
          <EntryCard
            icon={<Target className="h-5 w-5" />}
            title="Benchmark 数据集"
            description="管理用于漏洞挖掘、漏洞利用和漏洞修复能力评测的标准基准数据。"
            datasetCount={benchmarkDatasets.length}
            recordCount={benchmarkTasks.length}
            weeklyAdded={benchmarkDatasets.reduce((sum, item) => sum + item.weeklyAdded, 0)}
            updatedAt={latest(benchmarkDatasets.map((item) => item.updatedAt))}
            onClick={() => onNavigate('benchmarks')}
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
  datasetCount,
  recordCount,
  weeklyAdded,
  updatedAt,
  onClick,
}: {
  icon: ReactNode
  title: string
  description: string
  datasetCount: number
  recordCount: number
  weeklyAdded: number
  updatedAt: string
  onClick: () => void
}) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-panel)]">
      <CardHeader>
        <div className="flex items-center gap-2 text-[var(--color-brand)]">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="min-h-[72px] text-sm leading-6 text-[var(--color-ink-secondary)]">{description}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Mini label="数据集数量" value={`${datasetCount} 个`} />
          <Mini label="记录总量" value={`${recordCount} 条`} />
          <Mini label="本周新增" value={`${weeklyAdded} 条`} />
          <Mini label="最近更新" value={updatedAt} />
        </div>
        <Button className="mt-4" variant="secondary" onClick={onClick}>进入</Button>
      </CardContent>
    </Card>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--color-surface-muted)] px-3 py-2">
      <div className="text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold">{value}</div>
    </div>
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

function latest(values: string[]) {
  return values.sort().at(-1) ?? '-'
}

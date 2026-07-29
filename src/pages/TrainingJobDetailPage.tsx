import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Boxes, StopCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatasetToast } from '@/components/datasets/DatasetComponents'
import { useDataCenter } from '@/hooks/useDataCenter'
import { methodText, stageText, StatusBadge } from '@/pages/TrainingJobsPage'
import type { TrainingCheckpoint, TrainingMetricSeries } from '@/types/training'

interface TrainingJobDetailPageProps {
  jobId: string
  focusSection?: 'overview' | 'data' | 'artifact'
  onNavigate: (id: string) => void
  onOpenCpt: (id: string) => void
  onOpenVulnerability: (id: string) => void
  onOpenArtifact: (id: string) => void
}

const metricGroups = [
  { title: '训练效果', category: 'training_effect', keys: ['rollout/raw_reward', 'rollout/truncated_ratio', 'rollout/response_len/min'] },
  { title: '数据质量', category: 'data_quality', keys: ['fetched/reward'] },
  { title: '训练稳定性', category: 'training_stability', keys: ['train/ppo_kl', 'train/pg_clipfrac', 'train/entropy_loss'] },
  { title: '训练效率', category: 'training_efficiency', keys: ['perf/wait_time_ratio', 'perf/train_wait_time'] },
] as const

export function TrainingJobDetailPage({ jobId, focusSection = 'overview', onNavigate, onOpenCpt, onOpenVulnerability, onOpenArtifact }: TrainingJobDetailPageProps) {
  const {
    trainingJobs,
    checkpoints,
    trainingLogs,
    modelArtifacts,
    stopTrainingJob,
    advanceTrainingJob,
    createCheckpoint,
    completeTrainingJob,
  } = useDataCenter()
  const job = trainingJobs.find((item) => item.id === jobId) ?? trainingJobs[0]
  const jobCheckpoints = useMemo(() => checkpoints.filter((item) => item.trainingJobId === job.id), [checkpoints, job.id])
  const logs = useMemo(() => trainingLogs.filter((item) => item.trainingJobId === job.id), [trainingLogs, job.id])
  const artifact = modelArtifacts.find((item) => item.id === job.artifactId)
  const [stepRange, setStepRange] = useState<'100' | '500' | 'all'>('100')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (job.status !== 'running') return undefined
    const timer = window.setInterval(() => advanceTrainingJob(job.id), 3200)
    return () => window.clearInterval(timer)
  }, [advanceTrainingJob, job.id, job.status])

  useEffect(() => {
    if (focusSection === 'overview') return
    const timer = window.setTimeout(() => {
      document.getElementById(`training-section-${focusSection}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [focusSection, job.id])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
              <button className="hover:text-[var(--color-brand)]" onClick={() => onNavigate('home')}>运行总览</button>
              <span>/</span>
              <button className="hover:text-[var(--color-brand)]" onClick={() => onNavigate('training')}>基模训练</button>
              <span>/</span>
              <span className="font-mono">{job.id}</span>
            </div>
            <Badge variant="outline">Training Detail</Badge>
            <h1 className="mt-2 text-2xl font-semibold">{job.name}</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">{job.id} / {job.baseModel} / {methodText(job.trainingMethod)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => onNavigate('training')}><ArrowLeft className="h-4 w-4" />返回列表</Button>
            {!['completed', 'failed', 'stopped'].includes(job.status) ? <Button variant="secondary" onClick={() => { stopTrainingJob(job.id); showToast('任务已停止') }}><StopCircle className="h-4 w-4" />停止任务</Button> : null}
            <Button variant="secondary" onClick={() => createCheckpoint(job.id)}>保存 Checkpoint</Button>
            <Button variant="secondary" onClick={() => {
              const output = completeTrainingJob(job.id)
              if (output) showToast('模型产物生成完成')
            }}>生成产物</Button>
            {artifact ? <Button onClick={() => onOpenArtifact(artifact.id)}><Boxes className="h-4 w-4" />查看模型产物</Button> : null}
          </div>
        </div>

        <Card className="border-[var(--color-brand)]/20 bg-gradient-to-br from-white via-[#f7f9fd] to-[var(--color-brand-soft)]">
          <CardContent className="grid gap-3 p-4 md:grid-cols-4 xl:grid-cols-8">
            <Info label="Training ID" value={job.id} />
            <Info label="状态" value={<StatusBadge status={job.status} />} />
            <Info label="进度" value={`${job.progress}%`} />
            <Info label="当前阶段" value={stageText(job.stage)} />
            <Info label="开始时间" value={job.startedAt ?? '-'} />
            <Info label="已运行时间" value={job.elapsed} />
            <Info label="预计剩余" value={job.eta} />
            <Info label="数据规模" value={job.dataScale} />
          </CardContent>
        </Card>

        <Section title="训练进度">
          <div className="grid gap-3 xl:grid-cols-4">
            {job.stageStates.map((item, index) => (
              <div key={item.stage} className={`rounded-lg border p-3 ${item.status === 'running' ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]' : 'border-[var(--color-border)] bg-white'}`}>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={item.status === 'completed' ? 'success' : item.status === 'running' ? 'default' : item.status === 'failed' ? 'danger' : 'muted'}>{item.status}</Badge>
                  <span className="text-xs text-[var(--color-ink-muted)]">Step {index + 1}</span>
                </div>
                <div className="mt-2 font-semibold">{stageText(item.stage)}</div>
                <p className="mt-1 min-h-[44px] text-xs leading-5 text-[var(--color-ink-secondary)]">{item.note}</p>
                <div className="mt-2 text-xs text-[var(--color-ink-muted)]">{item.startedAt ?? '-'} / {item.duration ?? '-'}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="训练指标" action={(
          <select className="h-9 rounded-md border border-[var(--color-border-strong)] bg-white px-3 text-sm" value={stepRange} onChange={(event) => setStepRange(event.target.value as '100' | '500' | 'all')}>
            <option value="100">最近 100 steps</option>
            <option value="500">最近 500 steps</option>
            <option value="all">全部</option>
          </select>
        )}>
          <div className="space-y-4">
            <EfficiencyCards />
            {metricGroups.map((group) => (
              <Card key={group.title}>
                <CardHeader><CardTitle>{group.title}</CardTitle></CardHeader>
                <CardContent className="grid gap-4 xl:grid-cols-2">
                  {seriesForGroup(job.metrics, group.category, stepRange).map((series) => <MetricChart key={series.key} series={series} />)}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="training-section-data" title="数据使用情况">
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                    <tr>{['数据集', '类型', '版本', '文档 / 记录数', 'Token 数', '质量', '采样权重', '实际使用比例'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
                  </thead>
                  <tbody>
                    {job.datasets.map((dataset) => (
                      <tr key={dataset.datasetId} className="border-t border-[var(--color-border)]">
                        <td className="px-3 py-3"><button className="font-semibold text-[var(--color-brand)]" onClick={() => dataset.datasetType === 'cpt' ? onOpenCpt(dataset.datasetId) : onOpenVulnerability(dataset.datasetId)}>{dataset.datasetName}</button></td>
                        <td className="px-3 py-3">{dataset.datasetType === 'cpt' ? 'CPT 语料库' : '漏洞数据'}</td>
                        <td className="px-3 py-3">{dataset.version}</td>
                        <td className="px-3 py-3">{dataset.recordCount}</td>
                        <td className="px-3 py-3">{dataset.tokenCount?.toLocaleString() ?? '-'}</td>
                        <td className="px-3 py-3 text-[var(--color-success)]">{dataset.qualityScore}</td>
                        <td className="px-3 py-3">{Math.round((dataset.samplingWeight ?? 0) * 100)}%</td>
                        <td className="px-3 py-3">78%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-4">
                <Info label="原始记录数" value={String(job.dataUsage.rawRecords)} />
                <Info label="清洗后记录数" value={String(job.dataUsage.cleanedRecords)} />
                <Info label="去重后记录数" value={String(job.dataUsage.dedupedRecords)} />
                <Info label="实际使用记录数" value={String(job.dataUsage.usedRecords)} />
                <Info label="数据淘汰率" value={job.dataUsage.eliminationRate} />
                {job.dataUsage.sourceShare.map((item) => <Info key={item.label} label={item.label} value={item.value} />)}
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="基准评测">
          <div className="grid gap-4 xl:grid-cols-3">
            {job.benchmarkComparisons.map((comparison) => (
              <Card key={comparison.benchmark}>
                <CardHeader><CardTitle>{comparison.benchmark}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {comparison.metrics.map((metric) => (
                    <div key={metric.name} className="rounded-lg border border-[var(--color-border)] p-3">
                      <div className="text-sm font-semibold">{metric.name}</div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <Info label="训练前" value={String(metric.before)} />
                        <Info label="Checkpoint" value={String(metric.checkpoint)} />
                        <Info label="训练后" value={`${metric.after} (+${metric.after - metric.before})`} />
                      </div>
                      <Bar before={metric.before} checkpoint={metric.checkpoint} after={metric.after} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Checkpoint">
          <CheckpointTable checkpoints={jobCheckpoints} />
        </Section>

        <Section title="运行日志">
          <Card>
            <CardContent className="max-h-[300px] space-y-2 overflow-y-auto p-3">
              {logs.map((log) => (
                <div key={log.id} className="grid gap-2 rounded-lg border border-[var(--color-border)] bg-white p-2 text-sm md:grid-cols-[90px_160px_80px_1fr]">
                  <span className="font-mono text-xs text-[var(--color-ink-muted)]">{log.time}</span>
                  <span>{stageText(log.stage)}</span>
                  <Badge variant={log.level === 'SUCCESS' ? 'success' : log.level === 'WARN' ? 'warning' : log.level === 'ERROR' ? 'danger' : 'muted'}>{log.level}</Badge>
                  <span>{log.message}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>

        <Section id="training-section-artifact" title="模型产物">
          {artifact ? (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-semibold">{artifact.name}</div>
                  <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">{artifact.id} / {artifact.modelSize} / {artifact.status}</p>
                </div>
                <Button onClick={() => onOpenArtifact(artifact.id)}>查看详情</Button>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="p-4 text-sm text-[var(--color-ink-secondary)]">当前任务尚未生成模型产物。</CardContent></Card>
          )}
        </Section>
      </div>
      <DatasetToast message={toast} />
    </main>
  )
}

function seriesForGroup(metrics: TrainingMetricSeries[], category: string, stepRange: '100' | '500' | 'all') {
  const filtered = metrics.filter((series) => series.category === category)
  if (stepRange === 'all') return filtered
  const windowSize = Number(stepRange)
  return filtered.map((series) => {
    const maxStep = series.points.at(-1)?.step ?? 0
    return { ...series, points: series.points.filter((point) => point.step >= maxStep - windowSize) }
  })
}

function MetricChart({ series }: { series: TrainingMetricSeries }) {
  const values = series.points.map((point) => point.value)
  const current = values.at(-1) ?? 0
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)
  const status = series.key.includes('wait') && current > avg ? '关注' : series.key.includes('kl') && current > 0.05 ? '关注' : '正常'
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{series.name}</div>
          <div className="mt-1 text-xs text-[var(--color-ink-muted)]">x-axis: {series.xAxis}</div>
        </div>
        <Badge variant={status === '正常' ? 'success' : 'warning'}>{status}</Badge>
      </div>
      <p className="mt-2 min-h-[40px] text-xs leading-5 text-[var(--color-ink-secondary)]">{series.description}</p>
      {series.points.length ? <LineSvg points={series.points.map((point) => point.value)} /> : <div className="mt-3 h-32 rounded bg-[var(--color-surface-muted)] text-center text-sm">暂无指标</div>}
      <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
        <Info label="当前值" value={current.toFixed(3)} />
        <Info label="最小值" value={min.toFixed(3)} />
        <Info label="最大值" value={max.toFixed(3)} />
        <Info label="平均值" value={avg.toFixed(3)} />
      </div>
    </div>
  )
}

function LineSvg({ points }: { points: number[] }) {
  const width = 420
  const height = 120
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const d = points.map((value, index) => {
    const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width
    const y = height - ((value - min) / span) * (height - 18) - 9
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg className="mt-3 h-32 w-full rounded-lg bg-[var(--color-surface-muted)]" viewBox={`0 0 ${width} ${height}`} role="img">
      <path d={d} fill="none" stroke="#1a5fbf" strokeWidth="3" />
      {points.map((value, index) => {
        const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width
        const y = height - ((value - min) / span) * (height - 18) - 9
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="3" fill="#16a34a"><title>{value.toFixed(3)}</title></circle>
      })}
    </svg>
  )
}

function EfficiencyCards() {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      <Info label="samples / second" value="18.4" />
      <Info label="tokens / second" value="12.8k" />
      <Info label="step time" value="68s" />
      <Info label="GPU utilization" value="72%" />
      <Info label="waiting ratio" value="18%" />
    </div>
  )
}

function CheckpointTable({ checkpoints }: { checkpoints: TrainingCheckpoint[] }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>{['Checkpoint ID', 'Train Step', '创建时间', '模型大小', '训练 Loss', 'Raw Reward', 'Benchmark Score', '状态', '操作'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
          </thead>
          <tbody>
            {checkpoints.map((checkpoint) => (
              <tr key={checkpoint.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-3 font-mono text-xs">{checkpoint.id}</td>
                <td className="px-3 py-3">{checkpoint.trainStep}</td>
                <td className="px-3 py-3">{checkpoint.createdAt}</td>
                <td className="px-3 py-3">{checkpoint.modelSize}</td>
                <td className="px-3 py-3">{checkpoint.trainingLoss}</td>
                <td className="px-3 py-3">{checkpoint.rawReward}</td>
                <td className="px-3 py-3">{checkpoint.benchmarkScore}</td>
                <td className="px-3 py-3">{checkpoint.status}</td>
                <td className="px-3 py-3"><Button size="sm" variant="ghost">查看指标</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function Bar({ before, checkpoint, after }: { before: number; checkpoint: number; after: number }) {
  return (
    <div className="mt-3 space-y-1">
      {[['训练前', before], ['Checkpoint', checkpoint], ['训练后', after]].map(([label, value]) => (
        <div key={label as string} className="grid grid-cols-[90px_1fr_40px] items-center gap-2 text-xs">
          <span>{label}</span>
          <div className="h-2 rounded bg-[var(--color-surface-muted)]"><div className="h-2 rounded bg-[var(--color-brand)]" style={{ width: `${value}%` }} /></div>
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}

function Section({ id, title, action, children }: { id?: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2">
      <div className="text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold">{value}</div>
    </div>
  )
}

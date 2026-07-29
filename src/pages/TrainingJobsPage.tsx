import { useMemo, useState } from 'react'
import { Brain, Boxes, Eye, ListChecks, PackageOpen, Square, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DatasetToast } from '@/components/datasets/DatasetComponents'
import { useDataCenter } from '@/hooks/useDataCenter'
import type { TrainingJob } from '@/types/training'

interface TrainingJobsPageProps {
  onOpenJob: (jobId: string, section?: 'overview' | 'data' | 'artifact') => void
  onOpenArtifact: (artifactId: string) => void
  onOpenArtifacts: () => void
}

export function TrainingJobsPage({ onOpenJob, onOpenArtifact, onOpenArtifacts }: TrainingJobsPageProps) {
  const { trainingJobs, modelArtifacts, stopTrainingJob, deleteTrainingJob } = useDataCenter()
  const [toast, setToast] = useState('')
  const stats = useMemo(() => ({
    total: trainingJobs.length,
    queued: trainingJobs.filter((item) => item.status === 'queued').length,
    running: trainingJobs.filter((item) => item.status === 'running').length,
    completed: trainingJobs.filter((item) => item.status === 'completed').length,
    failed: trainingJobs.filter((item) => item.status === 'failed').length,
    artifacts: modelArtifacts.length,
  }), [modelArtifacts.length, trainingJobs])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">
              <Brain className="h-3.5 w-3.5" />
              Base Model Training
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold">基模训练</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">查看安全领域数据驱动的持续预训练任务与模型产物</p>
          </div>
          <div className="flex rounded-lg border border-[var(--color-border)] bg-white p-1">
            <Button size="sm" variant="default"><ListChecks className="h-4 w-4" />训练任务</Button>
            <Button size="sm" variant="ghost" onClick={onOpenArtifacts}><Boxes className="h-4 w-4" />模型产物</Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="训练任务总数" value={stats.total} />
          <Stat label="排队中" value={stats.queued} tone="warning" />
          <Stat label="训练中" value={stats.running} tone="brand" />
          <Stat label="已完成" value={stats.completed} tone="success" />
          <Stat label="已失败" value={stats.failed} tone="danger" />
          <Stat label="模型产物数" value={stats.artifacts} tone="success" />
        </div>

        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                <tr>
                  {['Training ID', '任务名称', '基础模型', '训练方式', 'CPT 数据集', '漏洞数据集', '状态', '当前进度', '当前阶段', '已运行时间', '预计剩余时间', '创建时间', '操作'].map((item) => <th key={item} className="px-3 py-2">{item}</th>)}
                </tr>
              </thead>
              <tbody>
                {trainingJobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    onOpenJob={onOpenJob}
                    onOpenArtifact={onOpenArtifact}
                    onDelete={() => {
                      deleteTrainingJob(job.id)
                      showToast('训练任务已删除')
                    }}
                    onStop={() => {
                      stopTrainingJob(job.id)
                      showToast('任务已停止')
                    }}
                  />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <DatasetToast message={toast} />
    </main>
  )
}

function JobRow({
  job,
  onOpenJob,
  onOpenArtifact,
  onDelete,
  onStop,
}: {
  job: TrainingJob
  onOpenJob: (jobId: string, section?: 'overview' | 'data' | 'artifact') => void
  onOpenArtifact: (artifactId: string) => void
  onDelete: () => void
  onStop: () => void
}) {
  const cptCount = job.datasets.filter((item) => item.datasetType === 'cpt').length
  const vulnCount = job.datasets.filter((item) => item.datasetType === 'vulnerability').length
  const deletable = ['completed', 'failed', 'stopped'].includes(job.status)
  return (
    <tr className="border-t border-[var(--color-border)]">
      <td className="px-3 py-3 font-mono text-xs">{job.id}</td>
      <td className="px-3 py-3 font-semibold">{job.name}</td>
      <td className="px-3 py-3">{job.baseModel}</td>
      <td className="px-3 py-3">{methodText(job.trainingMethod)}</td>
      <td className="px-3 py-3">{cptCount} 个</td>
      <td className="px-3 py-3">{vulnCount} 个</td>
      <td className="px-3 py-3"><StatusBadge status={job.status} /></td>
      <td className="px-3 py-3">{job.progress}%</td>
      <td className="px-3 py-3">{stageText(job.stage)}</td>
      <td className="px-3 py-3">{job.elapsed}</td>
      <td className="px-3 py-3">{job.eta}</td>
      <td className="px-3 py-3">{job.createdAt}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Button size="sm" variant="secondary" onClick={() => onOpenJob(job.id, 'overview')}>
            <Eye className="h-3.5 w-3.5" />
            详情
          </Button>
          {deletable ? (
            <Button size="sm" variant="ghost" className="text-[var(--color-danger)] hover:bg-red-50 hover:text-[var(--color-danger)]" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              删除
            </Button>
          ) : null}
          {!['completed', 'failed', 'stopped'].includes(job.status) ? (
            <Button size="sm" variant="ghost" onClick={onStop}>
              <Square className="h-3.5 w-3.5" />
              停止
            </Button>
          ) : null}
          {job.artifactId ? (
            <Button size="sm" variant="ghost" onClick={() => onOpenArtifact(job.artifactId!)}>
              <PackageOpen className="h-3.5 w-3.5" />
              产物
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

export function StatusBadge({ status }: { status: TrainingJob['status'] }) {
  const tone = status === 'completed' ? 'success' : status === 'failed' || status === 'stopped' ? 'danger' : status === 'queued' || status === 'evaluating' || status === 'preparing' ? 'warning' : 'default'
  return <Badge variant={tone}>{statusText(status)}</Badge>
}

export function stageText(stage: TrainingJob['stage']) {
  return {
    data_validation: '数据校验',
    data_preprocessing: '数据预处理',
    data_loading: '数据加载',
    rollout: 'Rollout',
    training: '模型训练',
    checkpoint: 'Checkpoint 保存',
    benchmark_evaluation: '基准评测',
    artifact_generation: '产物生成',
  }[stage]
}

export function methodText(method: TrainingJob['trainingMethod']) {
  return method === 'cpt' ? 'CPT 持续预训练' : 'CPT + 漏洞知识增强'
}

export function statusText(status: TrainingJob['status']) {
  return {
    draft: 'Draft',
    queued: 'Queued',
    preparing: 'Preparing',
    running: 'Running',
    evaluating: 'Evaluating',
    completed: 'Completed',
    failed: 'Failed',
    stopped: 'Stopped',
  }[status]
}

function Stat({ label, value, tone = 'brand' }: { label: string; value: number; tone?: 'brand' | 'success' | 'warning' | 'danger' }) {
  const color = {
    brand: 'text-[var(--color-brand)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    danger: 'text-[var(--color-danger)]',
  }[tone]
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
        <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

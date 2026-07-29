import { useMemo, useState } from 'react'
import { Brain, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDataCenter } from '@/hooks/useDataCenter'
import type { CptCorpusDataset, VulnerabilityDataset } from '@/types/dataset'
import type { TrainingJob } from '@/types/training'

interface TrainingLaunchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cptDatasets: CptCorpusDataset[]
  vulnerabilityDatasets: VulnerabilityDataset[]
  onCreated: (job: TrainingJob) => void
}

const baseModels = ['Shusheng-35B', 'InternLM-35B', 'InternLM-7B']
const benchmarkOptions = [
  ['bds-cybergym-001', 'CyberGym'],
  ['bds-exploitgym-001', 'ExploitGym'],
  ['bds-patcheval-001', 'PatchEval'],
  ['bds-internal-redteam-001', '自研综合评测集'],
]

export function TrainingLaunchDialog({
  open,
  onOpenChange,
  cptDatasets,
  vulnerabilityDatasets,
  onCreated,
}: TrainingLaunchDialogProps) {
  const { createTrainingJob } = useDataCenter()
  const [name, setName] = useState('安全领域基模持续预训练')
  const [baseModel, setBaseModel] = useState(baseModels[0])
  const [trainingMethod, setTrainingMethod] = useState<'cpt' | 'cpt_vulnerability_enhancement'>(
    vulnerabilityDatasets.length ? 'cpt_vulnerability_enhancement' : 'cpt',
  )
  const [benchmarks, setBenchmarks] = useState(['bds-cybergym-001'])
  const [note, setNote] = useState('使用已脱敏数据集进行 Mock 基模训练，训练后关联 Benchmark 对比。')

  const totals = useMemo(() => {
    const records =
      cptDatasets.reduce((sum, item) => sum + item.documentCount, 0) +
      vulnerabilityDatasets.reduce((sum, item) => sum + item.vulnerabilityCount, 0)
    const tokens =
      cptDatasets.reduce((sum, item) => sum + item.tokenTotal, 0) +
      vulnerabilityDatasets.reduce((sum, item) => sum + item.vulnerabilityCount * 520, 0)
    const qualityItems = [...cptDatasets, ...vulnerabilityDatasets]
    const quality = qualityItems.length
      ? Math.round(qualityItems.reduce((sum, item) => sum + item.qualityScore, 0) / qualityItems.length)
      : 0
    return { records, tokens, quality, size: `${Math.max(1, Math.round(tokens / 1800))} MB` }
  }, [cptDatasets, vulnerabilityDatasets])

  const toggleBenchmark = (id: string) => {
    setBenchmarks((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  }

  const create = () => {
    const job = createTrainingJob({
      name,
      baseModel,
      trainingMethod,
      benchmarkDatasetIds: benchmarks.length ? benchmarks : ['bds-cybergym-001'],
      note,
      cptDatasetIds: cptDatasets.map((dataset) => dataset.id),
      vulnerabilityDatasetIds: vulnerabilityDatasets.map((dataset) => dataset.id),
    })
    onOpenChange(false)
    onCreated(job)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>创建基模训练任务</DialogTitle>
          <DialogDescription>确认数据集、基础模型和评测 Benchmark，不展示复杂工程参数。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              训练任务名称
              <input className="mt-1 h-10 w-full rounded-md border border-[var(--color-border-strong)] px-3" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block text-sm font-medium">
                基础模型
                <select className="mt-1 h-10 w-full rounded-md border border-[var(--color-border-strong)] px-3" value={baseModel} onChange={(event) => setBaseModel(event.target.value)}>
                  {baseModels.map((model) => <option key={model} value={model}>{model}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">
                训练方式
                <select className="mt-1 h-10 w-full rounded-md border border-[var(--color-border-strong)] px-3" value={trainingMethod} onChange={(event) => setTrainingMethod(event.target.value as 'cpt' | 'cpt_vulnerability_enhancement')}>
                  <option value="cpt">CPT 持续预训练</option>
                  <option value="cpt_vulnerability_enhancement">CPT + 漏洞知识增强</option>
                </select>
              </label>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <div className="text-sm font-semibold">评测 Benchmark</div>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {benchmarkOptions.map(([id, label]) => (
                  <label key={id} className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm">
                    <input type="checkbox" checked={benchmarks.includes(id)} onChange={() => toggleBenchmark(id)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <label className="block text-sm font-medium">
              任务备注
              <textarea className="mt-1 min-h-[82px] w-full rounded-md border border-[var(--color-border-strong)] px-3 py-2" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
          </div>

          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-[var(--color-brand)]">
                <Brain className="h-4 w-4" />
                <span className="font-semibold">数据摘要</span>
              </div>
              <Mini label="已选 CPT 数据集" value={`${cptDatasets.length} 个`} />
              <Mini label="已选漏洞数据集" value={`${vulnerabilityDatasets.length} 个`} />
              <Mini label="记录总数" value={`${totals.records} 条`} />
              <Mini label="Token 估算" value={totals.tokens.toLocaleString()} />
              <Mini label="数据总大小" value={totals.size} />
              <Mini label="数据质量" value={`${totals.quality} / 100`} />
              <Mini label="脱敏状态" value="已脱敏" />
              <Mini label="数据版本" value="v1.0.0" />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button disabled={!name.trim() || (!cptDatasets.length && !vulnerabilityDatasets.length)} onClick={create}>
            <CheckCircle2 className="h-4 w-4" />
            创建训练任务
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2">
      <div className="text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}

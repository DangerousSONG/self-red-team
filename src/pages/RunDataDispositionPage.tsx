import { useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft, CheckCircle2, Database, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'
import { cn } from '@/lib/utils'

interface RunDataDispositionPageProps {
  runId: string
  onBackResult: (runId: string) => void
  onOpenDataset: (datasetId: string) => void
  onNavigate: (id: string) => void
}

const artifactCatalog = [
  ['Agent 行为轨迹', '18', '2.4 MB', '高', '是'],
  ['工具调用记录', '26', '1.7 MB', '中高', '否'],
  ['环境 observation', '34', '960 KB', '中高', '是'],
  ['攻击路径', '1', '180 KB', '高', '否'],
  ['Payload / PoC / Patch', '3', '420 KB', '中', '是'],
  ['漏洞记录', '1', '52 KB', '高', '否'],
  ['模型调用统计', '12', '310 KB', '中高', '否'],
  ['评测结果', '1', '76 KB', '高', '否'],
  ['证据索引', '8', '120 KB', '高', '否'],
]

const processingOptions = [
  '去除系统日志噪声',
  '合并连续工具调用',
  '保留失败轨迹',
  '保留模型响应',
  '脱敏密钥和账号',
  '生成任务级摘要',
  '生成回合级轨迹',
  '生成训练标签',
  '提取 CPT 候选语料',
  '提取漏洞记录',
]

export function RunDataDispositionPage({
  runId,
  onBackResult,
  onOpenDataset,
  onNavigate,
}: RunDataDispositionPageProps) {
  const { results, trajectoryDatasets, processRunData } = useDataCenter()
  const result = results.find((item) => item.runId === runId) ?? results[0]
  const [step, setStep] = useState(0)
  const [method, setMethod] = useState<'create' | 'append' | 'skip'>('create')
  const [selectedArtifacts, setSelectedArtifacts] = useState(() => artifactCatalog.map((item) => item[0]))
  const [datasetName, setDatasetName] = useState(`${result.taskName} 轨迹数据集`)
  const [datasetDescription, setDatasetDescription] = useState('由本次评测运行沉淀的脱敏轨迹、证据索引和安全数据产物。')
  const [targetDatasetId, setTargetDatasetId] = useState(trajectoryDatasets[0]?.id ?? '')
  const [options, setOptions] = useState(() => Object.fromEntries(processingOptions.map((item) => [item, true])))
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')

  const estimate = useMemo(() => {
    const rawEvents = selectedArtifacts.length * 42
    return {
      rawEvents,
      validTraces: method === 'skip' ? 0 : 8,
      traceRows: method === 'skip' ? 0 : 8,
      cptRows: options['提取 CPT 候选语料'] && method !== 'skip' ? 4 : 0,
      vulnerabilityRows: options['提取漏洞记录'] && method !== 'skip' ? 1 : 0,
    }
  }, [method, options, selectedArtifacts.length])

  const toggleArtifact = (name: string) => {
    setSelectedArtifacts((items) =>
      items.includes(name) ? items.filter((item) => item !== name) : [...items, name],
    )
  }

  const confirm = async () => {
    setProcessing(true)
    for (const label of ['读取运行产物', '执行脱敏与聚合', '写入数据中心', '更新报告状态']) {
      setProgress(label)
      await new Promise((resolve) => window.setTimeout(resolve, 360))
    }
    const output = processRunData({
      runId: result.runId,
      method,
      datasetName,
      datasetDescription,
      targetDatasetId,
      selectedArtifacts,
      options,
    })
    setProcessing(false)
    if (output.datasetId) {
      onOpenDataset(output.datasetId)
    } else {
      onNavigate('data-center')
    }
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1450px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline">
              <Database className="h-3.5 w-3.5" />
              Data Disposition
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold">处理运行数据</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">选择本次演练轨迹和安全数据的沉淀方式</p>
          </div>
          <Button variant="secondary" onClick={() => onBackResult(result.runId)}>
            <ArrowLeft className="h-4 w-4" />
            返回报告
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-4">
          {['选择数据产物', '选择处理方式', '数据加工选项', '确认处理'].map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left text-sm font-medium',
                step === index
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]'
                  : 'border-[var(--color-border)] bg-white text-[var(--color-ink-secondary)]',
              )}
            >
              Step {index + 1} / {label}
            </button>
          ))}
        </div>

        {step === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>选择数据产物</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                  <tr>
                    <th className="px-3 py-2">选中</th>
                    <th className="px-3 py-2">数据类型</th>
                    <th className="px-3 py-2">数量</th>
                    <th className="px-3 py-2">大小</th>
                    <th className="px-3 py-2">数据质量</th>
                    <th className="px-3 py-2">包含敏感信息</th>
                  </tr>
                </thead>
                <tbody>
                  {artifactCatalog.map(([name, count, size, quality, sensitive]) => (
                    <tr key={name} className="border-t border-[var(--color-border)]">
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={selectedArtifacts.includes(name)} onChange={() => toggleArtifact(name)} />
                      </td>
                      <td className="px-3 py-3 font-semibold">{name}</td>
                      <td className="px-3 py-3">{count}</td>
                      <td className="px-3 py-3">{size}</td>
                      <td className="px-3 py-3"><Badge variant={quality === '高' ? 'success' : 'default'}>{quality}</Badge></td>
                      <td className="px-3 py-3">{sensitive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>选择轨迹数据集处理方式</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 xl:grid-cols-3">
              <MethodCard active={method === 'create'} title="创建新的轨迹数据集" onClick={() => setMethod('create')}>
                <input className="mt-3 h-10 w-full rounded-md border border-[var(--color-border-strong)] px-3 text-sm" value={datasetName} onChange={(event) => setDatasetName(event.target.value)} />
                <textarea className="mt-2 min-h-[88px] w-full rounded-md border border-[var(--color-border-strong)] px-3 py-2 text-sm" value={datasetDescription} onChange={(event) => setDatasetDescription(event.target.value)} />
                <div className="mt-2 flex flex-wrap gap-2">
                  {['攻防演练', '训练候选', 'Workspace'].map((item) => <Badge key={item} variant="muted">{item}</Badge>)}
                </div>
              </MethodCard>
              <MethodCard active={method === 'append'} title="加入已有轨迹数据集" onClick={() => setMethod('append')}>
                <select className="mt-3 h-10 w-full rounded-md border border-[var(--color-border-strong)] px-3 text-sm" value={targetDatasetId} onChange={(event) => setTargetDatasetId(event.target.value)}>
                  {trajectoryDatasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>{dataset.name} / {dataset.traceCount} 条</option>
                  ))}
                </select>
                <p className="mt-3 text-sm text-[var(--color-ink-secondary)]">预计新增 {estimate.traceRows} 条轨迹数据，兼容性：高。</p>
              </MethodCard>
              <MethodCard active={method === 'skip'} title="暂不沉淀" onClick={() => setMethod('skip')}>
                <p className="mt-3 text-sm leading-6 text-[var(--color-ink-secondary)]">本次数据仍保留在运行记录中，但不会进入数据中心数据集。</p>
              </MethodCard>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>数据加工选项</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-[1fr_320px]">
              <div className="grid gap-2 md:grid-cols-2">
                {processingOptions.map((option) => (
                  <label key={option} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-white p-3 text-sm">
                    <input type="checkbox" checked={options[option]} onChange={(event) => setOptions((items) => ({ ...items, [option]: event.target.checked }))} />
                    {option}
                  </label>
                ))}
              </div>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                <h3 className="font-semibold">加工后预估</h3>
                <Info label="原始事件数" value={String(estimate.rawEvents)} />
                <Info label="有效轨迹数" value={String(estimate.validTraces)} />
                <Info label="预计轨迹条数" value={String(estimate.traceRows)} />
                <Info label="CPT 候选条数" value={String(estimate.cptRows)} />
                <Info label="漏洞记录条数" value={String(estimate.vulnerabilityRows)} />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <CardHeader>
              <CardTitle>确认处理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Info label="来源 Run" value={result.runId} />
                <Info label="任务" value={result.taskName} />
                <Info label="Agent" value={result.agent} />
                <Info label="Benchmark" value={result.benchmark ?? '-'} />
                <Info label="处理方式" value={methodText(method)} />
                <Info label="目标数据集" value={method === 'create' ? datasetName : trajectoryDatasets.find((item) => item.id === targetDatasetId)?.name ?? '-'} />
                <Info label="轨迹条数" value={String(estimate.traceRows)} />
                <Info label="CPT 候选语料" value={String(estimate.cptRows)} />
                <Info label="漏洞记录" value={String(estimate.vulnerabilityRows)} />
              </div>
              <div className="rounded-lg border border-[var(--color-brand)]/20 bg-[var(--color-brand-soft)] p-3 text-sm text-[var(--color-brand)]">
                脱敏策略：密钥、账号、内部地址和完整载荷会被替换为安全占位符。
              </div>
              {processing ? (
                <div className="flex items-center gap-2 text-sm text-[var(--color-warning)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {progress}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <div className="sticky bottom-4 flex justify-between rounded-xl border border-[var(--color-border)] bg-white/95 p-3 shadow-[var(--shadow-panel)] backdrop-blur">
          <Button variant="secondary" disabled={step === 0 || processing} onClick={() => setStep(Math.max(0, step - 1))}>返回修改</Button>
          {step < 3 ? (
            <Button disabled={selectedArtifacts.length === 0} onClick={() => setStep(step + 1)}>下一步</Button>
          ) : (
            <Button disabled={processing} onClick={confirm}>
              <CheckCircle2 className="h-4 w-4" />
              确认处理
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}

function MethodCard({
  active,
  title,
  children,
  onClick,
}: {
  active: boolean
  title: string
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-[210px] rounded-lg border p-4 text-left transition',
        active ? 'border-[var(--color-brand)] bg-[var(--color-brand-soft)]' : 'border-[var(--color-border)] bg-white hover:border-[var(--color-brand)]/50',
      )}
    >
      <div className="font-semibold">{title}</div>
      {children}
    </button>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-3">
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

function methodText(method: 'create' | 'append' | 'skip') {
  return method === 'create' ? '创建新的轨迹数据集' : method === 'append' ? '加入已有轨迹数据集' : '暂不沉淀'
}

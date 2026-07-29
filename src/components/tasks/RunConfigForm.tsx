import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { RunConfig } from '@/types/range'

export type RunConfigErrors = Partial<Record<keyof RunConfig, string>>

interface RunConfigFormProps {
  value: RunConfig
  errors: RunConfigErrors
  onChange: (value: RunConfig) => void
}

export function RunConfigForm({ value, errors, onChange }: RunConfigFormProps) {
  const updateText = (key: keyof RunConfig, nextValue: string) => {
    onChange({ ...value, [key]: nextValue })
  }

  const updateNumber = (key: keyof RunConfig, nextValue: string) => {
    onChange({ ...value, [key]: Number(nextValue) })
  }

  const updateBoolean = (key: keyof RunConfig, checked: boolean) => {
    onChange({ ...value, [key]: checked })
  }

  const estimateToken = Math.round(value.tokenBudget * 0.78)
  const estimateCost = Math.min(value.costBudget, Math.round((estimateToken / 1000) * 0.16))

  return (
    <div className="space-y-4">
      <ConfigSection title="基础配置" description="定义本次 RangeRun 的名称、时长和执行步数。">
        <TextField
          label="运行名称"
          value={value.runName}
          error={errors.runName}
          unit="用于任务列表与 Dashboard 展示"
          onChange={(nextValue) => updateText('runName', nextValue)}
        />
        <NumberField
          label="超时时间"
          min={10}
          max={360}
          unit="分钟，范围 10-360"
          value={value.timeoutMinutes}
          error={errors.timeoutMinutes}
          onChange={(nextValue) => updateNumber('timeoutMinutes', nextValue)}
        />
        <NumberField
          label="最大步骤数"
          min={5}
          max={300}
          unit="步，范围 5-300"
          value={value.maxSteps}
          error={errors.maxSteps}
          onChange={(nextValue) => updateNumber('maxSteps', nextValue)}
        />
        <NumberField
          label="并发数"
          min={1}
          max={8}
          unit="个任务，默认 1"
          value={value.concurrency}
          error={errors.concurrency}
          onChange={(nextValue) => updateNumber('concurrency', nextValue)}
        />
      </ConfigSection>

      <ConfigSection title="资源与预算" description="预算变化会实时同步到右侧 CasePlan 摘要。">
        <NumberField
          label="Token 预算"
          min={10000}
          max={3000000}
          unit="tokens，范围 10,000-3,000,000"
          value={value.tokenBudget}
          error={errors.tokenBudget}
          onChange={(nextValue) => updateNumber('tokenBudget', nextValue)}
        />
        <NumberField
          label="成本预算"
          min={10}
          max={2000}
          unit="元，范围 10-2,000"
          value={value.costBudget}
          error={errors.costBudget}
          onChange={(nextValue) => updateNumber('costBudget', nextValue)}
        />
        <NumberField
          label="CPU"
          min={1}
          max={16}
          unit="vCPU，范围 1-16"
          value={value.cpuCores}
          error={errors.cpuCores}
          onChange={(nextValue) => updateNumber('cpuCores', nextValue)}
        />
        <NumberField
          label="内存"
          min={2}
          max={64}
          unit="GB，范围 2-64"
          value={value.memoryGb}
          error={errors.memoryGb}
          onChange={(nextValue) => updateNumber('memoryGb', nextValue)}
        />
      </ConfigSection>

      <ConfigSection title="安全边界" description="定义 Agent 可触达范围和任务停止策略。">
        <ToggleField
          label="是否允许外网"
          hint="默认关闭，仅允许受控入口访问环境。"
          checked={value.allowInternet}
          onChange={(checked) => updateBoolean('allowInternet', checked)}
        />
        <ToggleField
          label="启用独立取证"
          hint="保留过程证据快照。"
          checked={value.enableForensics}
          onChange={(checked) => updateBoolean('enableForensics', checked)}
        />
        <ToggleField
          label="销毁后离线评分"
          hint="环境销毁后再执行评分。"
          checked={value.enableOfflineScoring}
          onChange={(checked) => updateBoolean('enableOfflineScoring', checked)}
        />
        <TextField
          label="自动停止条件"
          value={value.autoStopCondition}
          error={errors.autoStopCondition}
          unit="触发后停止任务并销毁环境"
          onChange={(nextValue) => updateText('autoStopCondition', nextValue)}
        />
      </ConfigSection>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Estimate label="预计耗时" value={`${value.timeoutMinutes} 分钟内`} />
          <Estimate label="预计 Token 使用" value={estimateToken.toLocaleString()} />
          <Estimate label="预计成本" value={`${estimateCost} 元`} />
          <Estimate label="预计资源占用" value={`${value.cpuCores} vCPU / ${value.memoryGb} GB`} />
        </CardContent>
      </Card>

      <div className="flex gap-3 rounded-lg border border-[var(--color-warning)]/20 bg-[var(--color-warning-soft)] p-3 text-sm leading-6 text-[var(--color-warning)]">
        <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
        <p>
          Agent
          仅能通过受控入口访问环境。超时、预算耗尽或触发安全策略后，系统将停止任务、冻结权限并销毁环境。
        </p>
      </div>
    </div>
  )
}

function ConfigSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">{children}</CardContent>
    </Card>
  )
}

function TextField({
  label,
  value,
  unit,
  error,
  onChange,
}: {
  label: string
  value: string
  unit: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        className="h-10 w-full rounded-md border border-[var(--color-border-strong)] bg-white px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldHelp unit={unit} error={error} />
    </label>
  )
}

function NumberField({
  label,
  min,
  max,
  unit,
  value,
  error,
  onChange,
}: {
  label: string
  min: number
  max: number
  unit: string
  value: number
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        className="h-10 w-full rounded-md border border-[var(--color-border-strong)] bg-white px-3 text-sm"
        min={min}
        max={max}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldHelp unit={unit} error={error} />
    </label>
  )
}

function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-white p-3">
      <input
        className="mt-1"
        checked={checked}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="text-xs text-[var(--color-ink-muted)]">{hint}</span>
      </span>
    </label>
  )
}

function FieldHelp({ unit, error }: { unit: string; error?: string }) {
  return (
    <div className={error ? 'mt-1 text-xs text-[var(--color-danger)]' : 'mt-1 text-xs text-[var(--color-ink-muted)]'}>
      {error || unit}
    </div>
  )
}

function Estimate({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--color-surface-muted)] px-3 py-2">
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

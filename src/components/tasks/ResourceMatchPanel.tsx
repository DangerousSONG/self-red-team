import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Bot, CheckCircle2, Cpu, ExternalLink, Search, Server, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  agentProfiles,
  modelProfiles,
  rangeEnvironments,
} from '@/lib/mock-data/resources'
import type { AgentProfile, ModelProfile, RangeEnvironment, TaskTemplate } from '@/types/range'

interface ResourceMatchPanelProps {
  task: TaskTemplate
  environmentId: string
  agentId: string
  modelId: string
  onEnvironmentChange: (id: string) => void
  onAgentChange: (id: string) => void
  onModelChange: (id: string) => void
  onOpenModel?: (id: string) => void
  onOpenAgent?: (id: string) => void
}

type DrawerType = 'environment' | 'agent' | 'model' | null

export function ResourceMatchPanel({
  task,
  environmentId,
  agentId,
  modelId,
  onEnvironmentChange,
  onAgentChange,
  onModelChange,
  onOpenModel,
  onOpenAgent,
}: ResourceMatchPanelProps) {
  const [drawer, setDrawer] = useState<DrawerType>(null)
  const environment = rangeEnvironments.find((item) => item.id === environmentId) ?? rangeEnvironments[0]
  const agent = agentProfiles.find((item) => item.id === agentId) ?? agentProfiles[0]
  const model = modelProfiles.find((item) => item.id === modelId) ?? modelProfiles[0]

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-3">
        <ResourceCard
          icon={<Server className="h-4 w-4" />}
          title="推荐环境"
          name={environment.name}
          meta={[
            ['类型', environment.environmentType],
            ['节点数量', environment.nodeCount],
            ['网络分区', environment.networkZones],
            ['可用状态', environment.status === 'available' ? '可用' : '繁忙'],
            ['预计启动', environment.startupTime],
          ]}
          reason={environment.recommendationReason}
          onChange={() => setDrawer('environment')}
        />
        <ResourceCard
          icon={<Bot className="h-4 w-4" />}
          title="推荐 Agent"
          name={agent.name}
          meta={[
            ['类型', agent.mode],
            ['能力标签', agent.capabilityTags.join(' / ')],
            ['最近成功率', agent.successRate],
          ]}
          reason={agent.recommendationReason}
          onChange={() => setDrawer('agent')}
          onOpenAsset={() => onOpenAgent?.(agent.id)}
        />
        <ResourceCard
          icon={<Cpu className="h-4 w-4" />}
          title="推荐模型"
          name={model.name}
          meta={[
            ['模型类型', model.modelType],
            ['上下文长度', model.contextWindow],
            ['预计成本', model.estimatedCost],
          ]}
          reason={model.recommendationReason}
          onChange={() => setDrawer('model')}
          onOpenAsset={() => onOpenModel?.(model.id)}
        />
      </div>

      {drawer ? (
        <ResourceDrawer
          type={drawer}
          task={task}
          selectedId={
            drawer === 'environment' ? environmentId : drawer === 'agent' ? agentId : modelId
          }
          onClose={() => setDrawer(null)}
          onSelect={(id) => {
            if (drawer === 'environment') onEnvironmentChange(id)
            if (drawer === 'agent') onAgentChange(id)
            if (drawer === 'model') onModelChange(id)
            setDrawer(null)
          }}
        />
      ) : null}
    </>
  )
}

function ResourceCard({
  icon,
  title,
  name,
  meta,
  reason,
  onChange,
  onOpenAsset,
}: {
  icon: ReactNode
  title: string
  name: string
  meta: Array<[string, string]>
  reason: string
  onChange: () => void
  onOpenAsset?: () => void
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-[var(--color-brand)]">{icon}</span>
              {title}
            </CardTitle>
            <CardDescription className="mt-1">系统推荐项</CardDescription>
          </div>
          <Badge variant="success">系统推荐</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {onOpenAsset ? (
            <button
              type="button"
              onClick={onOpenAsset}
              className="text-left text-base font-semibold text-[var(--color-brand)] hover:underline"
            >
              {name}
            </button>
          ) : (
            <div className="text-base font-semibold text-[var(--color-ink)]">{name}</div>
          )}
          {onOpenAsset ? (
            <button
              type="button"
              onClick={onOpenAsset}
              className="rounded-md p-1 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-brand)]"
              title="查看资产详情"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <div className="space-y-2">
          {meta.map(([label, value]) => (
            <div key={label} className="rounded-md bg-[var(--color-surface-muted)] px-3 py-2">
              <div className="text-[11px] text-[var(--color-ink-muted)]">{label}</div>
              <div className="mt-0.5 text-sm font-medium text-[var(--color-ink)]">{value}</div>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-[var(--color-brand)]/20 bg-[var(--color-brand-soft)] px-3 py-2 text-xs leading-5 text-[var(--color-brand)]">
          推荐原因：{reason}
        </div>
        <Button variant="secondary" className="w-full" onClick={onChange}>
          更换
        </Button>
      </CardContent>
    </Card>
  )
}

function ResourceDrawer({
  type,
  task,
  selectedId,
  onSelect,
  onClose,
}: {
  type: Exclude<DrawerType, null>
  task: TaskTemplate
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const title = type === 'environment' ? '更换环境' : type === 'agent' ? '更换 Agent' : '更换模型'
  const items = useMemo(() => {
    const source =
      type === 'environment' ? rangeEnvironments : type === 'agent' ? agentProfiles : modelProfiles
    return source.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
  }, [query, type])

  return (
    <div className="fixed inset-0 z-50 bg-[rgb(15_27_45_/0.32)]">
      <div className="ml-auto flex h-full w-full max-w-[420px] flex-col border-l border-[var(--color-border)] bg-white shadow-[var(--shadow-panel)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <div className="text-base font-semibold">{title}</div>
            <div className="text-xs text-[var(--color-ink-muted)]">搜索并选择兼容资源</div>
          </div>
          <button className="rounded-md p-1 hover:bg-[var(--color-surface-muted)]" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-[var(--color-border)] p-4">
          <label className="flex h-10 items-center gap-2 rounded-md border border-[var(--color-border-strong)] px-3">
            <Search className="h-4 w-4 text-[var(--color-ink-muted)]" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              value={query}
              placeholder="搜索资源"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] p-6 text-center text-sm text-[var(--color-ink-muted)]">
              暂无匹配资源
            </div>
          ) : (
            items.map((item) => (
              <DrawerOption
                key={item.id}
                type={type}
                item={item}
                task={task}
                selected={item.id === selectedId}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function DrawerOption({
  type,
  item,
  task,
  selected,
  onSelect,
}: {
  type: Exclude<DrawerType, null>
  item: RangeEnvironment | AgentProfile | ModelProfile
  task: TaskTemplate
  selected: boolean
  onSelect: (id: string) => void
}) {
  const compatible = item.compatibleTaskTypes.includes(task.id)
  const reason = compatible
    ? '兼容当前任务'
    : type === 'environment'
      ? '不支持当前任务所需环境'
      : type === 'agent'
        ? '不支持当前任务类型'
        : '当前模型预算或任务类型不匹配'

  return (
    <button
      type="button"
      disabled={!compatible}
      onClick={() => onSelect(item.id)}
      className="w-full rounded-lg border border-[var(--color-border)] bg-white p-3 text-left transition hover:border-[var(--color-brand)] disabled:cursor-not-allowed disabled:opacity-55"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-[var(--color-ink)]">{item.name}</div>
          <div className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
            {'resourceEstimate' in item
              ? item.resourceEstimate
              : 'successRate' in item
                ? `${item.mode} · 最近成功率 ${item.successRate}`
                : `${item.modelType} · ${item.contextWindow}`}
          </div>
        </div>
        {selected ? <CheckCircle2 className="h-5 w-5 text-[var(--color-brand)]" /> : null}
      </div>
      <Badge className="mt-3" variant={compatible ? 'success' : 'danger'}>
        {reason}
      </Badge>
    </button>
  )
}

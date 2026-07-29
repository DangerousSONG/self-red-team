import { Bot, Cpu, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCapabilityAssets } from '@/hooks/useCapabilityAssets'

interface CapabilityCenterPageProps {
  onNavigate: (id: string) => void
  onOpenModel: (id: string) => void
  onOpenAgent: (id: string) => void
}

export function CapabilityCenterPage({ onNavigate, onOpenModel, onOpenAgent }: CapabilityCenterPageProps) {
  const { modelAssets, agentAssets } = useCapabilityAssets()
  const readyModels = modelAssets.filter((item) => item.status === 'ready')
  const readyAgents = agentAssets.filter((item) => item.status === 'ready')
  const referencedAssets = modelAssets.filter((item) => item.referencedAgentIds.length || item.referencedCasePlanIds.length).length +
    agentAssets.filter((item) => item.referencedCasePlanIds.length).length
  const recentModels = [...modelAssets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)
  const recentAgents = [...agentAssets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)
  const commonAssets = [
    ...readyModels.slice(0, 2).map((item) => ({ id: item.id, name: item.name, type: '模型资产', meta: `${item.version} / ${modelTypeText(item.type)}`, onOpen: () => onOpenModel(item.id) })),
    ...readyAgents.slice(0, 2).map((item) => ({ id: item.id, name: item.name, type: '智能体资产', meta: `${item.version} / ${agentTypeText(item.type)}`, onOpen: () => onOpenAgent(item.id) })),
  ]

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div>
          <Badge variant="outline">
            <Sparkles className="h-3.5 w-3.5" />
            Capability Center
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold">模型与智能体中心</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">统一管理平台可用于训练、评测和演练的模型与智能体能力资产</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="模型总数" value={modelAssets.length} />
          <Stat label="可用模型" value={readyModels.length} tone="success" />
          <Stat label="智能体总数" value={agentAssets.length} tone="purple" />
          <Stat label="可用智能体" value={readyAgents.length} tone="success" />
          <Stat label="最近新增版本" value={modelAssets.filter((item) => item.updatedAt >= '2026-07-29').length + agentAssets.filter((item) => item.updatedAt >= '2026-07-29').length} tone="warning" />
          <Stat label="当前被引用资产" value={referencedAssets} tone="purple" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <EntryCard
            icon={<Cpu className="h-5 w-5" />}
            title="模型资产"
            description="管理基础模型、安全增强模型、守卫模型和裁判模型。"
            count={`${modelAssets.length} 个模型 / ${readyModels.length} 个 Ready`}
            onClick={() => onNavigate('models')}
          />
          <EntryCard
            icon={<Bot className="h-5 w-5" />}
            title="智能体资产"
            description="管理用于漏洞挖掘、利用、修复和场景演练的攻防智能体。"
            count={`${agentAssets.length} 个智能体 / ${readyAgents.length} 个 Ready`}
            onClick={() => onNavigate('agents')}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <AssetList title="最近更新模型" items={recentModels.map((item) => ({
            id: item.id,
            name: item.name,
            type: modelTypeText(item.type),
            meta: `${item.version} / ${statusText(item.status)}`,
            updatedAt: item.updatedAt,
            onOpen: () => onOpenModel(item.id),
          }))} />
          <AssetList title="最近更新智能体" items={recentAgents.map((item) => ({
            id: item.id,
            name: item.name,
            type: agentTypeText(item.type),
            meta: `${item.version} / ${statusText(item.status)}`,
            updatedAt: item.updatedAt,
            onOpen: () => onOpenAgent(item.id),
          }))} />
          <AssetList title="常用能力资产" items={commonAssets.map((item) => ({
            ...item,
            updatedAt: '已引用',
          }))} />
        </div>
      </div>
    </main>
  )
}

function EntryCard({ icon, title, description, count, onClick }: { icon: React.ReactNode; title: string; description: string; count: string; onClick: () => void }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-panel)]">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-[var(--color-brand)]">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--color-ink-secondary)]">{description}</p>
        <div className="mt-3 rounded-lg bg-[var(--color-surface-muted)] px-3 py-2 text-sm font-semibold">{count}</div>
        <Button className="mt-4" onClick={onClick}>进入</Button>
      </CardContent>
    </Card>
  )
}

function AssetList({ title, items }: { title: string; items: Array<{ id: string; name: string; type: string; meta: string; updatedAt: string; onOpen: () => void }> }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <button key={item.id} className="w-full rounded-lg border border-[var(--color-border)] bg-white p-3 text-left hover:border-[var(--color-brand)]/50" onClick={item.onOpen}>
            <Badge variant="muted">{item.type}</Badge>
            <div className="mt-2 font-semibold">{item.name}</div>
            <div className="mt-1 flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
              <span>{item.meta}</span>
              <span>{item.updatedAt}</span>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, tone = 'brand' }: { label: string; value: number; tone?: 'brand' | 'success' | 'warning' | 'purple' }) {
  const color = tone === 'success' ? 'text-[var(--color-success)]' : tone === 'warning' ? 'text-[var(--color-warning)]' : tone === 'purple' ? 'text-violet-600' : 'text-[var(--color-brand)]'
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
        <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

export function modelTypeText(type: string) {
  return {
    foundation: '基础模型',
    security_enhanced: '安全增强模型',
    attack: '攻击模型',
    guard: '守卫模型',
    judge: '裁判模型',
  }[type] ?? type
}

export function agentTypeText(type: string) {
  return {
    general_attack: '通用攻击智能体',
    whitebox_discovery: '白盒漏洞挖掘智能体',
    greybox_exploitation: '灰盒漏洞利用智能体',
    whitebox_patch: '白盒漏洞修复智能体',
    pentest: '渗透测试智能体',
    defense: '防御智能体',
    judge: '裁判智能体',
    tool: '工具智能体',
  }[type] ?? type
}

export function statusText(status: string) {
  return {
    ready: 'Ready',
    updating: 'Updating',
    offline: 'Offline',
    deprecated: 'Deprecated',
  }[status] ?? status
}

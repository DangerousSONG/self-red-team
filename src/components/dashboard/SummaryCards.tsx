import { Activity, Bot, Cpu, Database, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const cards = [
  {
    key: 'scenario',
    label: '当前场景',
    value: '企业内网横向移动',
    secondary: 'Scenario / Lateral Movement',
    extra: 'enterprise-lateral-range',
    icon: Database,
    live: false,
  },
  {
    key: 'agents',
    label: 'Agent',
    value: 'Attack Agent',
    secondary: 'Defense Observer',
    extra: '双角色同步观测',
    icon: Bot,
    live: false,
  },
  {
    key: 'models',
    label: '模型',
    value: 'Mock InternLM',
    secondary: 'Security Gateway',
    extra: 'Model Gateway 已绑定',
    icon: Cpu,
    live: false,
  },
  {
    key: 'budget',
    label: '资源预算',
    value: '2 小时 / 4 VM / 200 元',
    secondary: 'Budget Caps',
    extra: '已消耗 60%',
    icon: Wallet,
    live: false,
  },
  {
    key: 'status',
    label: '当前状态',
    value: '运行中',
    secondary: 'RangeRun',
    extra: '剩余 48m 26s',
    icon: Activity,
    live: true,
  },
] as const

export function SummaryCards() {
  return (
    <section>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.key} className="overflow-hidden">
              <CardContent className="relative p-3.5">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--color-brand)]/70 to-transparent" />
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[var(--color-ink-muted)]">{card.label}</span>
                  <Icon className="h-3.5 w-3.5 text-[var(--color-brand)] opacity-70" />
                </div>
                {card.live ? (
                  <div className="flex items-center gap-2">
                    <span className="status-pulse h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    <div className="text-[15px] font-semibold text-[var(--color-success)]">{card.value}</div>
                  </div>
                ) : (
                  <div className="text-[14px] font-semibold leading-snug text-[var(--color-ink)]">{card.value}</div>
                )}
                <div className="mt-0.5 text-[12px] text-[var(--color-ink-secondary)]">{card.secondary}</div>
                <div className="mt-2 font-mono text-[10px] text-[var(--color-ink-muted)]">{card.extra}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

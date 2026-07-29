import { Database, Bot, Cpu, Wallet, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { summaryCards } from '@/lib/data'

const icons = {
  scenario: Database,
  agents: Bot,
  models: Cpu,
  budget: Wallet,
  status: Activity,
} as const

const extras: Record<string, string> = {
  scenario: 'scene-db-defense-01',
  agents: 'Defense Agent 同步运行',
  models: 'Model Gateway 已绑定',
  budget: '已消耗 60%',
  status: '剩余 48m 26s',
}

export function SummaryCards() {
  return (
    <section>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = icons[card.key]
          return (
            <Card key={card.key} className="overflow-hidden">
              <CardContent className="relative p-3.5">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--color-brand)]/70 to-transparent" />
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[var(--color-ink-muted)]">
                    {card.label}
                  </span>
                  <Icon className="h-3.5 w-3.5 text-[var(--color-brand)] opacity-70" />
                </div>

                {'live' in card && card.live ? (
                  <div className="flex items-center gap-2">
                    <span className="status-pulse h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    <div className="text-[15px] font-semibold text-[var(--color-success)]">
                      {card.value}
                    </div>
                  </div>
                ) : (
                  <div className="text-[14px] font-semibold leading-snug text-[var(--color-ink)]">
                    {card.value}
                  </div>
                )}

                {'secondary' in card && card.secondary ? (
                  <div className="mt-0.5 text-[12px] text-[var(--color-ink-secondary)]">
                    {card.secondary}
                  </div>
                ) : null}

                <div className="mt-2 font-mono text-[10px] text-[var(--color-ink-muted)]">
                  {extras[card.key]}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

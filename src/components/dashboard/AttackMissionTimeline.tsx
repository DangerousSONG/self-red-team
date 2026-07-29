import { Check, Loader2, Circle, Crosshair, Flag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAttackRuntime } from '@/hooks/useAttackRuntime'
import { MISSION_PHASES } from '@/lib/attack-runtime'
import { cn } from '@/lib/utils'

export function AttackMissionTimeline() {
  const { current, phaseStatus, stepIndex } = useAttackRuntime()

  return (
    <aside className="sticky top-[88px] flex h-[calc(100vh-108px)] w-[240px] shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-border)] px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Attack Mission</h2>
          <Badge variant="warning" className="font-mono text-[9px]">
            LIVE
          </Badge>
        </div>
        <p className="mt-1 text-[11px] text-[var(--color-ink-muted)]">任务阶段 Timeline</p>
      </div>

      <div className="border-b border-[var(--color-border)] px-3.5 py-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
          <Flag className="h-3 w-3" />
          Objective
        </div>
        <p className="text-[12px] leading-snug text-[var(--color-ink)]">
          突破 Target Environment，获取{' '}
          <span className="font-mono font-semibold text-[var(--color-brand)]">vault01</span>{' '}
          敏感数据
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <ol className="space-y-0">
          {MISSION_PHASES.map((phase, index) => {
            const status = phaseStatus[phase.id]
            const isLast = index === MISSION_PHASES.length - 1
            const active = current.phase === phase.id
            return (
              <li key={phase.id} className="relative grid grid-cols-[28px_1fr] gap-2 pb-4">
                {!isLast ? (
                  <div
                    className={cn(
                      'absolute bottom-0 left-[13px] top-7 w-px',
                      status === 'done' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]',
                    )}
                  />
                ) : null}
                <div
                  className={cn(
                    'relative z-10 flex h-7 w-7 items-center justify-center rounded-full border',
                    status === 'done' &&
                      'border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]',
                    status === 'running' &&
                      'status-pulse border-[var(--color-warning)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
                    status === 'waiting' &&
                      'border-[var(--color-border-strong)] bg-white text-[var(--color-ink-muted)]',
                  )}
                >
                  {status === 'done' ? <Check className="h-3.5 w-3.5" /> : null}
                  {status === 'running' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  {status === 'waiting' ? <Circle className="h-3 w-3" /> : null}
                </div>
                <div
                  className={cn(
                    'rounded-lg border px-2.5 py-2',
                    active
                      ? 'border-[var(--color-warning)]/35 bg-[var(--color-warning-soft)]'
                      : 'border-transparent bg-transparent',
                  )}
                >
                  <div className="font-mono text-[10px] text-[var(--color-ink-muted)]">
                    STEP {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="text-[12px] font-semibold text-[var(--color-ink)]">{phase.label}</div>
                  <div className="text-[10px] text-[var(--color-ink-muted)]">{phase.labelZh}</div>
                  {active ? (
                    <p className="mt-1.5 text-[10px] leading-snug text-[var(--color-ink-secondary)]">
                      {current.missionNote}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3.5 py-3">
        <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
          <Crosshair className="h-3 w-3" />
          Now
        </div>
        <div className="font-mono text-[11px] text-[var(--color-ink)]">
          @{current.atNode} · {current.action}
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-[var(--color-ink-muted)]">
          tool/{current.tool} · step {stepIndex + 1}/{MISSION_PHASES.length}
        </div>
      </div>
    </aside>
  )
}

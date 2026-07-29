import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { TopologyNodeDetail, NodeRiskState } from '@/lib/data'

interface AssetDetailPanelProps {
  node: TopologyNodeDetail | null
  onClose: () => void
}

const riskVariant: Record<NodeRiskState, 'danger' | 'warning' | 'success' | 'muted' | 'default'> = {
  compromised: 'danger',
  under_attack: 'warning',
  defended: 'success',
  attacker: 'default',
  normal: 'muted',
}

export function AssetDetailPanel({ node, onClose }: AssetDetailPanelProps) {
  if (!node) {
    return (
      <div className="flex h-full min-h-[480px] w-[280px] shrink-0 flex-col rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)]/60 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
          Asset Detail
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-ink-secondary)]">
          点击网络中的资产节点，查看 IP、OS、服务、开放端口、Recent Events 与 Agent Actions。
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[480px] w-[280px] shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] px-3.5 py-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            Asset Detail
          </div>
          <div className="mt-1 font-mono text-base font-semibold text-[var(--color-ink)]">{node.label}</div>
          <div className="mt-0.5 text-[11px] text-[var(--color-ink-secondary)]">{node.type}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant={riskVariant[node.riskState]}>{node.statusLabel}</Badge>
            <Badge variant="outline">Risk · {node.riskLabel}</Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
        <div className="grid grid-cols-1 gap-2">
          <Meta label="Name" value={node.label} />
          <Meta label="IP" value={node.ip} />
          <Meta label="OS" value={node.os} />
          <Meta label="Service" value={node.service} />
          <Meta label="Open Port" value={node.openPorts.join(', ')} />
          <Meta label="Zone" value={node.zoneLabel} />
        </div>

        <Separator />

        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            Recent Events
          </div>
          <ul className="space-y-1.5">
            {node.recentEvents.map((event) => (
              <li
                key={event}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-1.5 text-[11px] text-[var(--color-ink)]"
              >
                {event}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            Agent Actions
          </div>
          <ul className="space-y-1.5">
            {node.agentActions.map((action) => (
              <li
                key={action}
                className="rounded-md border border-[var(--color-brand)]/15 bg-[var(--color-brand-soft)] px-2 py-1.5 text-[11px] text-[var(--color-brand)]"
              >
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-2">
      <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
        {label}
      </div>
      <div className="mt-1 text-[12px] font-medium text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

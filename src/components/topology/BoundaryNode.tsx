import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Bot, Globe, BrickWallShield, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NodeRiskState } from '@/lib/data'

export type BoundaryNodeData = {
  label: string
  type: string
  kind: 'attacker' | 'internet' | 'firewall' | 'lb'
  riskState?: Exclude<NodeRiskState, 'attacker'>
  statusLabel?: string
}

const kindIcon = {
  attacker: Bot,
  internet: Globe,
  firewall: BrickWallShield,
  lb: Scale,
}

function BoundaryNodeComponent({ data, selected }: NodeProps<BoundaryNodeData>) {
  const Icon = kindIcon[data.kind]
  const isAttacker = data.kind === 'attacker'
  const state = data.riskState ?? 'normal'

  return (
    <div
      className={cn(
        'relative w-[148px] rounded-lg border-2 px-2.5 py-2 shadow-sm',
        isAttacker && 'border-dashed border-[#1e3a8a]/50 bg-[#eff4ff]',
        !isAttacker && state === 'normal' && 'border-slate-300 bg-white',
        !isAttacker && state === 'compromised' && 'border-[#b42318] bg-[#fff8f8]',
        !isAttacker && state === 'under_attack' && 'border-[#ea580c] bg-[#fff7ed]',
        !isAttacker && state === 'defended' && 'border-[#0f8a4c] bg-[#f3faf6]',
        selected && !isAttacker && 'ring-2 ring-[var(--color-brand)] ring-offset-1',
        isAttacker ? 'cursor-default' : 'cursor-pointer',
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!h-2 !w-2 !border-2 !border-white !bg-[#64748b]"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!h-2 !w-2 !border-2 !border-white !bg-[#64748b]"
      />

      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
            isAttacker ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-600',
            state === 'compromised' && 'bg-[#fef3f2] text-[#b42318]',
            state === 'defended' && 'bg-[#e6f6ee] text-[#0f8a4c]',
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-mono text-[12px] font-semibold text-[var(--color-ink)]">
            {data.label}
          </div>
          <div className="truncate text-[10px] text-[var(--color-ink-secondary)]">{data.type}</div>
        </div>
      </div>

      {data.statusLabel ? (
        <div className="mt-1.5 font-mono text-[9px] font-semibold tracking-wide text-[var(--color-ink-muted)]">
          {data.statusLabel}
        </div>
      ) : null}

      {isAttacker ? (
        <div className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#1e3a8a]">
          External Threat · Not Asset
        </div>
      ) : null}

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={cn(
          '!h-2 !w-2 !border-2 !border-white',
          isAttacker ? '!bg-[#dc2626]' : '!bg-[#64748b]',
        )}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!h-2 !w-2 !border-2 !border-white !bg-[#64748b]"
      />
    </div>
  )
}

export const BoundaryNode = memo(BoundaryNodeComponent)

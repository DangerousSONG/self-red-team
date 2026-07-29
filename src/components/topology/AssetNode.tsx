import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NodeRiskState } from '@/lib/data'

export type AssetNodeData = {
  label: string
  type: string
  statusLabel: string
  riskState: Exclude<NodeRiskState, 'attacker'>
  currentAction?: string
}

const shell: Record<AssetNodeData['riskState'], string> = {
  normal: 'border-slate-300 bg-white',
  compromised: 'border-[#b42318] bg-[#fff8f8] shadow-[0_0_0_2px_rgb(180_35_24_/0.12)]',
  under_attack:
    'border-[#ea580c] bg-[#fff7ed] shadow-[0_0_0_3px_rgb(234_88_12_/0.18)] attack-node-pulse',
  defended: 'border-[#0f8a4c] bg-[#f3faf6] shadow-[0_0_0_2px_rgb(15_138_76_/0.12)]',
}

const statusTone: Record<AssetNodeData['riskState'], string> = {
  normal: 'bg-slate-100 text-slate-600',
  compromised: 'bg-[#fef3f2] text-[#b42318]',
  under_attack: 'bg-[#fff7ed] text-[#c2410c]',
  defended: 'bg-[#e6f6ee] text-[#0f8a4c]',
}

function AssetNodeComponent({ data, selected }: NodeProps<AssetNodeData>) {
  return (
    <div
      className={cn(
        'relative w-[148px] cursor-pointer rounded-lg border-2 px-2.5 py-2 shadow-sm transition',
        shell[data.riskState],
        selected && 'ring-2 ring-[var(--color-brand)] ring-offset-1',
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

      {data.riskState === 'defended' ? (
        <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-[#0f8a4c]/30 bg-white text-[#0f8a4c] shadow-sm">
          <Shield className="h-3 w-3" fill="currentColor" fillOpacity={0.2} />
        </div>
      ) : null}

      <div className="font-mono text-[12px] font-semibold text-[var(--color-ink)]">{data.label}</div>
      <div className="mt-0.5 truncate text-[10px] text-[var(--color-ink-secondary)]">{data.type}</div>
      <div className="mt-1.5">
        <span
          className={cn(
            'inline-flex rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wide',
            statusTone[data.riskState],
          )}
        >
          {data.statusLabel}
        </span>
      </div>
      {data.currentAction ? (
        <div className="mt-1 truncate rounded bg-[#fff7ed] px-1.5 py-0.5 font-mono text-[8px] font-medium text-[#c2410c]">
          {data.currentAction} · running
        </div>
      ) : null}

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!h-2 !w-2 !border-2 !border-white !bg-[#64748b]"
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

export const AssetNode = memo(AssetNodeComponent)

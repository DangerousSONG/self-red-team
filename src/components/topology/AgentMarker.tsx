import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AgentMarkerData = {
  action: string
  tool: string
  target: string
  status: 'running' | 'success' | 'blocked'
}

function AgentMarkerComponent({ data }: NodeProps<AgentMarkerData>) {
  return (
    <div className="pointer-events-none relative w-[132px]">
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <div className="flex items-center gap-1.5">
        <div className="agent-marker-pulse flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1e3a8a] bg-[#1e3a8a] text-white shadow-md">
          <Bot className="h-4 w-4" />
        </div>
        <div
          className={cn(
            'rounded-md border bg-white/95 px-1.5 py-1 shadow-sm backdrop-blur-sm',
            data.status === 'running' && 'border-[#ea580c]/50',
            data.status === 'success' && 'border-[var(--color-success)]/40',
            data.status === 'blocked' && 'border-[var(--color-danger)]/40',
          )}
        >
          <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.1em] text-[#1e3a8a]">
            Attack Agent
          </div>
          <div className="mt-0.5 font-mono text-[9px] leading-tight text-[var(--color-ink)]">
            {data.action} · {data.tool}
          </div>
          <div className="font-mono text-[8px] text-[var(--color-ink-muted)]">
            {data.target} · {data.status}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </div>
  )
}

export const AgentMarker = memo(AgentMarkerComponent)

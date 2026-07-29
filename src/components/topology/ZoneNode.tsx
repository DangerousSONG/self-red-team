import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { cn } from '@/lib/utils'

export type ZoneNodeData = {
  label: string
  subtitle: string
  tone: 'external' | 'perimeter' | 'dmz' | 'service' | 'protected'
}

const zoneStyles: Record<ZoneNodeData['tone'], string> = {
  external: 'border-[#c5d0e0] bg-[#eef2f7]/90',
  perimeter: 'border-[#f0c48a] bg-[#fff8ef]/92',
  dmz: 'border-[#b8ccea] bg-[#eef4fc]/95',
  service: 'border-[#a9d0c0] bg-[#eef8f3]/95',
  protected: 'border-[#8fbfa8] bg-[#e6f5ec]/96',
}

const labelStyles: Record<ZoneNodeData['tone'], string> = {
  external: 'text-[#475569]',
  perimeter: 'text-[#b45309]',
  dmz: 'text-[#1a5fbf]',
  service: 'text-[#0f766e]',
  protected: 'text-[#0f8a4c]',
}

function ZoneNodeComponent({ data }: NodeProps<ZoneNodeData>) {
  return (
    <div
      className={cn(
        'pointer-events-none relative h-full w-full rounded-xl border-2 border-dashed',
        zoneStyles[data.tone],
      )}
    >
      <div className="absolute inset-x-0 top-0 rounded-t-[10px] border-b border-black/5 bg-white/45 px-3 py-2 backdrop-blur-[1px]">
        <div
          className={cn(
            'font-mono text-[10px] font-semibold uppercase tracking-[0.14em]',
            labelStyles[data.tone],
          )}
        >
          {data.label}
        </div>
        <div className="mt-0.5 truncate text-[10px] text-[var(--color-ink-secondary)]">
          {data.subtitle}
        </div>
      </div>
    </div>
  )
}

export const ZoneNode = memo(ZoneNodeComponent)

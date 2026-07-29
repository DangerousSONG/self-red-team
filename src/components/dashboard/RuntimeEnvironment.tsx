import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Network, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TopologyCanvas } from '@/components/topology/TopologyCanvas'
import { architectureLayers, topologyLegend } from '@/lib/data'
import { cn } from '@/lib/utils'

const planeChips = [
  {
    title: 'Control Plane',
    items: architectureLayers.controlPlane.responsibilities.slice(0, 4),
    status: 'Running',
  },
  {
    title: 'Access Edge',
    items: architectureLayers.accessEdge.apis.slice(0, 3),
    status: 'Ready',
  },
  {
    title: 'Execution Layer',
    items: architectureLayers.executionLayer.components,
    status: 'Active',
  },
]

export function RuntimeEnvironment() {
  const [planesOpen, setPlanesOpen] = useState(false)

  return (
    <section className="space-y-2">
      <div className="rounded-xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
        <button
          type="button"
          onClick={() => setPlanesOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
              Platform Planes
            </span>
            {planeChips.map((plane) => (
              <span
                key={plane.title}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-1 text-[11px] text-[var(--color-ink-secondary)]"
              >
                <span className="font-medium text-[var(--color-ink)]">{plane.title}</span>
                <Badge variant="success" className="h-5 gap-1 px-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  {plane.status}
                </Badge>
              </span>
            ))}
          </div>
          {planesOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-[var(--color-ink-muted)]" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-ink-muted)]" />
          )}
        </button>
        <div
          className={cn(
            'grid transition-all',
            planesOpen ? 'grid-rows-[1fr] border-t border-[var(--color-border)]' : 'grid-rows-[0fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="grid gap-2 px-4 py-3 md:grid-cols-3">
              {planeChips.map((plane) => (
                <div
                  key={plane.title}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-2.5"
                >
                  <div className="mb-1.5 text-xs font-semibold text-[var(--color-ink)]">{plane.title}</div>
                  <div className="flex flex-wrap gap-1">
                    {plane.items.map((item) => (
                      <span
                        key={item}
                        className="rounded border border-[var(--color-border)] bg-white px-1.5 py-0.5 text-[10px] text-[var(--color-ink-secondary)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Network className="h-4 w-4 text-[var(--color-brand)]" />
              Target Environment
            </CardTitle>
            <CardDescription className="mt-1">
              目标企业网络 · Agent 在资产间移动攻击 · Overlay 显示推进路径
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono">
            CYBER RANGE OPS
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {topologyLegend.map((item) => (
                <div
                  key={item.key}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-1 text-[10px] text-[var(--color-ink-secondary)]"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)]">
              <ShieldAlert className="h-3.5 w-3.5" />
              点击资产查看 Asset Detail
            </div>
          </div>
          <TopologyCanvas />
        </CardContent>
      </Card>
    </section>
  )
}

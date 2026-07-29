import { Play, FilePlus2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-md">
      <div className="flex items-start justify-between gap-6 px-6 py-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              <Shield className="h-3 w-3" />
              CONTROL PLANE
            </Badge>
            <Badge variant="success">
              <span className="status-pulse h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
              LIVE RUN
            </Badge>
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[var(--color-ink)]">
            RangeRun 运行控制台
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-ink-secondary)]">
            AI Agent 正在攻击隔离企业网络环境 · 可编排、可验证、可复盘
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 pt-1">
          <Button variant="secondary">
            <FilePlus2 className="h-4 w-4" />
            创建 CasePlan
          </Button>
          <Button>
            <Play className="h-4 w-4" />
            启动 RangeRun
          </Button>
        </div>
      </div>
    </header>
  )
}

import {
  LayoutDashboard,
  Library,
  Bot,
  Cpu,
  FileText,
  Workflow,
  PlayCircle,
  Server,
  Network,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { navItems } from '@/lib/data'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Library,
  Bot,
  Cpu,
  FileText,
  Workflow,
  PlayCircle,
  Server,
  Network,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
}

interface SidebarProps {
  activeId: string
  onNavigate: (id: string) => void
}

export function Sidebar({ activeId, onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col bg-[#0f2744] text-white">
      <div className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a5fbf] shadow-sm">
            <Network className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-tight">AI安全靶场</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
              Cyber Range Console
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            const active = activeId === item.id
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors',
                    active
                      ? 'bg-[#1a5fbf] font-medium text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" /> : null}
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
            当前演练
          </div>
          <div className="mt-1.5 text-[12px] font-medium leading-snug text-white">
            数据库攻防演练
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-300">
            <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
            RangeRun · 运行中
          </div>
          <div className="mt-1 font-mono text-[10px] text-white/40">RR-2026-0724-011</div>
        </div>
      </div>
    </aside>
  )
}

import { useEffect, useRef } from 'react'
import { Pause, Play, RotateCcw, Terminal } from 'lucide-react'
import { useAttackRuntime } from '@/hooks/useAttackRuntime'
import { cn } from '@/lib/utils'
import type { TerminalLevel } from '@/lib/attack-runtime'

const levelClass: Record<TerminalLevel, string> = {
  cmd: 'text-[#e2e8f0]',
  info: 'text-[#7dd3fc]',
  success: 'text-[#86efac]',
  warning: 'text-[#fdba74]',
  blocked: 'text-[#fca5a5]',
  error: 'text-[#f87171]',
}

export function AgentAttackConsole() {
  const { terminalLines, playing, pause, resume, reset, current } = useAttackRuntime()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [terminalLines])

  return (
    <div className="flex h-[300px] flex-col overflow-hidden rounded-xl border border-[#1e293b] bg-[#0b1220] shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-slate-200">
          <Terminal className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span>Agent Runtime Console</span>
          <span className="hidden font-mono text-[10px] text-slate-500 sm:inline">
            command · tool · result · feedback
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[10px] text-slate-500 md:inline">
            phase/{current.phaseLabel} · @{current.atNode}
          </span>
          <button
            type="button"
            onClick={() => (playing ? pause() : resume())}
            className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            title={playing ? 'Pause' : 'Resume'}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[11.5px] leading-[1.65]">
        <div className="text-slate-500">
          # Cyber Range session · AttackAgent linked to Target Environment
        </div>
        <div className="mb-2 text-slate-600">
          # Each step: execute command → invoke tool → capture result → mission feedback
        </div>
        {terminalLines.map((line) => (
          <div key={line.id} className={cn('whitespace-pre-wrap', levelClass[line.level])}>
            <span className="text-slate-500">[{line.time}]</span> {line.text}
          </div>
        ))}
        <div className="mt-1 flex items-center gap-1 text-emerald-400">
          <span className="opacity-70">AttackAgent &gt;</span>
          <span className="inline-block h-3.5 w-1.5 animate-pulse bg-emerald-400" />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  )
}

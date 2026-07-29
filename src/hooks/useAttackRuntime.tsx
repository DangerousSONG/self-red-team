import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  attackSteps,
  MISSION_PHASES,
  type AttackStep,
  type ExploitArtifact,
  type MissionPhase,
  type TerminalLine,
} from '@/lib/attack-runtime'

interface AttackRuntimeState {
  stepIndex: number
  current: AttackStep
  terminalLines: TerminalLine[]
  artifacts: ExploitArtifact[]
  currentPhase: MissionPhase
  phaseStatus: Record<MissionPhase, 'done' | 'running' | 'waiting'>
  playing: boolean
  pause: () => void
  resume: () => void
  reset: () => void
}

const AttackRuntimeContext = createContext<AttackRuntimeState | null>(null)

export function AttackRuntimeProvider({ children }: { children: ReactNode }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    if (stepIndex >= attackSteps.length - 1) return
    const timer = window.setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, attackSteps.length - 1))
    }, 3400)
    return () => window.clearTimeout(timer)
  }, [playing, stepIndex])

  const current = attackSteps[stepIndex]

  const terminalLines = useMemo(
    () => attackSteps.slice(0, stepIndex + 1).flatMap((s) => s.terminal),
    [stepIndex],
  )

  const artifacts = useMemo(
    () =>
      attackSteps
        .slice(0, stepIndex + 1)
        .flatMap((s) => s.artifacts ?? [])
        .reverse(),
    [stepIndex],
  )

  const phaseStatus = useMemo(() => {
    const map = {} as Record<MissionPhase, 'done' | 'running' | 'waiting'>
    const currentPhaseIndex = MISSION_PHASES.findIndex((p) => p.id === current.phase)
    MISSION_PHASES.forEach((phase, index) => {
      if (index < currentPhaseIndex) map[phase.id] = 'done'
      else if (index === currentPhaseIndex) map[phase.id] = 'running'
      else map[phase.id] = 'waiting'
    })
    // Mark impact as done/blocked when last step finished with blocked
    if (stepIndex === attackSteps.length - 1 && current.phase === 'impact') {
      map.impact = current.status === 'blocked' ? 'running' : 'done'
    }
    return map
  }, [current, stepIndex])

  const pause = useCallback(() => setPlaying(false), [])
  const resume = useCallback(() => setPlaying(true), [])
  const reset = useCallback(() => {
    setStepIndex(0)
    setPlaying(true)
  }, [])

  const value = useMemo(
    () => ({
      stepIndex,
      current,
      terminalLines,
      artifacts,
      currentPhase: current.phase,
      phaseStatus,
      playing,
      pause,
      resume,
      reset,
    }),
    [stepIndex, current, terminalLines, artifacts, phaseStatus, playing, pause, resume, reset],
  )

  return (
    <AttackRuntimeContext.Provider value={value}>{children}</AttackRuntimeContext.Provider>
  )
}

export function useAttackRuntime() {
  const ctx = useContext(AttackRuntimeContext)
  if (!ctx) throw new Error('useAttackRuntime must be used within AttackRuntimeProvider')
  return ctx
}

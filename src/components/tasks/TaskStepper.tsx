import { AlertCircle, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  { title: '选择任务', help: '选择本次评测要完成的安全任务' },
  { title: '匹配资源', help: '确认系统匹配的环境、Agent 与模型' },
  { title: '运行配置', help: '设置预算、并发与安全边界' },
  { title: '确认启动', help: '封存配置并启动一次 RangeRun' },
]

interface TaskStepperProps {
  currentStep: number
  maxReachableStep: number
  errorSteps?: number[]
  onStepClick: (step: number) => void
}

export function TaskStepper({
  currentStep,
  maxReachableStep,
  errorSteps = [],
  onStepClick,
}: TaskStepperProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <ol className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const done = currentStep > index
          const active = currentStep === index
          const locked = index > maxReachableStep
          const hasError = errorSteps.includes(index)
          return (
            <li key={step.title}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onStepClick(index)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md p-1.5 text-left transition-colors',
                  !locked && 'hover:bg-[var(--color-brand-soft)]',
                  locked && 'cursor-not-allowed opacity-60',
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    done &&
                      'border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]',
                    active &&
                      'border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]',
                    !done &&
                      !active &&
                      'border-[var(--color-border-strong)] bg-white text-[var(--color-ink-muted)]',
                    hasError && 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
                  )}
                >
                  {hasError ? <AlertCircle className="h-4 w-4" /> : null}
                  {!hasError && done ? <Check className="h-4 w-4" /> : null}
                  {!hasError && !done && locked ? <Lock className="h-3.5 w-3.5" /> : null}
                  {!hasError && !done && !locked ? index + 1 : null}
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                    Step {index + 1}
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-ink)]">{step.title}</div>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="mt-3 rounded-md bg-[var(--color-brand-soft)] px-3 py-2 text-sm text-[var(--color-brand)]">
        {steps[currentStep].help}
      </div>
    </div>
  )
}

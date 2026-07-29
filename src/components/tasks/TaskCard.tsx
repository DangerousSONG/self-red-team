import { CheckCircle2, Clock, Info, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { AgentProfile, ModelProfile, RangeEnvironment, TaskTemplate } from '@/types/range'

interface TaskCardProps {
  task: TaskTemplate
  selected: boolean
  recommendedEnvironment: RangeEnvironment
  recommendedAgent: AgentProfile
  recommendedModel: ModelProfile
  disabled?: boolean
  onSelect: (task: TaskTemplate) => void
}

export function TaskCard({
  task,
  selected,
  recommendedEnvironment,
  recommendedAgent,
  recommendedModel,
  disabled = false,
  onSelect,
}: TaskCardProps) {
  const categoryLabel = task.category === 'benchmark' ? 'Benchmark' : '场景演练'

  return (
    <Card
      className={cn(
        'h-full overflow-hidden transition-colors',
        selected && 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/15',
        disabled && 'opacity-70',
      )}
    >
      <CardContent className="flex h-full flex-col p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <Badge variant={task.category === 'benchmark' ? 'default' : 'success'}>{categoryLabel}</Badge>
            <h3 className="mt-2 text-base font-semibold text-[var(--color-ink)]">{task.name}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.benchmark ? <Badge variant="outline">{task.benchmark}</Badge> : null}
              <Badge variant="outline">{task.type}</Badge>
              <Badge variant="muted">{task.environmentKind}</Badge>
              <Badge variant={task.difficulty === '高级' ? 'warning' : 'default'}>{task.difficulty}</Badge>
              {disabled ? <Badge variant="muted">Mock 预留</Badge> : null}
            </div>
          </div>
          {selected ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--color-brand)]" /> : null}
        </div>

        <div className="space-y-3 text-sm text-[var(--color-ink-secondary)]">
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <Clock className="h-3.5 w-3.5" />
            预计时长：{task.estimatedDuration}
          </span>
          {task.category === 'scenario' ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Mini label="节点数量" value={task.nodeCount ?? '-'} />
              <Mini label="网络分区" value={task.networkZones ?? '-'} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Mini label="评测对象" value={task.evaluationTarget} />
              <Mini label="环境" value={task.environmentKind} />
            </div>
          )}
          <p className="flex gap-2 leading-6">
            <Target className="mt-1 h-4 w-4 shrink-0 text-[var(--color-brand)]" />
            <span>{task.objective}</span>
          </p>
          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs leading-5">
            <span className="font-semibold">输入：</span>{task.input}
            <br />
            <span className="font-semibold">输出：</span>{task.output}
          </div>
          {selected ? (
            <div className="rounded-md border border-[var(--color-brand)]/20 bg-[var(--color-brand-soft)] px-3 py-2 text-xs leading-5 text-[var(--color-brand)]">
              该任务将匹配 {recommendedEnvironment.name} 环境与 {recommendedAgent.name}
            </div>
          ) : null}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <TaskDetailsDialog
            task={task}
            environment={recommendedEnvironment}
            agent={recommendedAgent}
            model={recommendedModel}
          />
          <Button
            variant={selected ? 'default' : 'secondary'}
            disabled={disabled}
            onClick={() => onSelect(task)}
          >
            {disabled ? '暂未接入' : selected ? '已选择' : '选择任务'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TaskDetailsDialog({
  task,
  environment,
  agent,
  model,
}: {
  task: TaskTemplate
  environment: RangeEnvironment
  agent: AgentProfile
  model: ModelProfile
}) {
  const rows = [
    ['任务说明', task.description],
    ['评测对象', task.evaluationTarget],
    ['输入', task.input],
    ['输出', task.output],
    ['成功条件', task.successCriteria],
    ['推荐环境', environment.name],
    ['推荐 Agent', agent.name],
    ['评分方式', task.scoringMethod],
  ]
  const benchmarkRows = task.category === 'benchmark'
    ? [
        ['Benchmark 名称', task.benchmarkName ?? task.benchmark ?? '-'],
        ['任务范式', task.paradigm ?? '-'],
        ['是否白盒', task.isWhiteBox ? '是' : '否'],
        ['是否提供源码', task.providesSource ? '是' : '否'],
        ['是否需要生成 PoC', task.requiresPoc ? '是' : '否'],
        ['是否需要生成 Patch', task.requiresPatch ? '是' : '否'],
        ['是否执行功能测试', task.runsFunctionalTests ? '是' : '否'],
        ['是否执行安全测试', task.runsSecurityTests ? '是' : '否'],
      ]
    : [
        ['任务类型', task.type],
        ['环境类型', task.environmentKind],
        ['节点数量', task.nodeCount ?? environment.nodeCount],
        ['网络分区', task.networkZones ?? environment.networkZones],
        ['推荐模型', model.name],
        ['预计资源', environment.resourceEstimate],
      ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Info className="h-4 w-4" />
          查看详情
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{task.name}</DialogTitle>
          <DialogDescription>{task.objective}</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2">
          {[...rows, ...benchmarkRows].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[var(--color-border)] bg-white p-3">
              <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
              <div className="mt-1 text-sm leading-6 text-[var(--color-ink)]">{value}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--color-surface-muted)] px-2.5 py-2">
      <div className="text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-0.5 font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

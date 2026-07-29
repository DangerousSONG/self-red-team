import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ClipboardList, ListChecks, Loader2 } from 'lucide-react'
import { CasePlanAside } from '@/components/tasks/CasePlanAside'
import { CasePlanSummary } from '@/components/tasks/CasePlanSummary'
import { ResourceMatchPanel } from '@/components/tasks/ResourceMatchPanel'
import { RunConfigForm, type RunConfigErrors } from '@/components/tasks/RunConfigForm'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskListTable } from '@/components/tasks/TaskListTable'
import { TaskStepper } from '@/components/tasks/TaskStepper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { agentProfiles, defaultResourceMatches, modelProfiles, rangeEnvironments } from '@/lib/mock-data/resources'
import { taskTemplates } from '@/lib/mock-data/tasks'
import { cn } from '@/lib/utils'
import { defaultRunConfig, useRangeTasks } from '@/hooks/useRangeTasks'
import type { RunConfig, Task } from '@/types/range'

interface TasksPageProps {
  onNavigate: (id: string) => void
  onDirtyChange?: (dirty: boolean) => void
}

type TaskTab = 'create' | 'list'
type SaveState = 'saving' | 'saved' | 'failed'

const startupStages = ['封存 CasePlan', '校验资源', '创建 RangeRun', '正在跳转运行控制台']

export function TasksPage({ onNavigate, onDirtyChange }: TasksPageProps) {
  const {
    draftProgress,
    setDraftProgress,
    saveDraft,
    startRun,
    currentRun,
    currentCasePlan,
  } = useRangeTasks()
  const [activeTab, setActiveTab] = useState<TaskTab>('create')
  const [step, setStep] = useState(draftProgress.step ?? 0)
  const [selectedTemplateId, setSelectedTemplateId] = useState(draftProgress.selectedTemplateId ?? '')
  const selectedMatch = selectedTemplateId ? defaultResourceMatches[selectedTemplateId] : undefined
  const [environmentId, setEnvironmentId] = useState(
    draftProgress.environmentId ?? selectedMatch?.environmentId ?? '',
  )
  const [agentId, setAgentId] = useState(draftProgress.agentId ?? selectedMatch?.agentId ?? '')
  const [modelId, setModelId] = useState(draftProgress.modelId ?? selectedMatch?.modelId ?? '')
  const [runConfig, setRunConfig] = useState<RunConfig>(draftProgress.runConfig ?? defaultRunConfig)
  const [starting, setStarting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [notice, setNotice] = useState(
    draftProgress.selectedTemplateId ? '已恢复上次未完成的任务配置。' : '',
  )
  const [confirmed, setConfirmed] = useState(false)
  const [startupStage, setStartupStage] = useState('')
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [parallelDialogOpen, setParallelDialogOpen] = useState(false)
  const [dirty, setDirty] = useState(false)

  const selectedTemplate = useMemo(
    () => taskTemplates.find((task) => task.id === selectedTemplateId),
    [selectedTemplateId],
  )
  const environment = rangeEnvironments.find((item) => item.id === environmentId)
  const agent = agentProfiles.find((item) => item.id === agentId)
  const model = modelProfiles.find((item) => item.id === modelId)
  const configErrors = useMemo(() => validateRunConfig(runConfig), [runConfig])
  const configValid = Object.keys(configErrors).length === 0
  const resourceValid = Boolean(environment && agent && model)
  const maxReachableStep = selectedTemplate
    ? resourceValid
      ? configValid
        ? 3
        : 2
      : 1
    : 0
  const errorSteps = configValid ? [] : [2]

  useEffect(() => {
    if (selectedTemplateId && !taskTemplates.some((task) => task.id === selectedTemplateId)) {
      setSelectedTemplateId('')
      setEnvironmentId('')
      setAgentId('')
      setModelId('')
      setStep(0)
    }
  }, [selectedTemplateId])

  useEffect(() => {
    if (step > maxReachableStep) {
      setStep(maxReachableStep)
    }
  }, [maxReachableStep, step])

  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  useEffect(() => {
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      try {
        setDraftProgress({
          step,
          selectedTemplateId,
          environmentId,
          agentId,
          modelId,
          runConfig,
        })
        setSaveState('saved')
      } catch {
        setSaveState('failed')
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [agentId, environmentId, modelId, runConfig, selectedTemplateId, setDraftProgress, step])

  useEffect(() => {
    const handler = () => {
      if (selectedTemplate && environment && agent && model) {
        saveDraft({ template: selectedTemplate, environment, agent, model, runConfig })
        setDirty(false)
      }
    }
    window.addEventListener('range-task-save-draft', handler)
    return () => window.removeEventListener('range-task-save-draft', handler)
  }, [agent, environment, model, runConfig, saveDraft, selectedTemplate])

  const buildInput = () => {
    if (!selectedTemplate || !environment || !agent || !model) return null
    return { template: selectedTemplate, environment, agent, model, runConfig }
  }

  const markChanged = () => {
    setDirty(true)
    setNotice('')
  }

  const selectTemplate = (taskId: string) => {
    const match = defaultResourceMatches[taskId]
    setSelectedTemplateId(taskId)
    setEnvironmentId(match.environmentId)
    setAgentId(match.agentId)
    setModelId(match.modelId)
    setRunConfig((current) => ({
      ...current,
      runName: taskTemplates.find((item) => item.id === taskId)?.name ?? current.runName,
    }))
    markChanged()
  }

  const handleSaveDraft = async () => {
    const input = buildInput()
    if (!input) {
      setNotice('请先选择任务并完成资源匹配。')
      return
    }
    setSaving(true)
    await new Promise((resolve) => window.setTimeout(resolve, 500))
    saveDraft(input)
    setSaving(false)
    setDirty(false)
    setNotice('草稿已保存到任务列表。')
  }

  const requestStart = () => {
    if (currentRun?.status === 'Running') {
      setParallelDialogOpen(true)
      return
    }
    void handleStart()
  }

  const handleStart = async () => {
    const input = buildInput()
    if (!input || !confirmed || !configValid) return
    setParallelDialogOpen(false)
    setStarting(true)
    for (const stage of startupStages) {
      setStartupStage(stage)
      await new Promise((resolve) => window.setTimeout(resolve, 450))
    }
    await startRun(input)
    setStarting(false)
    setDirty(false)
    onNavigate('home')
  }

  const handleEdit = (task: Task) => {
    const match = defaultResourceMatches[task.templateId]
    setActiveTab('create')
    setSelectedTemplateId(task.templateId)
    setEnvironmentId(match.environmentId)
    setAgentId(match.agentId)
    setModelId(match.modelId)
    setRunConfig({ ...defaultRunConfig, runName: task.name })
    setStep(2)
    setDirty(true)
    setNotice('已载入任务配置，可继续调整后保存或启动。')
  }

  const goStep = (nextStep: number) => {
    if (nextStep <= maxReachableStep) setStep(nextStep)
  }

  const nextDisabled =
    (step === 0 && !selectedTemplate) ||
    (step === 1 && !resourceValid) ||
    (step === 2 && !configValid) ||
    starting ||
    saving

  const handleExitCreate = () => {
    if (dirty) {
      setLeaveDialogOpen(true)
      return
    }
    setActiveTab('list')
  }

  const selectedDefaultMatch = selectedTemplate ? defaultResourceMatches[selectedTemplate.id] : undefined
  const recommendedEnvironment =
    rangeEnvironments.find((item) => item.id === selectedDefaultMatch?.environmentId) ?? rangeEnvironments[0]
  const recommendedAgent =
    agentProfiles.find((item) => item.id === selectedDefaultMatch?.agentId) ?? agentProfiles[0]
  const recommendedModel =
    modelProfiles.find((item) => item.id === selectedDefaultMatch?.modelId) ?? modelProfiles[0]

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1680px] space-y-5 pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline">
                <ClipboardList className="h-3.5 w-3.5" />
                Task Center
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              评测任务中心
            </h1>
            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">
              选择任务、配置环境与智能体，创建一次可复现的攻防演练
            </p>
          </div>
          {notice ? (
            <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-success)] shadow-[var(--shadow-card)]">
              {notice}
            </div>
          ) : null}
        </div>

        <div className="flex w-fit rounded-lg border border-[var(--color-border)] bg-white p-1">
          <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')}>
            <ClipboardList className="h-4 w-4" />
            创建任务
          </TabButton>
          <TabButton active={activeTab === 'list'} onClick={() => setActiveTab('list')}>
            <ListChecks className="h-4 w-4" />
            任务列表
          </TabButton>
        </div>

        {activeTab === 'create' ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-4">
              <TaskStepper
                currentStep={step}
                maxReachableStep={maxReachableStep}
                errorSteps={errorSteps}
                onStepClick={goStep}
              />

              {step === 0 ? (
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  {taskTemplates.map((task) => {
                    const match = defaultResourceMatches[task.id]
                    const cardEnvironment =
                      rangeEnvironments.find((item) => item.id === match.environmentId) ?? rangeEnvironments[0]
                    const cardAgent =
                      agentProfiles.find((item) => item.id === match.agentId) ?? agentProfiles[0]
                    const cardModel =
                      modelProfiles.find((item) => item.id === match.modelId) ?? modelProfiles[0]
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        selected={task.id === selectedTemplateId}
                        recommendedEnvironment={cardEnvironment}
                        recommendedAgent={cardAgent}
                        recommendedModel={cardModel}
                        onSelect={() => selectTemplate(task.id)}
                      />
                    )
                  })}
                </div>
              ) : null}

              {step === 1 && selectedTemplate ? (
                <ResourceMatchPanel
                  task={selectedTemplate}
                  environmentId={environmentId}
                  agentId={agentId}
                  modelId={modelId}
                  onEnvironmentChange={(id) => {
                    setEnvironmentId(id)
                    markChanged()
                  }}
                  onAgentChange={(id) => {
                    setAgentId(id)
                    markChanged()
                  }}
                  onModelChange={(id) => {
                    setModelId(id)
                    markChanged()
                  }}
                />
              ) : null}

              {step === 2 ? (
                <RunConfigForm
                  value={runConfig}
                  errors={configErrors}
                  onChange={(value) => {
                    setRunConfig(value)
                    markChanged()
                  }}
                />
              ) : null}

              {step === 3 && selectedTemplate && environment && agent && model ? (
                <CasePlanSummary
                  task={selectedTemplate}
                  environment={environment}
                  agent={agent}
                  model={model}
                  runConfig={runConfig}
                  starting={starting}
                  confirmed={confirmed}
                  startupStage={startupStage}
                  onConfirmedChange={setConfirmed}
                />
              ) : null}

              <BottomActionBar
                step={step}
                saving={saving}
                starting={starting}
                confirmed={confirmed}
                nextDisabled={nextDisabled}
                onExit={handleExitCreate}
                onSaveDraft={handleSaveDraft}
                onBack={() => setStep(Math.max(0, step - 1))}
                onNext={() => setStep(Math.min(3, step + 1))}
                onStart={requestStart}
              />
            </div>

            <CasePlanAside
              task={selectedTemplate}
              environment={selectedTemplate ? environment ?? recommendedEnvironment : undefined}
              agent={selectedTemplate ? agent ?? recommendedAgent : undefined}
              model={selectedTemplate ? model ?? recommendedModel : undefined}
              runConfig={runConfig}
              step={step}
              saveState={saveState}
            />
          </div>
        ) : (
          <TaskListTable onEdit={handleEdit} onViewRun={() => onNavigate('home')} />
        )}
      </div>

      <LeaveDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        onDiscard={() => {
          setDirty(false)
          setLeaveDialogOpen(false)
          setActiveTab('list')
        }}
        onSave={async () => {
          await handleSaveDraft()
          setLeaveDialogOpen(false)
          setActiveTab('list')
        }}
      />

      <ParallelRunDialog
        open={parallelDialogOpen}
        onOpenChange={setParallelDialogOpen}
        currentConcurrency={currentCasePlan?.concurrency ?? 1}
        nextConcurrency={runConfig.concurrency}
        resource={`${runConfig.cpuCores} vCPU / ${runConfig.memoryGb} GB`}
        onConfirm={() => void handleStart()}
      />
    </main>
  )
}

function validateRunConfig(value: RunConfig): RunConfigErrors {
  const errors: RunConfigErrors = {}
  if (!value.runName.trim()) errors.runName = '运行名称不能为空'
  if (value.timeoutMinutes < 10 || value.timeoutMinutes > 360) errors.timeoutMinutes = '超时时间需在 10-360 分钟之间'
  if (value.maxSteps < 5 || value.maxSteps > 300) errors.maxSteps = '最大步骤数需在 5-300 之间'
  if (value.concurrency < 1 || value.concurrency > 8) errors.concurrency = '并发数需在 1-8 之间'
  if (value.tokenBudget < 10000 || value.tokenBudget > 3000000) errors.tokenBudget = 'Token 预算需在 10,000-3,000,000 之间'
  if (value.costBudget < 10 || value.costBudget > 2000) errors.costBudget = '成本预算需在 10-2,000 元之间'
  if (value.cpuCores < 1 || value.cpuCores > 16) errors.cpuCores = 'CPU 需在 1-16 vCPU 之间'
  if (value.memoryGb < 2 || value.memoryGb > 64) errors.memoryGb = '内存需在 2-64 GB 之间'
  if (!value.autoStopCondition.trim()) errors.autoStopCondition = '请填写自动停止条件'
  return errors
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium',
        active
          ? 'bg-[var(--color-brand)] text-white'
          : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-soft)]',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function BottomActionBar({
  step,
  saving,
  starting,
  confirmed,
  nextDisabled,
  onExit,
  onSaveDraft,
  onBack,
  onNext,
  onStart,
}: {
  step: number
  saving: boolean
  starting: boolean
  confirmed: boolean
  nextDisabled: boolean
  onExit: () => void
  onSaveDraft: () => void
  onBack: () => void
  onNext: () => void
  onStart: () => void
}) {
  return (
    <div className="sticky bottom-4 z-10 rounded-xl border border-[var(--color-border)] bg-white/95 p-3 shadow-[var(--shadow-panel)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={step === 3 ? onBack : onExit}>
            {step === 3 ? '返回修改' : '退出创建'}
          </Button>
          <Button variant="outline" onClick={onSaveDraft} disabled={saving || starting}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            保存草稿
          </Button>
        </div>
        <div className="flex gap-2">
          {step < 3 ? (
            <>
              <Button variant="secondary" disabled={step === 0 || saving || starting} onClick={onBack}>
                上一步
              </Button>
              <Button disabled={nextDisabled} onClick={onNext}>
                下一步
              </Button>
            </>
          ) : (
            <Button disabled={!confirmed || starting || nextDisabled} onClick={onStart}>
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              确认并启动
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function LeaveDialog({
  open,
  onOpenChange,
  onDiscard,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: () => void
  onSave: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>当前 CasePlan 尚未封存</DialogTitle>
          <DialogDescription>是否保存为草稿后离开？</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant="outline" onClick={onDiscard}>不保存离开</Button>
          <Button onClick={onSave}>保存草稿并离开</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ParallelRunDialog({
  open,
  onOpenChange,
  currentConcurrency,
  nextConcurrency,
  resource,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentConcurrency: number
  nextConcurrency: number
  resource: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>当前已有 RangeRun 正在运行</DialogTitle>
          <DialogDescription>是否创建新的并行任务？</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-sm md:grid-cols-2">
          <Info label="当前并发数" value={String(currentConcurrency)} />
          <Info label="新任务并发数" value={String(nextConcurrency)} />
          <Info label="启动后总并发" value={String(currentConcurrency + nextConcurrency)} />
          <Info label="预计资源占用" value={resource} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={onConfirm}>确认并行启动</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className="mt-1 font-semibold text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DashboardPage } from '@/pages/DashboardPage'
import { RunOverviewPage } from '@/pages/RunOverviewPage'
import { TasksPage } from '@/pages/TasksPage'
import { ResultsPage } from '@/pages/ResultsPage'
import { ResultDetailPage } from '@/pages/ResultDetailPage'
import { RunDataDispositionPage } from '@/pages/RunDataDispositionPage'
import { DataCenterPage } from '@/pages/DataCenterPage'
import { TrajectoryDatasetsPage } from '@/pages/TrajectoryDatasetsPage'
import { TrajectoryDatasetDetailPage } from '@/pages/TrajectoryDatasetDetailPage'
import { CptCorpusPage } from '@/pages/CptCorpusPage'
import { CptCorpusDetailPage } from '@/pages/CptCorpusDetailPage'
import { VulnerabilityDataPage } from '@/pages/VulnerabilityDataPage'
import { VulnerabilityDetailPage } from '@/pages/VulnerabilityDetailPage'
import { BenchmarkDatasetsPage } from '@/pages/BenchmarkDatasetsPage'
import { BenchmarkDatasetDetailPage } from '@/pages/BenchmarkDatasetDetailPage'
import { TrainingJobsPage } from '@/pages/TrainingJobsPage'
import { TrainingJobDetailPage } from '@/pages/TrainingJobDetailPage'
import { ModelArtifactsPage } from '@/pages/ModelArtifactsPage'
import { ModelArtifactDetailPage } from '@/pages/ModelArtifactDetailPage'
import { usePlatformFocus } from '@/hooks/usePlatformFocus'
import { useRangeTasks } from '@/hooks/useRangeTasks'
import { useDataCenter } from '@/hooks/useDataCenter'
import type { TaskCategory } from '@/types/range'

export default function App() {
  const [activeId, setActiveId] = useState('home')
  const [tasksDirty, setTasksDirty] = useState(false)
  const [pendingNavId, setPendingNavId] = useState<string | null>(null)
  const [selectedRunId, setSelectedRunId] = useState('')
  const [quickTaskCategory, setQuickTaskCategory] = useState<TaskCategory | undefined>()
  const [selectedDatasetId, setSelectedDatasetId] = useState('')
  const [selectedCorpusId, setSelectedCorpusId] = useState('')
  const [selectedVulnerabilityDatasetId, setSelectedVulnerabilityDatasetId] = useState('')
  const [selectedBenchmarkDatasetId, setSelectedBenchmarkDatasetId] = useState('')
  const [selectedTrainingJobId, setSelectedTrainingJobId] = useState('')
  const [selectedArtifactId, setSelectedArtifactId] = useState('')
  const { setFocusedRun } = useRangeTasks()
  const { focusTask } = usePlatformFocus()
  const { results } = useDataCenter()

  const handleNavigate = (id: string) => {
    if (activeId === 'tasks' && id !== 'tasks' && tasksDirty) {
      setPendingNavId(id)
      return
    }
    setActiveId(id)
  }

  const openResult = (runId: string) => {
    setSelectedRunId(runId)
    handleNavigate('result-detail')
  }

  const openRun = (runId: string) => {
    const result = results.find((item) => item.runId === runId)
    const summary = setFocusedRun(runId, result
      ? {
          taskName: result.taskName,
          category: result.taskCategory === '基准评测' ? 'benchmark' : 'scenario',
          benchmark: result.benchmark,
          status: result.verdict === 'Stopped' ? 'stopped' : 'completed',
          progress: result.progress,
          currentStage: result.attackStage ?? result.benchmark ?? 'Completed',
          stageDescription: '历史运行记录，已完成评分并生成报告。',
          environment: result.environmentKind ?? 'historical-mock-range',
          agent: result.agent,
          model: result.model,
          costUsed: result.cost,
          updatedAt: result.completedAt,
        }
      : undefined)
    setSelectedRunId(runId)
    if (summary) focusTask(summary.id, summary.category === 'benchmark' ? 'benchmark_run' : 'scenario_run')
    handleNavigate('run-detail')
  }

  const processRunData = (runId: string) => {
    setSelectedRunId(runId)
    handleNavigate('run-data')
  }

  const openDataset = (datasetId: string) => {
    setSelectedDatasetId(datasetId)
    handleNavigate('trajectory-detail')
  }

  const openCorpus = (id: string) => {
    setSelectedCorpusId(id)
    handleNavigate('cpt-detail')
  }

  const openVulnerabilityDataset = (id: string) => {
    setSelectedVulnerabilityDatasetId(id)
    handleNavigate('vulnerability-detail')
  }

  const openBenchmarkDataset = (id: string) => {
    setSelectedBenchmarkDatasetId(id)
    handleNavigate('benchmark-detail')
  }

  const openTrainingJob = (id: string) => {
    setSelectedTrainingJobId(id)
    focusTask(id, 'base_model_training')
    handleNavigate('training-detail')
  }

  const quickStartTask = (category: TaskCategory) => {
    setQuickTaskCategory(category)
    handleNavigate('tasks')
  }

  const openArtifact = (id: string) => {
    setSelectedArtifactId(id)
    handleNavigate('artifact-detail')
  }

  const openArtifactDataset = (type: 'cpt' | 'vulnerability', id: string) => {
    if (type === 'cpt') openCorpus(id)
    else openVulnerabilityDataset(id)
  }

  const leaveTasks = (saveDraft: boolean) => {
    if (saveDraft) window.dispatchEvent(new CustomEvent('range-task-save-draft'))
    setTasksDirty(false)
    setActiveId(pendingNavId ?? 'home')
    setPendingNavId(null)
  }

  const renderPage = () => {
    if (activeId === 'home') {
      return (
        <RunOverviewPage
          onNavigate={handleNavigate}
          onOpenResult={openResult}
          onOpenDataset={openDataset}
          onOpenRun={openRun}
          onOpenTrainingJob={openTrainingJob}
          onOpenCorpus={openCorpus}
          onOpenVulnerability={openVulnerabilityDataset}
          onOpenBenchmark={openBenchmarkDataset}
          onOpenArtifact={openArtifact}
          onQuickStartTask={quickStartTask}
        />
      )
    }

    if (activeId === 'run-detail' || activeId === 'rangerun') {
      return (
        <>
          <Header onNavigate={handleNavigate} onOpenResult={openResult} />
          <DashboardPage onNavigate={handleNavigate} />
        </>
      )
    }

    if (activeId === 'tasks') {
      return (
        <ErrorBoundary>
          <TasksPage
            onNavigate={handleNavigate}
            onDirtyChange={setTasksDirty}
            onOpenRun={openRun}
            defaultCategory={quickTaskCategory}
            onConsumedDefaultCategory={() => setQuickTaskCategory(undefined)}
          />
        </ErrorBoundary>
      )
    }

    if (activeId === 'results') {
      return (
        <ResultsPage
          onOpenResult={openResult}
          onProcessData={processRunData}
          onOpenDataset={openDataset}
          onOpenRun={openRun}
          onNavigate={handleNavigate}
        />
      )
    }

    if (activeId === 'result-detail') {
      return <ResultDetailPage runId={selectedRunId} onNavigate={handleNavigate} onOpenRun={openRun} onProcessData={processRunData} onOpenDataset={openDataset} />
    }

    if (activeId === 'run-data') {
      return <RunDataDispositionPage runId={selectedRunId} onBackResult={openResult} onOpenDataset={openDataset} onNavigate={handleNavigate} />
    }

    if (activeId === 'data-center') return <DataCenterPage onNavigate={handleNavigate} />
    if (activeId === 'trajectories') return <TrajectoryDatasetsPage onOpenDataset={openDataset} />
    if (activeId === 'trajectory-detail') return <TrajectoryDatasetDetailPage datasetId={selectedDatasetId} onNavigate={handleNavigate} />
    if (activeId === 'cpt') return <CptCorpusPage onOpenCorpus={openCorpus} onOpenTrainingJob={openTrainingJob} />
    if (activeId === 'cpt-detail') return <CptCorpusDetailPage id={selectedCorpusId} onNavigate={handleNavigate} />
    if (activeId === 'vulnerabilities') return <VulnerabilityDataPage onOpenVulnerability={openVulnerabilityDataset} onOpenTrainingJob={openTrainingJob} />
    if (activeId === 'vulnerability-detail') return <VulnerabilityDetailPage uuid={selectedVulnerabilityDatasetId} onNavigate={handleNavigate} />
    if (activeId === 'benchmarks') return <BenchmarkDatasetsPage onOpenBenchmark={openBenchmarkDataset} />
    if (activeId === 'benchmark-detail') return <BenchmarkDatasetDetailPage datasetId={selectedBenchmarkDatasetId} onNavigate={handleNavigate} />
    if (activeId === 'training') return <TrainingJobsPage onOpenJob={openTrainingJob} onOpenArtifacts={() => handleNavigate('training-artifacts')} />
    if (activeId === 'training-detail') return <TrainingJobDetailPage jobId={selectedTrainingJobId} onNavigate={handleNavigate} onOpenCpt={openCorpus} onOpenVulnerability={openVulnerabilityDataset} onOpenArtifact={openArtifact} />
    if (activeId === 'training-artifacts') return <ModelArtifactsPage onOpenArtifact={openArtifact} onOpenTraining={() => handleNavigate('training')} />
    if (activeId === 'artifact-detail') return <ModelArtifactDetailPage artifactId={selectedArtifactId} onNavigate={handleNavigate} onOpenJob={openTrainingJob} onOpenDataset={openArtifactDataset} />

    return <DataCenterPage onNavigate={handleNavigate} />
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar activeId={activeId} onNavigate={handleNavigate} onOpenRun={openRun} onOpenTrainingJob={openTrainingJob} />
        <div className="flex min-w-0 flex-1 flex-col">{renderPage()}</div>
      </div>

      <Dialog open={Boolean(pendingNavId)} onOpenChange={(open) => !open && setPendingNavId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>当前 CasePlan 尚未封存</DialogTitle>
            <DialogDescription>是否保存为草稿后离开？</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPendingNavId(null)}>取消</Button>
            <Button variant="outline" onClick={() => leaveTasks(false)}>不保存离开</Button>
            <Button onClick={() => leaveTasks(true)}>保存草稿并离开</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

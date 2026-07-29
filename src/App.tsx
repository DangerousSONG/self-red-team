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

export default function App() {
  const [activeId, setActiveId] = useState('home')
  const [tasksDirty, setTasksDirty] = useState(false)
  const [pendingNavId, setPendingNavId] = useState<string | null>(null)
  const [selectedRunId, setSelectedRunId] = useState('')
  const [selectedDatasetId, setSelectedDatasetId] = useState('')
  const [selectedCorpusId, setSelectedCorpusId] = useState('')
  const [selectedVulnerabilityDatasetId, setSelectedVulnerabilityDatasetId] = useState('')

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

  const leaveTasks = (saveDraft: boolean) => {
    if (saveDraft) window.dispatchEvent(new CustomEvent('range-task-save-draft'))
    setTasksDirty(false)
    setActiveId(pendingNavId ?? 'home')
    setPendingNavId(null)
  }

  const renderPage = () => {
    if (activeId === 'home') return <RunOverviewPage onNavigate={handleNavigate} onOpenResult={openResult} />

    if (activeId === 'rangerun') {
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
          <TasksPage onNavigate={handleNavigate} onDirtyChange={setTasksDirty} />
        </ErrorBoundary>
      )
    }

    if (activeId === 'results') {
      return (
        <ResultsPage
          onOpenResult={openResult}
          onProcessData={processRunData}
          onOpenDataset={openDataset}
          onNavigate={handleNavigate}
        />
      )
    }

    if (activeId === 'result-detail') {
      return <ResultDetailPage runId={selectedRunId} onNavigate={handleNavigate} onProcessData={processRunData} onOpenDataset={openDataset} />
    }

    if (activeId === 'run-data') {
      return <RunDataDispositionPage runId={selectedRunId} onBackResult={openResult} onOpenDataset={openDataset} onNavigate={handleNavigate} />
    }

    if (activeId === 'data-center') return <DataCenterPage onNavigate={handleNavigate} />
    if (activeId === 'trajectories') return <TrajectoryDatasetsPage onOpenDataset={openDataset} />
    if (activeId === 'trajectory-detail') return <TrajectoryDatasetDetailPage datasetId={selectedDatasetId} onNavigate={handleNavigate} />
    if (activeId === 'cpt') return <CptCorpusPage onOpenCorpus={openCorpus} />
    if (activeId === 'cpt-detail') return <CptCorpusDetailPage id={selectedCorpusId} onNavigate={handleNavigate} />
    if (activeId === 'vulnerabilities') return <VulnerabilityDataPage onOpenVulnerability={openVulnerabilityDataset} />
    if (activeId === 'vulnerability-detail') return <VulnerabilityDetailPage uuid={selectedVulnerabilityDatasetId} onNavigate={handleNavigate} />

    return <DataCenterPage onNavigate={handleNavigate} />
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar activeId={activeId} onNavigate={handleNavigate} />
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

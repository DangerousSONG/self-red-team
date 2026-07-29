import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DatasetDetailPanel,
  DatasetFileList,
  DatasetHero,
  DatasetIntroPanel,
  DatasetMetadataSidebar,
  DatasetTabs,
  DatasetToast,
  DatasetUsagePanel,
  RecordTable,
} from '@/components/datasets/DatasetComponents'
import { useDataCenter } from '@/hooks/useDataCenter'

interface BenchmarkDatasetDetailPageProps {
  datasetId: string
  onNavigate: (id: string) => void
}

const tabs = ['数据集介绍', '数据集详情', '评测任务', '数据文件', '使用说明']

export function BenchmarkDatasetDetailPage({ datasetId, onNavigate }: BenchmarkDatasetDetailPageProps) {
  const { benchmarkDatasets, benchmarkTasks } = useDataCenter()
  const dataset = benchmarkDatasets.find((item) => item.id === datasetId) ?? benchmarkDatasets[0]
  const tasks = useMemo(() => benchmarkTasks.filter((item) => item.datasetId === dataset.id), [benchmarkTasks, dataset.id])
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [toast, setToast] = useState('')

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--color-ink-muted)]">
            数据中心 / Benchmark 数据集 / <span className="font-semibold text-[var(--color-ink)]">{dataset.name}</span>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('benchmarks')}>
            <ArrowLeft className="h-4 w-4" />
            返回 Benchmark 数据集
          </Button>
        </div>

        <DatasetHero dataset={dataset} dataTypeLabel="Benchmark 数据集" scaleLabel={`${dataset.taskCount} 个任务 / ${dataset.projectCount} 个项目`} onToast={showToast} />
        <DatasetTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            {activeTab === '数据集介绍' ? <DatasetIntroPanel dataset={dataset} /> : null}
            {activeTab === '数据集详情' ? <DatasetDetailPanel dataset={dataset} /> : null}
            {activeTab === '评测任务' ? (
              <RecordTable
                heads={['Task ID', '项目', '漏洞类型', 'CVE / CWE', '任务类型', '难度', '输入类型', '输出要求', '验证方式', '状态']}
                rows={tasks.map((task) => (
                  <tr key={task.id} className="border-t border-[var(--color-border)]">
                    <td className="px-3 py-3 font-mono text-xs">{task.id}</td>
                    <td className="px-3 py-3">{task.project}</td>
                    <td className="px-3 py-3">{task.vulnerabilityType}</td>
                    <td className="px-3 py-3">{task.cveOrCwe}</td>
                    <td className="px-3 py-3">{task.taskType}</td>
                    <td className="px-3 py-3"><Badge variant={task.difficulty === 'Hard' ? 'danger' : task.difficulty === 'Medium' ? 'warning' : 'success'}>{task.difficulty}</Badge></td>
                    <td className="px-3 py-3">{task.inputType}</td>
                    <td className="px-3 py-3">{task.outputRequirement}</td>
                    <td className="px-3 py-3">{task.verificationMethod}</td>
                    <td className="px-3 py-3">{task.status}</td>
                  </tr>
                ))}
              />
            ) : null}
            {activeTab === '数据文件' ? <DatasetFileList files={dataset.files} onToast={showToast} /> : null}
            {activeTab === '使用说明' ? <DatasetUsagePanel dataset={dataset} /> : null}
          </div>
          <DatasetMetadataSidebar dataset={dataset} benchmark={dataset.benchmarkType} runCount={dataset.detail.relatedRuns.length} />
        </div>
      </div>
      <DatasetToast message={toast} />
    </main>
  )
}

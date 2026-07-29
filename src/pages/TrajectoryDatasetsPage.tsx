import { Database, Route } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDataCenter } from '@/hooks/useDataCenter'

interface TrajectoryDatasetsPageProps {
  onOpenDataset: (datasetId: string) => void
}

export function TrajectoryDatasetsPage({ onOpenDataset }: TrajectoryDatasetsPageProps) {
  const { trajectoryDatasets } = useDataCenter()

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div>
          <Badge variant="outline">
            <Route className="h-3.5 w-3.5" />
            Trajectory Assets
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold">轨迹数据集</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">管理攻防演练、Benchmark 评测和 Agent 执行过程中生成的轨迹数据</p>
        </div>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                <tr>
                  {['数据集名称', '数据集 ID', '任务类型', '数据来源', 'Benchmark', 'Agent 类型', '轨迹条数', '成功轨迹', '失败轨迹', '数据质量', '创建时间', '最近更新时间', '操作'].map((item) => <th key={item} className="px-3 py-2">{item}</th>)}
                </tr>
              </thead>
              <tbody>
                {trajectoryDatasets.map((dataset) => (
                  <tr key={dataset.id} className="border-t border-[var(--color-border)]">
                    <td className="px-3 py-3 font-semibold">{dataset.name}</td>
                    <td className="px-3 py-3 font-mono text-xs">{dataset.id}</td>
                    <td className="px-3 py-3">{dataset.taskType}</td>
                    <td className="px-3 py-3">{dataset.source}</td>
                    <td className="px-3 py-3">{dataset.benchmark ?? '-'}</td>
                    <td className="px-3 py-3">{dataset.agentType}</td>
                    <td className="px-3 py-3">{dataset.traceCount}</td>
                    <td className="px-3 py-3 text-[var(--color-success)]">{dataset.successCount}</td>
                    <td className="px-3 py-3 text-[var(--color-warning)]">{dataset.failureCount}</td>
                    <td className="px-3 py-3"><Badge variant="success">{dataset.quality}</Badge></td>
                    <td className="px-3 py-3">{dataset.createdAt}</td>
                    <td className="px-3 py-3">{dataset.updatedAt}</td>
                    <td className="px-3 py-3">
                      <Button size="sm" variant="secondary" onClick={() => onOpenDataset(dataset.id)}>
                        <Database className="h-4 w-4" />
                        查看详情
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

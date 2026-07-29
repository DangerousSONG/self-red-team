import { Copy, Edit3, Eye, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRangeTasks } from '@/hooks/useRangeTasks'
import type { Task } from '@/types/range'

const statusLabel = {
  draft: '草稿',
  configured: '已配置',
  running: '运行中',
  completed: '已完成',
}

const statusVariant = {
  draft: 'muted',
  configured: 'default',
  running: 'success',
  completed: 'outline',
} as const

interface TaskListTableProps {
  onEdit: (task: Task) => void
  onViewRun: () => void
}

export function TaskListTable({ onEdit, onViewRun }: TaskListTableProps) {
  const { taskList, startExistingTask, duplicateTask } = useRangeTasks()

  const handleStart = async (taskId: string) => {
    await startExistingTask(taskId)
    onViewRun()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>任务列表</CardTitle>
        <CardDescription>本地 Mock 任务记录，刷新页面后会通过 localStorage 保留。</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full min-w-[920px] border-collapse bg-white text-left text-sm">
            <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-3 py-3 font-semibold">任务名称</th>
                <th className="px-3 py-3 font-semibold">任务类型</th>
                <th className="px-3 py-3 font-semibold">环境</th>
                <th className="px-3 py-3 font-semibold">Agent</th>
                <th className="px-3 py-3 font-semibold">状态</th>
                <th className="px-3 py-3 font-semibold">创建时间</th>
                <th className="px-3 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {taskList.map((task) => (
                <tr key={task.id} className="border-t border-[var(--color-border)]">
                  <td className="px-3 py-3">
                    <div className="font-semibold text-[var(--color-ink)]">{task.name}</div>
                    <div className="mt-0.5 max-w-[260px] truncate text-xs text-[var(--color-ink-muted)]">
                      {task.objective}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[var(--color-ink-secondary)]">{task.type}</td>
                  <td className="px-3 py-3 font-mono text-xs text-[var(--color-ink-secondary)]">
                    {task.environment}
                  </td>
                  <td className="px-3 py-3 text-[var(--color-ink-secondary)]">{task.agent}</td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant[task.status]}>{statusLabel[task.status]}</Badge>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-[var(--color-ink-muted)]">
                    {task.createdAt}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>
                        <Edit3 className="h-3.5 w-3.5" />
                        编辑
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleStart(task.id)}>
                        <Play className="h-3.5 w-3.5" />
                        启动
                      </Button>
                      <Button size="sm" variant="ghost" onClick={onViewRun}>
                        <Eye className="h-3.5 w-3.5" />
                        查看运行
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => duplicateTask(task.id)}>
                        <Copy className="h-3.5 w-3.5" />
                        复制
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

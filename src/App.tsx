import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DashboardPage } from '@/pages/DashboardPage'
import { TasksPage } from '@/pages/TasksPage'

export default function App() {
  const [activeId, setActiveId] = useState('home')
  const [tasksDirty, setTasksDirty] = useState(false)
  const [pendingNavId, setPendingNavId] = useState<string | null>(null)

  const handleNavigate = (id: string) => {
    if (activeId === 'tasks' && id !== 'tasks' && tasksDirty) {
      setPendingNavId(id)
      return
    }
    setActiveId(id)
  }

  const leaveTasks = (saveDraft: boolean) => {
    if (saveDraft) {
      window.dispatchEvent(new CustomEvent('range-task-save-draft'))
    }
    setTasksDirty(false)
    setActiveId(pendingNavId ?? 'home')
    setPendingNavId(null)
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar activeId={activeId} onNavigate={handleNavigate} />
        <div className="flex min-w-0 flex-1 flex-col">
          {activeId === 'home' ? (
            <>
              <Header onNavigate={handleNavigate} />
              <DashboardPage onNavigate={handleNavigate} />
            </>
          ) : (
            <TasksPage onNavigate={handleNavigate} onDirtyChange={setTasksDirty} />
          )}
        </div>
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

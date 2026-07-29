import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { DashboardPage } from '@/pages/DashboardPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { navItems } from '@/lib/data'

export default function App() {
  const [activeId, setActiveId] = useState('home')
  const activeItem = navItems.find((item) => item.id === activeId)

  return (
    <div className="flex min-h-screen">
      <Sidebar activeId={activeId} onNavigate={setActiveId} />
      <div className="flex min-w-0 flex-1 flex-col">
        {activeId === 'home' ? (
          <>
            <Header />
            <DashboardPage />
          </>
        ) : (
          <PlaceholderPage
            title={activeItem?.label ?? '模块'}
            description="该模块已纳入 AI 安全靶场控制台导航，后续可接入真实 API 与编排后端。"
          />
        )}
      </div>
    </div>
  )
}

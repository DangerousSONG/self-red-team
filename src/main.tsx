import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DataCenterProvider } from '@/hooks/useDataCenter'
import { RangeTaskProvider } from '@/hooks/useRangeTasks'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RangeTaskProvider>
      <DataCenterProvider>
        <App />
      </DataCenterProvider>
    </RangeTaskProvider>
  </StrictMode>,
)

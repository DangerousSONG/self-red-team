import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RangeTaskProvider } from '@/hooks/useRangeTasks'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RangeTaskProvider>
      <App />
    </RangeTaskProvider>
  </StrictMode>,
)

import { useEffect, useState } from 'react'
import type { DatasetViewMode } from '@/components/datasets/DatasetComponents'

export type DatasetBrowserState = {
  search: string
  source: string
  dataType: string
  status: string
  tag: string
  sort: string
  view: DatasetViewMode
}

const defaultState: DatasetBrowserState = {
  search: '',
  source: '',
  dataType: '',
  status: '',
  tag: '',
  sort: '最近更新',
  view: 'card',
}

export function useDatasetBrowserState(key: string) {
  const [state, setState] = useState<DatasetBrowserState>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  const update = <K extends keyof DatasetBrowserState>(name: K, value: DatasetBrowserState[K]) => {
    setState((current) => ({ ...current, [name]: value }))
  }

  return {
    state,
    update,
    clear: () => setState(defaultState),
  }
}

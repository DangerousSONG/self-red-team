import { useEffect, useState } from 'react'
import { agentAssets as initialAgentAssets, modelAssets as initialModelAssets } from '@/lib/mock-data/capability-assets'
import type { AgentAsset, ModelAsset } from '@/types/capability-asset'

const CAPABILITY_ASSETS_KEY = 'self-red-team.capability-assets.v1'

type CapabilityAssetState = {
  modelAssets: ModelAsset[]
  agentAssets: AgentAsset[]
}

const initialState: CapabilityAssetState = {
  modelAssets: initialModelAssets,
  agentAssets: initialAgentAssets,
}

function readState(): CapabilityAssetState {
  try {
    const raw = window.localStorage.getItem(CAPABILITY_ASSETS_KEY)
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState
  } catch {
    return initialState
  }
}

export function useCapabilityAssets() {
  const [state] = useState(readState)

  useEffect(() => {
    window.localStorage.setItem(CAPABILITY_ASSETS_KEY, JSON.stringify(state))
  }, [state])

  return state
}

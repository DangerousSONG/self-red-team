import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { ZoneNode, type ZoneNodeData } from '@/components/topology/ZoneNode'
import { AssetNode, type AssetNodeData } from '@/components/topology/AssetNode'
import { BoundaryNode, type BoundaryNodeData } from '@/components/topology/BoundaryNode'
import { AgentMarker, type AgentMarkerData } from '@/components/topology/AgentMarker'
import { AssetDetailPanel } from '@/components/topology/AssetDetailPanel'
import { nodeDetails, type TopologyNodeDetail } from '@/lib/data'
import { useAttackRuntime } from '@/hooks/useAttackRuntime'
import { ATTACK_EDGE_IDS, NODE_MARKER_OFFSET } from '@/lib/attack-runtime'

type CanvasNodeData = ZoneNodeData | AssetNodeData | BoundaryNodeData | AgentMarkerData

const nodeTypes = {
  zone: ZoneNode,
  asset: AssetNode,
  boundary: BoundaryNode,
  agentMarker: AgentMarker,
}

const ZONE_W = 188
const ZONE_H = 420
const ZONE_Y = 20
const GAP = 16
const zoneX = (index: number) => index * (ZONE_W + GAP)

const baseNodes: Node<CanvasNodeData>[] = [
  {
    id: 'zone-external',
    type: 'zone',
    position: { x: zoneX(0), y: ZONE_Y },
    data: { label: 'External Zone', subtitle: 'Internet / Threat', tone: 'external' },
    style: { width: ZONE_W, height: ZONE_H },
    draggable: false,
    selectable: false,
    connectable: false,
    zIndex: -2,
  },
  {
    id: 'zone-perimeter',
    type: 'zone',
    position: { x: zoneX(1), y: ZONE_Y },
    data: { label: 'Perimeter Zone', subtitle: 'Firewall / LB', tone: 'perimeter' },
    style: { width: ZONE_W, height: ZONE_H },
    draggable: false,
    selectable: false,
    connectable: false,
    zIndex: -2,
  },
  {
    id: 'zone-dmz',
    type: 'zone',
    position: { x: zoneX(2), y: ZONE_Y },
    data: { label: 'DMZ Zone', subtitle: 'Web Gateway', tone: 'dmz' },
    style: { width: ZONE_W, height: ZONE_H },
    draggable: false,
    selectable: false,
    connectable: false,
    zIndex: -2,
  },
  {
    id: 'zone-service',
    type: 'zone',
    position: { x: zoneX(3), y: ZONE_Y },
    data: { label: 'Service Zone', subtitle: 'Business API', tone: 'service' },
    style: { width: ZONE_W, height: ZONE_H },
    draggable: false,
    selectable: false,
    connectable: false,
    zIndex: -2,
  },
  {
    id: 'zone-protected',
    type: 'zone',
    position: { x: zoneX(4), y: ZONE_Y },
    data: { label: 'Protected Zone', subtitle: 'Database', tone: 'protected' },
    style: { width: ZONE_W, height: ZONE_H },
    draggable: false,
    selectable: false,
    connectable: false,
    zIndex: -2,
  },
  {
    id: 'attack-source',
    type: 'boundary',
    position: { x: zoneX(0) + 20, y: 90 },
    data: {
      label: 'Attack Agent',
      type: 'External Threat',
      kind: 'attacker',
      statusLabel: 'ACTIVE',
    },
    draggable: false,
    zIndex: 5,
  },
  {
    id: 'internet',
    type: 'boundary',
    position: { x: zoneX(0) + 20, y: 250 },
    data: {
      label: 'Internet',
      type: 'Public Network',
      kind: 'internet',
      statusLabel: 'UPLINK',
      riskState: 'normal',
    },
    draggable: false,
    zIndex: 5,
  },
  {
    id: 'fw-edge',
    type: 'boundary',
    position: { x: zoneX(1) + 20, y: 110 },
    data: {
      label: 'fw-edge',
      type: 'Edge Firewall',
      kind: 'firewall',
      statusLabel: 'COMPROMISED',
      riskState: 'compromised',
    },
    zIndex: 5,
  },
  {
    id: 'lb01',
    type: 'boundary',
    position: { x: zoneX(1) + 20, y: 260 },
    data: {
      label: 'lb01',
      type: 'Load Balancer',
      kind: 'lb',
      statusLabel: 'RUNNING',
      riskState: 'normal',
    },
    zIndex: 5,
  },
  {
    id: 'edge01',
    type: 'asset',
    position: { x: zoneX(2) + 20, y: 100 },
    data: {
      label: 'edge01',
      type: 'Web Gateway',
      statusLabel: 'RUNNING',
      riskState: 'normal',
    },
    zIndex: 5,
  },
  {
    id: 'edge02',
    type: 'asset',
    position: { x: zoneX(2) + 20, y: 260 },
    data: {
      label: 'edge02',
      type: 'Web Gateway',
      statusLabel: 'RUNNING',
      riskState: 'normal',
    },
    zIndex: 5,
  },
  {
    id: 'app01',
    type: 'asset',
    position: { x: zoneX(3) + 20, y: 100 },
    data: {
      label: 'app01',
      type: 'API / Business',
      statusLabel: 'RUNNING',
      riskState: 'normal',
    },
    zIndex: 5,
  },
  {
    id: 'app02',
    type: 'asset',
    position: { x: zoneX(3) + 20, y: 260 },
    data: {
      label: 'app02',
      type: 'API / Business',
      statusLabel: 'RUNNING',
      riskState: 'normal',
    },
    zIndex: 5,
  },
  {
    id: 'vault01',
    type: 'asset',
    position: { x: zoneX(4) + 20, y: 180 },
    data: {
      label: 'vault01',
      type: 'Database',
      statusLabel: 'PROTECTED',
      riskState: 'defended',
    },
    zIndex: 5,
  },
]

const networkEdges: Edge[] = [
  {
    id: 'net-inet-fw',
    source: 'internet',
    sourceHandle: 'right',
    target: 'fw-edge',
    targetHandle: 'left',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 14, height: 14 },
  },
  {
    id: 'net-fw-lb',
    source: 'fw-edge',
    sourceHandle: 'bottom',
    target: 'lb01',
    targetHandle: 'top',
    type: 'smoothstep',
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
  },
  {
    id: 'net-lb-edge01',
    source: 'lb01',
    sourceHandle: 'right',
    target: 'edge01',
    targetHandle: 'left',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 14, height: 14 },
  },
  {
    id: 'net-lb-edge02',
    source: 'lb01',
    sourceHandle: 'right',
    target: 'edge02',
    targetHandle: 'left',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 14, height: 14 },
  },
  {
    id: 'net-edge01-edge02',
    source: 'edge01',
    sourceHandle: 'bottom',
    target: 'edge02',
    targetHandle: 'top',
    type: 'smoothstep',
    style: { stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' },
  },
  {
    id: 'net-edge01-app01',
    source: 'edge01',
    sourceHandle: 'right',
    target: 'app01',
    targetHandle: 'left',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 14, height: 14 },
  },
  {
    id: 'net-edge02-app02',
    source: 'edge02',
    sourceHandle: 'right',
    target: 'app02',
    targetHandle: 'left',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 14, height: 14 },
  },
  {
    id: 'net-app01-app02',
    source: 'app01',
    sourceHandle: 'bottom',
    target: 'app02',
    targetHandle: 'top',
    type: 'smoothstep',
    style: { stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' },
  },
  {
    id: 'net-app01-vault',
    source: 'app01',
    sourceHandle: 'right',
    target: 'vault01',
    targetHandle: 'left',
    type: 'smoothstep',
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 14, height: 14 },
  },
  {
    id: 'net-app02-vault',
    source: 'app02',
    sourceHandle: 'right',
    target: 'vault01',
    targetHandle: 'left',
    type: 'smoothstep',
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8', width: 14, height: 14 },
  },
]

function buildAttackEdges(pathDone: string[], pathCurrent?: string, pathBlocked: string[] = []): Edge[] {
  const defs: Array<{ id: string; source: string; target: string; sourceHandle?: string; targetHandle?: string }> =
    [
      {
        id: ATTACK_EDGE_IDS.agentToEdge01,
        source: 'attack-source',
        target: 'edge01',
        sourceHandle: 'right',
        targetHandle: 'left',
      },
      {
        id: ATTACK_EDGE_IDS.edge01ToApp01,
        source: 'edge01',
        target: 'app01',
        sourceHandle: 'right',
        targetHandle: 'left',
      },
      {
        id: ATTACK_EDGE_IDS.app01ToVault,
        source: 'app01',
        target: 'vault01',
        sourceHandle: 'right',
        targetHandle: 'left',
      },
    ]

  return defs
    .filter((d) => pathDone.includes(d.id) || pathCurrent === d.id || pathBlocked.includes(d.id))
    .map((d) => {
      const blocked = pathBlocked.includes(d.id)
      const current = pathCurrent === d.id && !blocked
      const done = pathDone.includes(d.id) && !current && !blocked

      return {
        id: d.id,
        source: d.source,
        target: d.target,
        sourceHandle: d.sourceHandle,
        targetHandle: d.targetHandle,
        type: 'bezier',
        animated: current,
        className: current ? 'attack-path-edge' : undefined,
        label: blocked ? 'BLOCKED' : current ? 'LIVE' : undefined,
        labelStyle: {
          fill: blocked ? '#b42318' : '#dc2626',
          fontSize: 9,
          fontWeight: 700,
        },
        labelBgStyle: { fill: '#fff5f5', fillOpacity: 0.95 },
        style: {
          stroke: '#dc2626',
          strokeWidth: current ? 2.8 : 2.2,
          strokeDasharray: blocked ? '2 4' : current ? '6 4' : undefined,
          opacity: done || current || blocked ? 1 : 0.35,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#dc2626',
          width: 16,
          height: 16,
        },
        zIndex: 40,
      } satisfies Edge
    })
}

function assetStateForStep(
  nodeId: string,
  stepIndex: number,
  currentNode: string,
): Pick<AssetNodeData, 'statusLabel' | 'riskState' | 'currentAction'> {
  const isCurrent = currentNode === nodeId

  if (nodeId === 'edge01') {
    if (stepIndex <= 1) {
      return {
        statusLabel: 'UNDER ATTACK',
        riskState: 'under_attack',
        currentAction: isCurrent ? (stepIndex === 0 ? 'port_scan' : 'http_exploit') : undefined,
      }
    }
    if (stepIndex === 2) {
      return {
        statusLabel: 'UNDER ATTACK',
        riskState: 'under_attack',
        currentAction: isCurrent ? 'priv_esc' : undefined,
      }
    }
    return { statusLabel: 'COMPROMISED', riskState: 'compromised' }
  }

  if (nodeId === 'app01') {
    if (stepIndex < 3) return { statusLabel: 'RUNNING', riskState: 'normal' }
    if (stepIndex === 3) {
      return {
        statusLabel: 'UNDER ATTACK',
        riskState: 'under_attack',
        currentAction: 'sql_inject',
      }
    }
    return { statusLabel: 'COMPROMISED', riskState: 'compromised' }
  }

  if (nodeId === 'vault01') {
    if (stepIndex >= 4) {
      return {
        statusLabel: 'PROTECTED',
        riskState: 'defended',
        currentAction: isCurrent ? 'exfil_attempt' : undefined,
      }
    }
    return { statusLabel: 'PROTECTED', riskState: 'defended' }
  }

  return { statusLabel: 'RUNNING', riskState: 'normal' }
}

export function TopologyCanvas() {
  const { current, stepIndex } = useAttackRuntime()
  const [selected, setSelected] = useState<TopologyNodeDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const nodes = useMemo(() => {
    const markerPos = NODE_MARKER_OFFSET[current.atNode] ?? NODE_MARKER_OFFSET.app01

    const updated = baseNodes.map((node) => {
      if (node.type !== 'asset') return node
      const state = assetStateForStep(node.id, stepIndex, current.atNode)
      return {
        ...node,
        data: {
          ...(node.data as AssetNodeData),
          ...state,
        },
      }
    })

    const marker: Node<AgentMarkerData> = {
      id: 'agent-live-marker',
      type: 'agentMarker',
      position: markerPos,
      data: {
        action: current.action,
        tool: current.tool,
        target: current.target,
        status: current.status,
      },
      draggable: false,
      selectable: false,
      zIndex: 50,
    }

    return [...updated, marker]
  }, [current, stepIndex])

  const edges = useMemo(
    () => [
      ...networkEdges,
      ...buildAttackEdges(current.pathDone, current.pathCurrent, current.pathBlocked),
    ],
    [current],
  )

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    if (node.type === 'zone' || node.type === 'agentMarker') return
    if (node.id === 'attack-source' || node.id === 'internet') return
    const detail = nodeDetails[node.id]
    if (detail) {
      setSelected(detail)
      setDetailOpen(true)
    }
  }, [])

  return (
    <div className="flex gap-3">
      <div className="h-[500px] min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[#f5f8fc]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.06 }}
          minZoom={0.5}
          maxZoom={1.4}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#d0dae8" />
          <Controls showInteractive={false} className="!shadow-sm !border-[var(--color-border)] !bg-white" />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === 'zone') return '#cbd5e1'
              if (n.type === 'agentMarker') return '#1e3a8a'
              if (n.id === 'attack-source') return '#1e3a8a'
              const state =
                (n.data as AssetNodeData | BoundaryNodeData | undefined)?.riskState ?? 'normal'
              if (state === 'compromised') return '#b42318'
              if (state === 'under_attack') return '#ea580c'
              if (state === 'defended') return '#0f8a4c'
              return '#3b82f6'
            }}
            nodeColor={(n) => (n.type === 'zone' ? '#eef2f7' : '#ffffff')}
            maskColor="rgb(15 27 45 / 0.08)"
            className="!border-[var(--color-border)] !bg-white"
          />
        </ReactFlow>
      </div>
      {detailOpen ? (
        <AssetDetailPanel
          node={selected}
          onClose={() => {
            setDetailOpen(false)
            setSelected(null)
          }}
        />
      ) : null}
    </div>
  )
}

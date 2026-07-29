import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialCptCorpus } from '@/lib/mock-data/data-center/cpt-corpus'
import { initialResults } from '@/lib/mock-data/data-center/results'
import {
  initialTraces,
  initialTrajectoryDatasets,
} from '@/lib/mock-data/data-center/trajectory-datasets'
import { initialVulnerabilityRecords } from '@/lib/mock-data/data-center/vulnerabilities'
import type {
  CptCorpusItem,
  DataCenterState,
  DataDispositionJob,
  DataDispositionStatus,
  EvaluationResult,
  TraceRecord,
  TrajectoryDataset,
} from '@/types/data-center'
import type { RangeRun } from '@/types/range'
import type { VulnerabilityRecord } from '@/types/vulnerability'

const DATA_CENTER_KEY = 'self-red-team.data-center'

const initialState: DataCenterState = {
  results: initialResults,
  trajectoryDatasets: initialTrajectoryDatasets,
  traces: initialTraces,
  cptCorpus: initialCptCorpus,
  vulnerabilityRecords: initialVulnerabilityRecords,
  dataDispositionJobs: [],
}

interface DataDispositionInput {
  runId: string
  method: 'create' | 'append' | 'skip'
  datasetName?: string
  datasetDescription?: string
  targetDatasetId?: string
  selectedArtifacts: string[]
  options: Record<string, boolean>
}

interface DataCenterContextValue extends DataCenterState {
  generateResult: (run: RangeRun) => EvaluationResult
  updateDataDispositionStatus: (runId: string, status: DataDispositionStatus) => void
  createTrajectoryDataset: (input: DataDispositionInput) => TrajectoryDataset
  appendToTrajectoryDataset: (input: DataDispositionInput) => TrajectoryDataset | null
  skipDataDisposition: (runId: string) => void
  generateCptCandidates: (runId: string) => CptCorpusItem[]
  createVulnerabilityRecord: (runId: string) => VulnerabilityRecord
  linkVulnerabilityRecord: (uuid: string, runId: string) => void
  processRunData: (input: DataDispositionInput) => { datasetId?: string }
}

const DataCenterContext = createContext<DataCenterContextValue | null>(null)

function readState() {
  try {
    const raw = window.localStorage.getItem(DATA_CENTER_KEY)
    return raw ? ({ ...initialState, ...JSON.parse(raw) } as DataCenterState) : initialState
  } catch {
    return initialState
  }
}

function nowText() {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .replaceAll('/', '-')
}

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function resultFromRun(run: RangeRun): EvaluationResult {
  const benchmark = run.taskName.includes('CyberGym')
    ? 'CyberGym'
    : run.taskName.includes('ExploitGym')
      ? 'ExploitGym'
      : run.taskName.includes('PatchEval')
        ? 'PatchEval'
        : undefined

  const metrics =
    benchmark === 'CyberGym'
      ? [
          { label: '漏洞定位正确率', value: '84%', tone: 'success' as const },
          { label: '漏洞验证成功率', value: '78%', tone: 'brand' as const },
          { label: 'PoC 有效性', value: '82%', tone: 'success' as const },
          { label: '平均步骤数', value: '24', tone: 'warning' as const },
          { label: 'Token 成本', value: '280k', tone: 'brand' as const },
        ]
      : benchmark === 'ExploitGym'
        ? [
            { label: 'Exploit 成功率', value: '76%', tone: 'success' as const },
            { label: 'Payload 有效性', value: '80%', tone: 'brand' as const },
            { label: '目标达成情况', value: 'Success', tone: 'success' as const },
            { label: '稳定复现次数', value: '3/3', tone: 'success' as const },
            { label: 'Token 成本', value: '240k', tone: 'brand' as const },
          ]
        : benchmark === 'PatchEval'
          ? [
              { label: '漏洞修复率', value: '88%', tone: 'success' as const },
              { label: '功能测试通过率', value: '92%', tone: 'success' as const },
              { label: '安全测试通过率', value: '86%', tone: 'brand' as const },
              { label: '回归测试通过率', value: '90%', tone: 'success' as const },
              { label: 'Patch 质量评分', value: '82', tone: 'brand' as const },
            ]
          : [
              { label: '攻击成功率', value: '72%', tone: 'brand' as const },
              { label: '任务完成度', value: '86%', tone: 'success' as const },
              { label: '风险等级', value: 'High', tone: 'danger' as const },
              { label: '漏洞数量', value: '3', tone: 'warning' as const },
              { label: '证据完整性', value: '94%', tone: 'success' as const },
            ]

  return {
    runId: run.id,
    taskName: run.taskName,
    taskCategory: benchmark ? 'Benchmark 评测' : '场景演练',
    benchmark,
    agent: run.agent,
    model: run.model,
    verdict: 'Success',
    score: benchmark ? 84 : 78,
    progress: 100,
    duration: '64 min',
    cost: 72,
    completedAt: nowText(),
    dataDispositionStatus: 'unhandled',
    metrics,
    process: benchmark
      ? benchmark === 'PatchEval'
        ? ['源码分析', '漏洞定位', 'Patch 生成', '功能测试', '安全测试']
        : benchmark === 'ExploitGym'
          ? ['环境分析', '漏洞理解', 'Payload 构造', 'Exploit 执行', '目标验证']
          : ['源码分析', '漏洞定位', '验证脚本', '结果验证']
      : ['Recon', 'Initial Access', 'Privilege Escalation', 'Lateral Movement', 'Impact'],
    evidence: [
      {
        id: uniqueId('ev'),
        type: 'Agent 工具调用',
        title: '关键工具调用',
        summary: 'Agent 在受控环境中完成关键阶段验证，并形成可审计事件。',
        raw: 'tool=controlled_executor action=verify_target_state',
        cutoff: nowText(),
        snapshotId: uniqueId('SNAP'),
      },
      {
        id: uniqueId('ev'),
        type: 'Payload / PoC / Patch',
        title: '数据产物封存',
        summary: '产物已脱敏并进入候选数据产物列表，不包含可直接用于恶意利用的完整载荷。',
        raw: 'artifact=<redacted safe mock artifact>',
        cutoff: nowText(),
        snapshotId: uniqueId('SNAP'),
      },
    ],
    attribution: {
      successReasons: ['任务路径选择稳定', '证据快照完整', '预算控制有效'],
      failureReasons: ['少量无效探测增加成本'],
      keyDecisions: ['优先验证目标状态变化，再封存证据'],
      invalidAttempts: ['一次不兼容工具调用被策略拦截'],
      risks: ['需要保持沙箱隔离与脱敏策略'],
      suggestions: ['沉淀高质量轨迹并生成 CPT 候选语料'],
    },
    artifacts: [
      { id: 'agent-trace', type: 'Agent 轨迹', name: `${run.id}_agent_trace.jsonl`, count: 18, quality: '高' },
      { id: 'tool-trace', type: '工具调用轨迹', name: `${run.id}_tool_calls.jsonl`, count: 26, quality: '中高' },
      { id: 'cpt-candidate', type: 'CPT 候选语料', name: `${run.id}_summary.md`, count: 4, quality: '中高' },
      { id: 'vulnerability', type: '漏洞记录', name: `${run.id}_vulnerability.json`, count: 1, quality: '中' },
    ],
  }
}

export function DataCenterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataCenterState>(readState)

  useEffect(() => {
    window.localStorage.setItem(DATA_CENTER_KEY, JSON.stringify(state))
  }, [state])

  const updateDataDispositionStatus = useCallback((runId: string, status: DataDispositionStatus) => {
    setState((current) => ({
      ...current,
      results: current.results.map((result) =>
        result.runId === runId ? { ...result, dataDispositionStatus: status } : result,
      ),
    }))
  }, [])

  const generateResult = useCallback((run: RangeRun) => {
    const result = resultFromRun(run)
    setState((current) => ({
      ...current,
      results: current.results.some((item) => item.runId === run.id)
        ? current.results.map((item) => (item.runId === run.id ? result : item))
        : [result, ...current.results],
    }))
    return result
  }, [])

  const generateCptCandidates = useCallback((runId: string) => {
    const items: CptCorpusItem[] = [
      {
        id: uniqueId('cpt'),
        title: `${runId} 攻击链摘要`,
        type: '演练过程摘要',
        source: '演练自动生成',
        language: 'zh-CN',
        tokenCount: 1800,
        qualityScore: 82,
        desensitized: true,
        createdAt: nowText(),
        status: '候选',
        body: '本语料为受控演练的抽象摘要，描述任务目标、关键决策、证据封存和风险控制，不包含可直接滥用的完整攻击载荷。',
        relatedRunId: runId,
        tags: ['range-run', 'cpt-candidate'],
      },
    ]
    setState((current) => ({ ...current, cptCorpus: [...items, ...current.cptCorpus] }))
    return items
  }, [])

  const createVulnerabilityRecord = useCallback((runId: string) => {
    const record: VulnerabilityRecord = {
      uuid: `RangeRun:${runId}:mock${Math.random().toString(16).slice(2, 8)}`,
      description: 'Mock 演练发现的新漏洞记录，来自受控 RangeRun 证据产物。',
      datePublished: null,
      dateUpdated: new Date().toISOString(),
      relations: [],
      extra: {
        severity: 'High',
        cwe: 'CWE-20',
        sandboxStatus: '已生成沙箱',
        fromExercise: true,
        sources: [
          {
            name: 'RangeRun',
            originId: runId,
            data: { evidenceSnapshot: uniqueId('SNAP'), generatedBy: 'Mock disposition flow' },
          },
        ],
      },
    }
    setState((current) => ({
      ...current,
      vulnerabilityRecords: [record, ...current.vulnerabilityRecords],
    }))
    return record
  }, [])

  const createTrajectoryDataset = useCallback((input: DataDispositionInput) => {
    const dataset: TrajectoryDataset = {
      id: uniqueId('tds'),
      name: input.datasetName || `Run ${input.runId} 轨迹数据集`,
      description: input.datasetDescription || '由运行数据处理流程创建的 Mock 轨迹数据集。',
      taskType: '自动沉淀',
      source: 'RangeRun',
      agentType: 'Mixed Agent',
      usage: '训练候选 / 评测回放',
      tags: ['auto-disposition', input.runId],
      visibility: 'Workspace',
      traceCount: 8,
      successCount: 6,
      failureCount: 2,
      quality: '中高',
      createdAt: nowText(),
      updatedAt: nowText(),
      sourceRunIds: [input.runId],
    }
    const traces = makeTracesForDataset(dataset.id, input.runId)
    setState((current) => ({
      ...current,
      trajectoryDatasets: [dataset, ...current.trajectoryDatasets],
      traces: [...traces, ...current.traces],
    }))
    updateDataDispositionStatus(input.runId, 'created_dataset')
    return dataset
  }, [updateDataDispositionStatus])

  const appendToTrajectoryDataset = useCallback((input: DataDispositionInput) => {
    if (!input.targetDatasetId) return null
    const traces = makeTracesForDataset(input.targetDatasetId, input.runId)
    let target: TrajectoryDataset | null = null
    setState((current) => ({
      ...current,
      trajectoryDatasets: current.trajectoryDatasets.map((dataset) => {
        if (dataset.id !== input.targetDatasetId) return dataset
        target = {
          ...dataset,
          traceCount: dataset.traceCount + traces.length,
          successCount: dataset.successCount + 6,
          failureCount: dataset.failureCount + 2,
          updatedAt: nowText(),
          sourceRunIds: Array.from(new Set([...dataset.sourceRunIds, input.runId])),
        }
        return target
      }),
      traces: [...traces, ...current.traces],
    }))
    updateDataDispositionStatus(input.runId, 'appended_dataset')
    return target
  }, [updateDataDispositionStatus])

  const skipDataDisposition = useCallback((runId: string) => {
    updateDataDispositionStatus(runId, 'ignored')
  }, [updateDataDispositionStatus])

  const linkVulnerabilityRecord = useCallback((uuid: string, runId: string) => {
    setState((current) => ({
      ...current,
      vulnerabilityRecords: current.vulnerabilityRecords.map((record) =>
        record.uuid === uuid
          ? {
              ...record,
              extra: {
                ...record.extra,
                linkedRuns: [...((record.extra.linkedRuns as string[] | undefined) ?? []), runId],
              },
            }
          : record,
      ),
    }))
  }, [])

  const processRunData = useCallback(
    (input: DataDispositionInput) => {
      const job: DataDispositionJob = {
        id: uniqueId('job'),
        runId: input.runId,
        method: input.method,
        targetDatasetId: input.targetDatasetId,
        selectedArtifacts: input.selectedArtifacts,
        options: input.options,
        status: 'completed',
        createdAt: nowText(),
      }
      setState((current) => ({
        ...current,
        dataDispositionJobs: [job, ...current.dataDispositionJobs],
      }))
      if (input.method === 'skip') {
        skipDataDisposition(input.runId)
        return {}
      }
      const dataset =
        input.method === 'create'
          ? createTrajectoryDataset(input)
          : appendToTrajectoryDataset(input)
      generateCptCandidates(input.runId)
      createVulnerabilityRecord(input.runId)
      return { datasetId: dataset?.id }
    },
    [
      appendToTrajectoryDataset,
      createTrajectoryDataset,
      createVulnerabilityRecord,
      generateCptCandidates,
      skipDataDisposition,
    ],
  )

  const value = useMemo(
    () => ({
      ...state,
      generateResult,
      updateDataDispositionStatus,
      createTrajectoryDataset,
      appendToTrajectoryDataset,
      skipDataDisposition,
      generateCptCandidates,
      createVulnerabilityRecord,
      linkVulnerabilityRecord,
      processRunData,
    }),
    [
      state,
      generateResult,
      updateDataDispositionStatus,
      createTrajectoryDataset,
      appendToTrajectoryDataset,
      skipDataDisposition,
      generateCptCandidates,
      createVulnerabilityRecord,
      linkVulnerabilityRecord,
      processRunData,
    ],
  )

  return <DataCenterContext.Provider value={value}>{children}</DataCenterContext.Provider>
}

function makeTracesForDataset(datasetId: string, runId: string): TraceRecord[] {
  return Array.from({ length: 8 }, (_, index) => ({
    id: uniqueId('trace'),
    datasetId,
    runId,
    task: `Run ${runId} 沉淀轨迹`,
    agent: 'Mock Agent',
    model: 'Mock InternLM',
    verdict: index % 4 === 0 ? 'Partial' : 'Success',
    steps: 10 + index,
    token: 90000 + index * 5000,
    cost: 18 + index,
    quality: index % 3 === 0 ? '高' : '中高',
    createdAt: nowText(),
    observation: 'Observation 摘要：环境状态已记录。',
    planningSummary: '结构化规划摘要：分解目标、执行工具、验证结果。',
    action: '执行受控工具调用。',
    toolCall: 'tool.run({ name: "mock_tool" })',
    toolResult: '工具返回已脱敏结构化结果。',
    feedback: 'Verifier 标记该回合可用于训练候选。',
    finalResult: '完成',
    score: 78 + index,
    evidenceRef: uniqueId('SNAP'),
  }))
}

export function useDataCenter() {
  const context = useContext(DataCenterContext)
  if (!context) {
    throw new Error('useDataCenter must be used within DataCenterProvider')
  }
  return context
}

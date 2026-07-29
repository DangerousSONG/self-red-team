export type LifecycleStatus = 'done' | 'running' | 'waiting'

export interface LifecycleStep {
  id: number
  title: string
  status: LifecycleStatus
}

export type NodeRiskState = 'normal' | 'attacker' | 'compromised' | 'under_attack' | 'defended'

export interface TopologyNodeDetail {
  id: string
  label: string
  type: string
  zone: string
  zoneLabel: string
  ip: string
  service: string
  openPorts: string[]
  os: string
  status: 'Running' | 'Ready' | 'Isolated' | 'Provisioned'
  statusLabel: string
  risk: string
  riskLabel: string
  riskState: NodeRiskState
  recentEvents: string[]
  agentActions: string[]
}

export const navItems = [
  { id: 'home', label: '首页', icon: 'LayoutDashboard' },
  { id: 'scenarios', label: '场景目录', icon: 'Library' },
  { id: 'agents', label: 'Agent管理', icon: 'Bot' },
  { id: 'models', label: '模型管理', icon: 'Cpu' },
  { id: 'caseplan', label: 'CasePlan', icon: 'FileText' },
  { id: 'orchestration', label: '运行编排', icon: 'Workflow' },
  { id: 'rangerun', label: 'RangeRun', icon: 'PlayCircle' },
  { id: 'resources', label: '资源管理', icon: 'Server' },
  { id: 'topology', label: '网络拓扑', icon: 'Network' },
  { id: 'evidence', label: '证据中心', icon: 'ShieldCheck' },
  { id: 'scoring', label: '评分结果', icon: 'BarChart3' },
  { id: 'history', label: '历史演练', icon: 'History' },
  { id: 'settings', label: '系统设置', icon: 'Settings' },
] as const

export const summaryCards = [
  {
    key: 'scenario',
    label: '当前场景',
    value: '数据库攻击防御演练',
    hint: 'Scenario · SQL Injection Defense',
    accent: 'brand',
  },
  {
    key: 'agents',
    label: 'Agent',
    value: 'Attack Agent',
    secondary: 'Defense Agent',
    hint: '注册 Agent · Dual Role',
    accent: 'brand',
  },
  {
    key: 'models',
    label: '模型',
    value: 'Shusheng-35B',
    secondary: 'Guard-0.8B',
    hint: 'Model Gateway 已绑定',
    accent: 'brand',
  },
  {
    key: 'budget',
    label: '资源预算',
    value: '2小时 · 4 VM · 200元',
    hint: 'Budget Caps · Hard Limit',
    accent: 'warning',
  },
  {
    key: 'status',
    label: '当前状态',
    value: '运行中',
    hint: 'RangeRun · RR-2026-0724-011',
    accent: 'success',
    live: true,
  },
] as const

export const lifecycleSteps: LifecycleStep[] = [
  { id: 1, title: 'Scenario选择', status: 'done' },
  { id: 2, title: 'CasePlan生成', status: 'done' },
  { id: 3, title: 'Resource Provision', status: 'done' },
  { id: 4, title: 'Environment Ready', status: 'done' },
  { id: 5, title: 'Agent Execution', status: 'running' },
  { id: 6, title: 'Evidence Collection', status: 'waiting' },
  { id: 7, title: 'Verification', status: 'waiting' },
  { id: 8, title: 'Score', status: 'waiting' },
]

export const agentTraces = [
  {
    time: '10:01',
    agent: 'Attack Agent',
    action: 'Agent启动',
    target: 'Access Edge',
    risk: 'Low',
  },
  {
    time: '10:03',
    agent: 'Attack Agent',
    action: '调用SQL工具',
    target: 'Tool Executor VM',
    risk: 'Medium',
  },
  {
    time: '10:05',
    agent: 'Attack Agent',
    action: '访问数据库节点',
    target: 'app01 / Service',
    risk: 'High',
  },
  {
    time: '10:07',
    agent: 'Defense Agent',
    action: '发现漏洞',
    target: 'vault01 / Protected',
    risk: 'Critical',
  },
  {
    time: '10:10',
    agent: 'Attack Agent',
    action: '完成任务',
    target: 'CasePlan Objective',
    risk: 'Medium',
  },
]

export const runTimeline = [
  { step: 1, title: '选择场景 / Agent / 模型', status: 'done' as const },
  { step: 2, title: '生成不可修改 CasePlan', status: 'done' as const },
  { step: 3, title: 'Guardian 注册资源', status: 'done' as const },
  { step: 4, title: 'Provider 创建环境', status: 'done' as const },
  { step: 5, title: 'Runner 启动 Agent', status: 'done' as const },
  { step: 6, title: '隔离检查', status: 'done' as const },
  { step: 7, title: 'Agent 执行任务', status: 'running' as const },
  { step: 8, title: '采集证据', status: 'waiting' as const },
  { step: 9, title: '销毁环境', status: 'waiting' as const },
  { step: 10, title: '离线评分', status: 'waiting' as const },
]

export const evidencePipeline = [
  { id: 'observer', label: 'Observer', desc: '行为观测' },
  { id: 'storage', label: 'Evidence Storage', desc: '不可变存储' },
  { id: 'snapshot', label: 'Snapshot', desc: '环境快照' },
  { id: 'verifier', label: 'Verifier', desc: '离线验证' },
  { id: 'scorer', label: 'Scorer', desc: '评分引擎' },
  { id: 'verdict', label: 'Verdict', desc: '终局判定' },
]

export const scoringMetrics = [
  { label: '攻击成功率', value: '72%', tone: 'brand' },
  { label: '发现漏洞数量', value: '3', tone: 'warning' },
  { label: '风险等级', value: 'High', tone: 'danger' },
  { label: '任务完成度', value: '86%', tone: 'success' },
]

export const nodeDetails: Record<string, TopologyNodeDetail> = {
  'fw-edge': {
    id: 'fw-edge',
    label: 'fw-edge',
    type: 'Edge Firewall',
    zone: 'Perimeter',
    zoneLabel: 'Perimeter Zone',
    ip: '10.0.0.1',
    service: 'North-South Edge Firewall',
    openPorts: ['443', '80'],
    os: 'pfSense',
    status: 'Running',
    statusLabel: 'COMPROMISED',
    risk: 'Perimeter Breached',
    riskLabel: 'HIGH',
    riskState: 'compromised',
    recentEvents: [
      'Suspicious inbound session allowed',
      'TLS fingerprint anomaly from external agent',
    ],
    agentActions: ['probe_firewall', 'bypass_rule_check'],
  },
  lb01: {
    id: 'lb01',
    label: 'lb01',
    type: 'Load Balancer',
    zone: 'Perimeter',
    zoneLabel: 'Perimeter Zone',
    ip: '10.0.0.10',
    service: 'HTTPS Load Balancer',
    openPorts: ['443'],
    os: 'HAProxy',
    status: 'Running',
    statusLabel: 'RUNNING',
    risk: 'Normal',
    riskLabel: 'LOW',
    riskState: 'normal',
    recentEvents: ['Traffic shifted to edge01 pool', 'Health check OK'],
    agentActions: ['observe_backend_pool'],
  },
  edge01: {
    id: 'edge01',
    label: 'edge01',
    type: 'Web Gateway',
    zone: 'DMZ',
    zoneLabel: 'DMZ Zone',
    ip: '10.0.1.10',
    service: 'HTTPS:443',
    openPorts: ['443', '80', '8443'],
    os: 'Debian 12',
    status: 'Running',
    statusLabel: 'COMPROMISED',
    risk: 'Compromised',
    riskLabel: 'HIGH',
    riskState: 'compromised',
    recentEvents: [
      'Web shell indicator detected',
      'Credential stuffing succeeded',
      'Pivot toward Service Network initiated',
    ],
    agentActions: ['http_fingerprint', 'webshell_deploy', 'credential_reuse'],
  },
  edge02: {
    id: 'edge02',
    label: 'edge02',
    type: 'Web Gateway',
    zone: 'DMZ',
    zoneLabel: 'DMZ Zone',
    ip: '10.0.1.11',
    service: 'HTTPS:443',
    openPorts: ['443', '80'],
    os: 'Debian 12',
    status: 'Running',
    statusLabel: 'RUNNING',
    risk: 'Normal',
    riskLabel: 'LOW',
    riskState: 'normal',
    recentEvents: ['Standby gateway healthy', 'No exploit indicator'],
    agentActions: [],
  },
  app01: {
    id: 'app01',
    label: 'app01',
    type: 'API / Business Service',
    zone: 'Service',
    zoneLabel: 'Service Zone',
    ip: '10.0.2.20',
    service: 'API / SQL',
    openPorts: ['8080'],
    os: 'Ubuntu 22.04 LTS',
    status: 'Running',
    statusLabel: 'UNDER ATTACK',
    risk: 'Under Attack',
    riskLabel: 'HIGH',
    riskState: 'under_attack',
    recentEvents: [
      'SQL Injection Attempt',
      'Privilege Escalation Blocked',
      'Abnormal ORM query volume',
    ],
    agentActions: ['sql_inject', 'http_fingerprint', 'privilege_escalation'],
  },
  app02: {
    id: 'app02',
    label: 'app02',
    type: 'API / Business Service',
    zone: 'Service',
    zoneLabel: 'Service Zone',
    ip: '10.0.2.21',
    service: 'Business API',
    openPorts: ['8081'],
    os: 'Ubuntu 22.04 LTS',
    status: 'Running',
    statusLabel: 'RUNNING',
    risk: 'Normal',
    riskLabel: 'LOW',
    riskState: 'normal',
    recentEvents: ['Service healthy', 'No lateral attempt observed'],
    agentActions: [],
  },
  vault01: {
    id: 'vault01',
    label: 'vault01',
    type: 'Sensitive Database',
    zone: 'Protected',
    zoneLabel: 'Protected Zone',
    ip: '10.0.3.10',
    service: 'Database',
    openPorts: ['5432'],
    os: 'Hardened Linux',
    status: 'Isolated',
    statusLabel: 'PROTECTED',
    risk: 'Defended',
    riskLabel: 'LOW',
    riskState: 'defended',
    recentEvents: [
      'Unauthorized access attempt denied',
      'No data exfiltration observed',
      'Isolation policy active',
    ],
    agentActions: ['blocked_exfil_attempt'],
  },
}

export const topologyLegend = [
  { key: 'external', label: '外部攻击源', color: '#1e3a8a' },
  { key: 'compromised', label: '已攻陷', color: '#b42318' },
  { key: 'under_attack', label: '当前攻击', color: '#c2410c' },
  { key: 'defended', label: '防御保护', color: '#0f8a4c' },
  { key: 'attack_path', label: '攻击 Overlay', color: '#dc2626' },
  { key: 'network', label: '企业网络链路', color: '#3b82f6' },
] as const

export const architectureLayers = {
  controlPlane: {
    title: 'Control Plane',
    responsibilities: ['Scenario', 'Agent', 'Model', 'Budget', 'Scheduler'],
    output: 'CasePlan',
  },
  accessEdge: {
    title: 'Access Edge',
    subtitle: 'Agent 唯一入口',
    apis: ['Tool API', 'Observation API', 'Model Gateway', 'Artifact Upload'],
    note: 'Agent 不能直接访问底层环境',
  },
  executionLayer: {
    title: 'Execution Layer',
    components: ['Guardian', 'Provider', 'Runner'],
    responsibilities: ['Create', 'Isolation', 'Destroy'],
  },
}

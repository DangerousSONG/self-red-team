import { useState } from 'react'
import { ArrowLeft, Bot } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCapabilityAssets } from '@/hooks/useCapabilityAssets'
import { agentTypeText, statusText } from '@/pages/CapabilityCenterPage'

interface AgentDetailPageProps {
  agentId: string
  onNavigate: (id: string) => void
  onOpenModel: (id: string) => void
}

const tabs = ['智能体介绍', '运行配置', '工具与权限', '能力评测', '使用情况', '版本记录']

export function AgentDetailPage({ agentId, onNavigate, onOpenModel }: AgentDetailPageProps) {
  const { agentAssets, modelAssets } = useCapabilityAssets()
  const agent = agentAssets.find((item) => item.id === agentId) ?? agentAssets[0]
  const model = modelAssets.find((item) => item.id === agent.modelAssetId)
  const [activeTab, setActiveTab] = useState(tabs[0])

  return (
    <main className="flex-1 overflow-x-hidden px-6 py-5">
      <div className="mx-auto max-w-[1500px] space-y-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--color-ink-muted)]">
            模型与智能体中心 / 智能体资产 / <span className="font-semibold text-[var(--color-ink)]">{agent.name}</span>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('agents')}><ArrowLeft className="h-4 w-4" />返回智能体资产</Button>
        </div>

        <section className="rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-white via-[#f8f7ff] to-[#eef2ff] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={agent.status === 'ready' ? 'success' : agent.status === 'updating' ? 'warning' : 'muted'}>{statusText(agent.status)}</Badge>
                <Badge variant="outline">{agentTypeText(agent.type)}</Badge>
                <Badge variant="muted">{model?.name ?? agent.modelAssetId}</Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold">{agent.name}</h1>
              <p className="mt-2 font-mono text-sm text-[var(--color-ink-secondary)]">{agent.id} / {agent.version}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{agent.capabilities.map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}</div>
            </div>
            <Bot className="h-10 w-10 text-violet-600" />
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <Mini label="类型" value={agentTypeText(agent.type)} />
          <Mini label="状态" value={statusText(agent.status)} />
          <Mini label="当前模型" value={model?.name ?? agent.modelAssetId} action={() => onOpenModel(agent.modelAssetId)} />
          <Mini label="支持环境" value={agent.supportedEnvironments.slice(0, 2).join(' / ')} />
          <Mini label="能力标签" value={agent.capabilities.slice(0, 2).join(' / ')} />
          <Mini label="最近成功率" value={`${agent.successRate ?? 0}%`} />
          <Mini label="工具数量" value={`${agent.toolIds.length} 个`} />
          <Mini label="CasePlan 引用" value={`${agent.referencedCasePlanIds.length} 个`} />
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-white p-1">
          {tabs.map((tab) => (
            <button key={tab} className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === tab ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-soft)]'}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === '智能体介绍' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Info title="智能体定位" body={agent.description} />
            <Info title="适用任务" body={agent.capabilities.join('；')} />
            <Info title="输入" body={agent.inputs.join('；')} />
            <Info title="输出" body={agent.outputs.join('；')} />
            <Info title="支持场景" body={agent.supportedEnvironments.join('；')} />
            <Info title="支持 Benchmark" body={agent.supportedBenchmarks.join('；') || '-'} />
            <Info title="使用限制" body={agent.limitations.join('；')} />
          </div>
        ) : null}

        {activeTab === '运行配置' ? (
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-3">
              <Mini label="当前基础模型" value={model?.name ?? agent.modelAssetId} action={() => onOpenModel(agent.modelAssetId)} />
              <Mini label="守卫模型" value="Guard-0.8B" />
              <Mini label="裁判模型" value="Judge-7B" />
              <Mini label="最大步骤数" value="80" />
              <Mini label="默认超时" value="120 min" />
              <Mini label="默认 Token 预算" value="800K" />
              <Mini label="默认成本预算" value="200 元" />
              <Mini label="并发能力" value="1-4" />
              <Mini label="环境要求" value={agent.supportedEnvironments.join(' / ')} />
            </CardContent>
          </Card>
        ) : null}

        {activeTab === '工具与权限' ? (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                  <tr>{['工具名称', '工具类型', '权限等级', '支持环境', '状态', '最近使用时间'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
                </thead>
                <tbody>
                  {agent.toolIds.map((tool, index) => (
                    <tr key={tool} className="border-t border-[var(--color-border)]">
                      <td className="px-3 py-3 font-semibold">{tool}</td>
                      <td className="px-3 py-3">{index % 2 ? 'Verifier' : 'Executor'}</td>
                      <td className="px-3 py-3">{index % 2 ? '只读' : '受控执行'}</td>
                      <td className="px-3 py-3">{agent.supportedEnvironments[0] ?? '-'}</td>
                      <td className="px-3 py-3"><Badge variant="success">Ready</Badge></td>
                      <td className="px-3 py-3">{agent.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === '能力评测' ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            {metricsForAgent(agent.type, agent.successRate ?? 70).map((metric) => (
              <Card key={metric.label}>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold">{metric.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-[var(--color-brand)]">{metric.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {activeTab === '使用情况' ? (
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-3">
              <Mini label="关联 CasePlan" value={`${agent.referencedCasePlanIds.length} 个`} />
              <Mini label="最近 RangeRun" value="RR-20260729-SCENE-001" />
              <Mini label="关联模型" value={model?.name ?? agent.modelAssetId} action={() => onOpenModel(agent.modelAssetId)} />
              <Mini label="关联数据集" value="3 个" />
              <Mini label="总调用次数" value="1,248" />
              <Mini label="Token" value="4.6M" />
              <Mini label="成本" value="826 元" />
              <Mini label="成功率" value={`${agent.successRate ?? 0}%`} />
            </CardContent>
          </Card>
        ) : null}

        {activeTab === '版本记录' ? (
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-3">
              {[agent.version, '1.0.0', '0.9.0'].map((version, index) => (
                <div key={version} className="rounded-lg border border-[var(--color-border)] bg-white p-3">
                  <Badge variant={index === 0 ? 'success' : 'muted'}>{index === 0 ? '当前版本' : '历史版本'}</Badge>
                  <div className="mt-2 font-semibold">{version}</div>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-ink-secondary)]">当前模型：{model?.name ?? agent.modelAssetId}；能力变化：{index === 0 ? '稳定版本' : '历史评测记录'}。</p>
                  <div className="mt-2 text-xs text-[var(--color-ink-muted)]">{index === 0 ? agent.updatedAt : agent.createdAt}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  )
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="text-sm leading-7 text-[var(--color-ink-secondary)]">{body}</CardContent>
    </Card>
  )
}

function Mini({ label, value, action }: { label: string; value: string; action?: () => void }) {
  return (
    <button type="button" className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-left" onClick={action}>
      <div className="text-xs text-[var(--color-ink-muted)]">{label}</div>
      <div className={`mt-1 break-words text-sm font-semibold ${action ? 'text-[var(--color-brand)]' : ''}`}>{value}</div>
    </button>
  )
}

function metricsForAgent(type: string, successRate: number) {
  if (type === 'whitebox_discovery') return [
    { label: 'CyberGym 综合分', value: 82 },
    { label: '漏洞定位正确率', value: '84%' },
    { label: 'PoC 有效性', value: '82%' },
  ]
  if (type === 'greybox_exploitation') return [
    { label: 'ExploitGym 综合分', value: 81 },
    { label: 'Exploit 成功率', value: '76%' },
    { label: '目标达成率', value: '86%' },
  ]
  if (type === 'whitebox_patch') return [
    { label: 'PatchEval 综合分', value: 84 },
    { label: '修复率', value: '88%' },
    { label: '功能测试通过率', value: '92%' },
    { label: '安全测试通过率', value: '86%' },
  ]
  return [
    { label: '场景演练成功率', value: `${successRate}%` },
    { label: '平均任务进度', value: '82%' },
    { label: '平均耗时', value: '64 min' },
    { label: '平均成本', value: '72 元' },
  ]
}

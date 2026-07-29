import type { ReactNode } from 'react'
import { ArrowRight, Copy, Download, Heart, MoreHorizontal, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DatasetAsset, DatasetFile, DatasetMetadata } from '@/types/dataset'

export type DatasetViewMode = 'card' | 'list'

export function DatasetToast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-ink)] shadow-[var(--shadow-panel)]">
      {message}
    </div>
  )
}

export function DatasetSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-xl border border-[var(--color-border)] bg-white p-4">
          <div className="h-4 w-32 rounded bg-[var(--color-surface-muted)]" />
          <div className="mt-4 h-7 w-56 rounded bg-[var(--color-surface-muted)]" />
          <div className="mt-4 h-16 rounded bg-[var(--color-surface-muted)]" />
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="h-12 rounded bg-[var(--color-surface-muted)]" />
            <div className="h-12 rounded bg-[var(--color-surface-muted)]" />
            <div className="h-12 rounded bg-[var(--color-surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DatasetEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-white p-10 text-center">
      <div className="text-base font-semibold">没有匹配的数据集</div>
      <p className="mt-2 text-sm text-[var(--color-ink-secondary)]">调整搜索词或筛选条件后再试。</p>
      <Button className="mt-4" variant="secondary" onClick={onClear}>清空筛选</Button>
    </div>
  )
}

export function DatasetFilterBar({
  search,
  onSearchChange,
  source,
  onSourceChange,
  dataType,
  onDataTypeChange,
  status,
  onStatusChange,
  tag,
  onTagChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  count,
  sources,
  dataTypes,
  tags,
  onClear,
}: {
  search: string
  onSearchChange: (value: string) => void
  source: string
  onSourceChange: (value: string) => void
  dataType: string
  onDataTypeChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  tag: string
  onTagChange: (value: string) => void
  sort: string
  onSortChange: (value: string) => void
  view: DatasetViewMode
  onViewChange: (value: DatasetViewMode) => void
  count: number
  sources: string[]
  dataTypes: string[]
  tags: string[]
  onClear: () => void
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-[var(--color-ink-secondary)]">当前结果：{count} 个数据集</div>
          <div className="flex rounded-lg border border-[var(--color-border)] bg-white p-1">
            <button
              type="button"
              className={cn('rounded-md px-3 py-1.5 text-sm', view === 'card' ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-secondary)]')}
              onClick={() => onViewChange('card')}
            >
              卡片视图
            </button>
            <button
              type="button"
              className={cn('rounded-md px-3 py-1.5 text-sm', view === 'list' ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-secondary)]')}
              onClick={() => onViewChange('list')}
            >
              列表视图
            </button>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-8">
          <input className="h-10 rounded-md border border-[var(--color-border-strong)] px-3 text-sm xl:col-span-2" placeholder="搜索数据集名称、标签或 ID" value={search} onChange={(event) => onSearchChange(event.target.value)} />
          <Select value={source} onChange={onSourceChange} options={sources} placeholder="来源筛选" />
          <Select value={dataType} onChange={onDataTypeChange} options={dataTypes} placeholder="数据类型" />
          <Select value={status} onChange={onStatusChange} options={['published', 'updating', 'draft', 'archived']} placeholder="状态筛选" />
          <Select value={tag} onChange={onTagChange} options={tags} placeholder="标签筛选" />
          <Select value={sort} onChange={onSortChange} options={['最近更新', '数据量最多', '质量最高', '名称']} placeholder="排序" />
          <Button variant="secondary" onClick={onClear}>清空筛选</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
}) {
  return (
    <select
      className="h-10 rounded-md border border-[var(--color-border-strong)] bg-white px-3 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  )
}

export function DatasetAssetCard({
  dataset,
  eyebrow,
  metrics,
  onOpen,
  onToast,
  selected = false,
}: {
  dataset: DatasetAsset
  eyebrow: string
  metrics: Array<{ label: string; value: string | number; tone?: 'brand' | 'success' | 'warning' | 'danger' }>
  onOpen: () => void
  onToast: (message: string) => void
  selected?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group h-full rounded-xl border bg-white p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-[var(--color-brand)]/50 hover:shadow-[var(--shadow-panel)]',
        selected ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/15' : 'border-[var(--color-border)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="outline">{eyebrow}</Badge>
          <h3 className="mt-2 text-lg font-semibold leading-snug text-[var(--color-ink)]">{dataset.name}</h3>
          <div className="mt-1 font-mono text-xs text-[var(--color-ink-muted)]">{dataset.id}</div>
        </div>
        <div className="flex gap-1">
          <IconAction label="收藏" onClick={() => onToast(`已收藏「${dataset.name}」`)}><Heart className="h-4 w-4" /></IconAction>
          <IconAction label="更多" onClick={() => onToast('更多菜单：查看详情 / 收藏 / 复制数据集 ID / 导出 / 查看来源')}><MoreHorizontal className="h-4 w-4" /></IconAction>
        </div>
      </div>
      <p className="mt-3 min-h-[48px] text-sm leading-6 text-[var(--color-ink-secondary)]">{dataset.description}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {metrics.slice(0, 6).map((metric) => <DatasetStat key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} compact />)}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {dataset.tags.slice(0, 4).map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-sm">
        <span className="text-[var(--color-ink-muted)]">更新于 {dataset.updatedAt}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-brand)]">
          进入数据集
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}

function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <span
      role="button"
      tabIndex={0}
      title={label}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation()
          onClick()
        }
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)]"
    >
      {children}
    </span>
  )
}

export function DatasetStat({
  label,
  value,
  tone = 'brand',
  compact = false,
}: {
  label: string
  value: string | number
  tone?: 'brand' | 'success' | 'warning' | 'danger'
  compact?: boolean
}) {
  const color = {
    brand: 'text-[var(--color-brand)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    danger: 'text-[var(--color-danger)]',
  }[tone]
  return (
    <div className={cn('rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3', compact && 'p-2')}>
      <div className="truncate text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className={cn('mt-1 truncate font-semibold', compact ? 'text-sm' : 'text-lg', color)}>{value}</div>
    </div>
  )
}

export function DatasetHero({
  dataset,
  dataTypeLabel,
  scaleLabel,
  onToast,
}: {
  dataset: DatasetMetadata
  dataTypeLabel: string
  scaleLabel: string
  onToast: (message: string) => void
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-white via-[#f6f9fd] to-[var(--color-brand-soft)] shadow-[var(--shadow-card)]">
      <div className="relative p-5">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#d7e0ec_1px,transparent_1px),linear-gradient(90deg,#d7e0ec_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{dataTypeLabel}</Badge>
              <Badge variant={dataset.status === 'published' ? 'success' : dataset.status === 'updating' ? 'warning' : 'muted'}>{statusText(dataset.status)}</Badge>
              <Badge variant="outline">{visibilityText(dataset.visibility)}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">{dataset.name}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink-secondary)]">{dataset.description}</p>
            <div className="mt-4 grid gap-2 text-xs md:grid-cols-4">
              <Mini label="Dataset ID" value={dataset.id} mono />
              <Mini label="数据规模" value={scaleLabel} />
              <Mini label="来源" value={dataset.sourceTypes.join(', ')} />
              <Mini label="最近更新" value={dataset.updatedAt} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {dataset.tags.map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onToast(`已收藏「${dataset.name}」`)}>
              <Star className="h-4 w-4" />
              收藏
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onToast('Mock：导出任务已创建')}>
              <Download className="h-4 w-4" />
              导出
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onToast('更多：复制 ID / 查看来源 / 版本信息')}>
              <MoreHorizontal className="h-4 w-4" />
              更多
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Mini({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white/85 px-3 py-2">
      <div className="text-[10px] text-[var(--color-ink-muted)]">{label}</div>
      <div className={cn('mt-1 truncate font-semibold text-[var(--color-ink)]', mono && 'font-mono text-[11px]')}>{value}</div>
    </div>
  )
}

export function DatasetTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn('rounded-lg px-4 py-2 text-sm font-medium', active === tab ? 'bg-[var(--color-brand)] text-white' : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-brand-soft)]')}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export function DatasetMetadataSidebar({ dataset, benchmark, runCount }: { dataset: DatasetMetadata; benchmark?: string; runCount: number }) {
  const rows = [
    ['发布机构', dataset.organization],
    ['所属项目', dataset.project],
    ['数据负责人', dataset.owner],
    ['发布日期', dataset.createdAt],
    ['最近更新时间', dataset.updatedAt],
    ['许可证', dataset.license.name],
    ['可见范围', visibilityText(dataset.visibility)],
    ['数据版本', dataset.version],
    ['数据来源', dataset.sourceTypes.join(', ')],
    ['关联 Benchmark', benchmark ?? '-'],
    ['关联 Run 数量', String(runCount)],
    ['联系信息', dataset.contact],
  ]
  return (
    <aside className="sticky top-24 space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>发布信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[var(--color-border)] bg-white p-2.5">
              <div className="text-[10px] text-[var(--color-ink-muted)]">{label}</div>
              <div className="mt-1 break-words text-sm font-semibold">{value}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  )
}

export function DatasetIntroPanel({ dataset }: { dataset: DatasetMetadata }) {
  const rows: Array<[string, string]> = [
    ['简介', dataset.introduction.summary],
    ['数据来源', dataset.introduction.sources],
    ['数据用途', dataset.introduction.purpose],
    ['数据构建方式', dataset.introduction.buildMethod],
    ['数据质量说明', dataset.introduction.quality],
    ['许可证', dataset.introduction.licenseNote],
    ['注意事项', dataset.introduction.cautions],
    ['引用方式', dataset.introduction.citation],
  ]
  return <InfoGrid rows={rows} />
}

export function DatasetDetailPanel({ dataset }: { dataset: DatasetMetadata }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <DatasetStat label="数据规模" value={dataset.detail.scale} />
        <DatasetStat label="质量评分" value={dataset.qualityScore} tone="success" />
        <DatasetStat label="本周新增" value={dataset.weeklyAdded} tone="warning" />
      </div>
      <Card>
        <CardHeader><CardTitle>字段结构</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
              <tr><th className="px-3 py-2">字段</th><th className="px-3 py-2">类型</th><th className="px-3 py-2">说明</th></tr>
            </thead>
            <tbody>
              {dataset.detail.schema.map((row) => (
                <tr key={row.field} className="border-t border-[var(--color-border)]">
                  <td className="px-3 py-3 font-mono text-xs">{row.field}</td>
                  <td className="px-3 py-3">{row.type}</td>
                  <td className="px-3 py-3">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <InfoList title="数据分布" items={dataset.detail.distribution} />
        <InfoList title="质量统计" items={dataset.detail.qualityStats} />
        <InfoList title="来源构成" items={dataset.detail.sourceComposition} />
        <Card>
          <CardHeader><CardTitle>处理流程</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {dataset.detail.processingFlow.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-white p-2.5 text-sm">
                <Badge variant="outline">{index + 1}</Badge>
                {step}
              </div>
            ))}
            <p className="pt-2 text-sm leading-6 text-[var(--color-ink-secondary)]">{dataset.detail.updatePolicy}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <Card key={label}>
          <CardContent className="p-4">
            <div className="text-sm font-semibold">{label}</div>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink-secondary)]">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function InfoList({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm">
            <span className="text-[var(--color-ink-secondary)]">{item.label}</span>
            <span className="font-semibold text-[var(--color-brand)]">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function DatasetFileList({ files, onToast }: { files: DatasetFile[]; onToast: (message: string) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle>数据文件</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>
              {['文件名', '格式', '大小', '记录数量', '校验值', '创建时间', '状态', '操作'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-3 font-semibold">{file.name}</td>
                <td className="px-3 py-3">{file.format.toUpperCase()}</td>
                <td className="px-3 py-3">{formatSize(file.size)}</td>
                <td className="px-3 py-3">{file.recordCount}</td>
                <td className="px-3 py-3 font-mono text-xs">{file.checksum ?? '-'}</td>
                <td className="px-3 py-3">{file.createdAt}</td>
                <td className="px-3 py-3"><Badge variant={file.status === 'ready' ? 'success' : file.status === 'processing' ? 'warning' : 'danger'}>{file.status}</Badge></td>
                <td className="px-3 py-3">
                  <Button size="sm" variant="ghost" onClick={() => onToast('Mock：文件导出请求已记录')}>导出</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export function DatasetUsagePanel({ dataset }: { dataset: DatasetMetadata }) {
  const rows: Array<[string, string]> = [
    ['字段说明', dataset.usage.fields.join('；')],
    ['使用场景', dataset.usage.scenarios.join('；')],
    ['版本说明', dataset.usage.versionNote],
    ['引用格式', dataset.usage.citation],
  ]

  return (
    <div className="space-y-4">
      <InfoGrid rows={rows} />
      <Card>
        <CardHeader><CardTitle>数据加载示例</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <pre className="overflow-x-auto rounded-lg bg-[#0b1220] p-4 text-xs text-[#d1e7dd]">{dataset.usage.loadExample}</pre>
          <pre className="overflow-x-auto rounded-lg bg-[#0b1220] p-4 text-xs text-[#d1e7dd]">{dataset.usage.cliExample}</pre>
        </CardContent>
      </Card>
    </div>
  )
}

export function RecordTable({
  heads,
  rows,
}: {
  heads: string[]
  rows: ReactNode
}) {
  return (
    <Card>
      <CardHeader><CardTitle>数据记录</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
            <tr>{heads.map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export function CopyButton({ value, onToast }: { value: string; onToast: (message: string) => void }) {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => {
        void navigator.clipboard?.writeText(value)
        onToast('已复制到剪贴板')
      }}
    >
      <Copy className="h-4 w-4" />
      复制
    </Button>
  )
}

export function statusText(status: DatasetMetadata['status']) {
  return { draft: '草稿', published: '已发布', updating: '更新中', archived: '已归档' }[status]
}

export function visibilityText(visibility: DatasetMetadata['visibility']) {
  return { public: '公开', internal: '内部', private: '私有' }[visibility]
}

function formatSize(size: number) {
  if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(size / 1024)} KB`
}

# AI 安全面场 / Cyber Range Console

面向 AI Agent 安全评测的本地 Mock 控制台，用于演示从评测任务创建、RangeRun 运行、结果报告到数据资产沉淀的完整闭环。

## 本阶段新增

- 评测结果页拆分为“基准评测”和“场景演练”两个 Tab，统计卡、筛选项和表格字段会随当前分类变化。
- 基准评测结果覆盖 CyberGym、ExploitGym、PatchEval，并按漏洞挖掘、漏洞利用、漏洞修复展示差异化指标。
- 数据中心首页保留三类资产入口：轨迹数据集、CPT 语料库、漏洞数据，每张入口卡展示数据集数量、记录总量、本周新增和最近更新时间。
- 三类数据资产页均默认使用数据集卡片视图，并支持搜索、筛选、排序、卡片 / 列表视图切换、空状态、加载骨架和 Mock Toast。
- CPT 语料库已改为“语料数据集 → 语料条目”的结构；漏洞数据已改为“漏洞数据集 → VulnerabilityRecord”的结构。
- 数据集详情页统一为 Dataset Hub 形态：顶部 Header、页签导航、主内容区和右侧发布信息栏。
- 结果页的数据沉淀状态可直接跳转到目标轨迹数据集；处理完成后展示“查看数据集”和“返回评测结果”入口。

## 完整操作路径

1. 进入“评测任务”。
2. 在“场景演练”或“基准评测”中选择任务。
3. 完成资源匹配、运行配置和 CasePlan 确认。
4. 启动 RangeRun，进入运行控制台。
5. 点击“完成演练”进入 Completed 状态。
6. 点击“查看评测报告”进入结果详情页。
7. 在报告页或结果列表中点击“处理数据”。
8. 选择需要沉淀的数据产物。
9. 选择创建新轨迹数据集、加入已有轨迹数据集或暂不沉淀。
10. 确认处理后，可跳转到数据中心对应轨迹数据集详情页。

## 页面与路由

当前项目使用轻量前端状态模拟页面路由，对应页面包括：

- `/results`
- `/results/:runId`
- `/results/:runId/data`
- `/data-center`
- `/data-center/trajectories`
- `/data-center/trajectories/:datasetId`
- `/data-center/cpt`
- `/data-center/cpt/:datasetId`
- `/data-center/vulnerabilities`
- `/data-center/vulnerabilities/:datasetId`

## 评测结果分类

“基准评测”用于标准化评测漏洞挖掘、漏洞利用和漏洞修复 Agent，当前包含：

- CyberGym：白盒漏洞挖掘 Agent 评测
- ExploitGym：灰盒 / 白盒辅助漏洞利用 Agent 评测
- PatchEval：白盒漏洞修复 Agent 评测

“场景演练”用于多节点网络环境中的黑盒、灰盒和长程攻防能力评测，当前可运行任务为“企业内网横向移动”，目标是从 edge01 进入 app01，最终访问 vault01。

## 数据集体系

数据中心分为三类数据资产：

- 轨迹数据集：保存 Agent 行为轨迹、工具调用轨迹、攻击路径、评分引用和数据沉淀标签。
- CPT 语料库：以语料数据集为单位管理漏洞知识、攻击方法、修复经验、安全报告和演练过程摘要等领域文本。
- 漏洞数据：以漏洞数据集为单位管理来自 NVD、OSV、GitHub Advisory、CyberGym、ExploitGym 和 RangeRun 的漏洞记录。

数据集详情页统一包含：

- 数据集介绍
- 数据集详情
- 数据记录
- 数据文件
- 使用说明
- 右侧发布信息栏

轨迹记录只展示结构化任务规划、已执行步骤、可观测 Agent 行为、工具调用与结果，不展示或伪造模型隐藏思维链。

## DatasetMetadata

统一数据集元数据类型定义在 `src/types/dataset.ts`：

```ts
type DatasetMetadata = {
  id: string
  name: string
  description: string
  type: 'trajectory' | 'cpt' | 'vulnerability'
  visibility: 'public' | 'internal' | 'private'
  status: 'draft' | 'published' | 'updating' | 'archived'
  owner: string
  organization: string
  version: string
  tags: string[]
  license: DatasetLicense
  createdAt: string
  updatedAt: string
  files: DatasetFile[]
  sourceTypes: string[]
}
```

轨迹、CPT 和漏洞数据集会在此基础上扩展各自统计字段、介绍、详情、使用说明和记录列表。

## VulnerabilityRecord

漏洞数据类型定义在 `src/types/vulnerability.ts`：

```ts
type VulnerabilityRecord = {
  uuid: string
  description: string
  datePublished: string | null
  dateUpdated: string | null
  relations: VulnerabilityRelation[]
  extra: VulnerabilityExtra
}
```

uuid 使用来源、原始 ID 和 Mock description hash 组成，示例：

- `CVE:CVE-2024-1001:a8f9c0`
- `OSV:GHSA-229r-pqp6-8w6g:a8f9c2`

`relations` 描述 alias、upstream、related 关系；`extra.sources` 保存来源名称、原始 ID 和来源特有结构化数据。漏洞详情页会展示基本信息、relations、extra.sources、关联资产和只读原始 JSON。

## Mock 数据

Mock 数据放在：

- `src/lib/mock-data/data-center/results.ts`
- `src/lib/mock-data/data-center/trajectory-datasets.ts`
- `src/lib/mock-data/data-center/cpt-corpus.ts`
- `src/lib/mock-data/data-center/vulnerabilities.ts`
- `src/lib/mock-data/data-center/datasets.ts`

当前至少包含：

- 6 个轨迹数据集
- 5 个 CPT 语料数据集
- 7 个漏洞数据集
- 12 条以上轨迹记录
- 10 条以上 CPT 语料条目
- 15 条以上漏洞记录

本阶段不接真实后端、不做真实模型训练、不做真实 RL 训练、不提供真实上传下载服务。

## 启动与验证

```bash
npm install
npm run dev
npm run lint
npm run build
```

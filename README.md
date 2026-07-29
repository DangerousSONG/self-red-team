# AI 安全面场 / Cyber Range Console

面向 AI Agent 安全评测的本地 Mock 控制台，用于演示从评测任务创建、RangeRun 运行、结果报告到数据资产沉淀的完整闭环。

## 本阶段新增

- 评测任务中心 Step 1 拆分为“场景演练”和“Benchmark 评测”两个任务分类。
- Benchmark 评测新增 CyberGym、ExploitGym、PatchEval 三类任务卡与统一任务详情。
- RangeRun 支持 Mock 完成状态：Completed 后展示最终 Verdict，并提供“查看评测报告”入口。
- 新增评测结果列表与结果详情页，覆盖 Verdict、指标、过程、证据、归因和数据产物。
- 新增运行数据处理流程，可选择新建轨迹数据集、加入已有数据集或暂不沉淀。
- 新增数据中心，包含轨迹数据集、CPT 语料库和漏洞数据。
- 数据中心状态使用 localStorage 保存，刷新后保留结果报告、数据沉淀状态、数据集内容、CPT 语料和漏洞记录。

## 完整操作路径

1. 进入“评测任务”。
2. 在“场景演练”或“Benchmark 评测”中选择任务。
3. 完成资源匹配、运行配置和 CasePlan 确认。
4. 启动 RangeRun，进入运行控制台。
5. 点击“完成演练”进入 Completed 状态。
6. 点击“查看评测报告”进入结果详情页。
7. 在报告页点击“处理数据产物”。
8. 选择需要沉淀的数据产物。
9. 选择创建新轨迹数据集、加入已有数据集或暂不沉淀。
10. 确认处理后进入数据中心查看沉淀结果。

## 新增路由

当前项目仍使用轻量前端状态模拟页面路由，对应页面包括：

- `/results`
- `/results/:runId`
- `/results/:runId/data`
- `/data-center`
- `/data-center/trajectories`
- `/data-center/trajectories/:id`
- `/data-center/cpt`
- `/data-center/cpt/:id`
- `/data-center/vulnerabilities`
- `/data-center/vulnerabilities/:uuid`

## 任务分类

“场景演练”用于多节点网络环境中的黑盒、灰盒和长程攻防能力评测，当前可运行任务为“企业内网横向移动”，目标是从 edge01 进入 app01，最终访问 vault01。

“Benchmark 评测”用于标准化评测漏洞挖掘、漏洞利用和漏洞修复 Agent，当前包含：

- CyberGym：白盒漏洞挖掘 Agent 评测
- ExploitGym：灰盒 / 白盒辅助漏洞利用 Agent 评测
- PatchEval：白盒漏洞修复 Agent 评测

## 数据中心结构

数据中心分为三类资产：

- 轨迹数据集：保存 Agent 行为轨迹、工具调用轨迹、攻击路径、评分引用和训练候选标签。
- CPT 语料库：保存漏洞知识、攻击方法、修复经验、安全报告和演练过程摘要等领域文本。
- 漏洞数据：统一展示来自 NVD、OSV、GitHub Advisory、CyberGym、ExploitGym 和 RangeRun 的漏洞记录。

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
- `Osv:Osv-MOCK-2:b7e4d1`

`relations` 用于描述 alias、upstream、related 关系；`extra.sources` 保存来源名称、原始 ID 和来源特有结构化数据。

## Mock 数据

Mock 数据放在：

- `src/lib/mock-data/tasks.ts`
- `src/lib/mock-data/resources.ts`
- `src/lib/mock-data/data-center/results.ts`
- `src/lib/mock-data/data-center/trajectory-datasets.ts`
- `src/lib/mock-data/data-center/cpt-corpus.ts`
- `src/lib/mock-data/data-center/vulnerabilities.ts`

本阶段不接真实后端、不做真实模型训练、不做真实 RL 训练、不提供真实上传下载接口。

## 启动与验证

```bash
npm install
npm run dev
npm run lint
npm run build
```

# AI 安全面场 / Cyber Range Console

面向 AI Agent 安全评测的本地 Mock 控制台，用于演示从评测任务创建、RangeRun 运行、结果报告、数据资产沉淀到基模训练产物管理的完整闭环。

## 本阶段新增

- 运行总览主页升级为多任务运行态势总览，可同时查看运行中、排队中、评测中和异常任务。
- 首页新增并发与资源态势，展示当前并发额度、CPU、内存、VM、Docker 容器、Token 和成本概况。
- 首页支持卡片视图与紧凑列表、任务搜索、分类筛选和当前关注任务切换。
- 数据中心从三类资产扩展为四类：轨迹数据集、CPT 语料库、漏洞数据、Benchmark 数据集。
- 新增 Benchmark 数据集列表和详情门户，覆盖 CyberGym、ExploitGym、PatchEval 和自研综合评测集。
- CPT 语料库和漏洞数据支持“训练选择模式”，可勾选数据集并发起基模训练。
- 新增“基模训练”导航入口，包含训练任务列表和模型产物页。
- 新增训练任务详情页，展示训练阶段、训练指标、数据使用、Benchmark 对比、Checkpoint、运行日志和模型产物。
- 训练完成后生成 Mock ModelArtifact，并提供模型产物详情页。
- 全部训练、指标、Checkpoint、Benchmark 对比和模型产物继续使用前端 Mock 状态与 localStorage 持久化。

## 完整用户路径

### 多任务运行总览

1. 进入“运行总览”。
2. 查看顶部统计卡，确认任务总数、运行中、排队中、评测中、已完成、异常任务和当前并发。
3. 在“运行中任务”看板中查看每个 RangeRun 的阶段、进度、Agent、环境、Token 和成本预算。
4. 使用“全部 / 场景演练 / 基准评测 / 运行中 / 排队中 / 评测中 / 异常”筛选任务。
5. 通过搜索框按任务名称或 Run ID 查找任务。
6. 点击星标或“查看 CasePlan”将任务设为当前关注。
7. 点击“进入控制台”进入对应 RangeRun 控制台。
8. 在左下角“当前关注”卡片中点击“切换”，可快速切换关注任务。

### 数据沉淀与训练

1. 进入“数据中心”。
2. 查看四类数据资产入口。
3. 进入“CPT 语料库”或“漏洞数据”。
4. 开启“训练选择模式”。
5. 勾选一个或多个数据集。
6. 点击“用于基模训练”。
7. 在“创建基模训练任务”Dialog 中填写任务名称、基础模型、训练方式、评测 Benchmark 和备注。
8. 创建后跳转训练任务详情页。
9. 在详情页查看阶段、指标、数据使用、Benchmark 对比、Checkpoint 和日志。
10. 训练完成后查看模型产物。
11. 从模型产物详情回溯来源 TrainingJob 和来源数据集。

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
- `/data-center/benchmarks`
- `/data-center/benchmarks/:datasetId`
- `/training`
- `/training/:jobId`
- `/training/artifacts`
- `/training/artifacts/:artifactId`

## 数据中心四类资产

- 轨迹数据集：来源于场景演练、基准评测和 Agent 执行过程，后续用于 Agent SFT / RL / 策略优化。本阶段不接入基模训练。
- CPT 语料库：用于安全领域持续预训练，可勾选数据集发起基模训练。
- 漏洞数据：用于增强模型对漏洞描述、漏洞关系、CVE/CWE 和安全知识的理解，可勾选数据集发起基模训练。
- Benchmark 数据集：用于训练前后能力评测，包含 CyberGym、ExploitGym、PatchEval 和自研综合评测集，本阶段默认不作为训练数据。

## 运行总览多任务逻辑

主页使用 `RangeRunSummary[]` 展示多任务态势，类型定义在 `src/types/range.ts`。

状态映射：

- `queued`：排队中
- `preparing` / `provisioning` / `self_check` / `running`：运行中
- `evidence_sealing` / `destroying` / `scoring` / `evaluating`：评测中
- `completed`：已完成
- `failed` / `stopped`：异常任务

默认排序：

1. Failed
2. Running
3. Preparing / Provisioning
4. Scoring / Evaluating
5. Queued

点击任务卡片的“进入控制台”时，会将该任务映射为现有 `currentRun` 并跳转到 RangeRun 控制台。RangeRun 控制台核心布局保持不变。

并发与资源统计：

- 当前并发：运行中与评测中任务的 `concurrency` 汇总。
- 最大并发：Mock 固定为 10。
- CPU / 内存 / VM / Docker 容器：按运行中和评测中任务的资源字段汇总。
- Failed、Stopped、Completed 不占用当前并发额度。

Mock 任务每隔数秒轻量推进一次进度、耗时、Token 和成本，数据保存在 localStorage，刷新后保留。

## Benchmark 数据集

Benchmark 数据集详情页沿用 Dataset Hub 结构：

- 数据集介绍
- 数据集详情
- 评测任务
- 数据文件
- 使用说明

评测任务字段包括 Task ID、项目、漏洞类型、CVE / CWE、任务类型、难度、输入类型、输出要求、验证方式和状态。

## 基模训练

创建训练任务时只暴露必要产品字段：

- 训练任务名称
- 基础模型：Shusheng-35B、InternLM-35B、InternLM-7B
- 训练方式：CPT 持续预训练、CPT + 漏洞知识增强
- 评测 Benchmark：CyberGym、ExploitGym、PatchEval、自研综合评测集
- 任务备注

不会展示学习率、batch size、optimizer、epoch、GPU 拓扑或分布式参数。本阶段不做真实 GPU 调度、不做真实模型训练、不做 RL 训练、不做 Agent 训练、不做模型部署。

训练状态覆盖：

- Draft
- Queued
- Preparing
- Running
- Evaluating
- Completed
- Failed
- Stopped

训练阶段覆盖：

- 数据校验
- 数据预处理
- 数据加载
- Rollout
- 模型训练
- Checkpoint 保存
- 基准评测
- 产物生成

## 训练指标

训练详情页将指标分为四组：

- 训练效果：`rollout/raw_reward`、`rollout/truncated_ratio`、`rollout/response_len/min`、`rollout/response_len/max`、`rollout/response_len/mean`，x-axis 使用 `rollout_step`。
- 数据质量：`fetched/reward`、`used/reward`，x-axis 使用 `rollout_step`，用于观察数据筛选是否带来质量增益。
- 训练稳定性：`train/ppo_kl`、`train/pg_clipfrac`、`train/entropy_loss`，x-axis 使用 `train_step`。
- 训练效率：`perf/wait_time_ratio`、`perf/train_wait_time`、`perf/train_time`、`perf/step_time`，x-axis 使用 `rollout_step`。

页面支持最近 100 steps、最近 500 steps 和全部范围切换。Running 任务会通过 Mock 定时器追加指标点，刷新后从 localStorage 恢复。

## Benchmark 前后评测

训练任务可关联 Benchmark 数据集，并展示：

- 训练前基线
- 训练中 Checkpoint
- 训练后模型

CyberGym 展示漏洞定位正确率、漏洞验证成功率、PoC 有效性和综合评分。  
ExploitGym 展示 Exploit 成功率、Payload 有效性、目标达成率和综合评分。  
PatchEval 展示漏洞修复率、功能测试通过率、安全测试通过率、回归测试通过率和综合评分。

Mock 分数保持温和提升，例如训练前 61、Checkpoint 72、训练后 78。

## 模型产物

模型产物卡片展示：

- 模型名称
- Artifact ID
- 来源训练任务
- 基础模型
- 训练方式
- 数据版本
- 模型版本
- 模型大小
- Benchmark 综合分
- 创建时间
- 状态
- 标签

模型产物详情页包含：

- 模型介绍
- 训练信息
- 评测结果
- 产物文件
- 使用说明

产物文件为 Mock 展示，包括 `config.json`、tokenizer files、model shards、`training_manifest.json` 和 `evaluation_report.json`。

## 类型结构

数据集元数据定义在 `src/types/dataset.ts`，`DatasetMetadata.type` 当前支持：

```ts
'trajectory' | 'cpt' | 'vulnerability' | 'benchmark'
```

训练类型定义在 `src/types/training.ts`：

```ts
type TrainingJob = {
  id: string
  name: string
  baseModel: string
  trainingMethod: 'cpt' | 'cpt_vulnerability_enhancement'
  datasets: TrainingDatasetReference[]
  benchmarkDatasetIds: string[]
  status: TrainingStatus
  stage: TrainingStage
  progress: number
  metrics: TrainingMetricSeries[]
  checkpointIds: string[]
  artifactId?: string
}
```

模型产物类型定义在 `src/types/model-artifact.ts`：

```ts
type ModelArtifact = {
  id: string
  name: string
  version: string
  baseModel: string
  trainingJobId: string
  trainingMethod: string
  datasetIds: string[]
  benchmarkScores: Record<string, number>
  modelSize: string
  status: 'generating' | 'ready' | 'failed' | 'archived'
  createdAt: string
  tags: string[]
}
```

漏洞记录仍遵循 `src/types/vulnerability.ts` 中的 `VulnerabilityRecord`，不破坏原有结构。

## Mock 数据

Mock 数据放在：

- `src/lib/mock-data/data-center/results.ts`
- `src/lib/mock-data/data-center/trajectory-datasets.ts`
- `src/lib/mock-data/data-center/cpt-corpus.ts`
- `src/lib/mock-data/data-center/vulnerabilities.ts`
- `src/lib/mock-data/data-center/datasets.ts`
- `src/lib/mock-data/data-center/benchmark-datasets.ts`
- `src/lib/mock-data/data-center/training.ts`

当前至少包含：

- 6 个轨迹数据集
- 5 个 CPT 语料数据集
- 7 个漏洞数据集
- 4 个 Benchmark 数据集
- 6 个训练任务
- 10 个以上 Checkpoint
- 4 个模型产物
- 12 条以上轨迹记录
- 10 条以上 CPT 语料条目
- 15 条以上漏洞记录

## 启动与验证

```bash
npm install
npm run dev
npm run lint
npm run build
```

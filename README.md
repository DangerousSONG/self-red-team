# AI 安全靶场 · Cyber Range Console

面向 AI Agent 安全评测的本地 Mock 控制台，用于演示从评测任务创建到 RangeRun 运行总览的最小闭环。

## 本阶段新增

- 评测任务中心：左侧导航点击“评测任务”进入。
- 创建任务流程：选择任务、匹配资源、运行配置、确认启动四步 Stepper。
- 任务列表：展示本地 Mock 任务，支持编辑、启动、查看运行和复制。
- Dashboard 联动：启动 Mock 任务后自动进入运行总览，并展示当前任务、Run ID、环境、Agent、模型和状态。
- 本地状态保留：任务列表、当前 Run、当前 CasePlan 和创建进度会保存到 localStorage。

## 操作流程

1. 进入“评测任务”。
2. 在“创建任务”Tab 中选择一个 Mock 任务模板。
3. 查看或切换推荐靶场环境、Agent 和模型。
4. 填写运行名称、超时、Token 预算、成本预算、并发数和最大步骤数。
5. 在确认页保存草稿，或点击“确认并启动”。
6. 启动后自动返回“运行总览”，查看当前 Mock RangeRun。
7. 在 Dashboard 顶部点击“停止任务”可将当前 Run 状态改为 Stopped。

## Mock 数据

Mock 数据统一放在 `src/lib/mock-data/`：

- `tasks.ts`：任务模板和任务列表。
- `resources.ts`：靶场环境、Agent、模型和默认匹配规则。
- `runs.ts`：示例 RangeRun 数据。

类型定义放在 `src/types/range.ts`，包含 `Task`、`CasePlan`、`RangeRun`、`AgentProfile`、`ModelProfile` 和 `RangeEnvironment`。

## 技术栈

- React + TypeScript
- Tailwind CSS
- Vite
- React Flow

## 启动

```bash
npm install
npm run dev
```

## 验证

```bash
npm run lint
npm run build
```

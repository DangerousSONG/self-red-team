# AI安全靶场 · Cyber Range Console

面向研究员、安全专家、CI/CD 与安全运维的 AI Agent 攻防演练控制台。

## 能力闭环

场景 + Agent + 模型 + 预算 → CasePlan → RangeRun → 隔离环境 → Agent 执行 → 取证 → 销毁 → 离线评分

## 技术栈

- React + TypeScript
- Tailwind CSS
- shadcn/ui 风格组件
- React Flow（网络拓扑）

## 启动

```bash
npm install
npm run dev
```

## 首页模块

1. 当前演练概览
2. RangeRun Lifecycle
3. Runtime Environment（可点击拓扑节点）
4. Agent Trace
5. Evidence & Scoring
6. Run Timeline 侧栏

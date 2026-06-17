# FishStock

FishStock 是一个伪装成办公软件的轻量级桌面行情看板。

它使用 Tauri、React、TypeScript 和 FastAPI 构建，可以添加自选股票、ETF、指数等标的，并把行情数据展示成更像办公场景的界面：表格、天气、日历、记账本、项目看板、邮箱、物流追踪和系统监控。

> FishStock 仅用于个人学习与桌面工具实验，行情数据仅供参考，不构成任何投资建议。

## 功能

- Tauri 桌面应用，支持 macOS / Windows 扩展构建
- React + TypeScript 前端
- FastAPI quote gateway 后端
- 自选标的本地保存
- 多种伪装模式
- 超级伪装模式：隐藏真实股票名称，只保留编号与数值映射
- 本地 fallback/demo 数据，方便离线开发
- 一键本地环境启动脚本

## 模式

- 产品库存表
- 城市天气
- 团队日历
- 日常账目
- 项目执行看板
- 工作收件箱
- 物流追踪
- 系统监控

在隐藏模式下，底层数据仍保持原始行情数据，但展示字段会映射成库存、优先级、进度偏差、进程占用等办公语义。

## 技术栈

- Desktop：Tauri v2
- Frontend：React 19、TypeScript、Vite、Zustand、AG Grid Community
- Backend：FastAPI、Uvicorn
- Package manager：npm workspaces

## 快速开始

```bash
npm run env:setup
npm run gateway:dev
npm run tauri:dev
```

也可以启动 Web 预览和后端：

```bash
npm run env:dev
```

默认地址：

- Quote gateway：http://127.0.0.1:8787
- Vite dev server：http://127.0.0.1:5173
- Web 预览脚本：http://127.0.0.1:5174

## 常用脚本

```bash
npm run desktop:dev
npm run desktop:build
npm run tauri:dev
npm run tauri:build
npm run gateway:dev
npm run env:setup
npm run env:dev
npm run env:cleanup
```

## 项目结构

```text
.
├── apps/desktop              # Tauri + React 桌面端
├── services/quote-gateway    # FastAPI 行情网关
├── scripts                   # 本地环境脚本
├── LOCAL_ENVIRONMENT.md      # 本地环境说明
└── fish_stock_desktop_dev_doc.md
```

## 开源协议

MIT License

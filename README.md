# FishStock

FishStock 是一个伪装成办公软件的桌面行情看板。它可以添加自选股票、ETF、指数等标的，并把行情数据映射成库存、天气、日历、账本、项目、邮件、物流和系统监控等办公场景。

这个项目适合个人桌面工具、Tauri 练习、行情网关实验，以及“摸鱼式”信息看板原型。

> FishStock 仅供学习和个人工具实验。行情数据仅供参考，不构成任何投资建议。

## 项目亮点

- Tauri v2 桌面应用，面向 macOS / Windows 打包
- React + TypeScript + Vite 前端
- FastAPI quote gateway 后端
- 支持自选标的、本地状态保存和定时刷新
- 多种办公伪装界面，一键切换
- 隐藏模式不展示真实股票名称，只保留编号和数值映射
- 本地 demo/fallback 数据，后端不可用时也能开发调试
- 新 APP 图标：鱼 + 股票上涨图形，已接入 Tauri bundle 配置

## 界面模式

FishStock 当前包含这些展示模式：

- 产品库存表
- 城市天气
- 团队日历
- 日常账目
- 项目执行看板
- 工作收件箱
- 物流追踪
- 系统监控

正常模式下可以看到真实标的名称；隐藏模式下会把名称替换成更符合办公场景的内容，例如产品名称、城市、项目名、邮件主题、运单状态或进程名称。底层行情数值不会被修改。

## 技术栈

- Desktop：Tauri v2
- Frontend：React 19、TypeScript、Vite、Zustand、AG Grid Community
- Backend：FastAPI、Uvicorn、Requests、Pydantic
- Tooling：npm workspaces、GitHub Actions

## 快速开始

先安装依赖：

```bash
npm run env:setup
```

推荐使用一键本地启动：

```bash
npm run env:dev
```

这个命令会同时启动：

- Quote gateway：http://127.0.0.1:8787
- Tauri 桌面应用
- Vite dev server：http://127.0.0.1:5173

如果想拆开运行，可以分别开两个终端：

```bash
npm run gateway:dev
```

```bash
npm run tauri:dev
```

## 常用命令

```bash
npm run desktop:dev      # 仅启动 Vite 前端
npm run desktop:build    # 构建前端
npm run tauri:dev        # 启动 Tauri 桌面应用
npm run tauri:build      # 打包桌面应用
npm run gateway:dev      # 启动 quote gateway
npm run env:setup        # 初始化本地环境
npm run env:dev          # 启动后端 + Tauri 桌面应用
npm run env:cleanup      # 停止本地开发进程并清理缓存
```

## 项目结构

```text
.
├── apps/desktop
│   ├── src                 # React 前端
│   └── src-tauri           # Tauri 桌面壳、图标和打包配置
├── services/quote-gateway  # FastAPI 行情网关
├── scripts                 # 本地 setup/dev/cleanup 脚本
├── LOCAL_ENVIRONMENT.md    # Codex 本地环境说明
└── fish_stock_desktop_dev_doc.md
```

## APP 图标

图标源文件在：

```text
apps/desktop/src-tauri/icons/icon-source.png
```

生成后的 Tauri 图标文件包括：

```text
apps/desktop/src-tauri/icons/icon.icns
apps/desktop/src-tauri/icons/icon.ico
apps/desktop/src-tauri/icons/icon.png
apps/desktop/src-tauri/icons/32x32.png
apps/desktop/src-tauri/icons/128x128.png
apps/desktop/src-tauri/icons/128x128@2x.png
```

如果以后要重新生成图标，可以运行：

```bash
npm exec --workspace apps/desktop -- tauri icon apps/desktop/src-tauri/icons/icon-source.png
```

## API

本地后端提供：

- `GET /api/health`
- `GET /api/symbols/search?keyword=600519`
- `GET /api/quotes?symbols=SH.600519,SZ.300750`
- `GET /api/source/status`

## 开发说明

- 前端只负责展示统一的 quote 数据结构。
- 行情数据由 `services/quote-gateway` 聚合和兜底。
- 隐藏模式只改变展示语义，不修改底层数据。
- 不要提交 `.venv`、`node_modules`、Tauri `target`、构建产物或本地环境文件。

## License

MIT License

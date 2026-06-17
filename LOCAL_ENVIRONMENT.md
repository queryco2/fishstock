# FishStock 本地环境

这个项目的 Codex 本地环境可以这样配置。

## 设置脚本

```bash
cd "$CODEX_WORKTREE_PATH"
./scripts/setup-local.sh
```

作用：

- 创建 `.venv`
- 安装 `services/quote-gateway/requirements.txt`
- 安装 npm workspace 依赖

## 清理脚本

```bash
cd "$CODEX_WORKTREE_PATH"
./scripts/cleanup-local.sh
```

作用：

- 停掉 `5174` 和 `8787` 端口上的本地进程
- 清理 Python `__pycache__`
- 清理 `.cache/tmp`

## 操作

建议添加一个操作：

名称：

```text
启动 FishStock
```

脚本：

```bash
cd "$CODEX_WORKTREE_PATH"
./scripts/dev-local.sh
```

启动后：

- 行情网关：http://127.0.0.1:8787
- 前端预览：http://127.0.0.1:5174

也可以直接在终端运行：

```bash
npm run env:setup
npm run env:dev
```

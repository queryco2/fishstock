# 摸鱼版炒股桌面小工具开发文档

## 1. 项目概述

### 1.1 项目名称

暂定名称：

```text
FishStock / 摸鱼行情助手
```

### 1.2 项目定位

本项目是一个支持 Mac 和 Windows 安装使用的桌面端行情观察小工具。

产品表面上是普通办公工具，例如：

- Excel 表格；
- 天气软件；
- 日历日程；
- 记账本；
- 项目管理；
- 邮箱收件箱；
- 物流追踪；
- 系统监控。

但底层实际展示的是用户自选的股票、基金、ETF、指数等行情数据。

项目核心不是“专业交易终端”，而是：

```text
一个伪装成办公软件的轻量级自选行情看板。
```

---

## 2. 用户诉求

### 2.1 核心诉求

用户希望做一个“摸鱼版炒股小工具”，满足以下需求：

1. 电脑端可安装；
2. 支持 Mac 和 Windows；
3. 可以添加自选股票；
4. 可以获取当前价格、当前涨幅；
5. 可以伪装成 Excel、天气、日历、记账本等界面；
6. 支持一键切换界面；
7. 支持“超级伪装”按钮；
8. 点击“超级伪装”后，所有股票痕迹全部替换成普通办公数据；
9. 行情数据来源优先使用公开可获取的数据源；
10. 后续可以扩展正式行情 API。

---

## 3. 产品原则

### 3.1 前端只负责展示

前端不直接绑定某一个行情源。

前端只认统一数据结构：

```text
股票代码
股票名称
当前价格
当前涨幅
更新时间
数据源
```

Excel、天气、日历、记账本等都只是展示皮肤。

---

### 3.2 后端统一处理行情数据

行情数据不建议由桌面端直接请求东方财富、腾讯、天天基金等公开接口。

推荐结构：

```text
桌面端
  ↓
自己的行情网关 API
  ↓
efinance / AKShare / 东方财富 / 腾讯 / 天天基金 / 商业 API
```

这样做的好处：

1. 数据源变化时，只改后端；
2. 桌面端不会暴露数据源逻辑；
3. 方便做缓存；
4. 方便做 fallback；
5. 方便做限流；
6. 后续可以平滑切换到商业行情 API；
7. 后续可以加入授权码、用户管理和收费逻辑。

---

### 3.3 超级伪装只改变前端展示

超级伪装模式不能修改底层真实数据。

也就是说：

```text
真实数据仍然是股票行情
展示层临时变成产品、天气、日程、账目等假数据
```

退出超级伪装后，恢复真实股票展示。

---

## 4. 推荐技术栈

### 4.1 桌面端技术栈

推荐：

```text
Tauri v2 + React + TypeScript + Vite
```

### 选择原因

| 技术 | 作用 | 原因 |
|---|---|---|
| Tauri v2 | 桌面应用壳 | 支持 Mac / Windows，安装包较轻 |
| React | 前端界面 | 适合快速开发多种伪装界面 |
| TypeScript | 类型系统 | 行情字段、伪装字段更好维护 |
| Vite | 构建工具 | 开发体验好，启动快 |
| Zustand | 状态管理 | 轻量，适合全局模式切换 |
| AG Grid Community | 表格组件 | 适合第一版 Excel 表格模式 |
| Tailwind CSS | 样式 | 快速开发 UI |
| dayjs | 时间处理 | 格式化更新时间 |
| fetch / axios | 请求 API | 获取行情网关数据 |

---

### 4.2 后端行情网关技术栈

推荐：

```text
Python FastAPI
```

### 选择原因

| 技术 | 作用 | 原因 |
|---|---|---|
| FastAPI | 后端 API | 写接口快，类型清晰 |
| efinance | 行情源 | 适合 MVP 阶段获取股票/基金/期货数据 |
| AKShare | 备用行情源 | 金融数据接口丰富 |
| requests | 请求公开接口 | 用于东方财富、腾讯、天天基金直连 |
| cachetools / Redis | 缓存 | 降低接口频率 |
| pandas | 数据处理 | 处理行情 DataFrame |

---

### 4.3 存储方案

#### 第一版

```text
localStorage / Tauri Store
```

保存：

- 自选股；
- 当前模式；
- 是否开启超级伪装；
- 刷新频率；
- 涨跌颜色设置；
- 窗口配置。

#### 第二版

```text
SQLite
```

适合后续做：

- 多分组自选；
- 历史配置；
- 本地缓存；
- 用户配置；
- 行情快照。

---

## 5. 整体系统架构

```text
fish-stock-desktop
│
├── Desktop App
│   ├── Tauri
│   ├── React
│   ├── TypeScript
│   ├── Excel 模式
│   ├── 天气模式
│   ├── 日历模式
│   ├── 记账本模式
│   ├── 项目管理模式
│   ├── 邮箱模式
│   ├── 物流模式
│   ├── 系统监控模式
│   └── 超级伪装模式
│
└── Quote Gateway
    ├── FastAPI
    ├── efinance Provider
    ├── AKShare Provider
    ├── EastMoney Provider
    ├── Tencent Provider
    ├── Tiantian Fund Provider
    ├── Commercial Provider
    └── Cache Layer
```

---

## 6. 数据源设计

### 6.1 数据源优先级

第一版建议：

```text
1. efinance
2. AKShare
3. 东方财富直连
4. 腾讯行情
5. 天天基金
6. 商业 API
```

---

### 6.2 efinance

#### 定位

MVP 主数据源。

#### 适合范围

- A 股；
- 基金；
- 期货；
- 个人工具；
- 内部测试；
- Demo。

#### 示例代码

```python
import efinance as ef

df = ef.stock.get_realtime_quotes()

print(df[["股票代码", "股票名称", "最新价", "涨跌幅"]])
```

#### 注意事项

efinance 适合个人学习、测试、内部工具，不建议在未经确认数据授权的情况下直接用于商业销售版本。

---

### 6.3 AKShare

#### 定位

备用数据源。

#### 适合范围

- A 股实时行情；
- 指数；
- 基金；
- 债券；
- 期货；
- 外汇；
- 更多金融数据扩展。

#### 示例代码

```python
import akshare as ak

df = ak.stock_zh_a_spot_em()

print(df[["代码", "名称", "最新价", "涨跌幅"]])
```

#### 注意事项

AKShare 依赖公开数据源，字段和接口可能随上游变化而变化，需要做好 fallback 和异常处理。

---

### 6.4 东方财富直连

#### 定位

后端兜底数据源。

#### 示例接口

```text
https://push2.eastmoney.com/api/qt/stock/get?secid=1.600519&fields=f43,f57,f58,f169,f170
```

#### 字段示例

| 字段 | 含义 |
|---|---|
| f57 | 股票代码 |
| f58 | 股票名称 |
| f43 | 最新价 |
| f169 | 涨跌额 |
| f170 | 涨跌幅 |

#### 注意事项

1. 部分数字字段可能存在放大倍数；
2. 需要在后端统一转换；
3. 不建议前端直连；
4. 字段可能调整；
5. 建议只作为 fallback。

---

### 6.5 腾讯行情

#### 定位

备用兜底源。

#### 示例接口

```text
https://qt.gtimg.cn/q=sh600519
```

#### 注意事项

1. 返回通常不是标准 JSON；
2. 需要自行解析字符串；
3. 字段位置可能变化；
4. 建议只作为备用源。

---

### 6.6 天天基金

#### 定位

基金数据源。

#### 示例接口

```text
https://fundgz.1234567.com.cn/js/161725.js
```

#### 适合范围

- 开放式基金；
- 基金估值；
- 基金净值。

#### 注意事项

1. 返回可能是 JSONP；
2. 基金估算不等于真实净值；
3. 场内 ETF 建议走证券行情源；
4. 基金数据展示要明确“估算”或“净值”。

---

### 6.7 商业数据源

后续商业化可以考虑：

```text
iTick
TickFlow
其他授权行情服务商
```

#### 商业化时必须考虑

1. 数据授权；
2. API Key 管理；
3. 调用频率；
4. 用户数限制；
5. 是否允许转展示；
6. 免责声明；
7. 行情延迟说明。

---

## 7. 核心数据模型

### 7.1 WatchItem 自选标的

```ts
export type Market = 'SH' | 'SZ' | 'BJ' | 'HK' | 'US' | 'FUND' | 'INDEX';

export type WatchItemType = 'stock' | 'fund' | 'etf' | 'index';

export type WatchItem = {
  id: string;
  symbol: string;
  market: Market;
  type: WatchItemType;
  name: string;
  sortOrder: number;
  createdAt: string;
};
```

### 示例

```json
{
  "id": "watch_001",
  "symbol": "600519",
  "market": "SH",
  "type": "stock",
  "name": "贵州茅台",
  "sortOrder": 1,
  "createdAt": "2026-06-14 15:30:00"
}
```

---

### 7.2 Quote 行情数据

```ts
export type QuoteStatus = 'normal' | 'delay' | 'closed' | 'error';

export type Quote = {
  symbol: string;
  market: Market;
  type: WatchItemType;
  name: string;
  price: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  volume?: number | null;
  amount?: number | null;
  source: string;
  status: QuoteStatus;
  updatedAt: string;
};
```

### 示例

```json
{
  "symbol": "600519",
  "market": "SH",
  "type": "stock",
  "name": "贵州茅台",
  "price": 1450.2,
  "changeAmount": 17.6,
  "changePercent": 1.23,
  "source": "efinance",
  "status": "normal",
  "updatedAt": "2026-06-14 15:30:05"
}
```

---

## 8. 产品功能设计

### 8.1 自选股管理

#### 功能说明

用户可以添加、删除、排序自选标的。

#### 添加入口

不同模式下，按钮文案不同，但底层都是添加 WatchItem。

| 模式 | 按钮文案 | 实际动作 |
|---|---|---|
| Excel | 添加行 | 添加股票 |
| 天气 | 添加城市 | 添加股票 |
| 日历 | 添加日程 | 添加股票 |
| 记账本 | 添加账目 | 添加股票 |
| 项目管理 | 新建项目 | 添加股票 |
| 邮箱 | 新建联系人 | 添加股票 |
| 物流 | 添加运单 | 添加股票 |
| 系统监控 | 添加进程 | 添加股票 |

#### 添加流程

```text
点击添加按钮
  ↓
弹出输入框
  ↓
输入股票代码 / 股票名称 / 基金代码
  ↓
请求 /api/symbols/search
  ↓
选择标的
  ↓
保存 WatchItem
  ↓
刷新行情
```

---

### 8.2 行情刷新

#### 推荐刷新频率

| 场景 | 刷新频率 |
|---|---:|
| 交易时间 | 5-10 秒 |
| 非交易时间 | 60 秒 |
| 窗口最小化 | 30-60 秒 |
| 行情源异常 | 显示缓存 |
| 超级伪装开启 | 正常刷新，但只展示伪装字段 |

#### 页面必须展示

1. 更新时间；
2. 数据源；
3. 异常状态；
4. 是否为缓存数据。

---

### 8.3 模式切换

用户可以在以下模式之间切换：

```text
Excel
天气
日历
记账本
项目管理
邮箱
物流
系统监控
```

模式切换只改变展示方式，不改变自选股数据。

---

### 8.4 超级伪装

超级伪装是全局开关。

用户点击：

```text
超级伪装
```

后，当前所有模式都进入深度伪装状态。

再次点击：

```text
退出伪装
```

恢复真实行情展示。

---

### 8.5 老板键

建议支持快捷键：

| 快捷键 | 功能 |
|---|---|
| Ctrl/Cmd + Shift + B | 超级伪装 |
| Ctrl/Cmd + Shift + H | 隐藏窗口 |
| Ctrl/Cmd + Shift + E | 切换 Excel 模式 |
| Ctrl/Cmd + Shift + W | 切换天气模式 |
| Ctrl/Cmd + Shift + R | 手动刷新 |

---

## 9. 伪装模式设计

### 9.1 Excel 模式

#### 普通模式

| 股票代码 | 股票名称 | 当前价格 | 当前涨幅 |
|---|---|---:|---:|
| 600519 | 贵州茅台 | 1450.20 | +1.23% |
| 300750 | 宁德时代 | 210.35 | -0.82% |

#### 字段映射

| 真实字段 | Excel 字段 |
|---|---|
| symbol | 股票代码 |
| name | 股票名称 |
| price | 当前价格 |
| changePercent | 当前涨幅 |
| updatedAt | 更新时间 |

#### 操作文案

| 操作 | 文案 |
|---|---|
| 添加 | 添加行 |
| 刷新 | 刷新表格 |
| 删除 | 删除行 |
| 保存 | 保存表格 |

---

### 9.2 天气模式

#### 普通模式

| 城市 | 邮编 | 温度 | 湿度 |
|---|---|---:|---:|
| 贵州茅台 | 600519 | 1450.20℃ | +1.23% |
| 宁德时代 | 300750 | 210.35℃ | -0.82% |

#### 字段映射

| 真实字段 | 天气字段 |
|---|---|
| name | 城市 |
| symbol | 邮编 |
| price | 温度 |
| changePercent | 湿度 |
| updatedAt | 更新时间 |

#### 操作文案

| 操作 | 文案 |
|---|---|
| 添加 | 添加城市 |
| 刷新 | 更新天气 |
| 删除 | 删除城市 |

---

### 9.3 日历模式

#### 普通模式

| 时间 | 日程标题 | 会议室 | 预算 | 进度 |
|---|---|---|---:|---:|
| 09:30 | 贵州茅台 | 600519 | 1450.20 | +1.23% |
| 10:00 | 宁德时代 | 300750 | 210.35 | -0.82% |

#### 字段映射

| 真实字段 | 日历字段 |
|---|---|
| name | 日程标题 |
| symbol | 会议室 |
| price | 预算 |
| changePercent | 进度 |
| updatedAt | 更新时间 |

---

### 9.4 记账本模式

#### 普通模式

| 科目编码 | 科目名称 | 当前余额 | 今日变动 |
|---|---|---:|---:|
| 600519 | 贵州茅台 | 1450.20 | +1.23% |
| 300750 | 宁德时代 | 210.35 | -0.82% |

#### 字段映射

| 真实字段 | 记账本字段 |
|---|---|
| symbol | 科目编码 |
| name | 科目名称 |
| price | 当前余额 |
| changePercent | 今日变动 |

---

### 9.5 项目管理模式

#### 普通模式

| 项目编号 | 项目名称 | 当前预算 | 今日进度 | 状态 |
|---|---|---:|---:|---|
| 600519 | 贵州茅台 | 1450.20 | +1.23% | 正常 |
| 300750 | 宁德时代 | 210.35 | -0.82% | 波动 |

#### 字段映射

| 真实字段 | 项目字段 |
|---|---|
| symbol | 项目编号 |
| name | 项目名称 |
| price | 当前预算 |
| changePercent | 今日进度 |
| status | 状态 |

---

### 9.6 邮箱模式

#### 普通模式

| 发件人 | 主题 | 邮件大小 | 优先级 | 收件时间 |
|---|---|---:|---:|---|
| 贵州茅台 | 系统通知 #600519 | 1450.20 KB | +1.23% | 15:30 |
| 宁德时代 | 系统通知 #300750 | 210.35 KB | -0.82% | 15:30 |

#### 字段映射

| 真实字段 | 邮箱字段 |
|---|---|
| name | 发件人 |
| symbol | 邮件编号 |
| price | 邮件大小 |
| changePercent | 优先级 |
| updatedAt | 收件时间 |

---

### 9.7 物流模式

#### 普通模式

| 运单号 | 收件人 | 当前位置 | 运输进度 |
|---|---|---:|---:|
| 600519 | 贵州茅台 | 1450.20 | +1.23% |
| 300750 | 宁德时代 | 210.35 | -0.82% |

#### 字段映射

| 真实字段 | 物流字段 |
|---|---|
| symbol | 运单号 |
| name | 收件人 |
| price | 当前位置 |
| changePercent | 运输进度 |

---

### 9.8 系统监控模式

#### 普通模式

| PID | 进程名称 | CPU | 内存变化 |
|---|---|---:|---:|
| 600519 | 贵州茅台 | 1450.20% | +1.23% |
| 300750 | 宁德时代 | 210.35% | -0.82% |

#### 字段映射

| 真实字段 | 系统监控字段 |
|---|---|
| symbol | PID |
| name | 进程名称 |
| price | CPU |
| changePercent | 内存变化 |

---

## 10. 超级伪装模式设计

### 10.1 功能说明

超级伪装是一个全局开关。

开启后：

1. 不显示真实股票代码；
2. 不显示真实股票名称；
3. 不显示“股票”“行情”“涨跌幅”“证券”等敏感词；
4. 不影响底层行情刷新；
5. 不修改 WatchItem；
6. 只在前端渲染层替换展示字段；
7. 切换页面后仍保持超级伪装状态；
8. 再次点击后退出伪装。

---

### 10.2 全局状态设计

```ts
type DisplayMode =
  | 'excel'
  | 'weather'
  | 'calendar'
  | 'ledger'
  | 'project'
  | 'mail'
  | 'logistics'
  | 'monitor';

type AppState = {
  mode: DisplayMode;
  isSuperDisguise: boolean;
  setMode: (mode: DisplayMode) => void;
  toggleSuperDisguise: () => void;
};
```

---

### 10.3 超级伪装按钮

```tsx
<button
  onClick={toggleSuperDisguise}
  className="rounded border px-3 py-1 text-sm"
>
  {isSuperDisguise ? '退出伪装' : '超级伪装'}
</button>
```

---

### 10.4 Excel 超级伪装

#### 伪装前

| 股票代码 | 股票名称 | 当前价格 | 当前涨幅 |
|---|---|---:|---:|
| 600519 | 贵州茅台 | 1450.20 | +1.23% |
| 300750 | 宁德时代 | 210.35 | -0.82% |

#### 伪装后

| 产品编号 | 产品名称 | 当前库存 | 今日变化 |
|---|---|---:|---:|
| CP-001 | 产品一 | 1450.20 | +1.23% |
| CP-002 | 产品二 | 210.35 | -0.82% |

#### 文案替换

| 原文案 | 伪装后 |
|---|---|
| 自选股行情 | 产品库存管理表 |
| 股票代码 | 产品编号 |
| 股票名称 | 产品名称 |
| 当前价格 | 当前库存 |
| 当前涨幅 | 今日变化 |
| 添加行 | 添加产品 |
| 刷新表格 | 刷新数据 |

---

### 10.5 天气超级伪装

#### 伪装前

| 城市 | 邮编 | 温度 | 湿度 |
|---|---|---:|---:|
| 贵州茅台 | 600519 | 1450.20℃ | +1.23% |
| 宁德时代 | 300750 | 210.35℃ | -0.82% |

#### 伪装后

| 城市 | 城市编码 | 温度 | 湿度 |
|---|---|---:|---:|
| 北京 | 100000 | 24.5℃ | 62% |
| 上海 | 200000 | 26.1℃ | 58% |

#### 文案替换

| 原文案 | 伪装后 |
|---|---|
| 行情天气模式 | 城市天气 |
| 添加股票 | 添加城市 |
| 刷新行情 | 更新天气 |
| 股票名称 | 城市 |
| 股票代码 | 城市编码 |
| 当前价格 | 温度 |
| 当前涨幅 | 湿度 |

---

### 10.6 日历超级伪装

#### 伪装前

| 时间 | 日程标题 | 会议室 | 预算 | 进度 |
|---|---|---|---:|---:|
| 09:30 | 贵州茅台 | 600519 | 1450.20 | +1.23% |
| 10:00 | 宁德时代 | 300750 | 210.35 | -0.82% |

#### 伪装后

| 时间 | 日程标题 | 会议室 | 预算 | 进度 |
|---|---|---|---:|---:|
| 09:30 | 产品需求评审 | A301 | 1450.20 | 80% |
| 10:00 | 财务数据核对 | B204 | 210.35 | 60% |

#### 文案替换

| 原文案 | 伪装后 |
|---|---|
| 行情日历模式 | 今日日程 |
| 添加股票 | 添加日程 |
| 刷新行情 | 同步日历 |
| 股票名称 | 日程标题 |
| 股票代码 | 会议室 |
| 当前价格 | 预算 |
| 当前涨幅 | 进度 |

---

### 10.7 记账本超级伪装

#### 伪装前

| 科目编码 | 科目名称 | 当前余额 | 今日变动 |
|---|---|---:|---:|
| 600519 | 贵州茅台 | 1450.20 | +1.23% |
| 300750 | 宁德时代 | 210.35 | -0.82% |

#### 伪装后

| 科目编码 | 科目名称 | 当前余额 | 今日变动 |
|---|---|---:|---:|
| 1001 | 现金账户 | 1450.20 | +1.23% |
| 1122 | 应收账款 | 210.35 | -0.82% |

#### 文案替换

| 原文案 | 伪装后 |
|---|---|
| 行情记账本 | 日常账目明细 |
| 添加股票 | 添加账目 |
| 刷新行情 | 刷新账本 |
| 股票代码 | 科目编码 |
| 股票名称 | 科目名称 |
| 当前价格 | 当前余额 |
| 当前涨幅 | 今日变动 |

---

### 10.8 项目管理超级伪装

#### 伪装前

| 项目编号 | 项目名称 | 当前预算 | 今日进度 | 状态 |
|---|---|---:|---:|---|
| 600519 | 贵州茅台 | 1450.20 | +1.23% | 正常 |
| 300750 | 宁德时代 | 210.35 | -0.82% | 波动 |

#### 伪装后

| 项目编号 | 项目名称 | 当前预算 | 今日进度 | 状态 |
|---|---|---:|---:|---|
| PRJ-001 | 库存系统优化 | 1450.20 | 82% | 进行中 |
| PRJ-002 | 对账流程改造 | 210.35 | 64% | 进行中 |

---

### 10.9 邮箱超级伪装

#### 伪装前

| 发件人 | 主题 | 邮件大小 | 优先级 | 收件时间 |
|---|---|---:|---:|---|
| 贵州茅台 | 系统通知 #600519 | 1450.20 KB | +1.23% | 15:30 |
| 宁德时代 | 系统通知 #300750 | 210.35 KB | -0.82% | 15:30 |

#### 伪装后

| 发件人 | 主题 | 邮件大小 | 优先级 | 收件时间 |
|---|---|---:|---:|---|
| 系统通知 | 库存数据同步完成 | 1450.20 KB | 普通 | 15:30 |
| 财务助手 | 今日对账任务提醒 | 210.35 KB | 重要 | 15:30 |

---

### 10.10 物流超级伪装

#### 伪装前

| 运单号 | 收件人 | 当前位置 | 运输进度 |
|---|---|---:|---:|
| 600519 | 贵州茅台 | 1450.20 | +1.23% |
| 300750 | 宁德时代 | 210.35 | -0.82% |

#### 伪装后

| 运单号 | 收件人 | 当前位置 | 运输进度 |
|---|---|---|---:|
| SF100001 | 客户一 | 上海分拨中心 | 82% |
| SF100002 | 客户二 | 杭州转运中心 | 64% |

---

### 10.11 系统监控超级伪装

#### 伪装前

| PID | 进程名称 | CPU | 内存变化 |
|---|---|---:|---:|
| 600519 | 贵州茅台 | 1450.20% | +1.23% |
| 300750 | 宁德时代 | 210.35% | -0.82% |

#### 伪装后

| PID | 进程名称 | CPU | 内存 |
|---|---|---:|---:|
| 1024 | System Helper | 14.5% | 62 MB |
| 2048 | Update Service | 21.0% | 58 MB |

---

## 11. 超级伪装数据配置

### 11.1 天气伪装数据

```ts
export const weatherDisguiseNames = [
  { city: '北京', code: '100000', temp: '24.5', humidity: '62' },
  { city: '上海', code: '200000', temp: '26.1', humidity: '58' },
  { city: '广州', code: '510000', temp: '29.3', humidity: '71' },
  { city: '深圳', code: '518000', temp: '28.8', humidity: '69' },
  { city: '杭州', code: '310000', temp: '25.6', humidity: '64' },
];
```

---

### 11.2 日历伪装数据

```ts
export const calendarDisguiseNames = [
  { title: '产品需求评审', room: 'A301', progress: '80%' },
  { title: '财务数据核对', room: 'B204', progress: '60%' },
  { title: '供应商沟通会议', room: 'C102', progress: '45%' },
  { title: '运营周报整理', room: 'A208', progress: '90%' },
  { title: '库存异常复盘', room: 'D306', progress: '35%' },
];
```

---

### 11.3 记账本伪装数据

```ts
export const ledgerDisguiseNames = [
  { code: '1001', name: '现金账户' },
  { code: '1122', name: '应收账款' },
  { code: '1405', name: '库存商品' },
  { code: '2202', name: '应付账款' },
  { code: '6001', name: '主营业务收入' },
];
```

---

### 11.4 项目管理伪装数据

```ts
export const projectDisguiseNames = [
  { code: 'PRJ-001', name: '库存系统优化', status: '进行中' },
  { code: 'PRJ-002', name: '对账流程改造', status: '进行中' },
  { code: 'PRJ-003', name: '报表性能提升', status: '待确认' },
  { code: 'PRJ-004', name: '结算规则调整', status: '已排期' },
  { code: 'PRJ-005', name: '数据导入优化', status: '测试中' },
];
```

---

### 11.5 邮箱伪装数据

```ts
export const mailDisguiseNames = [
  { sender: '系统通知', subject: '库存数据同步完成', priority: '普通' },
  { sender: '财务助手', subject: '今日对账任务提醒', priority: '重要' },
  { sender: '运营中心', subject: '销售日报已生成', priority: '普通' },
  { sender: '数据平台', subject: '接口任务执行成功', priority: '低' },
  { sender: '审批系统', subject: '待处理审批提醒', priority: '重要' },
];
```

---

### 11.6 物流伪装数据

```ts
export const logisticsDisguiseNames = [
  { code: 'SF100001', receiver: '客户一', location: '上海分拨中心', progress: '82%' },
  { code: 'SF100002', receiver: '客户二', location: '杭州转运中心', progress: '64%' },
  { code: 'YT300001', receiver: '客户三', location: '广州仓库', progress: '45%' },
  { code: 'JD500001', receiver: '客户四', location: '北京转运站', progress: '90%' },
  { code: 'ZTO80001', receiver: '客户五', location: '深圳配送站', progress: '72%' },
];
```

---

### 11.7 系统监控伪装数据

```ts
export const monitorDisguiseNames = [
  { pid: '1024', process: 'System Helper', cpu: '14.5%', memory: '62 MB' },
  { pid: '2048', process: 'Update Service', cpu: '21.0%', memory: '58 MB' },
  { pid: '3072', process: 'Data Sync', cpu: '8.3%', memory: '74 MB' },
  { pid: '4096', process: 'Window Manager', cpu: '11.6%', memory: '91 MB' },
  { pid: '5120', process: 'Cache Worker', cpu: '6.8%', memory: '43 MB' },
];
```

---

## 12. 后端 API 设计

### 12.1 健康检查

#### 请求

```http
GET /api/health
```

#### 返回

```json
{
  "status": "ok",
  "time": "2026-06-14 15:30:00"
}
```

---

### 12.2 搜索标的

#### 请求

```http
GET /api/symbols/search?keyword=茅台
```

#### 返回

```json
[
  {
    "symbol": "600519",
    "market": "SH",
    "type": "stock",
    "name": "贵州茅台"
  }
]
```

---

### 12.3 批量获取行情

#### 请求

```http
GET /api/quotes?symbols=SH.600519,SZ.300750,SZ.000001
```

#### 返回

```json
[
  {
    "symbol": "600519",
    "market": "SH",
    "type": "stock",
    "name": "贵州茅台",
    "price": 1450.2,
    "changeAmount": 17.6,
    "changePercent": 1.23,
    "source": "efinance",
    "status": "normal",
    "updatedAt": "2026-06-14 15:30:05"
  }
]
```

---

### 12.4 获取数据源状态

#### 请求

```http
GET /api/source/status
```

#### 返回

```json
{
  "primary": "efinance",
  "fallback": ["akshare", "eastmoney", "tencent"],
  "status": "normal",
  "lastSuccessAt": "2026-06-14 15:30:05"
}
```

---

## 13. 后端代码样例

### 13.1 FastAPI 基础服务

```python
from fastapi import FastAPI, Query
from datetime import datetime
import efinance as ef

app = FastAPI(title="Fish Stock Quote Gateway")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


@app.get("/api/quotes")
def get_quotes(symbols: str = Query(...)):
    symbol_list = [s.split(".")[-1] for s in symbols.split(",")]

    df = ef.stock.get_realtime_quotes()
    df = df[df["股票代码"].isin(symbol_list)]

    result = []

    for _, row in df.iterrows():
        code = str(row["股票代码"])

        result.append({
            "symbol": code,
            "market": detect_market(code),
            "type": "stock",
            "name": row["股票名称"],
            "price": safe_float(row["最新价"]),
            "changeAmount": safe_float(row.get("涨跌额")),
            "changePercent": safe_float(row["涨跌幅"]),
            "source": "efinance",
            "status": "normal",
            "updatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

    return result


def safe_float(value):
    try:
        return float(value)
    except Exception:
        return None


def detect_market(code: str):
    if code.startswith("6"):
        return "SH"

    if code.startswith("0") or code.startswith("3"):
        return "SZ"

    if code.startswith("8") or code.startswith("4"):
        return "BJ"

    return "UNKNOWN"
```

---

### 13.2 Provider 抽象

```python
from abc import ABC, abstractmethod


class QuoteProvider(ABC):
    @abstractmethod
    def get_quotes(self, symbols: list[str]) -> list[dict]:
        pass
```

---

### 13.3 efinance Provider

```python
import efinance as ef


class EFinanceProvider(QuoteProvider):
    def get_quotes(self, symbols: list[str]) -> list[dict]:
        codes = [s.split(".")[-1] for s in symbols]

        df = ef.stock.get_realtime_quotes()
        df = df[df["股票代码"].isin(codes)]

        result = []

        for _, row in df.iterrows():
            code = str(row["股票代码"])

            result.append({
                "symbol": code,
                "market": detect_market(code),
                "type": "stock",
                "name": row["股票名称"],
                "price": safe_float(row["最新价"]),
                "changeAmount": safe_float(row.get("涨跌额")),
                "changePercent": safe_float(row["涨跌幅"]),
                "source": "efinance",
                "status": "normal",
            })

        return result
```

---

### 13.4 QuoteService fallback

```python
class QuoteService:
    def __init__(self):
        self.providers = [
            EFinanceProvider(),
            # AkShareProvider(),
            # EastMoneyProvider(),
            # TencentProvider(),
        ]

    def get_quotes(self, symbols: list[str]) -> list[dict]:
        last_error = None

        for provider in self.providers:
            try:
                data = provider.get_quotes(symbols)

                if data:
                    return data

            except Exception as e:
                last_error = e
                continue

        raise RuntimeError(f"All quote providers failed: {last_error}")
```

---

## 14. 前端代码样例

### 14.1 API Client

```ts
export type Quote = {
  symbol: string;
  market: string;
  type: string;
  name: string;
  price: number | null;
  changeAmount?: number | null;
  changePercent: number | null;
  source: string;
  status: 'normal' | 'delay' | 'closed' | 'error';
  updatedAt: string;
};

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const query = symbols.join(',');

  const res = await fetch(`http://127.0.0.1:8787/api/quotes?symbols=${query}`);

  if (!res.ok) {
    throw new Error('行情获取失败');
  }

  return res.json();
}
```

---

### 14.2 Zustand 状态管理

```ts
import { create } from 'zustand';

type DisplayMode =
  | 'excel'
  | 'weather'
  | 'calendar'
  | 'ledger'
  | 'project'
  | 'mail'
  | 'logistics'
  | 'monitor';

type WatchItem = {
  id: string;
  symbol: string;
  market: string;
  type: string;
  name: string;
};

type AppState = {
  mode: DisplayMode;
  isSuperDisguise: boolean;
  watchItems: WatchItem[];
  refreshSeconds: number;

  setMode: (mode: DisplayMode) => void;
  toggleSuperDisguise: () => void;
  addWatchItem: (item: WatchItem) => void;
  removeWatchItem: (id: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  mode: 'excel',
  isSuperDisguise: false,
  watchItems: [],
  refreshSeconds: 10,

  setMode: (mode) => set({ mode }),

  toggleSuperDisguise: () =>
    set((state) => ({
      isSuperDisguise: !state.isSuperDisguise,
    })),

  addWatchItem: (item) =>
    set((state) => ({
      watchItems: [...state.watchItems, item],
    })),

  removeWatchItem: (id) =>
    set((state) => ({
      watchItems: state.watchItems.filter((item) => item.id !== id),
    })),
}));
```

---

### 14.3 行情轮询 Hook

```tsx
import { useEffect, useState } from 'react';
import { fetchQuotes, Quote } from './api';

export function useQuotes(symbols: string[], refreshSeconds: number) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const data = await fetchQuotes(symbols);
      setQuotes(data);
      setError(null);
    } catch (e) {
      setError('数据刷新失败，正在显示上次数据');
    }
  }

  useEffect(() => {
    if (symbols.length === 0) return;

    refresh();

    const timer = window.setInterval(refresh, refreshSeconds * 1000);

    return () => window.clearInterval(timer);
  }, [symbols.join(','), refreshSeconds]);

  return { quotes, error, refresh };
}
```

---

## 15. 统一展示转换逻辑

### 15.1 getDisplayRows

```ts
type DisplayRow = Record<string, string | number | null>;

export function getDisplayRows(
  mode: DisplayMode,
  quotes: Quote[],
  isSuperDisguise: boolean
): DisplayRow[] {
  if (isSuperDisguise) {
    return getSuperDisguiseRows(mode, quotes);
  }

  return getNormalRows(mode, quotes);
}
```

---

### 15.2 普通展示

```ts
function getNormalRows(mode: DisplayMode, quotes: Quote[]): DisplayRow[] {
  switch (mode) {
    case 'excel':
      return quotes.map((item) => ({
        code: item.symbol,
        name: item.name,
        price: item.price,
        changePercent: item.changePercent,
      }));

    case 'weather':
      return quotes.map((item) => ({
        city: item.name,
        zipCode: item.symbol,
        temperature: item.price,
        humidity: item.changePercent,
      }));

    case 'calendar':
      return quotes.map((item, index) => ({
        time: getFakeMeetingTime(index),
        title: item.name,
        room: item.symbol,
        budget: item.price,
        progress: item.changePercent,
      }));

    case 'ledger':
      return quotes.map((item) => ({
        accountCode: item.symbol,
        accountName: item.name,
        balance: item.price,
        todayChange: item.changePercent,
      }));

    default:
      return quotes.map((item) => ({
        code: item.symbol,
        name: item.name,
        value: item.price,
        change: item.changePercent,
      }));
  }
}
```

---

### 15.3 超级伪装展示

```ts
function getSuperDisguiseRows(mode: DisplayMode, quotes: Quote[]): DisplayRow[] {
  switch (mode) {
    case 'excel':
      return quotes.map((item, index) => ({
        productCode: `CP-${String(index + 1).padStart(3, '0')}`,
        productName: `产品${toChineseNumber(index + 1)}`,
        stock: item.price,
        todayChange: item.changePercent,
      }));

    case 'weather':
      return quotes.map((item, index) => {
        const fake = weatherDisguiseNames[index % weatherDisguiseNames.length];

        return {
          city: fake.city,
          cityCode: fake.code,
          temperature: `${fake.temp}℃`,
          humidity: `${fake.humidity}%`,
        };
      });

    case 'calendar':
      return quotes.map((item, index) => {
        const fake = calendarDisguiseNames[index % calendarDisguiseNames.length];

        return {
          time: getFakeMeetingTime(index),
          title: fake.title,
          room: fake.room,
          budget: item.price,
          progress: fake.progress,
        };
      });

    case 'ledger':
      return quotes.map((item, index) => {
        const fake = ledgerDisguiseNames[index % ledgerDisguiseNames.length];

        return {
          accountCode: fake.code,
          accountName: fake.name,
          balance: item.price,
          todayChange: item.changePercent,
        };
      });

    case 'project':
      return quotes.map((item, index) => {
        const fake = projectDisguiseNames[index % projectDisguiseNames.length];

        return {
          projectCode: fake.code,
          projectName: fake.name,
          budget: item.price,
          progress: `${Math.min(95, 40 + index * 8)}%`,
          status: fake.status,
        };
      });

    case 'mail':
      return quotes.map((item, index) => {
        const fake = mailDisguiseNames[index % mailDisguiseNames.length];

        return {
          sender: fake.sender,
          subject: fake.subject,
          size: `${item.price} KB`,
          priority: fake.priority,
          receivedAt: item.updatedAt,
        };
      });

    case 'logistics':
      return quotes.map((item, index) => {
        const fake = logisticsDisguiseNames[index % logisticsDisguiseNames.length];

        return {
          trackingNo: fake.code,
          receiver: fake.receiver,
          location: fake.location,
          progress: fake.progress,
        };
      });

    case 'monitor':
      return quotes.map((item, index) => {
        const fake = monitorDisguiseNames[index % monitorDisguiseNames.length];

        return {
          pid: fake.pid,
          process: fake.process,
          cpu: fake.cpu,
          memory: fake.memory,
        };
      });

    default:
      return quotes;
  }
}
```

---

### 15.4 辅助方法

```ts
function toChineseNumber(num: number) {
  const map = [
    '零',
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九',
    '十',
  ];

  if (num <= 10) return map[num];

  return String(num);
}

function getFakeMeetingTime(index: number) {
  const times = ['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'];

  return times[index % times.length];
}
```

---

## 16. Excel 模式组件样例

```tsx
import { AgGridReact } from 'ag-grid-react';
import type { Quote } from './api';

type Props = {
  quotes: Quote[];
  isSuperDisguise: boolean;
  toggleSuperDisguise: () => void;
};

export function ExcelMode({
  quotes,
  isSuperDisguise,
  toggleSuperDisguise,
}: Props) {
  const rows = getDisplayRows('excel', quotes, isSuperDisguise);

  const normalColumns = [
    { headerName: '股票代码', field: 'code', width: 140 },
    { headerName: '股票名称', field: 'name', width: 160 },
    { headerName: '当前价格', field: 'price', width: 140 },
    { headerName: '当前涨幅', field: 'changePercent', width: 140 },
  ];

  const disguiseColumns = [
    { headerName: '产品编号', field: 'productCode', width: 140 },
    { headerName: '产品名称', field: 'productName', width: 160 },
    { headerName: '当前库存', field: 'stock', width: 140 },
    { headerName: '今日变化', field: 'todayChange', width: 140 },
  ];

  return (
    <div className="h-full w-full bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">
          {isSuperDisguise ? '产品库存管理表' : '自选股行情'}
        </div>

        <div className="flex gap-2">
          <button className="rounded border px-3 py-1 text-sm">
            {isSuperDisguise ? '添加产品' : '添加行'}
          </button>

          <button className="rounded border px-3 py-1 text-sm">
            {isSuperDisguise ? '刷新数据' : '刷新表格'}
          </button>

          <button
            onClick={toggleSuperDisguise}
            className="rounded border px-3 py-1 text-sm"
          >
            {isSuperDisguise ? '退出伪装' : '超级伪装'}
          </button>
        </div>
      </div>

      <div className="ag-theme-quartz h-[520px] w-full">
        <AgGridReact
          rowData={rows}
          columnDefs={isSuperDisguise ? disguiseColumns : normalColumns}
        />
      </div>
    </div>
  );
}
```

---

## 17. 天气模式组件样例

```tsx
import type { Quote } from './api';

type Props = {
  quotes: Quote[];
  isSuperDisguise: boolean;
  toggleSuperDisguise: () => void;
};

export function WeatherMode({
  quotes,
  isSuperDisguise,
  toggleSuperDisguise,
}: Props) {
  const rows = getDisplayRows('weather', quotes, isSuperDisguise);

  return (
    <div className="h-full w-full bg-slate-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-medium">
            {isSuperDisguise ? '城市天气' : '行情天气模式'}
          </div>

          <div className="text-xs text-slate-500">
            {isSuperDisguise ? '自动更新城市气象信息' : '自动更新自选标的数据'}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
            {isSuperDisguise ? '添加城市' : '添加股票'}
          </button>

          <button
            onClick={toggleSuperDisguise}
            className="rounded border px-3 py-1 text-sm"
          >
            {isSuperDisguise ? '退出伪装' : '超级伪装'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {rows.map((item: any, index) => (
          <div key={index} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex justify-between">
              <div>
                <div className="text-xl font-semibold">
                  {item.city}
                </div>

                <div className="text-xs text-slate-400">
                  {isSuperDisguise ? `城市编码 ${item.cityCode}` : `邮编 ${item.zipCode}`}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">
                  {item.temperature}
                  {!isSuperDisguise ? '℃' : ''}
                </div>

                <div className="text-sm text-slate-500">
                  湿度 {item.humidity}
                  {!isSuperDisguise ? '%' : ''}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 18. 代码目录结构

```text
fish-stock-desktop/
  apps/
    desktop/
      package.json
      src/
        api/
          quoteApi.ts
        components/
          AddSymbolDialog.tsx
          ModeSwitcher.tsx
          SuperDisguiseButton.tsx
          ExcelMode.tsx
          WeatherMode.tsx
          CalendarMode.tsx
          LedgerMode.tsx
          ProjectMode.tsx
          MailMode.tsx
          LogisticsMode.tsx
          MonitorMode.tsx
        disguise/
          constants.ts
          getDisplayRows.ts
        hooks/
          useQuotes.ts
        store/
          appStore.ts
        types/
          quote.ts
          watchItem.ts
        App.tsx
        main.tsx
      src-tauri/
        tauri.conf.json
        src/
          main.rs

  services/
    quote-gateway/
      requirements.txt
      app/
        main.py
        providers/
          base.py
          efinance_provider.py
          akshare_provider.py
          eastmoney_provider.py
          tencent_provider.py
          tiantian_provider.py
        services/
          quote_service.py
        schemas/
          quote.py
          symbol.py

  docs/
    product.md
    api.md
    data-source.md
    ui.md
```

---

## 19. MVP 开发计划

### 第一阶段：基础行情版

目标：能跑起来。

功能：

1. Tauri + React 项目搭建；
2. FastAPI 行情网关；
3. efinance 获取 A 股行情；
4. 添加自选股；
5. 删除自选股；
6. Excel 模式；
7. 10 秒自动刷新；
8. 本地保存自选股。

---

### 第二阶段：多伪装模式

目标：完成产品创意主体。

功能：

1. 天气模式；
2. 日历模式；
3. 记账本模式；
4. 模式切换；
5. 统一字段映射；
6. 添加按钮根据模式换文案；
7. 刷新按钮根据模式换文案。

---

### 第三阶段：超级伪装

目标：一键深度隐藏股票痕迹。

功能：

1. 超级伪装全局状态；
2. Excel 超级伪装；
3. 天气超级伪装；
4. 日历超级伪装；
5. 记账本超级伪装；
6. 快捷键 Ctrl/Cmd + Shift + B；
7. 页面标题替换；
8. 按钮文案替换；
9. 敏感词隐藏；
10. 退出伪装恢复真实数据。

---

### 第四阶段：数据源增强

目标：提升稳定性。

功能：

1. AKShare fallback；
2. 东方财富 fallback；
3. 腾讯 fallback；
4. 天天基金数据；
5. ETF / 指数支持；
6. 数据缓存；
7. 数据源状态展示；
8. 行情失败时显示上次更新时间。

---

### 第五阶段：产品化

目标：可安装、可配置、可分发。

功能：

1. Mac 安装包；
2. Windows 安装包；
3. 自动更新；
4. 设置页；
5. 窗口置顶；
6. 窗口大小记忆；
7. 老板键隐藏窗口；
8. 授权码；
9. 使用免责声明；
10. 数据源切换。

---

## 20. 风险与注意事项

### 20.1 数据源风险

公开数据源可能存在以下问题：

1. 接口变动；
2. 字段变动；
3. 限流；
4. IP 被限制；
5. 数据延迟；
6. 数据缺失；
7. 非交易时间无数据更新。

对应方案：

1. 增加缓存；
2. 增加 fallback；
3. 限制刷新频率；
4. 非交易时间降低刷新频率；
5. 失败时展示上次数据；
6. 显示更新时间；
7. 后续接商业 API。

---

### 20.2 商业化风险

如果只是个人使用或内部测试，可以先用公开数据源。

如果后续要收费销售，需要确认：

1. 数据源授权；
2. 是否允许转展示；
3. 是否允许商业用途；
4. 是否有调用频率限制；
5. 是否需要付费 API；
6. 是否需要展示行情延迟；
7. 是否需要用户协议和免责声明。

---

### 20.3 产品边界

本项目不提供：

1. 股票推荐；
2. 买卖建议；
3. 自动交易；
4. 下单功能；
5. 投资收益承诺。

建议页面底部或设置页显示：

```text
行情数据仅供参考，不构成任何投资建议。
```

---

## 21. 最终推荐方案

第一版推荐采用：

```text
桌面端：
Tauri v2 + React + TypeScript + Vite

表格：
AG Grid Community

行情网关：
Python FastAPI

主数据源：
efinance

备用数据源：
AKShare + 东方财富直连 + 腾讯行情

基金数据：
天天基金 / 东方财富基金源

本地存储：
第一版 localStorage / Tauri Store
第二版 SQLite

核心功能：
自选股
准实时行情
Excel 模式
天气模式
日历模式
记账本模式
超级伪装
老板键
```

一句话总结：

```text
前端只做伪装展示，后端统一做行情适配；所有界面的添加行、添加城市、添加日程、添加账目，本质上都是添加一个自选股票或基金标的。
```

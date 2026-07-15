import dayjs from 'dayjs';
import type { DisplayColumn, DisplayMode, DisplayRow, Quote } from '../types/quote';
import {
  calendarDisguiseNames,
  ledgerDisguiseNames,
  logisticsDisguiseNames,
  mailDisguiseNames,
  monitorDisguiseNames,
  productDisguiseNames,
  projectDisguiseNames,
  weatherDisguiseNames,
} from './constants';

export type ModeDisplay = {
  title: string;
  subtitle: string;
  addLabel: string;
  refreshLabel: string;
  emptyTitle: string;
  columns: DisplayColumn[];
  rows: DisplayRow[];
};

type ModeCopy = Pick<ModeDisplay, 'title' | 'subtitle' | 'addLabel' | 'refreshLabel' | 'emptyTitle'>;

const normalCopy: Record<DisplayMode, ModeCopy> = {
  excel: {
    title: '产品库存表',
    subtitle: '产品编号、名称、库存、今日变化与同步状态',
    addLabel: '添加行',
    refreshLabel: '刷新表格',
    emptyTitle: '还没有产品',
  },
  weather: {
    title: '城市天气',
    subtitle: '左侧切换城市，右侧查看温度、湿度与更新时间',
    addLabel: '添加城市',
    refreshLabel: '更新天气',
    emptyTitle: '还没有城市数据',
  },
  calendar: {
    title: '团队日历',
    subtitle: '会议时间、主题、会议室、预算与执行偏差',
    addLabel: '添加日程',
    refreshLabel: '同步日历',
    emptyTitle: '还没有日程',
  },
  ledger: {
    title: '日常账目',
    subtitle: '科目编码、科目名称、余额与今日变动',
    addLabel: '添加账目',
    refreshLabel: '刷新账本',
    emptyTitle: '还没有账目',
  },
  project: {
    title: '项目执行看板',
    subtitle: '项目编号、预算、进度偏差与状态',
    addLabel: '新建项目',
    refreshLabel: '同步项目',
    emptyTitle: '还没有项目',
  },
  mail: {
    title: '工作收件箱',
    subtitle: '发件人、主题、附件大小与优先级',
    addLabel: '新建联系人',
    refreshLabel: '收取邮件',
    emptyTitle: '还没有邮件',
  },
  logistics: {
    title: '物流追踪',
    subtitle: '运单号、收件人、当前位置与运输偏差',
    addLabel: '添加运单',
    refreshLabel: '刷新物流',
    emptyTitle: '还没有运单',
  },
  monitor: {
    title: '系统监控',
    subtitle: '进程编号、进程名称、占用率与内存变化',
    addLabel: '添加进程',
    refreshLabel: '刷新监控',
    emptyTitle: '还没有进程',
  },
};

const disguiseCopy: Record<DisplayMode, ModeCopy> = {
  excel: {
    title: '产品库存管理表',
    subtitle: '产品编号保留原编号，名称使用办公产品名',
    addLabel: '添加产品',
    refreshLabel: '刷新数据',
    emptyTitle: '还没有产品',
  },
  weather: {
    title: '城市天气',
    subtitle: '城市、温度、湿度与同步时间',
    addLabel: '添加城市',
    refreshLabel: '更新天气',
    emptyTitle: '还没有城市',
  },
  calendar: {
    title: '今日日程',
    subtitle: '会议室、预算、执行偏差与同步时间',
    addLabel: '添加日程',
    refreshLabel: '同步日历',
    emptyTitle: '还没有日程',
  },
  ledger: {
    title: '日常账目明细',
    subtitle: '科目编码、余额、今日变动与同步状态',
    addLabel: '添加账目',
    refreshLabel: '刷新账本',
    emptyTitle: '还没有账目',
  },
  project: {
    title: '项目执行看板',
    subtitle: '项目编号保留原编号，名称使用项目名',
    addLabel: '新建项目',
    refreshLabel: '同步项目',
    emptyTitle: '还没有项目',
  },
  mail: {
    title: '工作收件箱',
    subtitle: '发件人、主题、附件大小与优先级',
    addLabel: '新建联系人',
    refreshLabel: '收取邮件',
    emptyTitle: '还没有邮件',
  },
  logistics: {
    title: '物流追踪',
    subtitle: '运单号保留原编号，收件人与位置使用物流场景',
    addLabel: '添加运单',
    refreshLabel: '刷新物流',
    emptyTitle: '还没有运单',
  },
  monitor: {
    title: '系统监控',
    subtitle: '进程编号保留原编号，名称使用系统进程名',
    addLabel: '添加进程',
    refreshLabel: '刷新监控',
    emptyTitle: '还没有进程',
  },
};

export function getModeDisplay(mode: DisplayMode, quotes: Quote[], isSuperDisguise: boolean): ModeDisplay {
  const copy = isSuperDisguise ? disguiseCopy[mode] : normalCopy[mode];

  return {
    ...copy,
    columns: getColumns(mode, isSuperDisguise),
    rows: isSuperDisguise ? getSuperDisguiseRows(mode, quotes) : getNormalRows(mode, quotes),
  };
}

function getColumns(mode: DisplayMode, isSuperDisguise: boolean): DisplayColumn[] {
  if (isSuperDisguise) {
    return getDisguiseColumns(mode);
  }

  switch (mode) {
    case 'excel':
      return [
        { headerName: '产品编号', field: 'productCode', width: 140 },
        { headerName: '产品名称', field: 'productName', width: 180 },
        { headerName: '当前库存', field: 'stock', width: 140, align: 'right' },
        { headerName: '今日变化', field: 'todayChange', width: 140, align: 'right' },
        { headerName: '更新时间', field: 'updatedAt', width: 170 },
        { headerName: '数据源', field: 'source', width: 110 },
      ];
    case 'weather':
      return [
        { headerName: '城市', field: 'city', width: 180 },
        { headerName: '城市编码', field: 'cityCode', width: 140 },
        { headerName: '温度', field: 'temperature', width: 140, align: 'right' },
        { headerName: '湿度', field: 'humidity', width: 140, align: 'right' },
        { headerName: '更新时间', field: 'updatedAt', width: 170 },
      ];
    case 'calendar':
      return [
        { headerName: '时间', field: 'time', width: 110 },
        { headerName: '日程标题', field: 'title', width: 200 },
        { headerName: '会议室', field: 'room', width: 130 },
        { headerName: '预算', field: 'budget', width: 140, align: 'right' },
        { headerName: '执行偏差', field: 'variance', width: 130, align: 'right' },
      ];
    case 'ledger':
      return [
        { headerName: '科目编码', field: 'accountCode', width: 150 },
        { headerName: '科目名称', field: 'accountName', width: 190 },
        { headerName: '当前余额', field: 'balance', width: 150, align: 'right' },
        { headerName: '今日变动', field: 'todayChange', width: 150, align: 'right' },
      ];
    case 'project':
      return [
        { headerName: '项目编号', field: 'projectCode', width: 150 },
        { headerName: '项目名称', field: 'projectName', width: 210 },
        { headerName: '当前预算', field: 'budget', width: 150, align: 'right' },
        { headerName: '进度偏差', field: 'progress', width: 150, align: 'right' },
        { headerName: '状态', field: 'status', width: 120 },
      ];
    case 'mail':
      return [
        { headerName: '发件人', field: 'sender', width: 170 },
        { headerName: '主题', field: 'subject', width: 240 },
        { headerName: '附件大小', field: 'size', width: 150, align: 'right' },
        { headerName: '优先级', field: 'priority', width: 120, align: 'right' },
        { headerName: '更新时间', field: 'receivedAt', width: 160 },
      ];
    case 'logistics':
      return [
        { headerName: '运单号', field: 'trackingNo', width: 160 },
        { headerName: '收件人', field: 'receiver', width: 180 },
        { headerName: '当前位置', field: 'location', width: 170 },
        { headerName: '运输偏差', field: 'progress', width: 140, align: 'right' },
      ];
    case 'monitor':
      return [
        { headerName: 'PID', field: 'pid', width: 130 },
        { headerName: '进程名称', field: 'process', width: 220 },
        { headerName: '内存占用', field: 'load', width: 130, align: 'right' },
        { headerName: '负载波动', field: 'trend', width: 130, align: 'right' },
        { headerName: '状态', field: 'memory', width: 110, align: 'right' },
      ];
  }
}

function getDisguiseColumns(mode: DisplayMode): DisplayColumn[] {
  switch (mode) {
    case 'excel':
      return [
        { headerName: '产品编号', field: 'productCode', width: 150 },
        { headerName: '产品名称', field: 'productName', width: 190 },
        { headerName: '当前库存', field: 'stock', width: 150, align: 'right' },
        { headerName: '今日变化', field: 'todayChange', width: 150, align: 'right' },
        { headerName: '同步时间', field: 'updatedAt', width: 170 },
      ];
    case 'weather':
      return getColumns('weather', false);
    case 'calendar':
      return getColumns('calendar', false);
    case 'ledger':
      return getColumns('ledger', false);
    case 'project':
      return getColumns('project', false);
    case 'mail':
      return getColumns('mail', false);
    case 'logistics':
      return getColumns('logistics', false);
    case 'monitor':
      return getColumns('monitor', false);
  }
}

function getNormalRows(mode: DisplayMode, quotes: Quote[]): DisplayRow[] {
  switch (mode) {
    case 'excel':
      return quotes.map((item) => ({
        productCode: item.symbol,
        productName: item.name,
        stock: formatPrice(item.price),
        todayChange: formatPercent(item.changePercent),
        updatedAt: shortTime(item.updatedAt),
        source: item.cached ? `${item.source} 缓存` : item.source,
      }));
    case 'weather':
      return quotes.map((item, index) => ({
        city: weatherDisguiseNames[index % weatherDisguiseNames.length].city,
        cityCode: item.symbol,
        temperature: `${formatPrice(item.price)}℃`,
        humidity: formatPercent(item.changePercent),
        updatedAt: shortTime(item.updatedAt),
      }));
    case 'calendar':
      return quotes.map((item, index) => ({
        time: getFakeMeetingTime(index),
        title: `${item.name} 事项跟进`,
        room: item.symbol,
        budget: formatPrice(item.price),
        variance: formatPercent(item.changePercent),
      }));
    case 'ledger':
      return quotes.map((item) => ({
        accountCode: item.symbol,
        accountName: item.name,
        balance: formatPrice(item.price),
        todayChange: formatPercent(item.changePercent),
      }));
    case 'project':
      return quotes.map((item) => ({
        projectCode: item.symbol,
        projectName: `${item.name} 数据项目`,
        budget: formatPrice(item.price),
        progress: formatPercent(item.changePercent),
        status: Math.abs(item.changePercent ?? 0) > 2 ? '需关注' : '正常',
      }));
    case 'mail':
      return quotes.map((item) => ({
        sender: '数据提醒',
        subject: '同步状态通知',
        size: `${formatPrice(item.price)} KB`,
        priority: formatPercent(item.changePercent),
        receivedAt: shortTime(item.updatedAt),
      }));
    case 'logistics':
      return quotes.map((item) => ({
        trackingNo: item.symbol,
        receiver: item.name,
        location: `分拨 ${formatPrice(item.price)}`,
        progress: formatPercent(item.changePercent),
      }));
    case 'monitor':
      return quotes.map((item) => ({
        pid: item.symbol,
        process: item.name,
        load: `${formatPrice(item.price)} MB`,
        trend: formatPercent(item.changePercent),
        memory: getMonitorStatus(item.changePercent),
      }));
  }
}

function getSuperDisguiseRows(mode: DisplayMode, quotes: Quote[]): DisplayRow[] {
  switch (mode) {
    case 'excel':
      return quotes.map((item, index) => ({
        productCode: item.symbol,
        productName: productDisguiseNames[index % productDisguiseNames.length],
        stock: formatPrice(item.price),
        todayChange: formatPercent(item.changePercent),
        updatedAt: shortTime(item.updatedAt),
      }));
    case 'weather':
      return quotes.map((item, index) => {
        const fake = weatherDisguiseNames[index % weatherDisguiseNames.length];
        return {
          city: fake.city,
          cityCode: item.symbol,
          temperature: `${formatPrice(item.price)}℃`,
          humidity: formatPercent(item.changePercent),
          updatedAt: shortTime(item.updatedAt),
        };
      });
    case 'calendar':
      return quotes.map((item, index) => {
        const fake = calendarDisguiseNames[index % calendarDisguiseNames.length];
        return {
          time: getFakeMeetingTime(index),
          title: fake.title,
          room: fake.room,
          budget: formatPrice(item.price),
          variance: formatPercent(item.changePercent),
        };
      });
    case 'ledger':
      return quotes.map((item, index) => {
        const fake = ledgerDisguiseNames[index % ledgerDisguiseNames.length];
        return {
          accountCode: item.symbol,
          accountName: fake.name,
          balance: formatPrice(item.price),
          todayChange: formatPercent(item.changePercent),
        };
      });
    case 'project':
      return quotes.map((item, index) => {
        const fake = projectDisguiseNames[index % projectDisguiseNames.length];
        return {
          projectCode: item.symbol,
          projectName: fake.name,
          budget: formatPrice(item.price),
          progress: formatPercent(item.changePercent),
          status: fake.status,
        };
      });
    case 'mail':
      return quotes.map((item, index) => {
        const fake = mailDisguiseNames[index % mailDisguiseNames.length];
        return {
          sender: fake.sender,
          subject: fake.subject,
          size: `${formatPrice(item.price)} KB`,
          priority: formatPercent(item.changePercent),
          receivedAt: shortTime(item.updatedAt),
        };
      });
    case 'logistics':
      return quotes.map((item, index) => {
        const fake = logisticsDisguiseNames[index % logisticsDisguiseNames.length];
        return {
          trackingNo: item.symbol,
          receiver: fake.receiver,
          location: fake.location,
          progress: formatPercent(item.changePercent),
        };
      });
    case 'monitor':
      return quotes.map((item, index) => {
        const fake = monitorDisguiseNames[index % monitorDisguiseNames.length];
        return {
          pid: item.symbol,
          process: fake.process,
          load: `${formatPrice(item.price)} MB`,
          trend: formatPercent(item.changePercent),
          memory: getMonitorStatus(item.changePercent),
        };
      });
  }
}

function formatPrice(value: number | null) {
  return value == null ? '--' : value.toFixed(2);
}

function formatPercent(value: number | null) {
  if (value == null) return '--';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function getMonitorStatus(value: number | null) {
  if (value == null) return '等待';
  if (Math.abs(value) >= 5) return '告警';
  if (Math.abs(value) >= 2) return '观察';
  return '正常';
}

function shortTime(value: string) {
  const date = dayjs(value);
  return date.isValid() ? date.format('HH:mm:ss') : value;
}

function getFakeMeetingTime(index: number) {
  const times = ['09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'];
  return times[index % times.length];
}

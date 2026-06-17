import type { DisplayMode } from '../types/quote';

export const modeLabels: Record<DisplayMode, string> = {
  excel: 'Excel',
  weather: '天气',
  calendar: '日历',
  ledger: '记账本',
  project: '项目',
  mail: '邮箱',
  logistics: '物流',
  monitor: '系统',
};

export const weatherDisguiseNames = [
  { city: '北京', code: '100000', temp: '24.5', humidity: '62' },
  { city: '上海', code: '200000', temp: '26.1', humidity: '58' },
  { city: '广州', code: '510000', temp: '29.3', humidity: '71' },
  { city: '深圳', code: '518000', temp: '28.8', humidity: '69' },
  { city: '杭州', code: '310000', temp: '25.6', humidity: '64' },
];

export const productDisguiseNames = [
  '标准组件 A',
  '低温周转箱',
  '仓储标签套件',
  '门店补货包',
  '冷链记录仪',
  '盘点扫描器',
];

export const calendarDisguiseNames = [
  { title: '产品需求评审', room: 'A301', progress: '80%' },
  { title: '财务数据核对', room: 'B204', progress: '60%' },
  { title: '供应商沟通会议', room: 'C102', progress: '45%' },
  { title: '运营周报整理', room: 'A208', progress: '90%' },
  { title: '库存异常复盘', room: 'D306', progress: '35%' },
];

export const ledgerDisguiseNames = [
  { code: '1001', name: '现金账户' },
  { code: '1122', name: '应收账款' },
  { code: '1405', name: '库存商品' },
  { code: '2202', name: '应付账款' },
  { code: '6001', name: '主营业务收入' },
];

export const projectDisguiseNames = [
  { code: 'PRJ-001', name: '库存系统优化', status: '进行中' },
  { code: 'PRJ-002', name: '对账流程改造', status: '进行中' },
  { code: 'PRJ-003', name: '报表性能提升', status: '待确认' },
  { code: 'PRJ-004', name: '结算规则调整', status: '已排期' },
  { code: 'PRJ-005', name: '数据导入优化', status: '测试中' },
];

export const mailDisguiseNames = [
  { sender: '系统通知', subject: '库存数据同步完成', priority: '普通' },
  { sender: '财务助手', subject: '今日对账任务提醒', priority: '重要' },
  { sender: '运营中心', subject: '销售日报已生成', priority: '普通' },
  { sender: '数据平台', subject: '接口任务执行成功', priority: '低' },
  { sender: '审批系统', subject: '待处理审批提醒', priority: '重要' },
];

export const logisticsDisguiseNames = [
  { code: 'SF100001', receiver: '客户一', location: '上海分拨中心', progress: '82%' },
  { code: 'SF100002', receiver: '客户二', location: '杭州转运中心', progress: '64%' },
  { code: 'YT300001', receiver: '客户三', location: '广州仓库', progress: '45%' },
  { code: 'JD500001', receiver: '客户四', location: '北京转运站', progress: '90%' },
  { code: 'ZTO80001', receiver: '客户五', location: '深圳配送站', progress: '72%' },
];

export const monitorDisguiseNames = [
  { pid: '1024', process: 'System Helper', cpu: '14.5%', memory: '62 MB' },
  { pid: '2048', process: 'Update Service', cpu: '21.0%', memory: '58 MB' },
  { pid: '3072', process: 'Data Sync', cpu: '8.3%', memory: '74 MB' },
  { pid: '4096', process: 'Window Manager', cpu: '11.6%', memory: '91 MB' },
  { pid: '5120', process: 'Cache Worker', cpu: '6.8%', memory: '43 MB' },
];

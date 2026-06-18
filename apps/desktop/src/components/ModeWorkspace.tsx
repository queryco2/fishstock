import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AllCommunityModule, ModuleRegistry, type ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
  CalendarDays,
  CircleDollarSign,
  Cloud,
  CloudSun,
  FolderKanban,
  Inbox,
  MapPin,
  PackageCheck,
  Plus,
  RefreshCw,
  Server,
  SunMedium,
  Trash2,
} from 'lucide-react';
import type { DisplayMode, Quote } from '../types/quote';
import type { WatchItem } from '../types/watchItem';
import { getModeDisplay } from '../disguise/getDisplayRows';

ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
  mode: DisplayMode;
  quotes: Quote[];
  watchItems: WatchItem[];
  isSuperDisguise: boolean;
  isMiniMode: boolean;
  isLoading: boolean;
  onAdd: () => void;
  onRefresh: () => void;
  onRemove: (id: string) => void;
};

type WorkspaceProps = Props & {
  display: ReturnType<typeof getModeDisplay>;
};

export function ModeWorkspace(props: Props) {
  const display = getModeDisplay(props.mode, props.quotes, props.isSuperDisguise);

  if (props.mode === 'excel') {
    return <ExcelWorkspace {...props} display={display} />;
  }

  if (props.mode === 'weather') {
    return <WeatherWorkspace {...props} display={display} />;
  }

  if (props.mode === 'calendar') {
    return <CalendarWorkspace {...props} display={display} />;
  }

  if (props.mode === 'ledger') {
    return <LedgerWorkspace {...props} display={display} />;
  }

  if (props.mode === 'project') {
    return <ProjectWorkspace {...props} display={display} />;
  }

  if (props.mode === 'mail') {
    return <MailWorkspace {...props} display={display} />;
  }

  if (props.mode === 'logistics') {
    return <LogisticsWorkspace {...props} display={display} />;
  }

  return <MonitorWorkspace {...props} display={display} />;
}

function ExcelWorkspace(props: WorkspaceProps) {
  const columnDefs = useMemo<ColDef[]>(
    () =>
      (props.isMiniMode ? props.display.columns.slice(0, 4) : props.display.columns).map((column, index) => ({
        field: column.field,
        headerName: column.headerName,
        width: props.isMiniMode ? [78, 104, 82, 82][index] : column.width,
        cellClass: column.align ? `cell-${column.align}` : undefined,
        sortable: true,
        resizable: true,
      })),
    [props.display.columns, props.isMiniMode],
  );

  return (
    <main className="workspace workspace-excel">
      <AppHeader icon={<FolderKanban size={18} />} title={props.display.title} subtitle="本地文件 / 共享表格" {...props} />
      <div className="excel-sheet">
        <div className="formula-bar">
          <span>A1</span>
          <strong>=SUM(B2:B12)</strong>
        </div>
        <div className="ag-theme-quartz table-shell">
          <AgGridReact
            columnDefs={columnDefs}
            defaultColDef={{ suppressMovable: true }}
            rowData={props.display.rows}
            rowHeight={props.isMiniMode ? 34 : 42}
            headerHeight={props.isMiniMode ? 30 : 38}
            suppressCellFocus
          />
        </div>
      </div>
    </main>
  );
}

function WeatherWorkspace(props: WorkspaceProps) {
  const rows = props.display.rows;
  const [activeIndex, setActiveIndex] = useState(0);
  const main = rows[Math.min(activeIndex, Math.max(0, rows.length - 1))];

  return (
    <main className="workspace weather-app">
      <AppHeader icon={<CloudSun size={18} />} title={props.isSuperDisguise ? '天气' : '城市天气'} subtitle="未来 24 小时" {...props} />
      <section className="weather-stage">
        <aside className="weather-city-list">
          <div className="weather-list-head">
            <span>城市</span>
            <strong>{rows.length}</strong>
          </div>
          {rows.map((row, index) => (
            <button
              className={index === activeIndex ? 'weather-city-row active' : 'weather-city-row'}
              key={index}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <span>
                <strong>{text(row.city)}</strong>
                <small>{text(row.cityCode ?? row.zipCode)} · 湿度 {text(row.humidity)}</small>
              </span>
              <em>{text(row.temperature)}</em>
            </button>
          ))}
        </aside>

        <div className="weather-detail">
          <div className="weather-current">
            <div>
              <span className="weather-tag">当前位置</span>
              <h1>{text(main?.city ?? '北京')}</h1>
              <p>{text(main?.cityCode ?? main?.zipCode ?? '100000')} · 空气质量 良</p>
            </div>
            <div className="weather-temp">
              <SunMedium size={76} />
              <strong>{text(main?.temperature ?? '--℃')}</strong>
              <span>湿度 {text(main?.humidity ?? '--')}</span>
            </div>
          </div>
          <div className="weather-hourly">
            {rows.slice(0, 6).map((row, index) => (
              <div className="weather-hour" key={index}>
                <span>{['现在', '10:00', '11:00', '12:00', '14:00', '16:00'][index]}</span>
                {index % 2 ? <Cloud size={25} /> : <CloudSun size={25} />}
                <strong>{text(row.temperature)}</strong>
                <small>{text(row.humidity)}</small>
              </div>
            ))}
          </div>
          <div className="weather-metrics">
            {rows.slice(0, 3).map((row, index) => (
              <article className="weather-city" key={index}>
                <button className="mini-delete" onClick={() => props.onRemove(props.watchItems[index]?.id)} title="移除" type="button">
                  <Trash2 size={14} />
                </button>
                <span>{text(row.city)}</span>
                <strong>{text(row.temperature)}</strong>
                <small>{text(row.cityCode ?? row.zipCode)} · 湿度 {text(row.humidity)}</small>
              </article>
            ))}
          </div>
          {props.watchItems[activeIndex] ? (
            <button className="weather-remove" onClick={() => props.onRemove(props.watchItems[activeIndex].id)} type="button">
              <Trash2 size={14} />
              <span>移除城市</span>
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function CalendarWorkspace(props: WorkspaceProps) {
  const rows = props.display.rows;
  const days = Array.from({ length: 35 }, (_, index) => index + 1);

  return (
    <main className="workspace calendar-app">
      <AppHeader icon={<CalendarDays size={18} />} title="日历" subtitle="2026 年 6 月" {...props} />
      <section className="calendar-layout">
        <div className="calendar-month">
          {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
            <span className="weekday" key={day}>{day}</span>
          ))}
          {days.map((day, index) => {
            const event = rows[index % Math.max(rows.length, 1)];
            const hasEvent = index > 2 && index < 2 + rows.length;
            return (
              <div className={hasEvent ? 'calendar-day has-event' : 'calendar-day'} key={index}>
                <strong>{day <= 30 ? day : ''}</strong>
                {hasEvent ? <span>{text(event?.title)}</span> : null}
              </div>
            );
          })}
        </div>
        <aside className="agenda-panel">
          <h2>今日日程</h2>
          {rows.map((row, index) => (
            <div className="agenda-item" key={index}>
              <time>{text(row.time)}</time>
              <div>
                <strong>{text(row.title)}</strong>
                <span>{text(row.room)} · 预算 {text(row.budget)} · 偏差 {text(row.variance)}</span>
              </div>
              <button className="mini-delete" onClick={() => props.onRemove(props.watchItems[index]?.id)} type="button">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </aside>
      </section>
    </main>
  );
}

function LedgerWorkspace(props: WorkspaceProps) {
  const rows = props.display.rows;

  return (
    <main className="workspace ledger-app">
      <AppHeader icon={<CircleDollarSign size={18} />} title="记账本" subtitle="本月收支明细" {...props} />
      <section className="ledger-layout">
        <div className="ledger-summary">
          <span>当前余额</span>
          <strong>{text(rows[0]?.balance ?? '0.00')}</strong>
          <small>今日变动 {text(rows[0]?.todayChange ?? '--')}</small>
        </div>
        <div className="ledger-book">
          <div className="ledger-book-head">
            <span>科目</span>
            <span>余额</span>
            <span>变动</span>
          </div>
          {rows.map((row, index) => (
            <div className="ledger-entry" key={index}>
              <div>
                <strong>{text(row.accountName)}</strong>
                <small>{text(row.accountCode)}</small>
              </div>
              <span>{text(row.balance)}</span>
              <em>{text(row.todayChange)}</em>
              <button className="mini-delete" onClick={() => props.onRemove(props.watchItems[index]?.id)} type="button">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ProjectWorkspace(props: WorkspaceProps) {
  const rows = props.display.rows;

  return (
    <main className="workspace project-app">
      <AppHeader icon={<FolderKanban size={18} />} title="项目" subtitle="执行看板" {...props} />
      <section className="kanban-board">
        {['待确认', '进行中', '测试中'].map((column, columnIndex) => (
          <div className="kanban-column" key={column}>
            <h2>{column}</h2>
            {rows.filter((_, index) => index % 3 === columnIndex).map((row, index) => (
              <article className="kanban-card" key={index}>
                <span>{text(row.projectCode)}</span>
                <strong>{text(row.projectName)}</strong>
                <small>预算 {text(row.budget)}</small>
                <div className="progress-track">
                  <i style={{ width: progressWidth(row.progress) }} />
                </div>
                <em>{text(row.status)}</em>
              </article>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}

function MailWorkspace(props: WorkspaceProps) {
  const rows = props.display.rows;
  const selected = rows[0];

  return (
    <main className="workspace mail-app">
      <AppHeader icon={<Inbox size={18} />} title="邮箱" subtitle="收件箱" {...props} />
      <section className="mail-layout">
        <aside className="mail-folders">
          {['收件箱', '星标', '草稿', '已发送', '归档'].map((folder, index) => (
            <button className={index === 0 ? 'active' : ''} key={folder} type="button">
              {folder}<span>{index === 0 ? rows.length : index}</span>
            </button>
          ))}
        </aside>
        <div className="mail-list">
          {rows.map((row, index) => (
            <article className={index === 0 ? 'mail-item active' : 'mail-item'} key={index}>
              <strong>
                <span>{text(row.sender)}</span>
                <em>{text(row.mailCode)}</em>
              </strong>
              <span>{text(row.subject)}</span>
              <small>{text(row.priority)} · {text(row.receivedAt)}</small>
            </article>
          ))}
        </div>
        <article className="mail-preview">
          <span className="mail-from">{text(selected?.sender ?? '系统通知')}</span>
          <h1>{text(selected?.subject ?? '暂无邮件')}</h1>
          <div className="mail-meta">邮件编号 {text(selected?.mailCode ?? '--')}</div>
          <p>附件大小 {text(selected?.size ?? '--')}，优先级 {text(selected?.priority ?? '--')}。</p>
          <div className="mail-lines">
            <i />
            <i />
            <i />
          </div>
        </article>
      </section>
    </main>
  );
}

function LogisticsWorkspace(props: WorkspaceProps) {
  const rows = props.display.rows;

  return (
    <main className="workspace logistics-app">
      <AppHeader icon={<PackageCheck size={18} />} title="物流追踪" subtitle="在途包裹" {...props} />
      <section className="logistics-layout">
        <div className="route-map">
          <MapPin size={34} />
          <span>分拨中心</span>
          <i />
          <MapPin size={34} />
          <span>配送站</span>
        </div>
        <div className="parcel-list">
          {rows.map((row, index) => (
            <article className="parcel-card" key={index}>
              <div>
                <strong>{text(row.trackingNo)}</strong>
                <span>{text(row.receiver)}</span>
              </div>
              <p>{text(row.location)}</p>
              <div className="progress-track">
                <i style={{ width: progressWidth(row.progress) }} />
              </div>
              <small>{text(row.progress)}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function MonitorWorkspace(props: WorkspaceProps) {
  const rows = props.display.rows;

  return (
    <main className="workspace monitor-app">
      <AppHeader icon={<Server size={18} />} title="系统监控" subtitle="本机进程" {...props} />
      <section className="monitor-layout">
        <div className="monitor-meters">
          {['CPU', '内存', '磁盘', '网络'].map((label, index) => (
            <div className="meter" key={label}>
              <span>{label}</span>
              <strong>{[32, 58, 41, 76][index]}%</strong>
              <div className="progress-track">
                <i style={{ width: `${[32, 58, 41, 76][index]}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="process-list">
          {rows.map((row, index) => (
            <div className="process-row" key={index}>
              <span>{text(row.pid)}</span>
              <strong>{text(row.process)}</strong>
              <em>{text(row.load)}</em>
              <b>{text(row.trend)}</b>
              <small>{text(row.memory)}</small>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function AppHeader({
  icon,
  title,
  subtitle,
  display,
  isLoading,
  onAdd,
  onRefresh,
}: WorkspaceProps & { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <section className="app-header">
      <div className="app-title">
        <span>{icon}</span>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="app-actions">
        <button className="ghost-action" onClick={onAdd} type="button">
          <Plus size={16} />
          <span>{display.addLabel}</span>
        </button>
        <button className="ghost-action" disabled={isLoading} onClick={onRefresh} type="button">
          <RefreshCw className={isLoading ? 'spin' : undefined} size={16} />
          <span>{display.refreshLabel}</span>
        </button>
      </div>
    </section>
  );
}

function text(value: unknown) {
  return value == null || value === '' ? '--' : String(value);
}

function progressWidth(value: unknown) {
  const parsed = Number(String(value ?? '').replace(/[^\d.]/g, ''));
  return `${Math.max(8, Math.min(96, Number.isFinite(parsed) ? parsed : 50))}%`;
}

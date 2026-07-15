import { useEffect, useState } from 'react';
import { Clock3, Maximize2, Minimize2, PanelTopClose, RotateCw, SquareStack } from 'lucide-react';
import dayjs from 'dayjs';
import { AddSymbolDialog } from './components/AddSymbolDialog';
import { CalendarMode } from './components/CalendarMode';
import { ExcelMode } from './components/ExcelMode';
import { LedgerMode } from './components/LedgerMode';
import { LogisticsMode } from './components/LogisticsMode';
import { MailMode } from './components/MailMode';
import { ModeSwitcher } from './components/ModeSwitcher';
import { MonitorMode } from './components/MonitorMode';
import { ProjectMode } from './components/ProjectMode';
import { SuperDisguiseButton } from './components/SuperDisguiseButton';
import { WeatherMode } from './components/WeatherMode';
import { applyDesktopWindowMode } from './desktop/windowMode';
import { useQuotes } from './hooks/useQuotes';
import { useAppStore } from './store/appStore';

export default function App() {
  const {
    mode,
    isSuperDisguise,
    isMiniMode,
    watchItems,
    refreshSeconds,
    setMode,
    toggleSuperDisguise,
    toggleMiniMode,
    addWatchItem,
    removeWatchItem,
    setRefreshSeconds,
  } = useAppStore();
  const { quotes, error, isLoading, refresh } = useQuotes(watchItems, refreshSeconds);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCovered, setIsCovered] = useState(false);

  useEffect(() => {
    void applyDesktopWindowMode(isMiniMode);
  }, [isMiniMode]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta || !event.shiftKey) return;

      const key = event.key.toLowerCase();
      if (key === 'b') {
        event.preventDefault();
        toggleSuperDisguise();
      }
      if (key === 'h') {
        event.preventDefault();
        setIsCovered((value) => !value);
      }
      if (key === 'm') {
        event.preventDefault();
        toggleMiniMode();
      }
      if (key === 'e') {
        event.preventDefault();
        setMode('excel');
      }
      if (key === 'w') {
        event.preventDefault();
        setMode('weather');
      }
      if (key === 'r') {
        event.preventDefault();
        void refresh();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refresh, setMode, toggleMiniMode, toggleSuperDisguise]);

  const workspaceProps = {
    quotes,
    watchItems,
    isSuperDisguise,
    isMiniMode,
    isLoading,
    onAdd: () => setIsDialogOpen(true),
    onRefresh: refresh,
    onRemove: removeWatchItem,
  };
  const lastUpdated = getLatestUpdatedAt(quotes);
  const shellTitle = getShellTitle(mode);
  const statusText = isSuperDisguise
    ? error
      ? '同步服务使用备用数据'
      : '同步正常'
    : error ?? '行情网关连接正常';

  return (
    <div className={[isSuperDisguise ? 'app-shell super-disguise' : 'app-shell', isMiniMode ? 'mini-window' : ''].join(' ')}>
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-logo">
            <SquareStack size={19} aria-hidden="true" />
          </div>
          <div>
            <strong>{shellTitle.title}</strong>
            <span>{shellTitle.subtitle}</span>
          </div>
        </div>

        <ModeSwitcher mode={mode} onChange={setMode} />

        <div className="topbar-actions">
          <label className="refresh-picker">
            <RotateCw size={15} aria-hidden="true" />
            <select
              aria-label="刷新频率"
              onChange={(event) => setRefreshSeconds(Number(event.target.value))}
              value={refreshSeconds}
            >
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
            </select>
          </label>
          <button aria-label="隐藏窗口" className="icon-button" onClick={() => setIsCovered(true)} title="隐藏窗口" type="button">
            <Minimize2 size={17} />
          </button>
          <button
            aria-label={isMiniMode ? '展开窗口' : '小窗模式'}
            className="icon-button"
            onClick={toggleMiniMode}
            title={isMiniMode ? '展开窗口' : '小窗模式'}
            type="button"
          >
            {isMiniMode ? <Maximize2 size={17} /> : <PanelTopClose size={17} />}
          </button>
          <SuperDisguiseButton active={isSuperDisguise} onToggle={toggleSuperDisguise} />
        </div>
      </header>

      <div className="status-strip">
        <span className={error ? 'status-dot warning' : 'status-dot'} />
        <span>{isSuperDisguise ? '本地数据已同步' : statusText}</span>
        <span className="status-spacer" />
        <Clock3 size={15} aria-hidden="true" />
        <span>{lastUpdated ? dayjs(lastUpdated).format('YYYY-MM-DD HH:mm:ss') : '等待同步'}</span>
      </div>

      {mode === 'excel' ? <ExcelMode {...workspaceProps} /> : null}
      {mode === 'weather' ? <WeatherMode {...workspaceProps} /> : null}
      {mode === 'calendar' ? <CalendarMode {...workspaceProps} /> : null}
      {mode === 'ledger' ? <LedgerMode {...workspaceProps} /> : null}
      {mode === 'project' ? <ProjectMode {...workspaceProps} /> : null}
      {mode === 'mail' ? <MailMode {...workspaceProps} /> : null}
      {mode === 'logistics' ? <LogisticsMode {...workspaceProps} /> : null}
      {mode === 'monitor' ? <MonitorMode {...workspaceProps} /> : null}

      <footer className="disclaimer">
        {isSuperDisguise ? '本地数据仅供办公核对。' : '行情数据仅供参考，不构成任何投资建议。'}
      </footer>

      <AddSymbolDialog
        isOpen={isDialogOpen}
        onAdd={addWatchItem}
        onClose={() => setIsDialogOpen(false)}
      />

      {isCovered ? (
        <button className="privacy-cover" onClick={() => setIsCovered(false)} type="button">
          <span>月度运营报表</span>
          <strong>Q2 指标核对中</strong>
          <small>点击恢复</small>
        </button>
      ) : null}
    </div>
  );
}

function getShellTitle(mode: string) {
  const titles: Record<string, { title: string; subtitle: string }> = {
    excel: { title: '表格', subtitle: '工作簿 6 月' },
    weather: { title: '天气', subtitle: '城市天气与预报' },
    calendar: { title: '日历', subtitle: '今日与本月' },
    ledger: { title: '记账本', subtitle: '收支流水' },
    project: { title: '项目', subtitle: '任务看板' },
    mail: { title: '邮箱', subtitle: '收件箱' },
    logistics: { title: '物流追踪', subtitle: '包裹状态' },
    monitor: { title: '系统监控', subtitle: '资源与进程' },
  };

  return titles[mode] ?? titles.excel;
}

function getLatestUpdatedAt(quotes: { updatedAt: string }[]) {
  return quotes.reduce<string | undefined>((latest, item) => {
    if (!item.updatedAt || item.updatedAt === '--') return latest;
    if (!latest) return item.updatedAt;

    const currentTime = dayjs(item.updatedAt).valueOf();
    const latestTime = dayjs(latest).valueOf();
    if (!Number.isFinite(currentTime)) return latest;
    if (!Number.isFinite(latestTime)) return item.updatedAt;
    return currentTime > latestTime ? item.updatedAt : latest;
  }, undefined);
}

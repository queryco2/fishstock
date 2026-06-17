import {
  CalendarDays,
  ChevronDown,
  CloudSun,
  FileSpreadsheet,
  ListChecks,
  Mail,
  MonitorCog,
  ReceiptText,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import type { DisplayMode } from '../types/quote';
import { modeLabels } from '../disguise/constants';

const modes: Array<{ mode: DisplayMode; icon: typeof FileSpreadsheet }> = [
  { mode: 'excel', icon: FileSpreadsheet },
  { mode: 'weather', icon: CloudSun },
  { mode: 'calendar', icon: CalendarDays },
  { mode: 'ledger', icon: ReceiptText },
  { mode: 'project', icon: ListChecks },
  { mode: 'mail', icon: Mail },
  { mode: 'logistics', icon: Truck },
  { mode: 'monitor', icon: MonitorCog },
];

type Props = {
  mode: DisplayMode;
  onChange: (mode: DisplayMode) => void;
};

export function ModeSwitcher({ mode, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const activeMode = modes.find((item) => item.mode === mode) ?? modes[0];
  const ActiveIcon = activeMode.icon;

  return (
    <div className={isOpen ? 'mode-switcher open' : 'mode-switcher'}>
      <button
        aria-expanded={isOpen}
        aria-label="切换视图"
        className="mode-current"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <ActiveIcon size={16} aria-hidden="true" />
        <span>{modeLabels[mode]}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="mode-menu" role="tablist" aria-label="展示模式">
          {modes.map((item) => {
            const Icon = item.icon;
            const active = item.mode === mode;

            return (
              <button
                aria-selected={active}
                className={active ? 'mode-tab active' : 'mode-tab'}
                key={item.mode}
                onClick={() => {
                  onChange(item.mode);
                  setIsOpen(false);
                }}
                role="tab"
                title={modeLabels[item.mode]}
                type="button"
              >
                <Icon size={16} aria-hidden="true" />
                <span>{modeLabels[item.mode]}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

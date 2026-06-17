import { Eye, ShieldCheck } from 'lucide-react';

type Props = {
  active: boolean;
  onToggle: () => void;
};

export function SuperDisguiseButton({ active, onToggle }: Props) {
  const Icon = active ? Eye : ShieldCheck;

  return (
    <button
      className={active ? 'disguise-button active' : 'disguise-button'}
      onClick={onToggle}
      title={active ? '恢复标准视图' : '安全视图'}
      type="button"
    >
      <Icon size={17} aria-hidden="true" />
      <span>{active ? '标准视图' : '安全视图'}</span>
    </button>
  );
}

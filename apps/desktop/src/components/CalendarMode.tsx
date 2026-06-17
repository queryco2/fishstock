import type { ComponentProps } from 'react';
import { ModeWorkspace } from './ModeWorkspace';

export function CalendarMode(props: Omit<ComponentProps<typeof ModeWorkspace>, 'mode'>) {
  return <ModeWorkspace {...props} mode="calendar" />;
}

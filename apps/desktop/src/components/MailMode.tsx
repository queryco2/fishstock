import type { ComponentProps } from 'react';
import { ModeWorkspace } from './ModeWorkspace';

export function MailMode(props: Omit<ComponentProps<typeof ModeWorkspace>, 'mode'>) {
  return <ModeWorkspace {...props} mode="mail" />;
}

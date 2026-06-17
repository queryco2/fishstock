import type { ComponentProps } from 'react';
import { ModeWorkspace } from './ModeWorkspace';

export function ProjectMode(props: Omit<ComponentProps<typeof ModeWorkspace>, 'mode'>) {
  return <ModeWorkspace {...props} mode="project" />;
}

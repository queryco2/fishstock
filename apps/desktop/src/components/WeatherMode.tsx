import type { ComponentProps } from 'react';
import { ModeWorkspace } from './ModeWorkspace';

export function WeatherMode(props: Omit<ComponentProps<typeof ModeWorkspace>, 'mode'>) {
  return <ModeWorkspace {...props} mode="weather" />;
}

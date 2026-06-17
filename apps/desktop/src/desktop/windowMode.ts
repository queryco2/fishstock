export async function applyDesktopWindowMode(isMiniMode: boolean) {
  if (!('__TAURI_INTERNALS__' in window)) return;

  try {
    const { getCurrentWindow, currentMonitor, LogicalPosition, LogicalSize } = await import('@tauri-apps/api/window');
    const appWindow = getCurrentWindow();

    if (isMiniMode) {
      const width = 390;
      const height = 540;
      await appWindow.setMinSize(new LogicalSize(340, 460));
      await appWindow.setSize(new LogicalSize(width, height));
      await appWindow.setAlwaysOnTop(true);
      await appWindow.setSkipTaskbar(false);

      const monitor = await currentMonitor();
      if (monitor) {
        const scale = await appWindow.scaleFactor();
        const workArea = monitor.workArea;
        const x = workArea.position.x / scale + workArea.size.width / scale - width - 18;
        const y = workArea.position.y / scale + 18;
        await appWindow.setPosition(new LogicalPosition(Math.max(0, x), Math.max(0, y)));
      }
      return;
    }

    await appWindow.setAlwaysOnTop(false);
    await appWindow.setMinSize(new LogicalSize(980, 620));
    await appWindow.setSize(new LogicalSize(1180, 760));
    await appWindow.center();
  } catch {
    // Browser preview and restricted desktop environments can ignore native window changes.
  }
}

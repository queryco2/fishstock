# Contributing

Thanks for your interest in FishStock.

## Development

```bash
npm run env:setup
npm run gateway:dev
npm run tauri:dev
```

Before opening a pull request, please run:

```bash
npm run desktop:build
```

## Guidelines

- Keep UI changes consistent with the existing desktop-tool style.
- Do not commit local build outputs, virtual environments, cache files, or credentials.
- Keep disguise-mode labels scenario-friendly and avoid leaking real stock names in hidden mode.
- Treat quote data as informational only; do not present it as financial advice.

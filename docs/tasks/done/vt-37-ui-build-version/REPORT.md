---
branch: feature/vt-37-ui-build-version
---

# Отчёт vt-37 — Версия сборки в footer

## Что сделано

- `tools/generate-build-info.mts`, `prebuild` → `generate:build-info`.
- `BUILD_INFO` + footer `app-shell__version`.
- `formatBuildVersionLabel`, тесты AppShell и formatter.
- SPEC.

## Тесты

- `npm test -- --watch=false`: 65 files, 178 tests — зелёный

## Отклонения от TASK.md

- CI полагается на `prebuild` при `npm run build` (отдельный шаг в workflow не добавлялся).

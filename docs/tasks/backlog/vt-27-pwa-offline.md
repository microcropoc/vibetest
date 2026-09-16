# vt-27 — PWA и offline

## Контекст

MVP offline: app shell, lazy chunks, sql.js/WASM cache; production SW via `@angular/pwa`.

## Цель

`ng add @angular/pwa` (if not done), production SW config, `SwUpdate` UX minimal; verify offline: shell + imported course from IndexedDB; WASM cached on first use.

## Требования

- SW on production build only (not default dev serve expectation per rule).
- Lazy chunks cached — do not bundle all pages into main for offline.
- Document manual test steps in `REPORT.md`.
- Optional: update available prompt via `SwUpdate`.

## Технические заметки

- Зависимости: **vt-16** (routes exist), **vt-23** (practice/sql.js path exercised).
- Avoid unnecessary `angular.json` edits beyond PWA add.

## План работ

- [ ] Add/configure PWA
- [ ] SwUpdate hook (minimal)
- [ ] Offline checklist in REPORT
- [ ] `ng build` production succeeds

## Критерии готовности (Definition of Done)

- [ ] Offline section спецификации выполнен на уровне MVP

## Вне рамок задачи

- Background sync, push notifications

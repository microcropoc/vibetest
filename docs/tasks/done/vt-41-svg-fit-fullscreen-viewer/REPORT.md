---
branch: feature/vt-41-svg-fit-fullscreen-viewer
---

# Отчёт vt-41 — SVG: вписать в карточку и полноэкранный просмотр

## Что сделано

- **Карточка:** figure без `overflow: auto`, SVG `max-width`/`max-height` (до `min(50vh, 24rem)`), кнопка «Развернуть» (44px touch target).
- **`svg-viewport-state`:** pure functions — scale 1–4, step 0.25, pan при scale > 1, reset.
- **`app-svg-fullscreen-viewer`:** modal overlay, toolbar +/−/Сброс/Закрыть, backdrop закрывает, Escape, pointer pan, тот же `SafeHtml`.
- **`svg-step-ui`:** sanitization без изменений; orchestration open/close + focus restore на «Развернуть».
- **SPEC:** поведение fit + fullscreen viewer в разделе `svg`.

## Изменённые файлы

- `vibetest-app/src/app/player/ui/svg-step-ui/*`
- `vibetest-app/src/app/player/ui/svg-fullscreen-viewer/*`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: **зелёный** (72 files, 205 tests)

## Отклонения от TASK.md

- Backdrop закрывает viewer (зафиксировано в реализации).

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_

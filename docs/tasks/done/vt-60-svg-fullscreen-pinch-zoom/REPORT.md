---
branch: feature/vt-60-svg-fullscreen-pinch-zoom
---

# Отчёт vt-60 — SVG fullscreen: display + pinch/wheel zoom

## Что сделано

- Fullscreen CSS: panel `height: 100%`, SVG `width/height: 100%` в viewport для стабильного fit.
- При open inline SVG убирается из figure — одна копия в overlay (нет дублей `id`/`url(#…)`).
- `zoomSvgViewportAt`, `zoomSvgViewportByFactor`, `applySvgPinchViewport` + unit-тесты.
- Viewer: wheel zoom у курсора, pinch двумя pointer, pan одним при scale > 1.
- SPEC § `svg`: pinch/wheel разрешены.

## Изменённые файлы

- `vibetest-app/src/app/player/ui/svg-step-ui/svg-viewport-state.ts`
- `vibetest-app/src/app/player/ui/svg-step-ui/svg-viewport-state.spec.ts`
- `vibetest-app/src/app/player/ui/svg-step-ui/svg-step-ui.html`
- `vibetest-app/src/app/player/ui/svg-step-ui/svg-step-ui.scss`
- `vibetest-app/src/app/player/ui/svg-step-ui/svg-step-ui.spec.ts`
- `vibetest-app/src/app/player/ui/svg-fullscreen-viewer/svg-fullscreen-viewer.ts`
- `vibetest-app/src/app/player/ui/svg-fullscreen-viewer/svg-fullscreen-viewer.html`
- `vibetest-app/src/app/player/ui/svg-fullscreen-viewer/svg-fullscreen-viewer.scss`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: зелёный (83 files, 356 tests)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

- `applySvgPinchViewport` может оставить `scale === 1` с ненулевым pan → `svg-viewport-state.ts` (`applySvgPinchViewport`: после `zoomSvgViewportAt` всегда добавляется midpoint-delta) → при clamp к fit pan должен сбрасываться (как в `zoomSvgViewportAt` / `withSvgViewerScale`); добавить тест на pinch к scale 1 с ненулевым сдвигом midpoint.
  - **Исправлено:** midpoint-delta не применяется при `scale <= 1`; тест `clears pan when pinch clamps back to fit scale`.
- После pinch при отпускании одного пальца (остаётся 1 pointer) pan не продолжается → `svg-fullscreen-viewer.ts` (`onPointerUp`: при `size === 1` только сбрасывается `pinchSnapshot`, `panning`/`lastPointer` не выставляются) → если `canPanSvgViewport`, заново включить pan от оставшегося pointer.
  - **Исправлено:** при переходе 2→1 pointer и `scale > 1` включается pan от оставшегося pointer.

Ревью (2026-09-26 / раунд 2): замечаний нет.

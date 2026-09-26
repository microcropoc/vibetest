# vt-60 — SVG fullscreen: display + pinch/wheel zoom

## Контекст

В overlay часть SVG не отображается (CSS fit + дубли `id` при двух копиях в DOM). Wheel/pinch zoom не реализованы (SPEC запрещал).

## Цель

Fullscreen viewer стабильно показывает SVG; pinch на touch и колесо на desktop; кнопки +/−/pan без регрессии.

## Требования

- CSS fit в viewer; один экземпляр SVG в DOM при open.
- `zoomSvgViewportByFactor`, `zoomSvgViewportAt`, pinch pure helper + тесты.
- Wheel + multi-pointer pinch/pan в viewer.
- Обновить SPEC § `svg`.

## Критерии готовности

- [x] `ng test --watch=false` зелёный
- [x] SVG виден в overlay; pinch/wheel работают

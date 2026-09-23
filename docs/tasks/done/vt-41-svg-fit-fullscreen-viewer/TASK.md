# vt-41 — SVG: вписать в карточку и полноэкранный просмотр

## Контекст

Шаг **svg** в плеере ([`svg-step-ui`](../../../vibetest-app/src/app/player/ui/svg-step-ui/)): inline SVG через `innerHTML`, контейнер `.svg-step-ui__figure` с `overflow: auto` — на больших или широких SVG появляется **скролл** внутри карточки. Нет режима детального просмотра с увеличением.

SPEC: SVG доверенный, без санитизации; рендер как theory по завершению шага.

## Цель

1. В **карточке** шага SVG **целиком видно** без внутреннего scroll (fit/contain в доступной области).
2. Кнопка **«Развернуть»** открывает **полноэкранный overlay** в приложении с **zoom (+/−/Сброс)** и **pan** (drag) при увеличении.

## Требования

### Карточка ([`svg-step-ui`](../../../vibetest-app/src/app/player/ui/svg-step-ui/))

- Область figure: фиксированная или flex-доля viewport плеера; SVG **вписывается** (`max-width`/`max-height`, сохранение aspect ratio), **без** `overflow: auto` на figure для обычного просмотра.
- Caption и description остаются над/под figure, не обрезаются.
- Кнопка **«Развернуть»** (touch target ≥ 44 px, согласовано с vt-39).

### Полноэкранный viewer (modal overlay)

- **Не** Browser Fullscreen API — fixed overlay на весь viewport (`role="dialog"`, `aria-modal="true"`, заголовок/label).
- Закрытие: кнопка «Закрыть», клик по backdrop (опционально — зафиксировать в реализации), **Escape**.
- При открытии: SVG целиком в viewer (fit); при закрытии — сброс zoom/pan, **focus restore** на «Развернуть».
- Toolbar: **+**, **−**, **Сброс**; масштаб с min/max (например 0.5–4 или 1–4 от fit-baseline).
- **Pan:** pointer drag (mouse + touch) только когда scale > 1 (или всегда с clamp); transform на внутренней «сцене», viewport `overflow: hidden`.
- Тот же sanitized SVG markup, что в карточке (без второго источника данных).

### Архитектура

- Sanitization остаётся в [`svg-step-ui.ts`](../../../vibetest-app/src/app/player/ui/svg-step-ui/svg-step-ui.ts).
- Pure functions для zoom/pan state (clamp scale, apply delta, reset) — colocated spec без TestBed где возможно.
- Dumb subcomponent `svg-fullscreen-viewer` в `player/ui/` или `shared/ui/` — допустимо, если одна ответственность (overlay + controls).

### Тесты

- Рендер SVG + кнопка «Развернуть».
- Open/close dialog, Escape, focus restore (mock/focus trap minimal).
- Zoom limits, reset, pan state logic (unit on pure functions).
- Не assert computed CSS/media в component tests.

### Документация

- Обновить раздел **`svg`** в [`docs/SPECIFICATION.md`](../../SPECIFICATION.md): fit в карточке, fullscreen viewer с zoom/pan.

## Технические заметки

- Зависимость: player step UI (vt-21); учесть vt-39 на узких экранах (toolbar wrap, pan на touch).
- SMIL/CSS анимации в SVG продолжают работать в overlay (тот же DOM clone или re-render markup).

## План работ

- [x] Fit-to-card SCSS + кнопка «Развернуть»
- [x] Overlay viewer + zoom/pan model
- [x] Tests + SPEC
- [x] `ng test --watch=false`, REPORT при merge

## Критерии готовности (Definition of Done)

- [x] SVG в карточке без scroll; fullscreen с zoom/pan работает на desktop и touch
- [x] a11y: dialog, Escape, focus restore
- [x] `ng test --watch=false` зелёный; SPEC обновлён

## Вне рамок задачи

- Скачивание / экспорт SVG
- Редактирование SVG в UI
- Поворот, browser Fullscreen API
- Zoom колёсиком / pinch (только кнопки + drag pan)
- Подсветка отдельных элементов SVG
- Санитизация SVG (контент доверенный)

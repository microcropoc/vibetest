# vt-21 — Theory и SVG step UI

## Контекст

Display-шаги: markdown (theory) и inline SVG (svg); контент курса **доверенный**, без санитизации в MVP.

## Цель

Dumb step components: markdown render for theory; inline SVG as trusted HTML/SVG; wired from player shell **vt-19**.

## Требования

- Theory: render `content` string as markdown (library choice in REPORT).
- SVG: render inline SVG from `content`; optional caption/description.
- `@defer` or lazy import if bundle heavy.
- Tests: theory/svg render sample content (no sanitizer tests).

## Технические заметки

- Зависимости: **vt-4**, **vt-6**, **vt-19**.

## План работ

- [x] Markdown step component
- [x] Svg step component
- [x] Register components in **vt-19** player outlet (no separate orchestrator)
- [x] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [x] Trusted markdown/SVG render по спецификации (без sanitizer)

## Вне рамок задачи

- Quiz, practice editors

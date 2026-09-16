# vt-21 — Theory и SVG step UI

## Контекст

Display-шаги: markdown (theory) и inline SVG (svg) с санитизацией MVP.

## Цель

Dumb step components + sanitizer для SVG (no `<script>`, no external URL loads per spec); markdown render for theory; wired from player shell **vt-19**.

## Требования

- Theory: render `content` string as markdown (library choice in REPORT).
- SVG: render sanitized inline SVG; optional caption/description.
- `@defer` or lazy import if bundle heavy.
- Tests: sanitizer strips/blocks forbidden patterns; theory renders sample.

## Технические заметки

- Зависимости: **vt-4**, **vt-6**, **vt-19**.

## План работ

- [ ] Markdown step component
- [ ] Svg step + sanitizer pure fn tests
- [ ] Player outlet switching by type
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] SVG MVP security rules из спецификации

## Вне рамок задачи

- Quiz, practice editors

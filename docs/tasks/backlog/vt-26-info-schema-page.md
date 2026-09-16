# vt-26 — Info page (bundled schema)

## Контекст

Вкладка **Инфо**: read-only formatted JSON Schema из bundle (**vt-2**).

## Цель

Page loads bundled `course.schema.json`, displays pretty-printed JSON; no hand-maintained duplicate text.

## Требования

- Read-only `<pre>` or scrollable code block.
- Source = same artifact as app validation.
- Lazy route.

## Технические заметки

- Зависимости: **vt-2**, **vt-16**.

## План работ

- [ ] Load schema asset/json
- [ ] InfoPage template
- [ ] Smoke test optional
- [ ] `ng build` includes asset

## Критерии готовности (Definition of Done)

- [ ] Соответствует разделу «Инфо» спецификации

## Вне рамок задачи

- Human-readable schema renderer (post-MVP)

# vt-26 — Info page (bundled schema)

## Контекст

Вкладка **Инфо**: read-only formatted JSON Schema для **авторов** из bundle (**vt-2**).

## Цель

Page loads bundled `public/schemas/course.schema.json`, displays pretty-printed JSON; no hand-maintained duplicate text.

## Требования

- Read-only `<pre>` or scrollable code block.
- Source = `course.schema.json`.
- Lazy route.

## Технические заметки

- Зависимости: **vt-2**, **vt-16**.

## План работ

- [x] Load schema asset/json
- [x] InfoPage template
- [x] Smoke test optional
- [x] `ng build` includes asset

## Критерии готовности (Definition of Done)

- [x] Соответствует разделу «Инфо» спецификации

## Вне рамок задачи

- Human-readable schema renderer (post-MVP)

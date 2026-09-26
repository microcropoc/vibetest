# vt-62 — Theory: markdown styles pierce encapsulation

## Контекст

После vt-59 containment на `:host` работает, но стили для `pre`/`code` из [`theory-step-ui.scss`](../../../vibetest-app/src/app/player/ui/theory-step-ui/theory-step-ui.scss) не применяются к HTML из `[innerHTML]`: emulated encapsulation требует `_ngcontent` на injected узлах.

## Цель

Стили markdown (в т.ч. `overflow-x: auto` и affordance у fenced code) применяются к injected HTML; на мобилке длинный код скроллится внутри `<pre>`.

## Требования

- Правила для потомков `.theory-step-ui` (p, pre, code, table, …) — через `:host ::ng-deep`, по аналогии с [`code-editor.scss`](../../../vibetest-app/src/app/player/ui/code-editor/code-editor.scss).
- Без `ViewEncapsulation.None` и без изменений markdown-рендера.
- Spec: `getComputedStyle(pre).overflowX === 'auto'` для fenced block.

## Технические заметки

- [`theory-step-ui.scss`](../../../vibetest-app/src/app/player/ui/theory-step-ui/theory-step-ui.scss)
- [`theory-step-ui.spec.ts`](../../../vibetest-app/src/app/player/ui/theory-step-ui/theory-step-ui.spec.ts)

## План работ

- [x] `:host ::ng-deep` для markdown-descendant правил
- [x] Spec на overflow pre
- [x] `ng test --watch=false`

## Критерии готовности (Definition of Done)

- [x] Тесты зелёные (`ng test --watch=false`)
- [x] На theory видны affordance и горизонтальный scroll у `pre`

## Вне рамок задачи

- Повторный merge vt-59 / изменения player-shell
- Подсветка синтаксиса в theory

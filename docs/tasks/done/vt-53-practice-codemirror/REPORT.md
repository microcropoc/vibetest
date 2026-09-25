---
branch: feature/vt-53-practice-codemirror
---

# Отчёт vt-53 — CodeMirror 6 в practice UI

## Что сделано

- `CodeEditor` + `practice-codemirror-host` (CM6, dynamic `import()` host chunk).
- Подсветка: `javascript` / `sql` / `plain` (regex); тема через CSS variables (`data-theme`).
- `PracticeStepShellComponent` — textarea заменён на `app-code-editor`; draft/run/disabled без изменений контракта.
- Lazy: practice shell по-прежнему `@defer` в player-shell; CM bundle — отдельный chunk через dynamic import host.
- SPEC § Практика — описание редактора.

## Изменённые файлы

- `vibetest-app/package.json`, `package-lock.json`
- `player/ui/code-editor/*`, `player/ui/practice-step-shell/*`
- `docs/SPECIFICATION.md`, `docs/PLAN.md`
- `docs/tasks/done/vt-53-practice-codemirror/`

## Тесты

- `ng test --watch=false`: зелёный (**333**)

## Отклонения от TASK.md

- Внутренний `@defer` вокруг редактора в shell не добавлен: player-shell `@defer` + dynamic import host достаточно; вложенный defer ломал TestBed.

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-09-25):

1. **Утечка EditorView при destroy до resolve `import()`** → `code-editor.ts` (`afterNextRender` + `void import(...).then`) → если компонент уничтожен, пока грузится chunk, `mountPracticeCodeEditor` всё равно создаёт view, а `onDestroy` уже прошёл с `handle === undefined`. Ожидание: флаг/`Abort`/cancel; после resolve не mount’ить (или сразу `destroy()`), если компонент уже destroyed.
2. **`:global()` в Angular SCSS не работает** → `code-editor.scss` → Angular emulated encapsulation не понимает `:global(...)` (это не валидный CSS / не `::ng-deep`). Правила для `.cm-editor` / focus outline / min-height фактически отбрасываются. Ожидание: `:host ::ng-deep .cm-editor` (или стили через `EditorView.theme` / global styles).
3. **Доступность label** → `practice-step-shell.html` → `<label>` заменён на `<div class="…__label">`, клик по подписи и связь с полем потеряны. Ожидание: `aria-labelledby` / `aria-label` на host редактора (или явная привязка к CM contenteditable), сохранив видимый текст подписи.

**Исправлено:**

1. `code-editor.ts`: флаг `destroyed`; после resolve `import()` — не mount или сразу `destroy()` handle.
2. `code-editor.scss`: `:host ::ng-deep`; min-height/focus outline дублированы в `practice-codemirror-theme.ts`.
3. Подпись с `[id]="editorLabelId()"`; CM `contentDOM` — `aria-labelledby`, `role="textbox"`.

Ревью (2026-09-25, раунд 2):

1. **`aria-labelledby` только при mount** → `practice-codemirror-host.ts` / `code-editor.ts` → `labelledBy` читается в `mountPracticeCodeEditor`, в `effect` не обновляется. При переходах practice→practice shell/редактор переиспользуются (`player-shell` `@default`), `stepId`/id подписи меняются, а CM остаётся со старым `aria-labelledby`. Ожидание: `setLabelledBy` на handle + вызов из effect (как `setLanguage` / `setDoc`).

**Исправлено (раунд 2):** `setLabelledBy` на handle; `code-editor` effect синхронизирует `labelledBy()`; тест в `practice-codemirror-host.spec.ts`.

Ревью (2026-09-25, раунд 3): Замечаний нет.


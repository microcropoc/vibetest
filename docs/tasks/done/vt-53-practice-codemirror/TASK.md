# vt-53 — CodeMirror 6 в practice UI

## Контекст

Practice shell ([`vt-23`](../../done/vt-23-practice-step-ui/)) использует `<textarea>` без подсветки синтаксиса для javascript / sqlite / regex. После vt-51 и расширенного JS-практики нужен читаемый редактор без перехода на тяжёлый Monaco.

## Цель

Заменить textarea в [`practice-step-shell`](../../../../vibetest-app/src/app/player/ui/practice-step-shell/practice-step-shell.html) на **CodeMirror 6** с подсветкой по типу шага; сохранить текущий контракт draft/run/disabled.

## Требования

- **Языки:** `javascript` → JS; `sqlite` → SQL; `regex` → plain text (без ложной JS-подсветки).
- **Поведение:** `draft` / `draftChange` как сейчас; `disabled` при `running`; базовый Tab/indent; без LSP, autocomplete, format-on-save.
- **Lazy:** редактор не в main bundle — `@defer` и/или dynamic `import()` для CM chunk; PWA кэширует lazy chunk как остальные (vt-27).
- **Темы:** визуально согласован с light/dark ([`vt-40`](../../done/vt-40-settings-themes/)) — CSS variables / codemirror theme.
- **Архитектура:** dumb UI в `player/ui/` (отдельный `code-editor` или инкапсуляция в shell); orchestrator/engine не менять; Worker по-прежнему только через execution.
- **SPEC:** кратко описать редактор практики с подсветкой.
- **Тесты:** состояния shell (мок редактора или shallow); не тянуть полный CM в каждый unit без нужды.

## Технические заметки

- Зависимости: **vt-23** (practice shell), **vt-40** (темы).
- Пакеты: `codemirror`, `@codemirror/lang-javascript`, `@codemirror/lang-sql` (и минимальный набор view/state).
- `ng g component` для wrapper; CM init/teardown в `effect` или lifecycle с `DestroyRef`.
- Затрагиваемые папки: `player/ui/practice-step-shell`, новый `player/ui/code-editor` (или аналог).

## План работ

- [ ] Зависимости npm + lazy wrapper component
- [ ] Подключить в practice-step-shell (input language по step type)
- [ ] Тема light/dark
- [ ] SPEC + тесты shell
- [ ] `ng test --watch=false` зелёный; REPORT при merge

## Критерии готовности (Definition of Done)

- [ ] Три типа практики редактируются через CM6 с корректной подсветкой
- [ ] Draft/progress/run flow без регрессий
- [ ] Lazy chunk не ломает offline после production build
- [ ] Тесты зелёные; smart/dumb соблюдён

## Вне рамок задачи

- Monaco / полноценная IDE
- Lint diagnostics в редакторе
- Редактор для theory markdown
- Изменения course schema / runners

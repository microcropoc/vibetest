---
branch: feature/vt-87-regex-leetcode-format
merged: "15f12b0"
---

# Отчёт vt-87 — Regex-шаг в формате LeetCode / HackerRank

## Что сделано

- **Схема `regexContent`**: `flags`, `answerFormat` (pattern | literal), `mode` (test, fullMatch, match, matchAll, replace, split), `replacement`, `unordered`, `tests[].input` до 10 000; описания JS vs PCRE и Safari 16.4+. `npm run generate:zod`.
- **`RegexContentWithOptionsSchema`**: replacement обязателен при `mode: replace`; `flags` запрещены при `literal`; проверка флагов u/v.
- **Движок**: `regex-result.ts` (сериализация, сравнение, diff/preview), `regex-pattern.ts` (literal, flags, matchAll+g), расширенный `regex-practice-core.ts`.
- **Протокол**: `regexInit` с опциями; `regexCaseResult.diff`; runner и reference self-check прокидывают `PracticeFailureDetails` kind `regex`.
- **UI**: `app-regex-result-diff` + wiring в `practice-step-shell`; `PracticeFeedback.regexDiff`.
- **Fixtures**: `pass/regex-leetcode-format.json`, `fail/regex-broken-literal-reference.json`.
- **Документация**: `SPECIFICATION.md`, `INSTRUCTION_REGEX_PRACTICE` в промптах генерации курса/модуля.

## Изменённые файлы

- `docs/schemas/course.schema.json`, `course-import.schema.json`, `module-import.schema.json`; `vibetest-app/public/schemas/*`
- `vibetest-app/src/app/courses/generated/*`, `regex-content-options.ts`, `course-zod-schema.ts`, `import-course-zod-schema.ts`
- `vibetest-app/src/app/execution/regex-{result,pattern,practice-core}*`, `execution-messages.ts`, `regex-practice-worker-handler.ts`
- `vibetest-app/src/app/player/step-engine/practice-run-result.ts`, `regex/regex-practice-runner.ts`, `practice-step-view.ts`
- `vibetest-app/src/app/player/ui/regex-result-diff/*`, `practice-step-shell/*`
- `vibetest-app/src/app/courses/__fixtures__/practice-check/pass|fail/*`, `validate-practice-references.spec.ts`, `practice-reference-in-process-runners.spec-helper.ts`
- `vibetest-app/src/app/prompt-generation/build-course-generation-prompt.ts`, `build-staged-generation-messages.ts` (+ spec)
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: 130 файлов, 788 тестов — зелёный.

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

Ревью (2026-10-16), ветка `feature/vt-87-regex-leetcode-format` (коммит `cc67361`):

- **Невалидный синтаксис литерала с `/` внутри символьного класса (`[/]`) в `parseRegexLiteral`** → `vibetest-app/src/app/execution/regex-pattern.ts` (`parseRegexLiteral`, строки 10–31) → парсер ищет закрывающий `/` простым посимвольным циклом с пропуском только `\x` и не учитывает символьные классы `[...]` (включая вложенные при флаге `v`). В валидном JS RegExp-литерале `/` внутри `[...]` не требует экранирования (например, `/https?:[/][/]/` или `/[a/b]/i`), но `parseRegexLiteral('/[a/b]/i')` разрежет литерал на первом `/` внутри скобок (`pattern = '[a'`, `flags = 'b]/i'`) и выбросит `Invalid RegExp flag: b` → `Invalid regular expression`. Ожидание: отслеживать глубину открытых `[...]` (с учётом `\` внутри и вне символьного класса) и считать `/` закрывающим делимитером только вне `[...]`, либо разбирать литерал с конца строки (начиная с последнего `/` после флагов: `const lastSlash = trimmed.lastIndexOf('/')`, если `lastSlash > 0`).
- **Сравнение `namedGroups` зависит от порядка объявления именованных групп в паттерне** → `vibetest-app/src/app/execution/regex-result.ts` (`matchItemMultisetKey` на строках 115–118 и `matchResultsEqual` на строках 150–152) → `JSON.stringify(left.namedGroups ?? null)` сериализует ключи `m.groups` в порядке их объявления в регулярном выражении. Если в `mode: 'match'` или `mode: 'matchAll'` (например, с альтернацией `(?<a>x)|(?<b>y)` vs `(?<b>y)|(?<a>x)` или при разном порядке lookahead-групп) ученик и эталон захватывают одни и те же значения именованных групп `{ a: 'x', b: null }`, но объявили их в разном порядке, `JSON.stringify` вернёт разные строки и засчитает провал. Ожидание: нормализовать ключи `namedGroups` по алфавиту (`Object.keys(groups).sort()`) при создании в `namedGroupsFromExec` (тогда и `matchResultsEqual`, и `matchItemMultisetKey`, и UI-превью получат канонический порядок ключей).
- **`unordered` в `regexContent` разрешён для любых `mode`, хотя действует только для `matchAll`** → `vibetest-app/src/app/courses/regex-content-options.ts` (`RegexContentWithOptionsSchema`) → в `replacement` есть зеркальная проверка (`replacement is only allowed when mode is replace`), а в `build-course-generation-prompt.ts` написано «`unordered: true` только для `matchAll`», однако `RegexContentWithOptionsSchema` пропускает `unordered: true` при `mode: 'test' | 'split' | ...` (где флаг молча игнорируется). Ожидание: добавить в `RegexContentWithOptionsSchema` проверку, что `unordered !== undefined` допустим только при `mode === 'matchAll'` (по аналогии с `replacement`).
- **Перекрывающиеся совпадения в `RegexResultDiffComponent.inputSegments` дублируют текст входной строки** → `vibetest-app/src/app/player/ui/regex-result-diff/regex-result-diff.ts` (`inputSegments`, строки 45–67) → в `mode: 'matchAll'` паттерн с lookahead и захватывающей группой или пустыми/перекрывающимися шагами может породить спаны с `span.start < cursor` (либо одинаковым `start`), но цикл делает `segments.push({ text: preview.slice(span.start, span.end), highlight: true }); cursor = span.end;` без учёта `Math.max(span.start, cursor)`, из-за чего фрагменты `inputPreview` дублируются в DOM. Кроме того, в шаблоне `regex-result-diff.html` подсветка во «Вход» всегда строится только по `inputSegments('user')` (даже когда у ученика совпадений нет, а у эталона есть), поэтому метод принимает параметр `side: 'user' | 'expected'`, который нигде не вызывается со значением `'expected'`. Ожидание: зажимать начало сегмента (`const start = Math.max(span.start, cursor); if ( span.end <= start ) continue;`) и убрать неиспользуемый параметр `'expected'` (либо отображать подсветку согласованно).

### Что исправлено

- **`parseRegexLiteral`**: учёт глубины `[...]` и `\`; закрывающий `/` только вне символьного класса (`/[a/b]/i`, `/https?:[/][/]/`, `/[[a-z]--[/]]/v`).
- **`namedGroups`**: ключи сортируются в `namedGroupsFromExec`; сравнение match/matchAll через канонический JSON для `namedGroups` и multiset для позиционных `groups`.
- **`unordered`**: в `RegexContentWithOptionsSchema` запрещён при `mode !== 'matchAll'`.
- **`RegexResultDiffComponent`**: `inputSegments` — `computed` без параметра `side`; перекрывающиеся спаны зажимаются по `cursor`.
- **Тесты**: `ng test --watch=false` — 130 файлов, 792 теста — зелёный (до раунда 2).

Ревью (2026-10-16, раунд 2), коммит `7196715`:

- **Позиционные группы (`groups`) сравниваются как мультимножество вместо упорядоченного кортежа** → `vibetest-app/src/app/execution/regex-result.ts` (`captureGroupsMultisetEqual`, строки 152–162, и `matchItemMultisetKey`, строки 117–120) → в коммите `7196715` поэлементное сравнение `left.groups.every((g, i) => g === right.groups[i])` было заменено на `captureGroupsMultisetEqual` (и сортировку `groups` в `matchItemMultisetKey`), из-за чего порядок позиционных групп захвата `($1, $2, …)` перестал проверяться. Например, для входа `'2026-10'` и эталона `(\d{4})-(\d{2})` (`groups: ['2026', '10']`) неверное решение с переставленными группами `(?=.*-(\d{2}))(\d{4})-\d{2}` (`groups: ['10', '2026']`) ошибочно пройдёт проверку в `mode: 'match'` и `mode: 'matchAll'`. В замечании раунда 1 речь шла только про порядок ключей объекта `namedGroups` (`(?<a>x)|(?<b>y)` vs `(?<b>y)|(?<a>x)`), тогда как позиционные `groups` в `RegExpExecArray` (`m.slice(1)`) — это упорядоченный массив `$1, $2, …`, где индекс группы имеет семантический смысл. Ожидание: сравнивать `groups` по порядку индексов (`left.groups.length === right.groups.length && left.groups.every((g, i) => g === right.groups[i])`) и не сортировать `groups` в `matchItemMultisetKey` (оставив каноническую сортировку ключей только для `namedGroups`). If в тесте `treats namedGroups as equal regardless of declaration order in the pattern` нужно проверить именно `namedGroups` без позиционного конфликта, использовать дублирующиеся имена групп `(?<a>x)(?<b>y)|(?<b>y)(?<a>x)` в ES2025 или именованные группы на одинаковых позициях / прямое конструирование `RegexSerializedResult`.

### Что исправлено (раунд 2)

- **`groups`**: снова сравниваются по индексу `$1, $2, …`; `captureGroupsMultisetEqual` удалён; в `matchItemMultisetKey` порядок `groups` сохранён.
- **`namedGroups`**: канонический JSON по отсортированным ключам без изменений.
- **Тесты**: равенство `namedGroups` при разном порядке ключей объекта; провал при переставленных позиционных группах в `match` и `matchAll`.
- **`ng test --watch=false`**: 130 файлов, 794 теста — зелёный.

Ревью (2026-10-16, раунд 3), коммит `9f71141`:

- Замечаний нет. Позиционные группы снова сравниваются строго по порядку индексов, `namedGroups` сравниваются независимо от порядка ключей, все замечания закрыты.

# vt-87 — Regex-шаг в формате LeetCode / HackerRank

**Приоритет:** P1  
**Зависимости:** vt-86  
**Блокирует:** vt-88, vt-89, vt-90

## Контекст

Для курсов HackerRank Regex (~53 задачи) и LeetCode-подобных задач нужны флаги, сравнение match/replace/split, длинный ввод и diff при провале. Сейчас только `.test()` без флагов; `tests[].input` max 2000 символов.

Диагностика провала должна переиспользовать расширение `PracticeFeedback` из vt-81 (union по типу шага), если vt-81 уже в main — не дублировать модель.

## Цель

Автор описывает типичную regex-задачу с HackerRank/LeetCode; ученик при провале видит вход, свой и ожидаемый результат (matches/replace/split). Старые regex-шаги без новых полей остаются валидными.

## Требования

### Схема (`docs/schemas/course.schema.json` → `$defs.regexContent`)

- **`flags`** (string, optional): символы `g i m s u v y d`; по умолчанию без флагов.
- **`answerFormat`**: `pattern` (default) | `literal` — ученик пишет `/pattern/flags`.
- **`mode`**: `test` (default) | `fullMatch` | `match` | `matchAll` | `replace` | `split`.
- **`replacement`** (string, required when `mode: replace`): строка для `String.replace`, с `$1`, `$<name>`.
- **`unordered`** (boolean, optional): для `matchAll` — сравнение как multiset.
- **`tests[].input`**: поднять maxLength до **10000**.
- `npm run generate:zod`.

### Движок (core + worker)

- Сериализация результатов в JSON для сравнения: boolean; fullMatch; match `{ index, groups, namedGroups }`; matchAll — массив; replace — string; split — string[].
- Для `matchAll` при отсутствии `g` в flags — добавлять `g` автоматически.
- Deep equality с учётом `unordered` для matchAll.

### Диагностика UI

- Worker возвращает input (truncated), user/expected serialized results, message; cap размеров.
- Расширить `PracticeRunResult` → `PracticeFeedback` (согласовать с vt-81 sql diff).
- Dumb `player/ui/regex-result-diff`: подсветка match на input; для replace/split — side-by-side.
- Встроить в `practice-step-shell` для `regex`.

### Тесты и курсы

- Fixtures pass/fail на каждый mode и option в `courses/__fixtures__/practice-check/`.
- `sample-courses.spec.ts`: starter regex через shared core (уже есть starter fail — сохранить).

### Документация

- JSON Schema descriptions, `docs/SPECIFICATION.md`, `build-course-generation-prompt.ts`, `build-staged-generation-messages.ts`.
- Ограничения JS vs PCRE: нет atomic/possessive, recursion, conditionals, `\A`/`\Z`.
- `v` и lookbehind: Safari 16.4+.

## Технические заметки

- Домены: `courses/`, `execution/`, `player/`.
- CLI: `ng g` для `regex-result-diff` или ручная структура папок.

## План работ

- [ ] Расширить `regexContent` + generate:zod
- [ ] Core: compile with flags/literal, все mode, compare, unordered
- [ ] Execution messages + worker + runner payload для diff
- [ ] `regex-result-diff` + practice-step-shell
- [ ] Fixtures + docs + prompts
- [ ] Зелёные тесты

## Критерии готовности (Definition of Done)

- [ ] Fixtures покрывают все mode/options; reference pass / starter fail
- [ ] Обратная совместимость: шаг в `javascript-for-csharp` без новых полей работает
- [ ] `ng test --watch=false` зелёный

## Вне рамок задачи

- Наполнение курсов — vt-88–90
- Core/error id — vt-86

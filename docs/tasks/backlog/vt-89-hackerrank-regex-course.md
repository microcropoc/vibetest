# vt-89 — Курс «HackerRank Regex» (весь домен)

**Приоритет:** P2  
**Зависимости:** vt-86, vt-87  
**Блокирует:** нет

## Контекст

HackerRank Regex Domain: Introduction, Character Class, Repetitions, Grouping, Backreferences, Assertions (~29 «чистых» паттернов) + Applications (~24) с многострочным текстом, извлечением и заменой. Пользователь выбрал **весь раздел**, включая Applications в адаптации под vt-87.

## Цель

Bundled-курс **«HackerRank Regex»**: intro + 7 модулей, ~53 задачи; русское условие + ссылка на HackerRank; reference/starter invariants в тестах.

## Требования

- Каталог `docs/courses/hackerrank-regex/`:
  - 00-intro (JS vs PCRE, Safari 16.4+, режимы шага)
  - Introduction, Character Class, Repetitions, Grouping and Capturing, Backreferences, Assertions, Applications
- **PCRE-only** (Branch Reset, Forward References, Conditionals, Atomic Groups): в theory — ограничение JS; практика — эквивалентная задача под ECMAScript.
- **Applications:**
  - `matchAll` / `replace` + флаг `m` (Detect HTML Links, IP validation, Split Phone Numbers и т.д.);
  - где одного паттерна недостаточно — `javascript` шаг с `RegExp` в коде.
- `answerFormat`, `flags`, `mode`, `replacement`, длинный `input` (до 10k).
- `hackerrank-regex.json`, README, bundled-courses.

## Технические заметки

- Большой JSON; чеклист задач по разделам — в REPORT при in-progress.
- Таймаут `sample-courses.spec.ts` при необходимости.

## План работ

- [ ] course.json + intro
- [ ] 6 базовых модулей (чеклист HackerRank)
- [ ] Applications (matchAll/replace/javascript mix)
- [ ] PCRE-only замены
- [ ] build:courses, README, tests

## Критерии готовности (Definition of Done)

- [ ] ~53 задачи домена покрыты (с документированными заменами PCRE-only)
- [ ] Reference pass / starter fail
- [ ] `ng test --watch=false` зелёный

## Вне рамок задачи

- Флагман / practical — vt-88, vt-90
- vt-86, vt-87

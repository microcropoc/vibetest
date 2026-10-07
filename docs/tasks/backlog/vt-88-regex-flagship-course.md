# vt-88 — Флагман «Регулярные выражения в JavaScript» + модуль LeetCode

**Приоритет:** P2  
**Зависимости:** vt-86, vt-87  
**Блокирует:** нет (параллельно vt-89, vt-90)

## Контекст

В bundled-курсах один regex-шаг (`javascript-for-csharp/20-strings-regex`). После vt-87 нужен опорный курс и модуль задач LeetCode, где regex уместен.

## Цель

Bundled-курс **«Регулярные выражения в JavaScript»** (~15–17 модулей: theory, svg, regex, quiz) + модуль LeetCode (~12 задач). Курс в `docs/courses/`, README, `sample-courses.spec.ts`.

## Требования

- Каталог `docs/courses/regex-javascript/`: `course.json`, `NN-slug.module.json`.
- Темы модулей (ориентир):
  - литералы и экранирование;
  - классы символов, `\p{...}`;
  - квантификаторы greedy/lazy;
  - якоря, `\b`;
  - группы, alternation, backreferences, named groups;
  - lookahead / lookbehind;
  - флаги `y`, `d`;
  - String API: match, matchAll, replace (+ function), split, search;
  - флаг `v`, set operations;
  - catastrophic backtracking;
  - отличия от PCRE/.NET.
- **Модуль LeetCode** (~12):
  - **regex** шаги: 65 Valid Number, 468 Validate IP, 193 Valid Phone Numbers, 1108 Defanging IP, 1556 Thousand Separator (`replace` + lookahead), 434 Number of Segments, 2047 Valid Words, 2042 Ascending Numbers in Sentence, 1805 Different Integers in String;
  - **javascript** шаги (реализовать matcher): 10 Regular Expression Matching, 44 Wildcard Matching.
- Условия на русском + ссылка на LeetCode; режимы vt-87 где нужно.
- `regex-javascript.json`, README, bundled-courses.

## Технические заметки

- Эталон: [algorithms-blind-75](../../courses/algorithms-blind-75/), [javascript-for-csharp](../../courses/javascript-for-csharp/).
- Feature branch `feature/vt-88-regex-flagship-course` для правок app при merge.

## План работ

- [ ] course.json + intro
- [ ] Модули 01–N по темам
- [ ] Модуль LeetCode (regex + 2 javascript)
- [ ] build:courses, README, tests

## Критерии готовности (Definition of Done)

- [ ] Assembled JSON = in-memory build
- [ ] Reference pass / starter fail на каждом regex-шаге
- [ ] `ng test --watch=false` зелёный

## Вне рамок задачи

- HackerRank / practical — vt-89, vt-90
- Движок/схема — vt-86, vt-87

# vt-51 — Демо-курс: алгоритмы на JS-практике

## Контекст

После vt-47…vt-49 (и опционально vt-50) нужна проверка DX авторов и регрессии «счастливого пути» на реальном контенте: один небольшой import-курс в `docs/courses/`.

## Цель

Курс **«Алгоритмы: старт»** (или аналог) — 1 модуль, 5–8 шагов: theory/quiz по желанию + JS-практики, покрывающие новые поля **без** обязательного `checker`.

## Требования

### Контент

Import-DTO в [`docs/courses/`](../../courses/) (как `javascript-basics.json`):

| Шаг (пример) | Что демонстрирует |
|--------------|-------------------|
| Two Sum / сумма | baseline `functionName` + args |
| Rotate Array | `resultMode: "args"` |
| Reverse Linked List | `structure` list |
| Invert Binary Tree | `structure` tree |
| LRU Cache | `construct` + `calls` |
| Three Sum (урезанный) | `unordered: true` |

- Валидный import-DTO (`schemaVersion: 1`), проходит Zod + semantic.
- `starterCode` с заглушками; `referenceSolution` полный; тесты ≥ 2 на практику.
- Краткое описание в [`docs/courses/README.md`](../../courses/README.md), если файл есть.

### Проверка

- [ ] Импорт курса в приложении (ручной smoke или существующий parse fixture test)
- [ ] Хотя бы один automated parse/validate spec на файл курса (как другие bundled courses, если есть паттерн)
- [ ] Не использовать `checker` в этом курсе (оставить для vt-50 docs/examples в REPORT vt-50)

## Технические заметки

- Зависимости: **vt-47**, **vt-48**, **vt-49** (все три merged).
- Код раннера не менять, кроме фикса багов, найденных на курсе (багфикс — в той же ветке или follow-up).
- Не трогать `vibetest-app/` без необходимости; предпочтительно только `docs/courses/`.

## План работ

- [ ] Набросать JSON курса под схему после vt-49
- [ ] Validate через generate/zod / import parse
- [ ] README note
- [ ] REPORT при merge

## Критерии готовности (Definition of Done)

- [ ] Курс валиден и демонстрирует все четыре декларативных расширения
- [ ] README обновлён

## Вне рамок задачи

- Полный курс уровня LeetCode Blind 75
- `checker`-примеры (vt-50)
- UI автора / шаблоны

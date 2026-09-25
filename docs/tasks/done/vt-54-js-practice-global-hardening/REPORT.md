---
branch: feature/vt-54-js-practice-global-hardening
---

# Отчёт vt-54 — JS practice: global bag hardening + identifier validation

## Что сделано

- Bag и реестр spy без прототипа; `readSpyInvocationCount` читает только own-свойства; `Number.isSafeInteger` для счётчика.
- `assertPracticeIdentifier` перед compile для `functionName` / `className`.
- Спека на global и identifier. Патч DeepSeek (Date, queueMicrotask, dispose, __vibetestReset) не применялся — по вердикту плана.

## Изменённые файлы

- `vibetest-app/src/app/execution/javascript-practice-global.ts`
- `vibetest-app/src/app/execution/javascript-practice-global.spec.ts` (новый)
- `vibetest-app/src/app/execution/javascript-practice-identifier.ts` (новый)
- `vibetest-app/src/app/execution/javascript-practice-identifier.spec.ts` (новый)
- `vibetest-app/src/app/execution/javascript-practice-compile.ts`

## Тесты

- `ng test --watch=false`: 82 files, 341 tests — зелёный (после правок по ревью)

## Отклонения от TASK.md

- Нет

## Открытые вопросы к ревью

- Импорт курса по-прежнему не проверяет идентификатор regex-ом (только compile/worker); при желании — superRefine в `javascript-content-target.ts`.

## Изменения по ревью

Ревью (2026-09-25): ветка `feature/vt-54-js-practice-global-hardening`, коммитов относительно `main` нет — смотрел WIP (global, compile, identifier + specs).

1. **Строгий режим компиляции шире списка reserved** → `javascript-practice-identifier.ts` (`RESERVED_IDENTIFIERS`) → цель: понятная ошибка до `new Function` (`"use strict"`). Сейчас проходят `static`, `implements`, `interface`, `package`, `private`, `protected`, `public`: `new Function` бросает `SyntaxError: Unexpected strict mode reserved word`, не `Invalid … is a reserved word`. `eval` и `arguments` тоже проходят: объявление в user/reference — `Unexpected eval or arguments in strict mode`; `functionName: "eval"` без такого объявления компилируется, и `return eval` отдаёт встроенный `eval` (`typeof eval === "function"`). Ожидание: отклонять эти имена в `assertPracticeIdentifier` так же, как `class` / `let`, и покрыть хотя бы `static` и `eval`.
2. **Тест «игнор `__vibetestGetCount` на прототипе» не читает это свойство** → `javascript-practice-global.spec.ts` → spy `"missing"` отсекается на `getOwnPropertyDescriptor` реестра, до `__vibetestGetCount`. Тот же `expect` зелёный и при старом `Reflect.get(wrapped, '__vibetestGetCount')`. Ожидание: own-функция в реестре без собственного `__vibetestGetCount`, `Object.prototype.__vibetestGetCount = () => 999`, результат `undefined`.
3. **Ветка `className` в compile без теста** → `javascript-practice-identifier.spec.ts` (gate только `kind: 'function'`). Ожидание: `compileJavascriptPracticeCallable` с `kind: 'construct'` и невалидным `className` бросает `/Invalid className/` до `new Function`.

**Исправлено (2026-09-25):** (1) в `RESERVED_IDENTIFIERS` добавлены strict-mode слова и `eval` / `arguments`, тесты на `static` и `eval`; (2) тест pollution — own `fakeSpy` в реестре без `__vibetestGetCount`; (3) тест compile gate для `kind: 'construct'`.

Ревью (2026-09-25, раунд 2): повторная проверка WIP (`main..HEAD` пусто). Пункты 1–3 закрыты. Новых замечаний нет.

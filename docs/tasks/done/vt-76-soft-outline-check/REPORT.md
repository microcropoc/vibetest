---
branch: feature/vt-76-soft-outline-check
---

# Отчёт vt-76 — Мягкая проверка плана и усиленный промт

## Что сделано

- **Мягкая проверка:** `parseCourseOutlineText` проверяет только JSON и схему плана. `validateCourseOutlineSemantics` переименована в `findOutlineStepTypeGaps` (тексты прежние) и даёт предупреждения. `StagedCourseGenerator` не менялся: план с пробелами принимается с первой попытки.
- **Предупреждения в UI:** `generation-stages` — `computed` из `outline`, блок «Предупреждения плана» под планом; «Генерация промта» — список предупреждений рядом с «План принят», промты модулей доступны. Цвет `--color-warning`.
- **Промт плана** (`buildOutlineMessages`): в system — `OUTLINE_MODULE_EXAMPLE` (структура модуля: theory, svg, theory, quiz); в user — `OUTLINE_SELF_CHECK` после описания, до retry-заметки и финального напоминания. Промт общий для LM Studio и ручного режима.
- Промты этапов 2–3 и одношаговый промт не менялись.
- `docs/SPECIFICATION.md`: «Генерация курса» (этап 1, повторы), «Генерация промта».

## Изменённые файлы

- `vibetest-app/src/app/course-generation/parse-course-outline.ts` (+ spec)
- `vibetest-app/src/app/course-generation/staged-course-generator.service.spec.ts`
- `vibetest-app/src/app/course-generation/ui/generation-stages/*`
- `vibetest-app/src/app/prompt-generation/build-staged-generation-messages.ts` (+ spec)
- `vibetest-app/src/app/prompt-generation/parse-outline-response.ts` (+ spec)
- `vibetest-app/src/app/prompt-generation/pages/prompt-generation-page/*`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: 574 passed (107 files)
- `ng build`: успешно (предупреждение о бюджете initial bundle — существовало до задачи)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Курс по плану с пробелами может получиться без svg/quiz в части модулей — осознанно (выбор «ослабить проверку»); автодополнение плана вне рамок.

## Изменения по ревью

### Ревью (2026-10-02, раунд 1)

Скоуп: ветка без коммитов относительно `main`, ревью по незакоммиченным изменениям. `ng test --watch=false` — зелёный (107 файлов, 574 теста). Требования TASK выполнены: план проверяется только JSON и схемой, пробелы в типах шагов — предупреждения через `computed` на обеих страницах, промты этапов 2–3 и одношаговый промт не изменены. Открытый вопрос (курс без svg/quiz в части модулей) принят как осознанное решение задачи.

**Мелкие**

1. **Самопроверка противоречит ориентиру по размеру** → `build-staged-generation-messages.ts`, `OUTLINE_SELF_CHECK`: «шагов не меньше 4» звучит безусловно, а в system сказано «4–10 шагов в модуле, если автор не просит иначе». Если автор попросил короткие модули, модель получает два противоречащих указания, причём самопроверка стоит ближе к концу и перевешивает. Цель задачи — помочь модели с theory/svg/quiz, а не навязать минимум шагов. Ожидание: убрать «шагов не меньше 4» из самопроверки или добавить ту же оговорку («…если автор не просит иначе»).
2. **Устаревшее имя константы** → `parse-course-outline.ts`: `REQUIRED_STEP_TYPES` после ослабления проверки уже не «required». Ожидание: переименовать (например, `EXPECTED_STEP_TYPES`). Не блокирует.

### Исправления (раунд 1)

1. `OUTLINE_SELF_CHECK` — только про типы: «Перед ответом проверь каждый модуль: в steps есть type theory, svg и quiz.»; минимум шагов остаётся ориентиром в system («если автор не просит иначе»). Тест: в user нет «шагов не меньше».
2. `REQUIRED_STEP_TYPES` → `EXPECTED_STEP_TYPES`.

`ng test --watch=false` — 574 passed (107 файлов).

### Ревью (2026-10-02, раунд 2)

Проверены исправления раунда 1, пункты 1–2 закрыты корректно:
1. `OUTLINE_SELF_CHECK` — только про типы шагов, тест подтверждает отсутствие «шагов не меньше».
2. Константа переименована в `EXPECTED_STEP_TYPES`.

`ng test --watch=false` — зелёный (107 файлов, 574 теста).

Замечаний нет.

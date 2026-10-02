---
branch: feature/vt-74-staged-course-generation
---

# Отчёт vt-74 — Поэтапная генерация курса через LM Studio

## Что сделано

- **План курса:** новая JSON Schema `docs/schemas/course-outline.schema.json` (модули и шаги: `type`, `title`, `summary`). Генератор `generate:zod` копирует её в `public/schemas/` и генерирует `course-generation/generated/course-outline.zod.ts`; для этого добавлено разворачивание локальных `$ref` (json-schema-to-zod оставлял их `unknown`). `parseCourseOutlineText` проверяет JSON, схему и наличие `theory`/`svg`/`quiz` в каждом модуле; ошибки — `ImportIssue[]`.
- **Промты этапов** (`prompt-generation/build-staged-generation-messages.ts`): `buildOutlineMessages`, `buildFirstModuleCourseMessages` (ровно первый модуль плана), `buildModuleMessages` («модуль k из N: «название»» + весь план + шаги модуля), `retryNote` (до 10 проблем, перед финальным напоминанием). Общие блоки (`outputFormatInstruction`, `jsonSyntaxInstruction`, `selfCheckInstruction`, `finalUserReminder`) вынесены из `build-course-generation-prompt.ts`; текст «Генерации промта» проверен байт в байт до и после рефакторинга.
- **Retry** (`run-with-retry.ts`): до 3 попыток; `invalid` (нет JSON, обрезанный/пустой ответ, схема, семантика, не один модуль на этапе 2) повторяется с проблемами прошлой попытки; `fatal` (HTTP/сеть, отмена, курс удалён) — без повтора. В `ChatCompletionFailure` добавлено поле `retryReason` (`truncated` для `finish_reason: length`, `empty` для пустого ответа); модели в повторе уходит своя формулировка.
- **Оркестратор** `StagedCourseGenerator`: этап 1 → план; этап 2 → `importCourseWithNewIds` (курс сохраняется); этап 3 → `importModule` для модулей 2…N. Состояние `{ outline, courseId, nextModuleIndex }` позволяет продолжить с упавшего этапа. Для structured output каждому этапу передаётся своя схема.
- **Страница:** dumb-компонент `ui/generation-stages` (этапы со статусами и попыткой, план курса); чистая функция `buildGenerationStageViews`. Кнопки «Продолжить» / «Начать заново» после ошибки, ссылка «Открыть курс» после этапа 2, ответ модели и проблемы последней попытки. Загрузка трёх схем; оценка токенов по самому большому промту этапа. Удалена одношаговая `buildCourseGenerationMessages`.
- `zodIssues` экспортирован из `courses/import-parse.ts` и переиспользован для плана.
- Обновлён `docs/SPECIFICATION.md`: схема плана, этапы, retry, продолжение.

## Изменённые файлы

- `docs/schemas/course-outline.schema.json` (новый), `vibetest-app/public/schemas/course-outline.schema.json` (сгенерирован)
- `docs/SPECIFICATION.md`
- `vibetest-app/tools/generate-course-schema.mts`
- `vibetest-app/src/app/course-generation/generated/course-outline.zod.ts` (сгенерирован)
- `vibetest-app/src/app/course-generation/`: `course-outline.model.ts`, `parse-course-outline.ts`, `run-with-retry.ts`, `staged-course-generator.service.ts`, `generation-stage-view.ts` (новые, + spec), `__fixtures__/outline-fixtures.ts`, `estimate-prompt-tokens.ts`, `openai-chat-completions.ts` (+ spec)
- `vibetest-app/src/app/course-generation/ui/generation-stages/*` (новый компонент, `ng g c`)
- `vibetest-app/src/app/course-generation/pages/course-generation-page/*`
- `vibetest-app/src/app/prompt-generation/build-course-generation-prompt.ts` (+ spec), `build-staged-generation-messages.ts` (новый, + spec)
- `vibetest-app/src/app/info/bundled-course-schema.ts`
- `vibetest-app/src/app/courses/import-parse.ts`

## Тесты

- `ng test --watch=false`: 555 passed (106 files)
- `ng build`: успешно (предупреждение о бюджете initial bundle — существовало до задачи)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Проверка на этапе 2 и 3 не сверяет названия модуля и шагов с планом — только формат и семантику импорта. Модель может отойти от плана; сочтено допустимым.

## Изменения по ревью

### Ревью (2026-10-02, раунд 1)

Скоуп: ветка без коммитов относительно `main`, ревью по незакоммиченным изменениям (включая неотслеживаемые `docs/schemas/course-outline.schema.json` и `course-generation/generated/`). `ng test --watch=false` — зелёный (106 файлов, 553 теста). `public/schemas/course-outline.schema.json` совпадает с `docs/schemas/` (отличие только в окончаниях строк).

**Средние**

1. **Правка описания во время генерации ломает состояние** → `course-generation-page.html`: textarea «Описание курса» не блокируется при `generating()`, а `onDescriptionInput` вызывает `resetGeneration()`. Запущенный `generator.run` продолжает работу со старым описанием и через `onStateChange`, а в конце через `generationState.set(result.state)` перезаписывает сброс. В итоге в поле новое описание, а на странице прогресс, план и курс по старому; после ошибки «Продолжить» генерирует этап 2 с **новым** описанием поверх **старого** плана. Ожидание: блокировать описание (и выбор профиля) на время генерации либо отменять текущий запуск при изменении описания; тест на это.
2. **Лимиты схемы плана не согласованы с course-import** → `docs/schemas/course-outline.schema.json`: `title` до **200** символов, а в course-import до **120**; `description` без `minLength`, а в course-import `minLength: 1`. Промт этапа 2 требует «title и description курса — из плана». Если план прошёл с длинным title или пустым description, этап 2 противоречит сам себе: копия из плана не проходит импорт. Модель либо нарушает инструкцию, либо три попытки уходят впустую. Ожидание: выровнять ограничения (`title` max 120, `description` min 1), тест на отклонение такого плана.

**Мелкие**

3. **SPEC обещает продолжение после ухода со страницы** → `docs/SPECIFICATION.md`, раздел «Генерация курса»: «уход со страницы отменяют текущий запрос (сохранённое остаётся, можно продолжить)». Состояние `{ outline, courseId, nextModuleIndex }` живёт только в сигналах страницы. После ухода и возврата продолжить нельзя, остаётся лишь частичный курс. Ожидание: уточнить формулировку («продолжить можно, пока страница открыта»), либо, если это нужно, хранить состояние (отдельная задача).
4. **Подсказка про обрезание уходит модели в retry-заметке** → `staged-course-generator.service.ts`, `requestText`: при `retryable`-ошибке текст `completion.message` («Ответ модели обрезан… Уменьшите курс или увеличьте лимит токенов») становится issue и попадает в `retryNote`. Это совет пользователю, а не модели; повтор с тем же лимитом токенов почти всегда снова обрежется. Ожидание: для обрезания передавать модели отдельную формулировку (например, «ответ не поместился — пиши компактнее, короче теорию») и/или отметить в REPORT, что повтор обрезания осознанно оставлен по SPEC.
5. **Нет ограничения размера плана для небольших моделей** → схема плана допускает до 100 модулей и 200 шагов в модуле, промт этапа 1 не задаёт ориентира. Каждый модуль — отдельный запрос, а модуль на 30+ шагов не поместится в ответ слабой модели. Ожидание: ориентир в промте (например, 3–8 модулей, 4–10 шагов) или более жёсткие `maxItems` в схеме плана. Не блокирует.

### Исправления (раунд 1)

1. Описание и выбор профиля обёрнуты в `<fieldset class="course-generation-page__form" [disabled]="generating()">`; `onDescriptionInput` дополнительно игнорирует ввод во время генерации. Тест: во время генерации форма заблокирована, попытка ввода не сбрасывает план, после завершения форма снова доступна.
2. `course-outline.schema.json`: `title` max 120, `description` min 1 — как в course-import; Zod перегенерирован. Тест: длинный title и пустой description отклоняются.
3. SPEC: продолжить можно, пока страница открыта; после ухода остаётся только частичный курс. Хранение состояния — вне рамок задачи.
4. `ChatCompletionFailure.retryable` заменён на `retryReason: 'truncated' | 'empty'`. В retry-заметку модели уходит своя формулировка («Ответ не поместился… Пиши компактнее…», «Ответ пустой. Выведи JSON.»), совет пользователю про лимит токенов модели не передаётся. Тест в оркестраторе.
5. В промт этапа 1 добавлен ориентир: 3–8 модулей и 4–10 шагов в модуле, если автор не просит иначе. `maxItems` схемы оставлены как у импорта. Тест промта; SPEC обновлён.

`ng test --watch=false` — 555 passed (106 файлов); `ng build` — успешно.

### Ревью (2026-10-02, раунд 2)

Проверены исправления раунда 1, пункты 1–5 закрыты корректно:
1. Описание и профиль в `fieldset [disabled]="generating()"`, плюс guard в `onDescriptionInput`.
2. В схеме плана `title` max 120 и `description` min 1 — в `docs/schemas`, `public/schemas` и в перегенерированном Zod.
3. SPEC: продолжение только пока страница открыта.
4. `retryReason` с отдельными формулировками для модели; совет про лимит токенов в retry-заметку не попадает.
5. Ориентир 3–8 модулей и 4–10 шагов в промте этапа 1 и в SPEC.

`ng test --watch=false` — зелёный (106 файлов, 555 тестов).

Замечаний нет.

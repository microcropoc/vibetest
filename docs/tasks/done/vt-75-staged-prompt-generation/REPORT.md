---
branch: feature/vt-75-staged-prompt-generation
---

# Отчёт vt-75 — Поэтапные промты на странице «Генерация промта»

## Что сделано

- **Режимы страницы:** переключатель «Одним промтом» (прежнее поведение, по умолчанию) / «Поэтапно»; описание курса общее. Три схемы (course-import, module-import, course-outline) грузятся независимо: сбой схем этапов отключает только «Поэтапно».
- **Поэтапно:**
  1. «Копировать промт плана» — `buildOutlineMessages` (неактивна при пустом описании).
  2. Поле «Ответ LLM с планом» — `computed` над `parseOutlineResponse`: `prepareLlmImportText` (сырой JSON или блок ```json) + `parseCourseOutlineText` (схема и семантика). Показываются проблемы или план (`formatOutlineForPrompt`) с числом модулей.
  3. При валидном плане — промт на каждый модуль: «Курс и модуль 1» (`buildFirstModuleCourseMessages`) и «Модуль k из N» (`buildModuleMessages`), с подсказкой, как импортировать ответ; статус копирования у каждой кнопки свой.
- `joinStagedMessages` — промт этапа одним текстом: system, затем user (финальное напоминание в конце).
- Промты этапов те же, что в LM Studio-генерации, без structured output.
- **Инфо:** третий блок `course-outline.schema.json` с копированием; общее сообщение об ошибке загрузки — «Не удалось загрузить схемы.».
- `docs/SPECIFICATION.md`: разделы «Генерация промта», «Инфо», дерево папок.

## Изменённые файлы

- `vibetest-app/src/app/prompt-generation/build-staged-generation-messages.ts` (+ spec)
- `vibetest-app/src/app/course-generation/prepare-llm-import-text.ts` (+ spec) — параметр `contextHint`
- `vibetest-app/src/app/prompt-generation/parse-outline-response.ts` (новый, + spec)
- `vibetest-app/src/app/prompt-generation/pages/prompt-generation-page/*`
- `vibetest-app/src/app/info/pages/info-page/*`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: 567 passed (107 files)
- `ng build`: успешно (предупреждение о бюджете initial bundle — существовало до задачи)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

### Ревью (2026-10-02, раунд 1)

Скоуп: ветка без коммитов относительно `main`, ревью по незакоммиченным изменениям. `ng test --watch=false` — зелёный (107 файлов, 564 теста). Требования TASK выполнены; промты этапов переиспользуют `build-staged-generation-messages.ts` без дублирования.

**Мелкие**

1. **Подсказка про LM Studio на странице внешнего LLM** (решение по открытому вопросу) → `parse-outline-response.ts` показывает сообщение `prepareLlmImportText` как есть, и пользователь внешнего чата видит «Увеличьте Context Length в LM Studio». Для этой страницы совет неверен. Ожидание: не показывать LM Studio-подсказку на «Генерации промта», например вынести хвост из сообщения (`prepareLlmImportText` даёт базовый текст, LM Studio-страница дописывает `LLM_CONTEXT_LENGTH_HINT`) или передавать подсказку параметром. Тест: ответ без JSON на странице промта не содержит «LM Studio».
2. **Тест не проверяет, какая схема уходит в какой этап** → `prompt-generation-page.spec.ts`: `fetchMock` отдаёт один `SCHEMA_TEXT` на все три URL, поэтому перепутанные `courseImport`/`moduleImport`/`courseOutline` в `onCopyOutlinePrompt`/`onCopyModulePrompt` тест не поймает. Ожидание: в моке разные схемы по URL (как в `info-page.spec.ts`), в ожиданиях — соответствующие тексты.
3. **Режим «Одним промтом» теперь зависит от трёх схем** → `loadSchemas` грузит все три через `Promise.all`; при сбое загрузки outline- или module-схемы недоступен и прежний одношаговый промт, которому нужна только course-import. Риск низкий (схемы bundled и кэшируются SW). Ожидание: оставить как есть с пометкой в REPORT или грузить схемы независимо. Не блокирует.

### Исправления (раунд 1)

1. `prepareLlmImportText(rawContent, contextHint = LLM_CONTEXT_LENGTH_HINT)`: подсказка дописывается к ошибкам «нет JSON» / «блок не закрыт», `null` — без неё. LM Studio-генерация не меняется; `parseOutlineResponse` передаёт `null`. Тесты: `prepare-llm-import-text.spec.ts` (сообщения без подсказки), `parse-outline-response.spec.ts` и страница (ответ без JSON не содержит «LM Studio»).
2. В `prompt-generation-page.spec.ts` мок `fetch` отдаёт свою схему по URL; ожидания сверяют, что в промт плана уходит course-outline, в «Курс и модуль 1» — course-import, в «Модуль k из N» — module-import.
3. Схемы грузятся независимо (`Promise.allSettled`): без course-import — ошибка страницы (прежний текст «Не удалось загрузить course-import.schema.json.»); без module-import или course-outline — сообщение только в режиме «Поэтапно», одношаговый промт работает. Тест на сбой course-outline. SPEC дополнен.

`ng test --watch=false` — 567 passed (107 файлов); `ng build` — успешно.

### Ревью (2026-10-02, раунд 2)

Проверены исправления раунда 1, пункты 1–3 закрыты корректно:
1. `prepareLlmImportText(..., contextHint)` со значением по умолчанию для LM Studio; `parseOutlineResponse` передаёт `null`.
2. Мок `fetch` отдаёт разные схемы по URL, и тест сверяет схему каждого этапа.
3. Схемы грузятся через `Promise.allSettled`: без course-import — ошибка страницы, без module-import или course-outline — сообщение только в режиме «Поэтапно», одношаговый промт работает.

`ng test --watch=false` — зелёный (107 файлов, 567 тестов).

Замечаний нет.

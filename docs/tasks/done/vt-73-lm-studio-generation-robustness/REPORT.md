---
branch: feature/vt-73-lm-studio-generation-robustness
---

# Отчёт vt-73 — Надёжная генерация курса через LM Studio

## Что сделано

- Промт для API разбит на **system** (правила + JSON Schema) и **user** (описание + финальное напоминание «только JSON»); вкладка «Генерация промта» по-прежнему использует `buildCourseGenerationPrompt` без изменения текста.
- `buildChatCompletionsBody` / `LmStudioClient.complete` принимают массив `messages`; опционально `response_format: json_schema` при `profile.structuredOutput`.
- Улучшено извлечение JSON: сырой объект, закрытый ` ```json `, plain ` ``` ` с `{`; отдельные ошибки для незакрытого блока и ответа без JSON с подсказкой про **Context Length** в LM Studio.
- В ответе API разбирается `usage.prompt_tokens`; на странице — оценка `estimatePromptTokens` до генерации и факт после ответа.
- В профиле LLM поле `structuredOutput` (default `false`), чекбокс в настройках, метка `json_schema` в списке профилей; HTTP-ошибки structured output дополняются советом выключить флаг.
- Обновлён раздел «Генерация курса» и таблица `llmProfiles` в `docs/SPECIFICATION.md`.

## Изменённые файлы

- `docs/SPECIFICATION.md`
- `vibetest-app/src/app/prompt-generation/build-course-generation-prompt.ts` (+ spec)
- `vibetest-app/src/app/course-generation/openai-chat-completions.ts` (+ spec)
- `vibetest-app/src/app/course-generation/lm-studio-client.service.ts`
- `vibetest-app/src/app/course-generation/extract-first-json-fence.ts` (+ spec)
- `vibetest-app/src/app/course-generation/prepare-llm-import-text.ts` (+ spec)
- `vibetest-app/src/app/course-generation/estimate-prompt-tokens.ts` (новый)
- `vibetest-app/src/app/course-generation/llm-import-context-hint.ts` (новый)
- `vibetest-app/src/app/course-generation/pages/course-generation-page/*`
- `vibetest-app/src/app/settings/llm-profile.model.ts`, `parse-llm-profiles.ts`, `llm-profile-fields-value.ts`, `upsert-llm-profile.spec.ts`, `settings-repository.spec.ts`, `storage/settings-row-parse.ts`
- `vibetest-app/src/app/settings/ui/llm-profile-fields/*`, `llm-profiles-editor/*`

## Тесты

- `ng test --watch=false`: 526 passed (100 files)
- `ng build`: успешно

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

### Ревью (2026-09-29, раунд 1)

Скоуп: ветка без коммитов относительно `main`, ревью по незакоммиченным изменениям. `ng test --watch=false` — зелёный (100 файлов, 523 теста). Текст вкладки «Генерация промта» не изменился: блоки склеиваются через `\n\n`, как было.

**Существенные**

1. **Валидный сырой JSON отклоняется как «незакрытый ```json»** → `prepare-llm-import-text.ts`: `hasUnclosedJsonFence` вызывается **до** попытки `unwrapJsonImportText(trimmed)`. Если модель вернула сырой JSON (именно так отвечает режим Structured output), а в theory/quiz/description есть пример с ` ```json ` (курс про JSON, API, конфиги), то внутри JSON-строки перевод строки экранирован (`\n`), и регэксп закрывающего fence на отдельной строке не находит → ошибка «Блок ```json не закрыт — ответ обрезан», хотя курс корректный. Воспроизведено: `JSON.stringify({…, content: '## X\n\n```json\n{"a":1}\n```'}, null, 2)` проходит `JSON.parse`, а `hasUnclosedJsonFence` возвращает `true`. Ожидание: сначала пробовать сырой JSON и закрытый fence, проверку незакрытого блока делать только в ветке «ничего не извлеклось»; добавить тест на этот случай.

**Средние**

2. **Регрессия: `as` вместо типобезопасного поиска** → `parse-llm-profiles.ts`, `findLlmProfileDraftIssue`: `path0 as (typeof DRAFT_FIELDS)[number]` и `path0 as keyof LlmProfileDraft`. В vt-72 было `DRAFT_FIELDS.find((name) => name === issue.path[0]) ?? 'label'`, без приведений. Правило запрещает доменные `as T`. Ожидание: вернуть `find`.
3. **Противоречие инструкций при Structured output** → system-промт (`INSTRUCTION_OUTPUT_FORMAT`, `INSTRUCTION_SELF_CHECK`) требует «первая строка ответа: ```json», а `response_format: json_schema` заставляет модель выдавать сырой JSON. При constrained decoding модель не может выполнить инструкцию; слабые модели на этом конфликте тратят контекст или ломаются, хотя именно ради них задача и делалась. Ожидание: при `structuredOutput` отдавать вариант system-блока «формат вывода» без fence (или нейтральную формулировку «JSON-объект; допускается блок ```json»). Альтернатива — осознанное решение с записью в REPORT.

**Мелкие**

4. **Type guard после `.default(false)` врёт** → `isLlmProfiles(value): value is readonly LlmProfile[]` для legacy-строки без `structuredOutput` возвращает `true`, но сырое значение поля не содержит. Сейчас это безвредно: `llmProfilesFromSettingsRow` затем вызывает `parseLlmProfiles`, и default применяется. Но сужение типа некорректно. Ожидание: в `llmProfilesFromSettingsRow` использовать `safeParse(...).data` вместо пары `isLlmProfiles` + `parseLlmProfiles`, либо guard по входному типу схемы.
5. **`strict: true` в `response_format`** → `openai-chat-completions.ts`: для OpenAI-совместимых серверов, которые реально применяют strict, bundled-схема (без `additionalProperties: false` и `required` на всех уровнях, с `$defs`/`oneOf`) будет отклонена. Для LM Studio флаг, вероятно, игнорируется, а подсказка «выключите Structured output» частично это покрывает. Ожидание: `strict: false` или комментарий-ограничение, почему `true`.
6. **Hygiene** → `shared/build-info/generated-build-info.ts` (коммит vt-72 вместо vt-36) и `courses/bundled/generated-bundled-courses.ts` (только CRLF/LF) изменены сборкой, в коммит задачи не включать. То же про 20 `docs/courses/javascript-for-csharp/*.module.json` (только окончания строк).

### Исправления (раунд 1)

1. `prepareLlmImportText`: сначала сырой JSON, закрытый ` ```json `, plain ` ``` `; `hasUnclosedJsonFence` проверяется только если ничего не извлеклось. Тест: сырой JSON с ` ```json ` внутри строкового поля импортируется.
2. `findLlmProfileDraftIssue`: вернул `DRAFT_FIELDS.find((name) => name === issue.path[0]) ?? 'label'`, без `as`.
3. `buildCourseGenerationMessages(..., { structuredOutput })`: при Structured output блоки «Формат вывода», запрет текста вне ответа и самопроверка просят сырой JSON-объект без fence; финальное напоминание — `FINAL_USER_REMINDER_STRUCTURED`. Страница собирает сообщения с флагом профиля (и только если схема загружена). Текст «Генерация промта» не изменился. Тесты: промт и страница.
4. `isLlmProfiles` заменён на `tryParseLlmProfiles(value): readonly LlmProfile[] | undefined` (`safeParse().data`, default применён); `llmProfilesFromSettingsRow` использует его. Тест репозитория: legacy-строка без `structuredOutput` читается как `false`.
5. `response_format.json_schema.strict: false` с комментарием-ограничением; SPEC обновлён.
6. Сгенерированные сборкой файлы откачены (`git checkout`); `docs/courses/javascript-for-csharp/*.module.json` в коммит задачи не включать.

`ng test --watch=false` — 526 passed (100 файлов); `ng build` — успешно (предупреждение о бюджете initial bundle, не связано с задачей).

### Ревью (2026-09-29, раунд 2)

Проверены исправления раунда 1, пункты 1–6 закрыты корректно:
1. Проверка незакрытого fence идёт после всех попыток извлечения.
2. `find` без `as`.
3. Отдельные structured-варианты блоков формата, синтаксиса и самопроверки плюс напоминание; флаг берётся из фактической отправки схемы; текст «Генерация промта» прежний, через `instructions(false)`.
4. `tryParseLlmProfiles` на `safeParse().data`; ссылок на `isLlmProfiles` не осталось.
5. `strict: false` с комментарием.
6. Сгенерированные файлы откачены.

`ng test --watch=false` — зелёный (100 файлов, 526 тестов).

Замечаний нет.

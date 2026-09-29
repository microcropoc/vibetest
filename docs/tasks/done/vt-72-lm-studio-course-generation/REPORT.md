---
branch: feature/vt-72-lm-studio-course-generation
---

# Отчёт vt-72 — Генерация курса через LM Studio

## Что сделано

- Профили LLM в `settings` (`llmProfiles`): модель, parse, `SettingsRepository.get/setLlmProfiles`
- Секция «Генерация курса (LLM)» в Настройках: список, добавление, правка, удаление; маскирование ключа
- Вкладка «Генерация курса»: описание, выбор/новый профиль, вызов OpenAI-compatible chat completions, импорт при успехе, отмена запроса
- Клиент LM Studio, разбор ответа, извлечение JSON из fenced-блока
- Обновлён `docs/SPECIFICATION.md`

## Изменённые файлы

- `vibetest-app/src/app/course-generation/**`
- `vibetest-app/src/app/settings/**` (профили, UI)
- `vibetest-app/src/app/storage/settings-repository.ts`, `settings-row-parse.ts`, `settings-llm-profiles-key.ts`
- `vibetest-app/src/app/courses/course-import.service.ts` (+ spec): `importCourseWithNewIds`
- `vibetest-app/src/app/app.routes.ts`, `shared/ui/app-shell/app-shell.ts`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: зелёный (100 файлов, 510 тестов)
- `ng build`: проходит; предупреждение о бюджете initial 500 KB было и на `main` (674.62 KB против 677 KB в vt-68)

## Отклонения от TASK.md

- Нет

## Открытые вопросы к ревью

- Запрос к LM Studio идёт из браузера; на HTTPS-деплое возможны ограничения mixed content к `http://localhost`

## Изменения по ревью

### Ревью (2026-09-29, раунд 1)

Скоуп: ветка без коммитов относительно `main`, ревью по незакоммиченным изменениям. `ng test --watch=false` — зелёный (96 файлов, 476 тестов).

**Существенные**

1. **Дубли профилей при повторной генерации** → `course-generation-page.ts`, `resolveProfileForRequest` (режим `new` + «Сохранить профиль») → каждый клик «Сгенерировать» вызывает `profileFromFields(fields)` с новым UUID и дописывает ещё один профиль; после сохранения режим остаётся `new`, поэтому повтор после ошибки API или валидации плодит копии. Ожидание: после сохранения переключаться на `saved` с выбранным id или переиспользовать id уже сохранённого черновика; добавить тест.
2. **Необработанные исключения в async-обработчиках** → `profileFromFields` (`upsert-llm-profile.ts`) бросает `ZodError`, если превышены `max(120/500/200)`, а `isLlmProfileFieldsValid` длину не проверяет; `settings.setLlmProfiles` тоже может упасть. Места: `LlmProfilesEditorComponent.onSave` / `onDelete`, `CourseGenerationPage.resolveProfileForRequest` (вызывается вне `try`). Итог — unhandled rejection без сообщения пользователю. Ожидание: валидировать длины в `isLlmProfileFieldsValid` (или через `safeParse`) и перехватывать ошибки сохранения со статусом или ошибкой в UI.
3. **`as T` вместо parse на границе HTTP** → `openai-chat-completions.ts`, разбор `error.message` при `!response.ok` (цепочка `body as { error: … }`) → противоречит правилу «`unknown` → `parseX`/Zod, без доменных `as`». Ожидание: маленькая Zod-схема `{ error: { message: string } }` + `safeParse`.

**Средние**

4. **Отмена во время чтения тела** → `postChatCompletion`: `AbortError` из `response.json()` попадает в catch «Ответ API не JSON (HTTP 200)», а не «Запрос отменён.». Ожидание: одинаково обрабатывать abort на обоих `await`.
5. **Запрос не отменяется при уходе со страницы** → `CourseGenerationPage` не вызывает `abort()` при destroy; ответ, пришедший позже, всё равно импортирует курс в фоне. Ожидание: `DestroyRef.onDestroy(() => abortController?.abort())` или осознанное решение, отражённое в REPORT и SPEC.
6. **Мёртвая ветка `replace-required`** → `course-generation-page.ts` ~170–177: при `regenerateIds: true` `CourseImportService` этот исход не возвращает, а текст «Включите новые id при импорте» относится к странице импорта. Ожидание: удалить ветку (сузить тип `importStage`).
7. **Пробелы в тестах по требованиям TASK** → нет спеков для `maskApiKey` (требование «ключ в списке маскирован»), `prepareLlmImportText`, `upsertLlmProfile`/`removeLlmProfile`, для путей ошибок `postChatCompletion` (HTTP-ошибка с `error.message`, не-JSON, abort, сетевая ошибка), для отмены и сохранения нового профиля на странице, для правки и удаления в `LlmProfilesEditorComponent`. Ожидание: покрыть поведение, особенно п. 1, 2, 4.

**Мелкие**

8. **Smart-компонент в `settings/ui/`** → `LlmProfilesEditorComponent` сам инжектит `SettingsRepository` и грузит данные; из-за этого в `settings-page.spec.ts` понадобился polling-хелпер `whenSettingsPageReady`. Ожидание: либо поднять загрузку и сохранение в `SettingsPage` (editor — dumb через `input`/`output`), либо зафиксировать в REPORT, почему секция самодостаточна. Аналогично `course-generation` импортирует `settings/ui/llm-profile-fields` — допустимо, но стоит отметить.
9. **Лишний `computed`** → `savedProfileOptions = computed(() => this.profiles())` дублирует `profiles`; убрать.
10. **Генерация с пустым описанием** → `onGenerate` не требует непустого `courseDescription`; ожидание — блокировать кнопку или показывать подсказку.
11. **Сообщение об ошибке профиля не сбрасывает старый результат** → при `!profileResult.ok` старые `rawModelResponse`/`importIssues` остаются на экране рядом с новой ошибкой; вызывать `clearResult()` до установки `apiError`.
12. **Hygiene** → в рабочем дереве 20 `docs/courses/javascript-for-csharp/*.module.json` помечены modified без изменения содержимого (только CRLF/LF); в коммит задачи не включать. В `TASK.md` чекбоксы плана и критериев не отмечены, хотя REPORT утверждает, что всё сделано.

### Исправлено (раунд 1)

1. После сохранения нового профиля страница переключается в режим «Сохранённый профиль» с выбранным id и очищает форму — повторная генерация не создаёт копию. Тест `saves a new profile once and reuses it on the next generation`.
2. Лимиты длины живут в одной Zod-схеме черновика (`findLlmProfileDraftIssue` в `parse-llm-profiles.ts`); `llmProfileFieldsError` превращает проблему в сообщение («Заполните поле…» / «Поле … слишком длинное.»), `isLlmProfileFieldsValid` удалён. Ошибки записи в IndexedDB перехватываются: в Настройках — «Не удалось сохранить профили.», на генерации — «Не удалось сохранить профиль.» / «Не удалось сохранить курс.»; `resolveProfileForRequest` теперь внутри `try`.
3. Тело HTTP-ошибки разбирается `ChatCompletionErrorBodySchema.safeParse`, приведения `as` удалены.
4. `AbortError` из `response.json()` даёт «Запрос отменён.», как и на `fetch`. Тесты на оба места, HTTP-ошибку с `error.message` и без, не-JSON и сетевую ошибку (ключ не попадает в сообщение).
5. `DestroyRef.onDestroy` отменяет запрос; после ответа проверяется `signal.aborted`, импорт не выполняется. Тест `aborts the request when the page is destroyed`; SPEC дополнен.
6. Добавлен `CourseImportService.importCourseWithNewIds` с типом результата без `replace-required` (`importCourse` с `regenerateIds: true` делегирует в него, общий разбор — `parseAndCheckCourse`). Страница вызывает его, ветка удалена, `importStage` сужен до `ImportValidationStage | null`.
7. Новые спеки: `mask-api-key`, `upsert-llm-profile`, `llm-profile-fields-value`, `prepare-llm-import-text`; дополнены `openai-chat-completions`, `course-generation-page` (кнопка без описания, дубли профиля, отмена, destroy), `llm-profiles-editor` (маскирование, добавление, правка с тем же id, удаление, ошибка длины), `settings-page` (сохранение через редактор попадает в IndexedDB), `course-import.service` (`importCourseWithNewIds` не конфликтует с существующим курсом).
8. `LlmProfilesEditorComponent` стал dumb: `input` `profiles` / `loading` / `statusMessage`, `output` `profileSave` / `profileDelete`; загрузку и запись делает `SettingsPage`. Polling-хелпер `whenSettingsPageReady` остался: страница по-прежнему грузит профили асинхронно, а zoneless `whenStable()` не ждёт произвольных промисов Dexie. `course-generation` импортирует dumb-компонент `settings/ui/llm-profile-fields` осознанно: общая форма нужна, чтобы Настройки и генерация не расходились.
9. `savedProfileOptions` удалён, шаблон использует `profiles()`.
10. Кнопка «Сгенерировать» неактивна при пустом описании (`canGenerate`), рядом подсказка.
11. `clearResult()` вызывается в начале `onGenerate`, до любых ошибок профиля.
12. CRLF-файлы курсов не трогались и в коммит задачи не входят; чекбоксы `TASK.md` отмечены.

### Ревью (2026-09-29, раунд 2)

Проверены исправления раунда 1: пункты 1–12 закрыты корректно. `ng test --watch=false` — зелёный (100 файлов, 508 тестов).

**Средние**

13. **Выпадающий список показывает не тот профиль, который реально используется** → `course-generation-page.html`, `<select [value]="selectedProfileId()">` с `<option>` внутри `@for`. Привязка `value` у `select` применяется до того, как отрисованы опции, поэтому браузер выделяет первую опцию, а повторно Angular значение не выставляет (сигнал не меняется). Сейчас это срабатывает случайно: по умолчанию выбран `profiles[0]`. После исправления п. 1 проявляется: если сохранённые профили уже есть и пользователь генерирует с новым профилем и отметкой «Сохранить», страница переключается в `saved`, новый профиль добавляется в конец, `selectedProfileId` = его id, а в списке выделен первый. Следующий клик «Сгенерировать» уйдёт на новый профиль, хотя UI показывает другой. Ожидание: `[selected]="profile.id === selectedProfileId()"` на `<option>` (или эквивалент) и тест «при существующих профилях после сохранения нового в select выбран он».

**Мелкие**

14. **Форма профиля закрывается до подтверждения записи** → `LlmProfilesEditorComponent.onSave` сбрасывает `editingId` сразу после `profileSave.emit`; при ошибке IndexedDB введённое пропадает (уже отмечено в «Открытых вопросах»). Приемлемо для этой задачи. Если чинить — закрывать форму, когда родитель подтверждает успех (например, по изменению `profiles` или отдельному `input`).

### Исправлено (раунд 2)

13. `select` больше не привязывает `[value]`; у каждой `<option>` — `[selected]="profile.id === selectedProfileId()"`. Тест `selects the newly saved profile when other profiles already exist`; проверено, что со старой привязкой он падает.
14. Форма закрывается, только когда отправленный профиль (совпадают все поля) появился во входе `profiles`: `pendingSave` + `computed` `formOpen`, без `effect`. При ошибке записи форма и введённые значения остаются, рядом статус родителя. После первой попытки новый профиль получает постоянный id, поэтому повторное «Сохранить» не создаёт дубль. Тесты: закрытие после подтверждения и `keeps the form and its values until the parent confirms the save`. Открытый вопрос из REPORT снят.

### Ревью (2026-09-29, раунд 3)

Проверены исправления раунда 2: п. 13 (`[selected]` на `<option>`, без `[value]` у `select`) и п. 14 (`pendingSave` + `computed` `formOpen`; сценарии удаления, повторного редактирования и повторного «Сохранить» после ошибки записи не дают ни дублей, ни повторного открытия формы) закрыты корректно. `ng test --watch=false` — зелёный (100 файлов, 510 тестов).

Замечаний нет.

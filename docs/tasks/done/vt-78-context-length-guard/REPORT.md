---
branch: feature/vt-78-context-length-guard
---

# Отчёт vt-78 — Промт не влезает в контекст модели

## Что сделано

- Страница «Генерация курса» передаёт JSON Schema этапов в промт компактно (`JSON.stringify` без отступов): course-import ≈22.2K → ≈16.6K символов, module-import ≈23.3K → ≈16.0K. «Генерация промта» и «Инфо» не менялись.
- `contextOverflowMessage` распознаёт переполнение контекста (LM Studio / llama.cpp `request (N tokens) exceeds the available context size (M tokens)`, OpenAI-подобное `maximum context length is M tokens … resulted in N tokens`, общие `context_length_exceeded` / `exceeds the available context size`) и даёт русское сообщение с числами или без них.
- `postChatCompletion`: тело ошибки принимается с `error` строкой или `{ message }`; если сообщение не распознано, переполнение ищется во всём теле ответа. Для переполнения подсказка про Structured output не добавляется.
- Профиль LLM: необязательное поле `contextLength` (`number | null`, целое 512…2 000 000, по умолчанию `null`; старые профили читаются без миграции), поле ввода «Context Length» с подсказкой, ошибка «Поле «Context Length» должно быть целым числом от 512 до 2000000.», в списке профилей «контекст N».
- Страница генерации: оценка самого большого промта считается по трём этапам (добавлен этап 3 — module-import). Если в выбранном или вводимом профиле задан Context Length и оценка + 4096 токенов на ответ больше него, показывается предупреждение; запуск не блокируется.
- SPECIFICATION.md: поле профиля, предупреждение, компактная схема, сообщение о переполнении.

## Изменённые файлы

- `vibetest-app/src/app/course-generation/context-overflow-message.ts` (+ spec) — новый
- `vibetest-app/src/app/course-generation/openai-chat-completions.ts` (+ spec)
- `vibetest-app/src/app/course-generation/pages/course-generation-page/course-generation-page.{ts,html,scss,spec.ts}`
- `vibetest-app/src/app/course-generation/staged-course-generator.service.spec.ts` — фикстура профиля
- `vibetest-app/src/app/settings/llm-profile.model.ts`
- `vibetest-app/src/app/settings/parse-llm-profiles.ts` (+ spec)
- `vibetest-app/src/app/settings/llm-profile-fields-value.ts` (+ spec)
- `vibetest-app/src/app/settings/ui/llm-profile-fields/llm-profile-fields.{ts,html}`
- `vibetest-app/src/app/settings/ui/llm-profiles-editor/llm-profiles-editor.{ts,html,spec.ts}`
- `vibetest-app/src/app/settings/upsert-llm-profile.spec.ts`, `vibetest-app/src/app/storage/settings-repository.spec.ts` — фикстуры и чтение старых профилей
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: зелёный (109 файлов, 608 тестов).
- `npm run build`: успешно (предупреждение о бюджете initial bundle было и раньше).

## Отклонения от TASK.md

- Сообщение об ошибке поля указывает обе границы («от 512 до 2000000»), а не только нижнюю, чтобы оно было верным и для слишком больших чисел.
- Стиль предупреждения — выделенный блок (`--color-bg-highlight` и полоса `--color-warning-accent`): переменной `--color-warning` в теме нет.
- В списке профилей в настройках показывается «контекст N».

## Открытые вопросы к ревью

- Запас под ответ 4096 токенов — эвристика под один модуль JSON; при необходимости можно вынести в профиль.
- Оценка токенов по-прежнему грубая (символы / 3), поэтому предупреждение ориентировочное.

## Изменения по ревью

### Ревью (2026-10-02, раунд 1)

Скоуп: ветка без коммитов относительно `main`, ревью по незакоммиченным изменениям. `ng test --watch=false` — зелёный (109 файлов, 608 тестов). Требования TASK выполнены:
- компактная схема только в `generationSchema` страницы генерации; «Генерация промта» и «Инфо» не тронуты;
- `record` для `response_format` не изменился;
- распознавание переполнения с числами и без, тело ошибки со строкой или объектом;
- `contextLength` с `.nullable().default(null)` для старых профилей;
- оценка по трём этапам;
- предупреждение не блокирует запуск.

Отклонения в REPORT обоснованы. Открытые вопросы (запас 4096 и грубая оценка) приняты: предупреждение ориентировочное и запуск не блокирует.

**Мелкие**

1. **Предупреждение по недовведённому значению Context Length** → `course-generation-page.ts`, `activeContextLength` в режиме «Новый профиль» берёт `newProfileFields().contextLength` без проверки диапазона. Пока пользователь набирает «8192», после первой цифры появляется «не помещается в Context Length профиля (8)»; то же для значений вне 512…2 000 000, которые профиль всё равно не примет. Ожидание: учитывать только допустимое значение, например при `llmProfileFieldsError(fields) === null` или по проверке диапазона; тест на ввод «8».
2. **Live-region с меняющимся числом** → `course-generation-page.html`: у предупреждения `role="status"`, а в тексте `estimatedPromptTokens()`, который пересчитывается на каждый символ описания. Скринридер будет объявлять предупреждение при каждом нажатии клавиши. Ожидание: убрать `role="status"` (как у соседнего абзаца с оценкой) или вынести число из live-region, оставив в нём статичный текст.

### Исправлено (раунд 1)

1. Добавлен `isValidLlmContextLength` в `parse-llm-profiles.ts` (та же Zod-схема поля, что и в профиле). `activeContextLength` в режиме «Новый профиль» учитывает только допустимое значение, поэтому при наборе «8», «81»… предупреждения нет. Тесты: ввод «4» без предупреждения, затем «4096» с предупреждением; `isValidLlmContextLength` на границах и нецелых значениях. `ng test --watch=false` — зелёный (109 файлов, 616 тестов).
2. У предупреждения убран `role="status"`, как у соседнего абзаца с оценкой.

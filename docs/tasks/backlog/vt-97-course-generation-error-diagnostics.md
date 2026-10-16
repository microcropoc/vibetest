# vt-97 — Диагностика ошибки генерации курса (промт и ответ модели)

## Контекст

На странице **Генерация курса** при сбое этапа (исчерпаны 3 попытки или fatal (HTTP/сеть)) пользователь видит краткое сообщение, список проблем валидации и при некоторых сценариях — сворачиваемый блок «Ответ модели (последняя попытка)». Промт, отправленный в API, не показывается; при `finish_reason: length` обрезанный текст ответа может не попасть в UI. Это затрудняет отладку модели и Context Length без внешних инструментов.

## Цель

При остановке генерации из-за ошибки на этапе пользователь видит **промт** и **ответ нейронки** именно **последней упавшей попытки** этого этапа — в сворачиваемых блоках с кнопками копирования.

## Требования

- Показывать только **последнюю** неуспешную попытку упавшего этапа (не историю всех 3 попыток).
- **Промт** — полный текст, как для ручного копирования в «Генерация промта»: `joinStagedMessages` (system + user) для данной попытки, с учётом `retryIssues` и structured output.
- **Ответ модели** — сырой текст из API (`rawResponse`), в том числе **обрезанный** при `finish_reason: length`, если сервер вернул непустой `content`.
- UI: два блока `<details>` — «Промт (последняя попытка)» и «Ответ модели (последняя попытка)»; в каждом `<pre>` и кнопка копирования через `copyTextToClipboard` (`shared/clipboard/`).
- Блоки показываются при `failure()` на странице генерации курса (exhausted и fatal с диагностикой), если соответствующий текст есть; отмена запроса (`CANCELLED`) — без промта/ответа, как сейчас.
- Обновить [docs/SPECIFICATION.md](../../SPECIFICATION.md), раздел «Генерация курса».

## Технические заметки

- `course-generation/openai-chat-completions.ts`: `ChatCompletionFailure.rawResponse?`; в `parseChatCompletionResponseBody` при `finish_reason === 'length'` сохранять непустой `message.content` в `rawResponse`.
- `course-generation/run-with-retry.ts`: `AttemptInvalid.prompt?`, `AttemptFatal.prompt?` (уже есть `rawResponse?` на invalid/fatal где нужно).
- `course-generation/staged-course-generator.service.ts`: в `requestText` собирать `prompt` через `joinStagedMessages` из `prompt-generation/build-staged-generation-messages.ts`; прокидывать `prompt` и `rawResponse` (включая из `completion` при failure) во все неуспешные исходы, кроме `CANCELLED`.
- `course-generation/pages/course-generation-page/`: расширить `GenerationFailure` полем `prompt`; шаблон и стили для `<details>` + копирование (паттерн как на «Инфо» / `service-textarea`, без обязательного нового компонента).
- Тесты: `openai-chat-completions.spec.ts` (truncated + rawResponse), генератор/страница — поведение `applyOutcome` и отображение при наличии `prompt`/`rawResponse`.
- CLI не обязателен; правки в существующих файлах.

## План работ

- [ ] `rawResponse` при обрезанном ответе API
- [ ] Поле `prompt` в attempt outcomes и прокидка из `StagedCourseGenerator.requestText`
- [ ] UI на `course-generation-page` (details + копирование)
- [ ] SPEC, unit/component tests, `ng test --watch=false`

## Критерии готовности (Definition of Done)

- [ ] Тесты на доменную логику и нетривиальные части зелёные (`ng test --watch=false` в `vibetest-app/`)
- [ ] Функциональность соответствует требованиям
- [ ] Smart/dumb-разделение соблюдено
- [ ] Код соответствует стилю проекта (strict TS, signals, control flow синтаксис)

## Вне рамок задачи

- История всех неуспешных попыток этапа (1–3).
- Аналогичная диагностика на «Генерация промта» / ручном поэтапном мастере.
- Логирование промтов на сервер или в IndexedDB.

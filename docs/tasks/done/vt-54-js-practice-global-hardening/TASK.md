# vt-54 — JS practice: global bag hardening + identifier validation

## Контекст

Внешнее ревью (DeepSeek) перечислило десятки «критичных» пунктов; сверка со SPEC показала, что большинство — ложные (Date не подменяется по контракту, клон args в `prepareArgs`, timeout через `Worker.terminate()`). Имеет смысл только точечное усиление: prototype-safe bag/spy registry и валидация `functionName` / `className` для понятных ошибок автору.

## Цель

Spy-счётчики и bag не читаются через `Object.prototype`; имена цели compile — валидные JS-идентификаторы, не зарезервированные слова.

## Требования

- `createPracticeGlobalBag` / реестр spy — без прототипа (`Object.create(null)`).
- `readSpyInvocationCount` — только own-свойства реестра и wrapped.
- `compileJavascriptPracticeCallable` — отклонять невалидные `functionName` / `className` до `new Function`.
- Не подменять Date, queueMicrotask, не добавлять dispose/heap/__vibetestReset.

## Технические заметки

- `execution/javascript-practice-global.ts`, `execution/javascript-practice-compile.ts`
- Новый pure helper для идентификатора рядом с compile или в `execution/`

## Критерии готовности

- [ ] Colocated spec на global + compile validation
- [ ] `ng test --watch=false` зелёный

## Вне рамок задачи

- Патч по полному списку DeepSeek; изменения fake-timers/worker протокола.

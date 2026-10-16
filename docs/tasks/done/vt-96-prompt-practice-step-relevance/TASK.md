# vt-96 — Уместность практических шагов (JS, SQL, Regex) в промтах генерации курса

## Контекст

При генерации курса или плана курса через промт (одиночный промт, поэтапная ручная генерация и генерация через LM Studio) языковая модель часто вставляет практические шаги `javascript`, `sqlite` и `regex` в курсы, тема которых к ним не относится (например, гуманитарные дисциплины, сети, верстка без JS, другие языки программирования).

Причины в текущих промтах (`prompt-generation/build-course-generation-prompt.ts` и `prompt-generation/build-staged-generation-messages.ts`):
- в одиночном промте `buildCourseGenerationPrompt` нет правила, ограничивающего добавление практических шагов по теме запроса;
- в промте плана `buildOutlineMessages` формулировка «практика (javascript, sqlite, regex) — только если подходит теме» слишком мягкая, а в `OUTLINE_SELF_CHECK` проверяются только `theory`, `svg` и `quiz`;
- блоки `INSTRUCTION_SQLITE_PRACTICE` и `INSTRUCTION_REGEX_PRACTICE` безусловно включаются в промты генерации курса/модуля без оговорки «применяй только если такие шаги нужны/есть в плане», что подталкивает модель использовать все типы из схемы.

## Цель

Обновить инструкции промтов генерации плана, полного курса и модулей так, чтобы ИИ определял из контекста запроса автора, уместны ли шаги `javascript`, `sqlite` и `regex`, и не добавлял их в неподходящие по теме курсы и модули.

## Требования

- Ввести явное правило выбора практических шагов по контексту запроса (в `build-course-generation-prompt.ts` и `build-staged-generation-messages.ts`):
  - практические шаги (`javascript`, `sqlite`, `regex`) необязательны; если тема курса/модуля не связана с ними напрямую, используются только `theory`, `svg` и `quiz`;
  - `javascript` разрешён только когда тема курса или модуля обучает JavaScript / алгоритмам на JS (или автор явно запросил практику на JS); запрещено использовать `javascript` для имитации задач по другим языкам программирования или непрофильным темам;
  - `sqlite` разрешён только когда тема курса или модуля прямо связана с SQL и реляционными базами данных (или по явному запросу автора);
  - `regex` разрешён только когда тема курса или модуля прямо посвящена регулярным выражениям и шаблонам поиска (или по явному запросу автора);
  - запрещено добавлять практические шаги «для разнообразия» ради покрытия всех типов `enum` из JSON Schema.
- Уточнить формулировки в `INSTRUCTION_SQLITE_PRACTICE` и `INSTRUCTION_REGEX_PRACTICE` (или условно подключать их при поэтапной генерации модулей по наличию соответствующих типов шагов в плане модуля), чтобы наличие справочных правил по движкам не провоцировало модель вставлять лишние шаги.
- Обновить `OUTLINE_SELF_CHECK` в `build-staged-generation-messages.ts`: перед ответом модель должна не только проверить наличие `theory`, `svg` и `quiz` в каждом модуле, но и убедиться, что `javascript`, `sqlite` и `regex` присутствуют только в профильных по теме модулях.
- При необходимости синхронизировать краткое пояснение в `docs/schemas/course-outline.schema.json` (с регенерацией Zod-схем через `npm run generate:zod`, если JSON Schema меняется).

## Технические заметки

- Затрагиваемые папки: `vibetest-app/src/app/prompt-generation/` (`build-course-generation-prompt.ts`, `build-course-generation-prompt.spec.ts`, `build-staged-generation-messages.ts`, `build-staged-generation-messages.spec.ts`).
- Проверить совместимость с `vibetest-app/src/app/course-generation/` (использует функции из `prompt-generation`).
- CLI-команды `ng g` не требуются (чистые функции формирования промтов и их unit-тесты).

## План работ

- [ ] Сформулировать и добавить инструкции уместности практических шагов (`javascript`, `sqlite`, `regex`) в `build-course-generation-prompt.ts`.
- [ ] Обновить `buildOutlineMessages`, `OUTLINE_SELF_CHECK`, `buildFirstModuleCourseMessages` и `buildModuleMessages` в `build-staged-generation-messages.ts`.
- [ ] Обновить и дополнить unit-тесты в `build-course-generation-prompt.spec.ts` и `build-staged-generation-messages.spec.ts`.
- [ ] Прогнать `ng test --watch=false` в `vibetest-app/`.

## Критерии готовности (Definition of Done)

- [ ] Тесты на доменную логику и нетривиальные части зелёные (`ng test --watch=false` в `vibetest-app/`)
- [ ] Функциональность соответствует требованиям
- [ ] Smart/dumb-разделение соблюдено
- [ ] Код соответствует стилю проекта (strict TS, signals, control flow синтаксис)

## Вне рамок задачи

- Изменение валидаторов импорта курса (`CourseImportService`) или жёсткий программный запрет типов шагов при парсинге плана.
- Изменение UI страниц генерации промта и генерации курса.

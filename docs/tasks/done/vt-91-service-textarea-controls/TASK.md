# vt-91 — Сервисные textarea и единый стиль кнопок

## Контекст

На служебных страницах (**Импорт**, **Генерация промта**, **Генерация курса**) многострочные поля и действия с буфером обмена реализованы разрозненно: частично «Взять из буфера» на импорте, отдельные кнопки копирования на промте, локальные SCSS для кнопок на каждой странице. Замечания: нужны **копировать**, **вставить из буфера**, **очистить**, **применить** (контекстное действие принятия — импорт, проверка и сохранение этапа и т.д.) в одном переиспользуемом UI; плюс **единый стиль кнопок** по приложению.

## Цель

Пользователь на служебных страницах работает с JSON/текстом через один предсказуемый блок «поле + toolbar»; кнопки primary/secondary/danger и touch targets выглядят одинаково на импорте, генерации промта/курса, настройках, плеере и диалогах.

## Требования

- **Компонент** `shared/ui/` (standalone): многострочное поле с label, `value` / `valueChange` (или model), `disabled`, `rows`/`monospace`, опциональный `name` для форм.
- **Toolbar** (настраиваемый, но с общими действиями по умолчанию):
  - **Копировать** — содержимое поля в clipboard (`shared/clipboard/copy-text-to-clipboard`).
  - **Вставить** — `navigator.clipboard.readText()` в поле с сообщением об ошибке/недоступности (как на импорте).
  - **Очистить** — сброс текста (подтверждение не обязательно; опциональный input `confirmClear`).
  - **Применить** — `output()` / callback; подпись через `applyLabel` («Импортировать», «Проверить и сохранить», …); `disabled` при пустом поле или `busy`.
- Слот или `@if` для дополнительных контролов рядом (чекбоксы импорта, выбор курса) — страница остаётся smart, компонент dumb.
- **Миграция** всех textarea на указанных страниц:
  - [`import-page`](../../../../vibetest-app/src/app/import/pages/import-page/) — курс и модуль (сохранить существующие флаги и submit-потоки).
  - [`prompt-generation-page`](../../../../vibetest-app/src/app/prompt-generation/pages/prompt-generation-page/) — описание, ответ с планом; [`manual-stage-panel`](../../../../vibetest-app/src/app/prompt-generation/ui/manual-stage-panel/) — ответ LLM этапа.
  - [`course-generation-page`](../../../../vibetest-app/src/app/course-generation/pages/course-generation-page/) — описание курса.
- **Единые кнопки:** вынести базовые классы/компонент `app-button` (или SCSS partial + BEM-модификаторы `--primary`, `--secondary`, `--danger`) в `shared/ui/`; постепенно заменить дублирующие `.settings-page__button`, `.import-page__…`, `.player-nav__button` и т.д. в рамках этой задачи — минимум все toolbar’ы нового textarea-компонента + страницы из миграции; остальные страницы — по возможности без раздувания scope (зафиксировать в REPORT что осталось).
- Touch target ≥ `--touch-target-min`; focus-visible; сообщения clipboard через `role="status"`.
- **SPEC:** описать toolbar сервисных полей и единый стиль кнопок (кратко в разделах Импорт / Генерация промта / Генерация курса / адаптивность).

## Технические заметки

- `ng g component shared/ui/service-textarea --standalone` (имя уточнить: `service-textarea` / `json-textarea-field`).
- Clipboard: переиспользовать [`copy-text-to-clipboard.ts`](../../../../vibetest-app/src/app/shared/clipboard/copy-text-to-clipboard.ts); read — общий helper рядом, без дублирования в import-page.
- Не трогать CodeMirror в practice shell и `<pre>` на Инфо (отдельные паттерны копирования).
- Затрагиваемые папки: `shared/ui/`, `import/`, `prompt-generation/`, `course-generation/`, глобально `styles.scss` или `shared/ui/button/`.

## План работ

- [ ] Helper read clipboard + unit-тесты
- [ ] Компонент service-textarea + стили toolbar
- [ ] Shared button styles / `app-button`
- [ ] Миграция import, prompt-generation, manual-stage-panel, course-generation
- [ ] Обновить/добавить spec страниц и компонента
- [ ] SPEC + `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] На всех целевых страницах доступны копировать / вставить / очистить / применить (где было submit)
- [ ] Поведение импорта и поэтапного промта без регрессий
- [ ] Единый визуальный язык кнопок на мигрированных экранах
- [ ] Тесты зелёные; dumb UI, orchestration на страницах

## Вне рамок задачи

- Toolbar для CodeMirror в practice
- Замена всех кнопок приложения (можно follow-up, если scope велик)
- Изменение course schema / runners

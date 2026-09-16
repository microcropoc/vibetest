# vibetest — спецификация MVP

## Назначение

Offline-first PWA для прохождения курсов, импортированных из JSON.

Курс: модули → шаги. Типы шагов (`type`): **theory** (markdown), **svg** (inline SVG/анимация), **quiz**, **javascript** | **sqlite** | **regex** (практика с проверкой).

Backend и авторизация — вне MVP.

## Стек

- Angular 22, standalone, signals
- Dexie.js / IndexedDB
- `@angular/pwa` (Service Worker только в production build)
- Web Workers; sql.js для SQLite

## Формат курса

Структура полей и ограничения — [course.schema.json](./schemas/course.schema.json) (draft-07, источник истины). Курс: корень → модули → шаги; `content` зависит от `type`.

**UUID v4** (`courseId`, `moduleId`, `stepId`): канонический RFC 4122, задаются автором, не меняются после публикации. В файле: один `courseId`; уникальные `moduleId` и пары `(moduleId, stepId)`. Невалидный UUID или дубликат → отклонение импорта.

Порядок модулей и шагов — порядок в массивах. Неизвестный `type` или невалидный JSON → отклонение.

## Типы шагов

Поля `content` — см. `$defs/*Content` в схеме.

### `theory`

`content` — строка markdown. Прогресс `completed` по «Далее».

```json
{
  "stepId": "11111111-1111-4111-8111-111111111101",
  "type": "theory",
  "title": "Стрелочные функции",
  "content": "Стрелочная функция: `(x) => x * 2`."
}
```

### `svg`

Inline SVG (SMIL/CSS внутри допустимы). MVP: без внешних URL и `<script>` (санитизация). Без автопроверки — как theory.

```json
{
  "stepId": "11111111-1111-4111-8111-111111111102",
  "type": "svg",
  "title": "Схема",
  "content": {
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><circle cx=\"32\" cy=\"32\" r=\"24\" fill=\"#4a90d9\"/></svg>",
    "caption": "Опционально"
  }
}
```

### `quiz`

Один индекс в `correctIndices` → radio; несколько → checkbox. Локальная проверка; успех → `completed`.

```json
{
  "stepId": "11111111-1111-4111-8111-111111111104",
  "type": "quiz",
  "title": "Проверка",
  "content": {
    "question": "Как объявить стрелочную функцию?",
    "options": ["x => x * 2", "function(x) { return x }"],
    "correctIndices": [0]
  }
}
```

### Практика (`javascript`, `sqlite`, `regex`)

Проверка в Web Worker; таймаут → завершение Worker. Курсы **доверенные**; Worker защищает от зависания, не от произвольного кода в origin.

`reset` — только очистка среды, перед **каждым** элементом `tests` (включая первый). Для `regex` при отсутствии среды `setup` — `""`.

**На каждый элемент `tests`:**

1. При первом тесте: `setup` (один раз на прогон).
2. `reset`, если задан и не пустой.
3. `sqlite`: `tests[i].seed`.
4. `starterCode` и `referenceSolution` в изолированных средах с одинаковым состоянием → сравнение.

| Тип | Сравнение | `setup` / `reset` / кейс |
|-----|-----------|---------------------------|
| `javascript` | возврат `functionName(...args)` | JS; тест `{ "args": … }`; обязателен `functionName` |
| `sqlite` | набор строк результата запроса | DDL в `setup`; `DELETE`/`TRUNCATE` в `reset`; `{ "seed": … }` после reset. Порядок строк — только если требует задание |
| `regex` | `RegExp.test(input)` | `setup`/`reset` часто `""`; `{ "input": string }` |

```json
{
  "stepId": "11111111-1111-4111-8111-111111111105",
  "type": "javascript",
  "title": "Удвоение",
  "content": {
    "description": "Реализуйте `double`.",
    "starterCode": "const double = (x) => x;",
    "referenceSolution": "const double = (x) => x * 2;",
    "setup": "let calls = 0;",
    "reset": "calls = 0;",
    "functionName": "double",
    "tests": [{ "args": [2] }, { "args": [0] }]
  }
}
```

```json
{
  "stepId": "11111111-1111-4111-8111-111111111106",
  "type": "sqlite",
  "title": "Пользователь",
  "content": {
    "description": "Найдите пользователя с id = 1.",
    "setup": "CREATE TABLE users(id INT, name TEXT);",
    "reset": "DELETE FROM users;",
    "starterCode": "SELECT * FROM users WHERE id = 1;",
    "referenceSolution": "SELECT id, name FROM users WHERE id = 1;",
    "tests": [
      { "seed": "INSERT INTO users VALUES(1, 'Anna');" },
      { "seed": "INSERT INTO users VALUES(1, 'Bob');" }
    ]
  }
}
```

```json
{
  "stepId": "11111111-1111-4111-8111-111111111107",
  "type": "regex",
  "title": "Цифры",
  "content": {
    "description": "Строка из цифр.",
    "starterCode": "^\\d+$",
    "referenceSolution": "^\\d+$",
    "setup": "",
    "tests": [{ "input": "123" }, { "input": "abc" }]
  }
}
```

## Импорт

- Выбор `.json` (файл или drag-and-drop).
- Валидация по [course.schema.json](./schemas/course.schema.json), плюс UUID и уникальность id в файле; у практики — непустой `tests`, поля кейса по `type`; `reset` без seed-данных.
- Существующий `courseId` — «заменить» или «отменить»; замена удаляет прогресс курса.

## Хранилище (IndexedDB)

| Таблица        | Содержимое |
|----------------|------------|
| `courses`      | JSON курса целиком, key `courseId` |
| `stepProgress` | key `${courseId}::${moduleId}::${stepId}`; `status`: `not-started` \| `in-progress` \| `completed`; черновики по типу шага |

Статус модуля и курса — агрегация по шагам. Удаление курса — одной транзакцией (курс + прогресс).

## Экраны

1. **Список курсов** — импорт, открыть, удалить, статус.
2. **Модули курса** — список модулей и статус.
3. **Плеер** — шаги модуля («Назад»/«Далее»; на последнем шаге «Выйти» → модули).

## Offline / PWA

Контент курсов в IndexedDB после импорта; app shell и статика — SW. sql.js/WASM кэшируется при первом использовании.

## Вне MVP

- Backend, синхронизация, аккаунты
- Визуальный редактор курсов
- Рейтинги, соц. функции
- Песочница для недоверенного JavaScript
- Внешние ресурсы в `svg` (URL, CDN)

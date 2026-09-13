# vibetest — спецификация MVP

## Назначение

Offline-first PWA для прохождения курсов, импортированных из JSON.

Курс: модули → шаги. Типы шагов (`type`):

- **theory** — markdown-текст;
- **svg** — SVG-картинка или анимация (разметка inline);
- **quiz** — вопрос с вариантами;
- **javascript** | **sqlite** | **regex** — практика с проверкой.

Backend и авторизация — вне MVP.

## Стек

- Angular 22, standalone, signals
- Dexie.js / IndexedDB
- `@angular/pwa` (Service Worker только в production build)
- Web Workers; sql.js для SQLite

## Формат курса

### Корень документа

| Поле | Тип | Описание |
|------|-----|----------|
| `schemaVersion` | number | Версия формата файла (MVP: `1`) |
| `courseId` | string (UUID) | Стабильный id курса |
| `title` | string | Название |
| `description` | string | Краткое описание |
| `modules` | array | Модули по порядку прохождения |

### Модуль

| Поле | Тип | Описание |
|------|-----|----------|
| `moduleId` | string (UUID) | Стабильный id модуля в рамках курса |
| `title` | string | Название модуля |
| `steps` | array | Шаги по порядку |

### Шаг (общие поля)

| Поле | Тип | Описание |
|------|-----|----------|
| `stepId` | string (UUID) | Стабильный id шага в рамках модуля |
| `type` | string | Один из: `theory`, `svg`, `quiz`, `javascript`, `sqlite`, `regex` |
| `title` | string | Заголовок в плеере |
| `content` | см. ниже | Структура зависит от `type` |

### Идентификаторы (UUID)

`courseId`, `moduleId`, `stepId` — **UUID v4** в каноническом виде (RFC 4122): строчные hex, дефисы, 36 символов, например `a1b2c3d4-e5f6-4789-a012-3456789abcde`.

- Задаются автором курса при создании; **не меняются** после публикации.
- В пределах импортируемого файла: `courseId` один; пары `(moduleId)`, `(moduleId, stepId)` уникальны.
- При импорте: невалидный UUID или дубликат → отклонение.

### Общие правила

- `type` задаёт структуру `content`.
- Порядок модулей и шагов — порядок элементов в массивах.
- Неизвестный `type` или невалидный JSON → импорт отклоняется.

---

## Типы шагов

### `theory`

Текстовый шаг. `content` — **строка** с markdown (рендер в плеере).

```json
{
  "stepId": "11111111-1111-4111-8111-111111111101",
  "type": "theory",
  "title": "Стрелочные функции",
  "content": "Стрелочная функция: `(x) => x * 2`.\n\nКраткий синтаксис без своего `this`."
}
```

---

### `svg`

Визуальный шаг: статичная SVG или анимация (SMIL, CSS `@keyframes` внутри SVG и т.п.). `content` — **объект**.

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `svg` | string | да | Разметка SVG (корневой элемент `<svg>…</svg>`), inline в JSON |
| `caption` | string | нет | Подпись под картинкой (plain text или markdown — на усмотрение UI) |
| `description` | string | нет | Пояснение над/рядом с SVG (markdown) |

- В MVP: только inline SVG в JSON; внешние URL и `<script>` в SVG **не** загружаются/не исполняются (санитизация при рендере).
- Шаг без автопроверки: пользователь отмечает просмотр кнопкой «Далее» (прогресс — `completed` по явному переходу, как для theory без квиза).

Пример (статичная иконка):

```json
{
  "stepId": "11111111-1111-4111-8111-111111111102",
  "type": "svg",
  "title": "Схема потока",
  "content": {
    "description": "Упрощённая схема вызова функции.",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 120 40\" width=\"120\" height=\"40\"><rect x=\"2\" y=\"10\" width=\"30\" height=\"20\" fill=\"#4a90d9\" rx=\"2\"/><text x=\"17\" y=\"24\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\">fn</text><path d=\"M32 20h20\" stroke=\"#333\" marker-end=\"url(#a)\"/><defs><marker id=\"a\" markerWidth=\"6\" markerHeight=\"6\" refX=\"5\" refY=\"3\" orient=\"auto\"><path d=\"M0,0 L6,3 L0,6\" fill=\"#333\"/></marker></defs><rect x=\"52\" y=\"10\" width=\"30\" height=\"20\" fill=\"#7cb342\" rx=\"2\"/></svg>",
    "caption": "Вызов → выполнение"
  }
}
```

Пример (анимация, SMIL):

```json
{
  "stepId": "11111111-1111-4111-8111-111111111103",
  "type": "svg",
  "title": "Пульсация",
  "content": {
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><circle cx=\"32\" cy=\"32\" r=\"20\" fill=\"#e91e63\"><animate attributeName=\"r\" values=\"16;24;16\" dur=\"1.2s\" repeatCount=\"indefinite\"/></circle></svg>"
  }
}
```

---

### `quiz`

Вопрос с вариантами. `content` — **объект**.

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `question` | string | да | Текст вопроса |
| `options` | string[] | да | Варианты (минимум 2) |
| `correctIndices` | number[] | да | Индексы правильных вариантов (0-based) |

- Один правильный ответ: один элемент в `correctIndices`; UI — radio.
- Несколько правильных: несколько индексов; UI — checkbox.
- Проверка локально; после успеха шаг — `completed`.

```json
{
  "stepId": "11111111-1111-4111-8111-111111111104",
  "type": "quiz",
  "title": "Проверка знаний",
  "content": {
    "question": "Как объявить стрелочную функцию?",
    "options": ["x => x * 2", "function(x) { return x }", "function => x"],
    "correctIndices": [0]
  }
}
```

---

### Практика: общая схема (`javascript`, `sqlite`, `regex`)

Типы `javascript`, `sqlite` и `regex` используют один каркас `content`. Проверка в Web Worker; при таймауте Worker завершается.

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `description` | string | да | Условие (markdown) |
| `starterCode` | string | да | Ответ ученика: JS-код, SQL-запрос или regex-паттерн |
| `referenceSolution` | string | да | Эталон того же вида (не показывается ученику) |
| `setup` | string | да* | Однократная инициализация среды перед прогоном `tests` |
| `reset` | string | нет | **Только очистка** среды; выполняется перед каждым элементом `tests` (включая первый). Без инициализации данных |
| `tests` | array | да | Сценарии (минимум 1); каждый элемент задаёт свой кейс — пустые `{}` недопустимы |

\* Для `regex` — пустая строка `""`, если среда не нужна.

**Порядок на каждый элемент `tests`:**

1. При первом тесте: выполнить `setup` (один раз на весь прогон).
2. Выполнить `reset`, если поле задано и не пустое.
3. Для `sqlite`: выполнить обязательный `tests[i].seed` (данные сценария).
4. Выполнить `starterCode` и `referenceSolution` в изолированных средах с одинаковым состоянием; сравнить результаты.

| Сравнение | `javascript` | `sqlite` | `regex` |
|-----------|--------------|----------|---------|
| Что сравниваем | возврат `functionName(...args)` | набор строк запроса | результат `RegExp.test(input)` |

Дополнительно только для `javascript`: поле `functionName` (string, обяз.) — имя функции, которую вызывают все тесты в коде пользователя и в эталоне.

| | `setup` | `reset` | элемент `tests` |
|--|---------|---------|-----------------|
| `javascript` | JS: объявления, общее mutable state | JS: сброс state между тестами | `{ "args": unknown[] }` |
| `sqlite` | SQL: DDL, базовые таблицы | SQL: только очистка (`DELETE` / `TRUNCATE`) | `{ "seed": string }` — SQL с данными сценария после `reset` |
| `regex` | `""` | omit или `""` | `{ "input": string }` |

Для `sqlite` порядок строк в результате учитывается только если это явно требует задание.

#### `javascript`

```json
{
  "stepId": "11111111-1111-4111-8111-111111111105",
  "type": "javascript",
  "title": "Удвоение числа",
  "content": {
    "description": "Реализуйте функцию `double`.",
    "starterCode": "const double = (x) => x;",
    "referenceSolution": "const double = (x) => x * 2;",
    "setup": "let calls = 0;",
    "reset": "calls = 0;",
    "functionName": "double",
    "tests": [
      { "args": [2] },
      { "args": [0] }
    ]
  }
}
```

#### `sqlite`

Один тест:

```json
{
  "stepId": "11111111-1111-4111-8111-111111111106",
  "type": "sqlite",
  "title": "Поиск пользователя",
  "content": {
    "description": "Найдите пользователя с id = 1.",
    "setup": "CREATE TABLE users(id INT, name TEXT);",
    "reset": "DELETE FROM users;",
    "starterCode": "SELECT * FROM users WHERE id = 1;",
    "referenceSolution": "SELECT id, name FROM users WHERE id = 1;",
    "tests": [
      { "seed": "INSERT INTO users VALUES(1, 'Anna');" }
    ]
  }
}
```

Два теста с разным `seed`:

```json
{
  "stepId": "11111111-1111-4111-8111-111111111108",
  "type": "sqlite",
  "title": "Имена по id",
  "content": {
    "description": "Верните имя пользователя с заданным id.",
    "setup": "CREATE TABLE users(id INT, name TEXT);",
    "reset": "DELETE FROM users;",
    "starterCode": "SELECT name FROM users WHERE id = 1;",
    "referenceSolution": "SELECT name FROM users WHERE id = 1;",
    "tests": [
      { "seed": "INSERT INTO users VALUES(1, 'Anna');" },
      { "seed": "INSERT INTO users VALUES(1, 'Bob');" }
    ]
  }
}
```

#### `regex`

```json
{
  "stepId": "11111111-1111-4111-8111-111111111107",
  "type": "regex",
  "title": "Поиск числа",
  "content": {
    "description": "Выражение для строки из цифр.",
    "starterCode": "^\\d+$",
    "referenceSolution": "^\\d+$",
    "setup": "",
    "tests": [
      { "input": "123" },
      { "input": "abc" }
    ]
  }
}
```

---

### Пример курса (фрагмент)

Один модуль с одним шагом каждого типа; id — UUID.

```json
{
  "schemaVersion": 1,
  "courseId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Основы JavaScript",
  "description": "Короткий вводный курс",
  "modules": [
    {
      "moduleId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "title": "Функции",
      "steps": [
        {
          "stepId": "11111111-1111-4111-8111-111111111101",
          "type": "theory",
          "title": "Стрелочные функции",
          "content": "Стрелочная функция: `(x) => x * 2`."
        },
        {
          "stepId": "11111111-1111-4111-8111-111111111102",
          "type": "svg",
          "title": "Схема",
          "content": {
            "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><circle cx=\"32\" cy=\"32\" r=\"24\" fill=\"#4a90d9\"/></svg>"
          }
        },
        {
          "stepId": "11111111-1111-4111-8111-111111111104",
          "type": "quiz",
          "title": "Проверка",
          "content": {
            "question": "Как объявить стрелочную функцию?",
            "options": ["x => x * 2", "function => x"],
            "correctIndices": [0]
          }
        },
        {
          "stepId": "11111111-1111-4111-8111-111111111105",
          "type": "javascript",
          "title": "Удвоение",
          "content": {
            "description": "Реализуйте функцию double.",
            "starterCode": "const double = (x) => x;",
            "referenceSolution": "const double = (x) => x * 2;",
            "setup": "",
            "functionName": "double",
            "tests": [{ "args": [2] }]
          }
        },
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
            "tests": [{ "seed": "INSERT INTO users VALUES(1, 'Anna');" }]
          }
        },
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
      ]
    }
  ]
}
```

Импортированные курсы считаются **доверенными**. Worker защищает от зависания, не от произвольного кода в origin приложения.

## Импорт

- Выбор `.json` (файл или drag-and-drop).
- Валидация: схема, обязательные поля, типы, формат UUID, уникальность id, лимиты размера (в т.ч. длина inline SVG); у практики — непустой `tests`, у каждого элемента обязательные поля по `type` (`args` / `seed` / `input`); `reset` без seed-данных.
- При существующем `courseId` — «заменить» или «отменить». Замена удаляет прогресс по этому курсу.

## Хранилище (IndexedDB)

| Таблица        | Содержимое |
|----------------|------------|
| `courses`      | JSON курса целиком, key `courseId` (UUID) |
| `stepProgress` | key `${courseId}::${moduleId}::${stepId}`; `status`: `not-started` \| `in-progress` \| `completed`; черновики ответа/кода по типу шага |

Статус модуля и курса — агрегация по шагам. Удаление курса — одной транзакцией (курс + весь прогресс).

## Экраны

1. **Список курсов** — импорт, открыть, удалить, статус.
2. **Модули курса** — список модулей и статус.
3. **Плеер** — шаги модуля (переход по индикатору и «Назад»/«Далее»; на последнем шаге «Выйти» → модули).

## Offline / PWA

Контент курсов в IndexedDB после импорта; app shell и статика — через SW. sql.js/WASM кэшируется при первом использовании.

## Вне MVP

- Backend, синхронизация, аккаунты
- Визуальный редактор курсов
- Рейтинги, соц. функции
- Песочница для недоверенного JavaScript
- Внешние ресурсы в шагах `svg` (URL, `<image href="…">` к CDN)

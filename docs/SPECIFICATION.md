# vibetest — спецификация MVP

## Назначение

Offline-first PWA для прохождения курсов, импортированных из JSON.

Курс: модули → шаги трёх видов:

- **theory** — markdown-текст;
- **quiz** — вопрос с вариантами;
- **javascript** | **sqlite** | **regex** — практика.

Backend и авторизация — вне MVP.

## Стек

- Angular 22, standalone, signals
- Dexie.js / IndexedDB
- `@angular/pwa` (Service Worker только в production build)
- Web Workers; sql.js для SQLite

## Формат курса

Пример курса со всеми типами шагов:

```json
{
  "schemaVersion": 1,
  "courseId": "js-basics",
  "title": "Основы JavaScript",
  "description": "Короткий вводный курс",
  "modules": [
    {
      "moduleId": "functions",
      "title": "Функции",
      "steps": [
        {
          "stepId": "theory-1",
          "type": "theory",
          "title": "Стрелочные функции",
          "content": "Стрелочная функция: `(x) => x * 2`."
        },
        {
          "stepId": "quiz-1",
          "type": "quiz",
          "title": "Проверка знаний",
          "content": {
            "question": "Как объявить стрелочную функцию?",
            "options": ["x => x * 2", "function => x"],
            "correctIndices": [0]
          }
        },
        {
          "stepId": "js-1",
          "type": "javascript",
          "title": "Удвоение числа",
          "content": {
            "description": "Реализуйте функцию double.",
            "starterCode": "const double = (x) => x;",
            "functionName": "double",
            "tests": [
              { "args": [2], "expected": 4 }
            ]
          }
        },
        {
          "stepId": "sql-1",
          "type": "sqlite",
          "title": "Поиск пользователя",
          "content": {
            "description": "Найдите пользователя с id = 1.",
            "setup": "CREATE TABLE users(id INT, name TEXT); INSERT INTO users VALUES(1, 'Anna');",
            "starterCode": "SELECT * FROM users;",
            "expectedRows": [{ "id": 1, "name": "Anna" }]
          }
        },
        {
          "stepId": "regex-1",
          "type": "regex",
          "title": "Поиск числа",
          "content": {
            "description": "Выражение для строки из цифр.",
            "starterCode": "^\\d+$",
            "tests": [
              { "input": "123", "shouldMatch": true },
              { "input": "abc", "shouldMatch": false }
            ]
          }
        }
      ]
    }
  ]
}
```

Правила:

- `schemaVersion` — версия формата файла.
- `courseId`, `moduleId`, `stepId` — стабильные идентификаторы (не меняются после публикации).
- `type` задаёт структуру `content`.
- Порядок модулей и шагов — порядок элементов в массивах.
- Неизвестный `type` или невалидный JSON → импорт отклоняется.

### Quiz

Несколько правильных ответов: `correctIndices` содержит несколько индексов; UI — checkbox.

### JavaScript

В Worker вызывается `functionName(...args)` для каждого элемента `tests`; результат сравнивается с `expected` (глубокое сравнение). Таймаут → Worker завершается.

### SQLite

В Worker: `setup`, затем запрос пользователя; результат сравнивается с `expectedRows` (построчно, по колонкам). Порядок строк учитывается только если это явно требует задание.

### Regex

Паттерн из `starterCode` (редактируемый пользователем) проверяется через `tests`; каждый тест — в отдельном Worker с таймаутом.

Импортированные курсы считаются **доверенными**. Worker защищает от зависания, не от произвольного кода в origin приложения.

## Импорт

- Выбор `.json` (файл или drag-and-drop).
- Валидация: схема, обязательные поля, типы, уникальность ID, лимиты размера.
- При существующем `courseId` — «заменить» или «отменить». Замена удаляет прогресс по этому курсу.

## Хранилище (IndexedDB)

| Таблица        | Содержимое |
|----------------|------------|
| `courses`      | JSON курса целиком, key `courseId` |
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

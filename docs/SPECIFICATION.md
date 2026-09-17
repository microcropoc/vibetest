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
- Zod — runtime-валидация import- и канонического формата; типы из сгенерированных Zod-схем

## Структура приложения

Целевая раскладка `vibetest-app/` (имена файлов могут уточняться задачами; границы доменов — нет):

```text
vibetest-app/
├── tools/                          # генерация Zod из JSON Schema (npm script)
├── public/
│   └── schemas/                    # bundled course-import + course (canonical)
├── src/
│   └── app/
│       ├── app.ts, app.routes.ts   # shell, lazy routes
│       ├── courses/                # типы, parse, import, списки курса/модулей
│       │   └── generated/          # Zod/types — не редактировать вручную
│       ├── player/                 # orchestration, навигация, step UI по type
│       ├── execution/              # Worker protocol, wrapper, runners, *.worker.ts
│       ├── progress/               # агрегации, индикаторы — pure functions
│       ├── storage/                # Dexie, migrations, repositories
│       ├── statistics/             # страница статистики
│       ├── import/                 # страница импорта
│       ├── info/                   # страница схемы
│       └── shared/ui/              # переиспользуемые dumb-компоненты
```

- `*.spec.ts` — рядом с кодом; domain/storage logic без TestBed где возможно.
- Dexie — **только** `storage/`; domain не импортирует Dexie.
- `postMessage` / Worker — **только** через `execution/` (компоненты не вызывают Worker напрямую).
- Страницы — lazy (`loadComponent`); тяжёлые step UI — `@defer` или dynamic import.

```mermaid
flowchart TD
  Schema[BundledJsonSchema] --> Courses[CoursesDomain]
  Courses --> Engines[StepEngines]
  Engines --> Player[PlayerOrchestration]
  Execution[ExecutionWorkers] --> Player
  Storage[DexieStorage] --> Player
  Progress[ProgressDomain] --> Player
  Player --> StepUI[StepUI]
  Storage --> Pages[CoursesStatisticsImportInfo]
```

## Формат курса

Две JSON Schema (draft **2020-12**):

| Схема | Назначение |
|-------|------------|
| [course-import.schema.json](./schemas/course-import.schema.json) | **Ввод** при импорте (автор, нейросеть): `schemaVersion`, `courseId`, `moduleId`, `stepId` **опциональны** |
| [course.schema.json](./schemas/course.schema.json) | **Канон** после нормализации: все ID и `schemaVersion: 1` **обязательны**; так хранится курс в IndexedDB и так типизирован domain `Course` |

Ограничения `content` по `type` — общие (`$ref` из import-схемы в каноническую). В bundle приложения (`public/schemas/`) обе схемы + **сгенерированные** Zod и TypeScript; generated-файлы не редактируют вручную.

**UUID v4** (если указаны во входе): RFC 4122. Дубликаты **предоставленных** `courseId` / `moduleId` / `stepId` → отклонение. После нормализации: один `courseId`, уникальные `moduleId`, уникальные `stepId` в документе.

Порядок модулей и шагов — порядок в массивах. Во входе: если `schemaVersion` указан и ≠ 1 → отклонение. Неизвестный `type` или невалидный JSON → отклонение.

## Типы шагов

Поля `content` — см. `$defs/*Content` в схеме.

### `theory`

`content` — строка markdown; рендер **без санитизации** (курс доверенный, ответственность автора). Прогресс `completed` по «Далее».

```json
{
  "type": "theory",
  "title": "Стрелочные функции",
  "content": "Стрелочная функция: `(x) => x * 2`."
}
```

### `svg`

Inline SVG (SMIL/CSS и т.п.); рендер **без санитизации** (курс доверенный). Без автопроверки — как theory.

```json
{
  "type": "svg",
  "title": "Схема",
  "content": {
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><circle cx=\"32\" cy=\"32\" r=\"24\" fill=\"#4a90d9\"/></svg>",
    "caption": "Опционально"
  }
}
```

### `quiz`

Один индекс в `correctIndices` → radio; несколько → checkbox. В схеме: уникальные индексы; при импорте дополнительно проверять, что каждый индекс `< options.length`. Локальная проверка; успех → `completed`.

```json
{
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

Проверка в Web Worker. Обязательное **`timeoutMs`** (100–30000): лимит на прогон шага; по истечении — завершение Worker и ошибка шага. Курсы **доверенные**; Worker защищает от зависания, не от произвольного кода в origin.

Кейсы `tests` выполняются **по порядку**; при первом провале, runtime-ошибке или timeout дальнейшие кейсы **не** запускаются.

`reset` (только `javascript` / `sqlite`) — очистка среды перед **каждым** элементом `tests` (включая первый), если поле задано и не пустое; **отсутствие или пустая строка** — no-op. У `regex` полей `setup` / `reset` нет.

**Подготовка (один раз на прогон):**

- **JavaScript:** две изолированные среды — код пользователя и эталон: `setup` (подготовка к выполнению решения; **не** класть проверочные данные в `setup` — авторская конвенция, не проверяется при импорте), затем загрузка `starterCode` / `referenceSolution`. Каждый **`argsGenerator`** — самодостаточная строка с **полным** выражением функции без параметров (например `"() => [2, 3]"`); движок **не** дописывает обёртку. Вызов — в **отдельной изолированной** среде на каждый кейс (без `setup`/`reset` шага, без starter/reference).
- **SQLite:** две среды, `setup` + load starter/reference.
- **Regex:** только паттерны и `tests`.

**На каждый элемент `tests`:**

1. **JavaScript:** evaluate `argsGenerator` → массив аргументов (≤ 20 элементов, только JSON-совместимые значения); иначе ошибка кейса и стоп. Затем `reset` в средах пользователя и эталона (если задан и не пустой), вызов `functionName(...args)` с **одним и тем же** сгенерированным массивом.
2. **SQLite:** `reset` в обеих средах (no-op, если не задан или пустой), `tests[i].seed`, выполнение и сравнение.
3. **Regex:** `RegExp.test(input)` у паттерна пользователя и эталона на одном `input`; успех, если оба boolean **совпадают**.
4. При fail / runtime error / timeout — стоп (fail-fast).

| Тип | Сравнение | Прочее |
|-----|-----------|--------|
| `javascript` | возврат `functionName(...args)` — JSON-совместимые значения; структурное сравнение | `setup`/`reset`; `{ "argsGenerator": "…" }`; `functionName`; `timeoutMs` |
| `sqlite` | строки результата; порядок при `orderMatters: true`, иначе multiset | DDL `setup`; `reset`; `{ "seed": … }`; `orderMatters`; `timeoutMs` |
| `regex` | `RegExp.test(input)` user vs reference — одинаковый boolean | `{ "input": string }`; `timeoutMs` |

```json
{
  "type": "javascript",
  "title": "Сумма",
  "content": {
    "description": "Реализуйте `add(a, b)`.",
    "starterCode": "const add = (a, b) => 0;",
    "referenceSolution": "const add = (a, b) => a + b;",
    "setup": "",
    "reset": "",
    "functionName": "add",
    "timeoutMs": 2000,
    "tests": [
      { "argsGenerator": "() => [2, 3]" },
      { "argsGenerator": "() => [0, 5]" },
      { "argsGenerator": "() => [4, 1]" }
    ]
  }
}
```

```json
{
  "type": "sqlite",
  "title": "Пользователь",
  "content": {
    "description": "Найдите пользователя с id = 1.",
    "setup": "CREATE TABLE users(id INT, name TEXT);",
    "reset": "DELETE FROM users;",
    "starterCode": "SELECT * FROM users WHERE id = 1;",
    "referenceSolution": "SELECT id, name FROM users WHERE id = 1;",
    "orderMatters": false,
    "timeoutMs": 5000,
    "tests": [
      { "seed": "INSERT INTO users VALUES(1, 'Anna');" },
      { "seed": "INSERT INTO users VALUES(1, 'Bob');" }
    ]
  }
}
```

```json
{
  "type": "regex",
  "title": "Цифры",
  "content": {
    "description": "Строка из цифр.",
    "starterCode": "^\\d+$",
    "referenceSolution": "^\\d+$",
    "timeoutMs": 1000,
    "tests": [{ "input": "123" }, { "input": "abc" }]
  }
}
```

## Импорт

Вкладка **Импорт**: многострочное поле JSON, кнопки **Взять из буфера** (вставить текст из clipboard в поле) и **Импортировать**.

Поток **Импортировать**:

1. Разбор JSON.
2. Валидация **import**-Zod ([course-import.schema.json](./schemas/course-import.schema.json)).
3. **Нормализация** (pure): отсутствующий `schemaVersion` → `1`; отсутствующие `courseId` / `moduleId` / `stepId` → `crypto.randomUUID()`; переданные ID сохраняются.
4. Валидация **канонического** Zod ([course.schema.json](./schemas/course.schema.json)).
5. Semantic rules: уникальность всех ID в документе; quiz indices; практика — `tests`, `timeoutMs`, у JS — `argsGenerator`; у JS/SQLite — `reset` не должен содержать seed-данные кейсов (SQL `INSERT`/`seed` только в `tests[].seed`).
6. Успех — сохранение **канонического** JSON в IndexedDB.

При ошибках — **все проблемы достигнутого этапа** (JSON parse → import Zod → normalize → canonical Zod → semantic) **под полем импорта**; после сбоя этапа следующие шаги не выполняются; курс не сохраняется.

**Create / replace:** без `courseId` во входе — всегда **новый** курс (новые UUID на шаге нормализации). Диалог «заменить» — только если во **входе** указан `courseId`, он уже есть в хранилище; замена удаляет прогресс курса. Повторный импорт того же текста без ID снова создаёт новый курс (MVP).

## Хранилище (IndexedDB)

| Таблица        | Содержимое |
|----------------|------------|
| `courses`      | JSON курса целиком, key `courseId` |
| `stepProgress` | key `${courseId}::${moduleId}::${stepId}`; `status`: `not-started` \| `in-progress` \| `completed`; черновики по типу шага; признак неудачной последней проверки (quiz/практика) для UI |

Статус модуля и курса — агрегация по шагам. Удаление курса — одной транзакцией (курс + прогресс).

## Экраны

Вверху — горизонтальная навигация: **Курсы** | **Статистика** | **Импорт** | **Инфо**. По умолчанию открыта вкладка **Курсы**.

### Курсы

Список карточек: **название**, **прогресс** (число модулей и сколько модулей полностью пройдено), кнопка **Пройти** → экран **модулей** этого курса, **Удалить** с подтверждением (курс + весь прогресс, одна транзакция). На карточках модулей — то же (название, прогресс по шагам модуля, **Пройти**).

**Пройти** у модуля → **плеер** на **первом непройденном** шаге; если все шаги `completed` — с **первого** шага модуля.

### Плеер

Над контентом — ряд **квадратиков** (по одному на шаг); tap/клик переходит на шаг. Состояния: **текущий** (серый), **ошибка последней проверки** (красный, quiz/практика), **пройден** (`completed`, зелёный), **не тронут** (нейтральный). Приоритет: **текущий → ошибка → пройден → не тронут**. **Повторить** — сброс черновика и флага ошибки; статус **`completed` не снимается**, если шаг уже был успешно пройден.

Навигация в модуле — только кнопки **Назад** / **Далее** (MVP ориентирован на **touch**, без горячих клавиш стрелок). На последнем шаге вместо «Далее» — **Выход** → модули; на экране модулей — **Выход** → курсы.

### Статистика

Сводка по импортированным курсам: прогресс, пройденные модули/шаги (агрегация из `stepProgress`).

### Импорт

См. раздел **Импорт** выше.

### Инфо

Просмотр формата для авторов: **bundled** [course-import.schema.json](./schemas/course-import.schema.json) — форматированный JSON (read-only). Каноническая [course.schema.json](./schemas/course.schema.json) — для хранения после нормализации; на вкладке **Инфо** не показывается. На MVP без отдельного UI-рендера полей.

## Offline / PWA

Контент курсов в IndexedDB после импорта; app shell и статика — SW. sql.js/WASM кэшируется при первом использовании.

## Вне MVP

- Backend, синхронизация, аккаунты
- Визуальный редактор курсов
- Рейтинги, соц. функции
- Песочница для недоверенного JavaScript
- Санитизация markdown/SVG и ограничения SVG-ресурсов (контент доверенный)

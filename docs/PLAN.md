# vibetest — план разработки

Здесь — дорожная карта и приоритеты. **Что** строим: [SPECIFICATION.md](SPECIFICATION.md). **Как** по шагам: задачи `vt-{n}` в [tasks/](tasks/) (`backlog` → `in-progress` → `done`).

## Этапы

1. **Scaffold** — `vt-1` (done): Angular CLI, сборка и тесты.
2. **Схема и типы** — `vt-2`: JSON Schema 2020-12, Zod, semantic validation.
3. **Движки шагов (домен)** — `vt-3` … `vt-6`: core, theory, quiz, svg.
4. **Execution** — `vt-7` … `vt-10`: Worker core, javascript, sqlite, regex.
5. **Хранение и прогресс** — `vt-11` … `vt-15`: Dexie, repositories, import service.
6. **Shell и списки** — `vt-16` … `vt-18`: routes, курсы, модули.
7. **Плеер** — `vt-19` … `vt-23`: orchestration, навигация, step UI.
8. **Страницы и PWA** — `vt-24` … `vt-27`: импорт, статистика, инфо, offline.

## Очередь задач

| # | Задача | Зависимости |
|---|--------|-------------|
| vt-2 | [course-schema-zod](tasks/backlog/vt-2-course-schema-zod.md) | vt-1 |
| vt-3 | [step-engine-core](tasks/backlog/vt-3-step-engine-core.md) | vt-2 |
| vt-4 | [theory-step-engine](tasks/backlog/vt-4-theory-step-engine.md) | vt-3 |
| vt-5 | [quiz-step-engine](tasks/backlog/vt-5-quiz-step-engine.md) | vt-3 |
| vt-6 | [svg-step-engine](tasks/backlog/vt-6-svg-step-engine.md) | vt-3 |
| vt-7 | [execution-worker-core](tasks/backlog/vt-7-execution-worker-core.md) | vt-3 |
| vt-8 | [javascript-step-engine](tasks/backlog/vt-8-javascript-step-engine.md) | vt-7 |
| vt-9 | [sqlite-step-engine](tasks/backlog/vt-9-sqlite-step-engine.md) | vt-7 |
| vt-10 | [regex-step-engine](tasks/backlog/vt-10-regex-step-engine.md) | vt-7 |
| vt-11 | [dexie-schema-migrations](tasks/backlog/vt-11-dexie-schema-migrations.md) | vt-2 |
| vt-12 | [course-repository](tasks/backlog/vt-12-course-repository.md) | vt-11 |
| vt-13 | [progress-domain](tasks/backlog/vt-13-progress-domain.md) | vt-3 |
| vt-14 | [progress-repository](tasks/backlog/vt-14-progress-repository.md) | vt-11, vt-12, vt-13 |
| vt-15 | [course-import-service](tasks/backlog/vt-15-course-import-service.md) | vt-2, vt-12, vt-14 |
| vt-16 | [app-shell-routes](tasks/backlog/vt-16-app-shell-routes.md) | vt-1 |
| vt-17 | [course-list-page](tasks/backlog/vt-17-course-list-page.md) | vt-12, vt-13, vt-14, vt-16 |
| vt-18 | [module-list-page](tasks/backlog/vt-18-module-list-page.md) | vt-12, vt-13, vt-14, vt-16 |
| vt-19 | [player-orchestration](tasks/backlog/vt-19-player-orchestration.md) | vt-4–vt-10, vt-12, vt-13, vt-14, vt-16 |
| vt-20 | [player-navigation-ui](tasks/backlog/vt-20-player-navigation-ui.md) | vt-13, vt-19 |
| vt-21 | [theory-svg-step-ui](tasks/backlog/vt-21-theory-svg-step-ui.md) | vt-4, vt-6, vt-19 |
| vt-22 | [quiz-step-ui](tasks/backlog/vt-22-quiz-step-ui.md) | vt-5, vt-19 |
| vt-23 | [practice-step-ui](tasks/backlog/vt-23-practice-step-ui.md) | vt-8–vt-10, vt-19 |
| vt-24 | [import-page](tasks/backlog/vt-24-import-page.md) | vt-15, vt-16 |
| vt-25 | [statistics-page](tasks/backlog/vt-25-statistics-page.md) | vt-12, vt-13, vt-14, vt-16 |
| vt-26 | [info-schema-page](tasks/backlog/vt-26-info-schema-page.md) | vt-2, vt-16 |
| vt-27 | [pwa-offline](tasks/backlog/vt-27-pwa-offline.md) | vt-16, vt-23 |

**Параллельно после vt-3:** vt-4–vt-6, vt-7, vt-13; после vt-7: vt-8–vt-10; после vt-11: **vt-12** (строго до vt-14); vt-13 параллельно с vt-11+; **vt-14** после vt-11, vt-12 **и** vt-13; vt-16 — отдельная ветка после vt-1.

## Решения и допущения

- Step engine — контракт + pure functions; registry всех типов — в orchestration (vt-19), не в vt-3.
- JSON Schema draft **2020-12**; Zod generated.
- Dexie только в `storage/`; domain не импортирует Dexie.
- Worker — только через `execution/` wrapper.
- Практика: обязательный **`timeoutMs`** (100–30000); кейсы **fail-fast**; regex **без** `setup`/`reset`.
- JavaScript: **`argsGenerator`** — самодостаточная `() => …` на кейс; `setup` без проверочных данных; evaluate в изолированной среде.
- Две схемы: **course-import** (ввод, ID опциональны) → normalize → **course** (канон в IndexedDB).
- Импорт: все ошибки **достигнутого этапа** под формой; без `courseId` — всегда новый курс; replace только при переданном существующем `courseId`.
- Bundled schemas: `public/schemas/`.
- Каскадное удаление progress: storage helper в **vt-12**; **vt-14** `deleteAllByCourseId` — обёртка, не обратная зависимость.
- **Инфо:** показывать import-схему.
- Контент курса доверенный: markdown/SVG **без** санитизации в MVP.
- Плеер: навигация **touch** (кнопки + индикаторы); **`completed`** не снимается при неудачном повторе.

## Заметки

_(свободная форма)_

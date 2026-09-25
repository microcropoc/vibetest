---
branch: feature/vt-49-javascript-unordered
---

# Отчёт vt-49 — JavaScript: unordered

## Что сделано

- Опциональный `tests[].unordered`: после `structure`-serialize, перед equal — `sortUnordered` (массивы по стабильному ключу, plain objects — normalize values).
- SPEC / schema / Zod; проброс через Worker messages и runner.
- Unit + checklist (порядок групп, тройки, multiset, list serialize до unordered).
- `ng test`: 301 зелёных.

## Изменённые файлы

- `docs/schemas/course.schema.json`, `course-import.schema.json`, `SPECIFICATION.md`, `PLAN.md`
- `docs/tasks/done/vt-49-javascript-unordered/`
- `vibetest-app/public/schemas/*`, `generated/*`
- `sort-unordered.ts` (+ spec)
- `run-javascript-case.ts` (+ spec)
- `execution-messages.ts`, `javascript-practice.worker.ts`, `javascript-practice-runner.ts`

## Тесты

- `ng test --watch=false`: зелёный (301)

## Отклонения от TASK.md

- В JSON Schema нет `default: false` у `unordered` (как у `resultMode`) — отсутствие = false в раннере.

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью не запрашивалось; merge по явной просьбе.

# vt-73 — Надёжная генерация курса через LM Studio

## Контекст

При малом Context Length модель теряет инструкции, пересказывает схему и обрезает JSON. Нужны system/user промт, извлечение JSON, подсказки про контекст, structured output.

## Цель

Генерация устойчива к лишнему тексту и обрезанию; профиль с флагом structured output; оценка размера промта.

## План

- [x] Ветка и задача
- [x] buildCourseGenerationMessages, API messages
- [x] prepareLlmImportText улучшения
- [x] prompt_tokens, estimate на странице
- [x] structuredOutput в профиле
- [x] SPEC, тесты

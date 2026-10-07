# vt-90 — Курс «Регулярки на практике: валидация, парсинг, Regex Golf»

**Приоритет:** P3  
**Зависимости:** vt-86, vt-87  
**Блокирует:** нет

## Контекст

Отдельный практический курс: реальные форматы (email, URL, логи), парсинг и Regex Golf — наборы строк «должны / не должны» match (`test` mode), акцент на коротких паттернах.

## Цель

Bundled-курс **«Регулярки на практике»** в `docs/courses/regex-practical/`: модули по темам + модуль Regex Golf; bundled sync и green tests через `regex-practice-core`.

## Требования

- Каталог `docs/courses/regex-practical/`:
  - email, URL, телефоны, даты;
  - IPv4/IPv6, UUID, semver;
  - пароли с lookahead;
  - разбор логов, CSV;
  - токенизация с флагом `y`;
  - лёгкий Markdown;
  - **Regex Golf**: классические наборы must-match / must-not-match, `mode: test`, несколько кейсов на задачу.
- Каждый модуль: theory (по необходимости), svg (опционально), regex-практики, quiz в конце — по аналогии с другими курсами.
- `regex-practical.json`, README.

## Технические заметки

- Не дублировать задачи из vt-88 LeetCode-модуля и vt-89 HackerRank; фокус на «жизненных» форматах и golf.
- Feature branch `feature/vt-90-regex-practical-course` при merge app.

## План работ

- [ ] course.json + intro
- [ ] Модули валидации и парсинга
- [ ] Модуль Regex Golf (набор задач с must/must-not)
- [ ] build:courses, README, tests

## Критерии готовности (Definition of Done)

- [ ] Assembled JSON = build
- [ ] Reference pass / starter fail на regex-шагах
- [ ] `ng test --watch=false` зелёный

## Вне рамок задачи

- HackerRank / флагман — vt-88, vt-89
- Расширение движка — vt-86, vt-87

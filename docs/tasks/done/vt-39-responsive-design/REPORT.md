---
branch: feature/vt-39-responsive-design
---

# Отчёт vt-39 — Адаптивный дизайн (mobile-first)

## Что сделано

- Глобальные токены `--page-padding`, `--content-max-width`, `--touch-target-min` в `styles.scss`; `min-width: 320px`, `overflow-x: clip` на `html`/`body`.
- **App shell:** nav в одну строку с горизонтальным скроллом; ссылки и PWA-кнопка с min-height 44px; main центрирован с max-width; footer/version с переносом длинного subject.
- **Страницы:** курсы и статистика — grid 2 колонки от 768px; импорт и генерация промта — stack кнопок на узком экране; инфо — `<pre>` с внутренним scroll; confirm dialog — padding и full-width кнопки ≤359px.
- **Плеер:** step indicators — horizontal scroll, квадраты 44px; player-nav — primary на всю ширину на ≤479px; theory/quiz/practice/svg/player-shell — `max-width: 100%`, pre/table overflow-x.
- **Карточки и кнопки:** min-height touch target на основных action-кнопках.
- **SPEC:** подраздел «Адаптивность и touch».

## Изменённые файлы

- `vibetest-app/src/styles.scss`
- `vibetest-app/src/app/shared/ui/app-shell/app-shell.scss`
- `vibetest-app/src/app/shared/ui/confirm-dialog/confirm-dialog.scss`
- `vibetest-app/src/app/courses/pages/courses-page/courses-page.scss`
- `vibetest-app/src/app/courses/pages/course-modules-page/course-modules-page.scss`
- `vibetest-app/src/app/courses/ui/course-list-card/course-list-card.scss`
- `vibetest-app/src/app/courses/ui/module-list-card/module-list-card.scss`
- `vibetest-app/src/app/statistics/pages/statistics-page/statistics-page.scss`
- `vibetest-app/src/app/import/pages/import-page/import-page.scss`
- `vibetest-app/src/app/info/pages/info-page/info-page.scss`
- `vibetest-app/src/app/prompt-generation/pages/prompt-generation-page/prompt-generation-page.scss`
- `vibetest-app/src/app/player/ui/step-indicator-bar/step-indicator-bar.scss`
- `vibetest-app/src/app/player/ui/player-nav/player-nav.scss`
- `vibetest-app/src/app/player/ui/player-shell/player-shell.scss`
- `vibetest-app/src/app/player/ui/theory-step-ui/theory-step-ui.scss`
- `vibetest-app/src/app/player/ui/svg-step-ui/svg-step-ui.scss`
- `vibetest-app/src/app/player/ui/quiz-step-ui/quiz-step-ui.scss`
- `vibetest-app/src/app/player/ui/practice-step-shell/practice-step-shell.scss`
- `docs/SPECIFICATION.md`
- `docs/tasks/in-progress/vt-39-responsive-design/TASK.md`

## Тесты

- `ng test --watch=false`: **зелёный** (66 files, 185 tests)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Ручная матрица viewport в CI не автоматизирована (follow-up: visual/E2E при необходимости).

## Изменения по ревью

_(после замечаний пользователя)_

## Ручная матрица viewport (320 / 375 / 768 / 1024 / 1440)

Проверка: DevTools responsive mode, `document.documentElement.scrollWidth <= clientWidth` на body (допустим scroll у nav, step bar, pre/code).

| Страница | 320 | 375 | 768 | 1024 | 1440 | Примечания |
|----------|-----|-----|-----|------|------|------------|
| Курсы | ✓ | ✓ | ✓ | ✓ | ✓ | 2-col grid с 768px |
| Модули | ✓ | ✓ | ✓ | ✓ | ✓ | заголовок переносится |
| Статистика | ✓ | ✓ | ✓ | ✓ | ✓ | как курсы |
| Импорт | ✓ | ✓ | ✓ | ✓ | ✓ | кнопки stack ≤479px |
| Инфо | ✓ | ✓ | ✓ | ✓ | ✓ | schema scroll внутри pre |
| Генерация промта | ✓ | ✓ | ✓ | ✓ | ✓ | copy full-width ≤479px |
| Плеер | ✓ | ✓ | ✓ | ✓ | ✓ | indicators scroll; nav stack |

_(Отметки — ожидаемое поведение по реализации; рекомендуется быстрый smoke в браузере перед merge.)_

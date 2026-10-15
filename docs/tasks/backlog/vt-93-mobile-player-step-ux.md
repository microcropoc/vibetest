# vt-93 — Плеер: mobile keyboard, scroll, без «Повторить»

## Контекст

Три замечания по плееру:

1. **Mobile PWA:** фокус на CodeMirror в шагах js/sql/regex — экранная клавиатура **перекрывает** редактор, приходится вручную скроллить.
2. **Навигация:** при переходе **theory → theory** (и, вероятно, между однотипными шагами) viewport остаётся **внизу** предыдущего шага — нет сброса прокрутки к началу контента.
3. **«Повторить»:** кнопку убрать из шагов ([`player-nav`](../../../../vibetest-app/src/app/player/ui/player-nav/player-nav.html)); тексты в quiz/practice, ссылающиеся на «Повторить», обновить.

Связанные done: [`vt-59`](../../done/vt-59-theory-code-mobile-scroll/) (theory code scroll), [`vt-53`](../../done/vt-53-practice-codemirror/) (редактор).

## Цель

На телефоне в PWA редактор практики остаётся видимым при появлении клавиатуры; при любом переходе на другой шаг (Назад/Далее/индикатор) пользователь видит **начало** нового шага. Действие «Повторить» исчезает из UI; сброс черновика/ошибки — только через редактирование и повторную проверку (или явные кнопки шага «Запустить»/«Проверить», без отдельного retry в nav).

## Требования

- **Keyboard / editor visibility (mobile):**
  - При focus в CodeMirror — прокрутить редактор (или practice block) в видимую область с учётом `visualViewport` / `interactive-widget=resizes-content` (viewport meta при необходимости).
  - Не ломать desktop; уважать `prefers-reduced-motion` для scroll behavior.
  - Рассмотреть минимальную высоту редактора и padding-bottom main content над [`player-nav`](../../../../vibetest-app/src/app/player/ui/player-nav/) при открытой клавиатуре.
- **Scroll reset on step change:**
  - При смене `currentStepIndex` / `stepId` — scroll window (или scroll container плеера, если overflow не на window) к top **или** `scrollIntoView` на заголовок шага / `player-shell` root.
  - Покрыть: theory→theory, quiz→quiz, practice→practice, смешанные переходы, выбор квадратика на индикаторе.
  - Не сбрасывать scroll при mere draft update внутри того же шага.
- **Удалить «Повторить»:**
  - Убрать кнопку и `(retry)` из player-nav / player-page; удалить или упростить `PlayerOrchestratorService.retry()` если больше не используется.
  - Обновить copy в [`quiz-step-ui`](../../../../vibetest-app/src/app/player/ui/quiz-step-ui/), [`practice-step-shell`](../../../../vibetest-app/src/app/player/ui/practice-step-shell/) — без отсылки к «Повторить».
  - **SPEC:** убрать/переписать абзац про «Повторить» в разделе Плеер (прогресс `completed` при retry больше не актуален в UI).
  - Поведение progress: без кнопки retry черновик сбрасывается только если явно заложено иначе — **не** менять семантику completed без product decision; если retry удалён, метод retry не вызывается из UI.
- **Тесты:** orchestrator/page — scroll hook (spy на scrollTo); player-nav без retry; quiz/practice тексты в spec.

## Технические заметки

- Папки: `player/pages/player-page`, `player/ui/player-shell`, `player/ui/code-editor`, `player/ui/player-nav`, `player-orchestrator.service.ts`.
- `visualViewport` API + fallback `element.scrollIntoView({ block: 'nearest' })`.
- Ручная проверка: 320/375 px, installed PWA Android/iOS по возможности.

## План работ

- [ ] Scroll-to-top (or header) on step change
- [ ] Mobile keyboard visibility для CodeMirror host
- [ ] Удалить retry из nav + orchestrator wiring + copy
- [ ] SPEC + unit/spec tests
- [ ] Ручной чеклист mobile PWA

## Критерии готовности (Definition of Done)

- [ ] Theory→theory и другие переходы показывают начало шага
- [ ] На mobile PWA редактор не полностью скрыт клавиатурой в типичном сценарии
- [ ] «Повторить» нигде в плеере; тексты согласованы
- [ ] `ng test --watch=false` зелёный

## Вне рамок задачи

- Горячие клавиши навигации
- Изменение логики progress/completed в storage
- Fullscreen SVG viewer scroll

---
branch: feature/vt-93-mobile-player-step-ux
---

# Отчёт vt-93 — Плеер: mobile keyboard, scroll, без «Повторить»

## Что сделано

- Сброс прокрутки к началу документа только при смене `index:stepId` (`stepScrollKey`), не при черновике и не при новой ссылке на тот же шаг.
- Каретка CodeMirror: абсолютный `scrollTo` с `behavior: 'auto'` на focus и `visualViewport.resize`; зазор nav только когда клавиатура перекрывает layout viewport.
- Запас под клавиатуру — `margin-bottom: 16rem` у редактора на узком экране, пока поле в фокусе (не `dvh`); постоянного padding под nav нет.
- Пока редактор в фокусе, каретка следует и за `visualViewport` `scroll`, и за `resize`.
- Слежение за фокусом только в `mountPracticeCodeEditor`.
- Viewport meta: `interactive-widget=resizes-content`.
- Удалены кнопка «Повторить», `PlayerOrchestratorService.retry()` и привязки в nav/page.
- Обновлены тексты quiz/practice и раздел «Плеер» в SPEC.

## Изменённые файлы

- `vibetest-app/src/app/player/player-scroll.ts` (+ spec)
- `vibetest-app/src/app/player/pages/player-page/*`
- `vibetest-app/src/app/player/ui/code-editor/code-editor.scss`, `practice-codemirror-host.ts` (+ spec)
- `vibetest-app/src/app/player/ui/player-nav/*`
- `vibetest-app/src/app/player/ui/quiz-step-ui/*`, `practice-step-shell/*`
- `vibetest-app/src/app/player/player-orchestrator.service.ts` (+ spec)
- `vibetest-app/src/index.html`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: зелёный (121 files, 749 tests)
- В браузере (localhost, viewport 375×400): у сфокусированного редактора `margin-bottom: 256px` (`16rem`), не доля ужатого `dvh`. Экранную клавиатуру на устройстве не проверял.

## Отклонения от TASK.md

- Команда `retry` в step-engine сохранена (внутренний контракт); из UI не вызывается.

## Открытые вопросы к ревью

- На установленном PWA (Android/iOS) не проверялось, остаётся ли строка каретки над системной клавиатурой.

## Изменения по ревью

Ревью (2026-10-15):

1. Слежение за клавиатурой сдвигает редактор мимо видимой области → `scrollEditableIntoView` в `player-scroll.ts`, вызов на каждом `visualViewport.resize` из `code-editor.ts`. Относительный `scrollBy` с `behavior: 'smooth'` повторяется, пока клавиатура анимируется, а `getBoundingClientRect` ещё не догнал прошлый скролл — дельты накладываются. Если верх хоста уже выше `visibleTop`, функция выходит и не поднимает низ, перекрытый клавиатурой. Зазор 72px вычитается при любом `visualViewport`, в том числе на desktop, хотя `player-nav` в потоке, не `fixed`. Ожидание: на resize клавиатуры — абсолютный `scrollTo` с `behavior: 'auto'` (smooth оставить разовому сбросу шага, с учётом `prefers-reduced-motion`); в видимую зону попадает строка каретки, а не только верх или низ всего хоста; зазор nav не применяется без клавиатуры.

2. Нижний запас не оказывается над навигацией и включён на всех узких шагах → `player-page.scss`, `padding-bottom: 5.5rem` на `.player-page` при `max-width: 479px`. Секция содержит и контент, и `player-nav`, поэтому padding стоит под футером. Пустая полоса есть и на theory/quiz/svg, где клавиатуры нет. Ожидание: запас помогает прокрутить редактор над клавиатурой и не добавляет постоянный зазор под nav на шагах без редактора.

3. Два пути фокуса, один не используется → `onFocus` в `practice-codemirror-host.ts` вешает свой `focusin`, а `CodeEditor` колбэк не передаёт и слушает `contentElement()` сам. Ожидание: один механизм (либо опция mount, либо слушатели компонента).

4. Сброс прокрутки не привязан к смене шага и не закрыт тестом → эффект в `player-page.ts` читает объект `currentStep()`, не `stepId`. Сейчас черновик не меняет ссылку шага, поэтому draft scroll не сбрасывает, но любой новый массив `steps` на том же индексе уведёт viewport наверх. В `player-page.spec.ts` есть только `selectStep(1)`. Ожидание: зависимость от `stepId` / индекса и тест, что обновление черновика того же шага не вызывает `scrollTo`.

После правок:

1. `scrollCaretIntoView`: абсолютный `scrollTo`, `behavior: 'auto'`; приоритет у нижнего края строки каретки; зазор 72px только если `visualViewport` заметно ниже layout viewport.
2. Постоянный `padding-bottom` у `.player-page` убран. На ширине до 479px запас — `margin-bottom` хоста редактора, пока на mount-элементе класс `code-editor--editing`.
3. Фокус и `visualViewport.resize` только в `bindCaretFollow` внутри `mountPracticeCodeEditor`.
4. Эффект страницы читает computed `index:stepId`. Тесты: черновик quiz и замена массива шагов с теми же id не вызывают `scrollTo`.

Ревью (2026-10-15, раунд 2):

1. Запас под клавиатуру схлопывается, когда клавиатура как раз открыта → `code-editor.scss`, `margin-bottom: min(40dvh, 16rem)` у `:host:has(.code-editor--editing)`. В `index.html` стоит `interactive-widget=resizes-content`, из‑за этого `dvh` уменьшается вместе с viewport. В режиме 375px без клавиатуры получается 256px (`16rem`); с клавиатурой потолок `16rem` уже не действует, остаётся ~40% ужатого viewport. Ожидание: длина, которая не следит за клавиатурой (`16rem` или `lvh`), пока висит `code-editor--editing`.

2. Слежение за кареткой не видит сдвиг visual viewport, только его высоту → `bindCaretFollow` в `practice-codemirror-host.ts` слушает `visualViewport` `resize`. `scrollCaretIntoView` считает видимую полосу через `offsetTop`, а он меняется на событии `scroll` (iOS при открытии клавиатуры сначала ресайзит, потом сдвигает visual viewport). Ожидание: пока фокус в редакторе, тот же абсолютный `scrollTo` с `behavior: 'auto'` и на `visualViewport` `scroll`.

После правок (раунд 2):

1. Запас — фиксированные `16rem`, пока висит `code-editor--editing`.
2. `bindCaretFollow` на фокусе подписывается на `visualViewport` `resize` и `scroll` одним обработчиком и снимает оба на blur/destroy. Тест проверяет подписку и снятие.

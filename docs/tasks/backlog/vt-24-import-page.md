# vt-24 — Import page

## Контекст

Вкладка **Импорт**: textarea, флажок **Заменить все ID новыми UUID**, **Взять из буфера**, **Импортировать**; ошибки; replace confirm при выключенном флажке.

## Цель

Page wired to **vt-15** ImportService: checkbox **включён по умолчанию** при каждом открытии формы; paste clipboard; **вывести под формой все** ошибки; confirm replace **только** когда флажок выключен и `courseId` из JSON совпадает с существующим курсом.

## Требования

- Checkbox «Заменить все ID новыми UUID» → `importCourse(..., { regenerateIds: true|false })`.
- При включённом флажке — без replace-диалога.
- Clipboard API with graceful deny message.
- Import button calls service; success → navigate or toast (minimal).
- Replace/cancel — **переиспользовать** `ConfirmDialogComponent` из `shared/ui/` (**vt-17**); не дублировать разметку/логику диалога.
- Lazy route under shell.

## Технические заметки

- Зависимости: **vt-15**, **vt-16**, **vt-17** (confirm dialog).

## План работ

- [ ] ImportPage + form + checkbox (default on)
- [ ] Clipboard + error display
- [ ] Replace dialog (conditional)
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Import flow из спецификации end-to-end с service

## Вне рамок задачи

- File drag-drop (optional later)

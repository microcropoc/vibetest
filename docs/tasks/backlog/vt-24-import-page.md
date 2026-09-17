# vt-24 — Import page

## Контекст

Вкладка **Импорт**: textarea, **Взять из буфера**, **Импортировать**; ошибки; replace confirm.

## Цель

Page wired to **vt-15** ImportService: paste clipboard, **вывести под формой все** ошибки; confirm replace **только** когда во входном JSON указан `courseId`, совпадающий с существующим курсом (импорт без `courseId` — без диалога replace).

## Требования

- Clipboard API with graceful deny message.
- Import button calls service; success → navigate or toast (minimal).
- Replace/cancel dialog per spec.
- Lazy route under shell.

## Технические заметки

- Зависимости: **vt-15**, **vt-16**.

## План работ

- [ ] ImportPage + form
- [ ] Clipboard + error display
- [ ] Replace dialog
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Import flow из спецификации end-to-end с service

## Вне рамок задачи

- File drag-drop (optional later)

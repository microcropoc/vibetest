# vt-24 — Import page

## Контекст

Вкладка **Импорт**: textarea, **Взять из буфера**, **Импортировать**; ошибки; replace confirm.

## Цель

Page wired to **vt-15** ImportService: paste clipboard, show validation errors, confirm replace when `courseId` exists.

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

# Примеры курсов (JSON)

Готовые файлы для вкладки **Импорт** в приложении. Формат — [course.schema.json](../schemas/course.schema.json).

| Файл | Описание |
|------|----------|
| [english-basics.json](./english-basics.json) | Небольшой курс английского: 2 модуля, теория (markdown) и quiz |
| [svg-graphics-basics.json](./svg-graphics-basics.json) | SVG-графика: 2 модуля, теория, шаги `svg` и quiz |
| [javascript-basics.json](./javascript-basics.json) | JavaScript: 2 модуля, теория, `svg`, quiz и практика `javascript` |
| [sqlite-basics.json](./sqlite-basics.json) | SQLite: 2 модуля, теория, `svg`, quiz и практика `sqlite` |
| [regex-basics.json](./regex-basics.json) | Regex: 2 модуля, теория, `svg`, quiz и практика `regex` |

## Импорт

1. Откройте `english-basics.json` в редакторе, скопируйте содержимое целиком (или **Взять из буфера** после копирования).
2. В приложении: **Импорт** → вставьте JSON → при первом импорте оставьте включённым **Заменить все ID новыми UUID** → **Импортировать**.

При повторном импорте того же файла с выключенным флажком и тем же `courseId` потребуется подтверждение замены.

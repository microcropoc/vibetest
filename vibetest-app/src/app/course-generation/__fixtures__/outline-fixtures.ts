import type { CourseOutline, CourseOutlineModule } from '../course-outline.model';

export function outlineModule(title: string): CourseOutlineModule {
  return {
    title,
    summary: `О модуле ${title}`,
    steps: [
      { type: 'theory', title: `${title}: теория`, summary: 'Введение' },
      { type: 'svg', title: `${title}: схема`, summary: 'Иллюстрация' },
      { type: 'quiz', title: `${title}: тест`, summary: 'Проверка' },
    ],
  };
}

export function outlineWithModules(...titles: readonly string[]): CourseOutline {
  return {
    schemaVersion: 1,
    title: 'Регулярные выражения',
    description: 'Базовый курс',
    modules: titles.map(outlineModule),
  };
}

export const VALID_OUTLINE: CourseOutline = outlineWithModules('Основы');

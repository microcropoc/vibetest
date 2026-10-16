/**
 * Generator for docs/courses/hackerrank-sql/*.module.json (vt-85).
 * Run: npm run generate:hackerrank-sql-course
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MODULE_DEFS,
  type HackerrankProblem,
  type ModuleDef,
} from './hackerrank-sql-modules-data.mts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(repoRoot, 'docs', 'courses', 'hackerrank-sql');
mkdirSync(outDir, { recursive: true });

function hrLink(slug: string): string {
  return `https://www.hackerrank.com/challenges/${slug}/problem`;
}

function assertTestCount(p: HackerrankProblem): void {
  if (p.tests.length < 3) {
    throw new Error(`${p.slug}: need at least 3 seed tests, got ${p.tests.length}`);
  }
  if (p.tests.length > 5) {
    throw new Error(`${p.slug}: at most 5 seed tests, got ${p.tests.length}`);
  }
}

function sqliteStep(p: HackerrankProblem): object {
  assertTestCount(p);
  const desc = `${p.description}\n\n[HackerRank: ${p.title}](${hrLink(p.slug)})`;
  const content: Record<string, unknown> = {
    description: desc,
    setup: p.setup,
    starterCode: p.starterCode,
    referenceSolution: p.referenceSolution,
    timeoutMs: 8000,
    tests: p.tests.map((seed) => ({ seed })),
  };
  content['orderMatters'] = p.orderMatters ?? false;
  if (p.checkColumnNames === true) {
    content['checkColumnNames'] = true;
  }
  if (p.floatTolerance !== undefined) {
    content['floatTolerance'] = p.floatTolerance;
  }
  if (p.checkQuery) {
    content['checkQuery'] = p.checkQuery;
  }
  return { type: 'sqlite', title: p.title, content };
}

function buildModule(mod: ModuleDef): object {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" width="100%" role="img" aria-label="${mod.title}"><rect id="${mod.svgIdPrefix}-box" x="40" y="15" width="200" height="50" rx="4" fill="#e3f2fd" stroke="#1565c0"/><text x="140" y="45" text-anchor="middle" font-size="12" fill="#0d47a1">${mod.title}</text></svg>`;
  const steps: object[] = [
    { type: 'theory', title: mod.theoryTitle, content: mod.theoryContent },
    {
      type: 'svg',
      title: `Схема: ${mod.title}`,
      content: {
        caption: mod.svgCaption,
        description: mod.svgDescription,
        svg,
      },
    },
    ...mod.problems.map(sqliteStep),
    {
      type: 'quiz',
      title: 'Итоговый тест модуля',
      content: {
        question: mod.quizQuestion,
        options: [...mod.quizOptions],
        correctIndices: [...mod.quizCorrect],
      },
    },
  ];
  return { schemaVersion: 1, title: mod.title, steps };
}

const courseMeta = {
  schemaVersion: 1,
  title: 'HackerRank SQL',
  description:
    'Полный раздел SQL Domain на HackerRank: шесть подразделов (Basic Select, Advanced Select, Aggregation, Basic Join, Advanced Join, Alternative Queries), 58 sqlite-задач с русскими условиями, ссылками на оригинал и автопроверкой в браузере (SQLite 3 / sql.js).',
};

const introModule = {
  schemaVersion: 1,
  title: 'Введение: HackerRank SQL на SQLite',
  steps: [
    {
      type: 'theory',
      title: 'HackerRank и SQLite в приложении',
      content:
        "## Курс HackerRank SQL\n\nЗадачи с [SQL Domain](https://www.hackerrank.com/domains/sql) адаптированы под **SQLite 3** (sql.js). На HackerRank часто MySQL/Oracle; здесь — диалект SQLite.\n\n### Строки и числа\n\n| HackerRank (MySQL) | SQLite |\n|--------------------|--------|\n| `CONCAT(a, b)` | `a \\|\\| b` или `printf` |\n| `LENGTH(s)` | `LENGTH(s)` |\n| `SUBSTR(s, pos, len)` | `SUBSTR(s, pos, len)` (позиция с 1) |\n| `ROUND(x, d)` | `ROUND(x, d)` |\n| `CEIL(x)` / `CEILING(x)` | `CEIL(x)` / `CEILING(x)` (зарегистрированы в приложении) |\n\n### REGEXP и генерация строк\n\n- **`REGEXP`** в приложении — семантика **JavaScript** `RegExp` (регистрозависимый).\n- Задачи «нарисовать треугольник» / «простые числа»: параметр **`N`** в таблице **`params(n)`** через `seed`; строки генерируют **`WITH RECURSIVE`**.\n\n### Проверка\n\n- Сравнивается **последний** result set.\n- **`orderMatters: true`** — когда важен порядок строк (форматированный вывод, сортировка по условию).\n- **`checkColumnNames: true`** — имена колонок как в эталоне.\n\nВ каждой задаче — ссылка на оригинал HackerRank.",
    },
    {
      type: 'svg',
      title: 'Схема: один кейс — новая БД',
      content: {
        caption: 'На каждый тест: **setup → seed → ваш SQL**',
        description: 'Данные не переносятся между seed-тестами.',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 70" width="100%" role="img" aria-label="Порядок проверки SQL"><rect id="hr00-a" x="10" y="20" width="70" height="30" rx="3" fill="#fff9c4" stroke="#f9a825"/><text x="45" y="38" text-anchor="middle" font-size="8">setup</text><text x="115" y="38" font-size="14">→</text><rect id="hr00-b" x="130" y="20" width="70" height="30" rx="3" fill="#e8f5e9" stroke="#2e7d32"/><text x="165" y="38" text-anchor="middle" font-size="8">seed</text><text x="235" y="38" font-size="14">→</text><rect id="hr00-c" x="250" y="20" width="40" height="30" rx="3" fill="#e3f2fd" stroke="#1565c0"/><text x="270" y="38" text-anchor="middle" font-size="8">SQL</text></svg>',
      },
    },
    {
      type: 'sqlite',
      title: 'Разминка: SELECT 1',
      content: {
        description: 'Верните одну строку с колонкой **`answer`** и значением `1`.',
        setup: 'CREATE TABLE warmup(id INTEGER);',
        starterCode: 'SELECT 0 AS answer;',
        referenceSolution: 'SELECT 1 AS answer;',
        orderMatters: false,
        checkColumnNames: true,
        timeoutMs: 5000,
        tests: [{ seed: '' }, { seed: 'INSERT INTO warmup VALUES (1);' }, { seed: 'INSERT INTO warmup VALUES (2);' }],
      },
    },
    {
      type: 'quiz',
      title: 'Итоговый тест модуля',
      content: {
        question: 'Как в SQLite склеить две строки `a` и `b`?',
        options: ['`CONCAT(a, b)`', '`a || b`', '`JOIN(a, b)`', '`MERGE(a, b)`'],
        correctIndices: [1],
      },
    },
  ],
};

writeFileSync(
  join(outDir, 'course.json'),
  `${JSON.stringify(courseMeta, null, 2)}\n`,
  'utf8',
);
writeFileSync(
  join(outDir, '00-intro.module.json'),
  `${JSON.stringify(introModule, null, 2)}\n`,
  'utf8',
);

for (const mod of MODULE_DEFS) {
  writeFileSync(join(outDir, mod.file), `${JSON.stringify(buildModule(mod), null, 2)}\n`, 'utf8');
  console.log(`Wrote ${mod.file} (${mod.problems.length} problems)`);
}

console.log('Done.');

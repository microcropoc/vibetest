/**
 * One-off generator for docs/courses/leetcode-sql/*.module.json (vt-83).
 * Run: npm run generate:leetcode-sql-course (or tsx tools/generate-leetcode-sql-course.mts)
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(repoRoot, 'docs', 'courses', 'leetcode-sql');

type SqliteProblem = {
  readonly leetcode: number;
  readonly title: string;
  readonly description: string;
  readonly setup: string;
  readonly starterCode: string;
  readonly referenceSolution: string;
  readonly orderMatters?: boolean;
  readonly checkColumnNames?: boolean;
  readonly floatTolerance?: number;
  readonly checkQuery?: string;
  readonly tests: readonly string[];
};

type ModuleDef = {
  readonly file: string;
  readonly title: string;
  readonly theoryTitle: string;
  readonly theoryContent: string;
  readonly svgCaption: string;
  readonly svgDescription: string;
  readonly svgIdPrefix: string;
  readonly quizQuestion: string;
  readonly quizOptions: readonly string[];
  readonly quizCorrect: readonly number[];
  readonly problems: readonly SqliteProblem[];
};

function leetLink(n: number): string {
  return `https://leetcode.com/problems/${slugFromLeet(n)}/`;
}

/** Approximate slugs for links; titles in steps use Russian + number. */
function slugFromLeet(n: number): string {
  const map: Record<number, string> = {
    1757: 'recyclable-and-low-fat-products',
    584: 'find-customer-referee',
    595: 'big-countries',
    1148: 'article-views-i',
    1683: 'invalid-tweets',
    1378: 'replace-employee-id-with-the-unique-identifier',
    1581: 'customer-who-never-order',
    1068: 'product-sales-analysis-i',
    1075: 'project-employees-i',
    197: 'rising-temperature',
    577: 'employee-bonus',
    570: 'managers-with-at-least-5-direct-reports',
    1280: 'students-and-examinations',
    1934: 'confirmation-rate',
    1211: 'queries-quality-and-percentage',
    1251: 'average-selling-price',
    1661: 'average-time-of-process-per-machine',
    1633: 'percentage-of-users-attended-a-contest',
    1193: 'monthly-transactions-i',
    1174: 'immediate-food-delivery-ii',
    550: 'game-play-analysis-iv',
    620: 'not-boring-movies',
    2356: 'number-of-unique-subjects-taught-by-each-teacher',
    1141: 'user-activity-for-the-past-30-days-i',
    1070: 'product-sales-analysis-iii',
    596: 'classes-more-than-5-students',
    1729: 'find-followers-count',
    619: 'biggest-single-number',
    1045: 'customers-who-bought-all-products',
    1731: 'the-number-of-employees-which-report-to-each-employee',
    1789: 'primary-department-for-each-employee',
    177: 'triangle-judgement',
    180: 'consecutive-numbers',
    1164: 'product-price-at-a-given-date',
    1204: 'last-person-to-fit-in-the-bus',
    1907: 'count-salary-categories',
    1773: 'employees-whose-manager-left-the-company',
    626: 'exchange-seats',
    1341: 'movie-rating',
    1321: 'restaurant-growth',
    602: 'friend-requests-ii-who-has-the-most-friends',
    585: 'investments-in-2016',
    185: 'department-top-three-salaries',
    1667: 'fix-names-in-a-table',
    1527: 'patients-with-a-condition',
    196: 'delete-duplicate-emails',
    176: 'second-highest-salary',
    1484: 'group-sold-products-by-the-date',
    1327: 'list-the-products-ordered-in-a-period',
    1517: 'find-users-with-valid-e-mails',
  };
  return map[n] ?? `problem-${n}`;
}

function sqliteStep(p: SqliteProblem): object {
  const desc = `${p.description}\n\n[LeetCode ${p.leetcode}](${leetLink(p.leetcode)})`;
  const checkColumnNames =
    p.checkColumnNames === true || FORCE_CHECK_COLUMN_NAMES.has(p.leetcode);
  const content: Record<string, unknown> = {
    description: desc,
    setup: p.setup,
    starterCode: p.starterCode,
    referenceSolution: p.referenceSolution,
    timeoutMs: 8000,
    tests: mergeProblemTests(p.leetcode, p.tests).map((seed) => ({ seed })),
  };
  if (p.orderMatters !== undefined) {
    content['orderMatters'] = p.orderMatters;
  } else {
    content['orderMatters'] = false;
  }
  if (checkColumnNames) {
    content['checkColumnNames'] = true;
  }
  if (p.floatTolerance !== undefined) {
    content['floatTolerance'] = p.floatTolerance;
  }
  if (p.checkQuery) {
    content['checkQuery'] = p.checkQuery;
  }
  return { type: 'sqlite', title: `${p.leetcode}. ${p.title}`, content };
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

const introModule = {
  schemaVersion: 1,
  title: 'Введение: SQLite и LeetCode SQL 50',
  steps: [
    {
      type: 'theory',
      title: 'Диалект SQLite и проверка',
      content:
        '## Курс LeetCode SQL 50\n\nЗадачи с [LeetCode Study Plan SQL 50](https://leetcode.com/studyplan/top-sql-50/) адаптированы под **SQLite 3** (sql.js в браузере).\n\n### Даты и время\n\n| MySQL | SQLite |\n|-------|--------|\n| `DATE_FORMAT(d, \'%Y-%m\')` | `strftime(\'%Y-%m\', d)` |\n| `DATEDIFF(a, b)` | `julianday(a) - julianday(b)` |\n| `DATE_ADD(d, INTERVAL 1 DAY)` | `DATE(d, \'+1 day\')` |\n\n### Строки и regex\n\n- `CONCAT(a, b)` → `a || b` или `printf(\'%s%s\', a, b)`\n- Оператор **`REGEXP`** в приложении — семантика **JavaScript** `RegExp` (регистрозависимый).\n\n### Проверка\n\n- Сравнивается **последний** result set с колонками.\n- **`checkColumnNames: true`** — имена столбцов как на LeetCode.\n- **`orderMatters: true`** — порядок строк важен.\n- **`checkQuery`** — для UPDATE/DELETE проверяется состояние таблиц после запроса.\n- Задачи «функция» (Nth Salary): параметр в таблице **`params`** через `seed`.\n\n### Ссылки\n\nВ каждой задаче — номер LeetCode и ссылка на оригинал.',
    },
    {
      type: 'svg',
      title: 'Схема: один кейс — новая БД',
      content: {
        caption: 'На каждый тест: **setup → seed → ваш SQL**',
        description: 'Temp-таблицы ученика не переносятся в следующий кейс.',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 70" width="100%" role="img" aria-label="Порядок проверки SQL"><rect id="lsq00-a" x="10" y="20" width="70" height="30" rx="3" fill="#fff9c4" stroke="#f9a825"/><text x="45" y="38" text-anchor="middle" font-size="8">setup</text><text x="115" y="38" font-size="14">→</text><rect id="lsq00-b" x="130" y="20" width="70" height="30" rx="3" fill="#e8f5e9" stroke="#2e7d32"/><text x="165" y="38" text-anchor="middle" font-size="8">seed</text><text x="235" y="38" font-size="14">→</text><rect id="lsq00-c" x="250" y="20" width="40" height="30" rx="3" fill="#e3f2fd" stroke="#1565c0"/><text x="270" y="38" text-anchor="middle" font-size="8">SQL</text></svg>',
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
        tests: [{ seed: '' }, { seed: 'INSERT INTO warmup VALUES (1);' }],
      },
    },
    {
      type: 'quiz',
      title: 'Итоговый тест модуля',
      content: {
        question: 'Как в SQLite получить разницу в днях между датами `a` и `b`?',
        options: [
          '`DATEDIFF(a, b)`',
          '`julianday(a) - julianday(b)`',
          '`DATE_DIFF(a, b)`',
          '`TIMESTAMPDIFF(DAY, b, a)`',
        ],
        correctIndices: [1],
      },
    },
  ],
};

import { MODULE_DEFS } from './leetcode-sql-50-modules-data.mts';
import {
  FORCE_CHECK_COLUMN_NAMES,
  mergeProblemTests,
} from './leetcode-sql-50-extra-seeds.mts';

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

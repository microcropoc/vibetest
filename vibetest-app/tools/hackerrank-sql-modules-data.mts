/**
 * Module data for HackerRank SQL Domain (vt-85).
 * Run: npm run generate:hackerrank-sql-course
 */

export type HackerrankProblem = {
  readonly slug: string;
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

export type ModuleDef = {
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
  readonly problems: readonly HackerrankProblem[];
};

const CITY_DDL =
  'CREATE TABLE CITY(ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, COUNTRYCODE TEXT NOT NULL, DISTRICT TEXT NOT NULL, POPULATION INTEGER NOT NULL);';

const STATION_DDL =
  'CREATE TABLE STATION(ID INTEGER PRIMARY KEY, CITY TEXT NOT NULL, STATE TEXT NOT NULL, LAT_N REAL NOT NULL, LONG_W REAL NOT NULL);';

const STUDENTS_DDL =
  'CREATE TABLE STUDENTS(ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, MARKS INTEGER NOT NULL);';

const EMPLOYEES_NAME_DDL = 'CREATE TABLE Employees(ID INTEGER PRIMARY KEY, Name TEXT NOT NULL);';

const EMPLOYEES_SALARY_DDL =
  'CREATE TABLE Employees(ID INTEGER PRIMARY KEY, Name TEXT NOT NULL, Salary INTEGER NOT NULL);';

/* ------------------------------------------------------------------ module 01 */

const basicSelectProblems: readonly HackerrankProblem[] = [
  {
    slug: 'revising-the-select-query',
    title: 'Revising the Select Query',
    description:
      'Выведите **все** поля из `CITY`, где `COUNTRYCODE = \'USA\'` и `POPULATION > 100000`.',
    setup: CITY_DDL,
    starterCode:
      "SELECT * FROM CITY WHERE COUNTRYCODE = 'USA' OR POPULATION > 100000;",
    referenceSolution:
      "SELECT * FROM CITY WHERE COUNTRYCODE = 'USA' AND POPULATION > 100000;",
    orderMatters: false,
    tests: [
      "INSERT INTO CITY VALUES (1,'NYC','USA','NY',8000000),(2,'Paris','FRA','Paris',2000000),(3,'LA','USA','CA',4000000),(4,'Boston','USA','MA',500000);",
      "INSERT INTO CITY VALUES (1,'Small','USA','X',50000);",
      "INSERT INTO CITY VALUES (1,'Big','DEU','Berlin',5000000);",
      "INSERT INTO CITY VALUES (1,'A','USA','D',150000),(2,'B','USA','D',150000);",
    ],
  },
  {
    slug: 'revising-the-select-query-ii',
    title: 'Revising the Select Query II',
    description:
      'Верните `NAME` и `COUNTRYCODE` для городов с `POPULATION > 120000` и `COUNTRYCODE = \'USA\'`. Сортировка по `NAME`.',
    setup: CITY_DDL,
    starterCode:
      "SELECT NAME, COUNTRYCODE FROM CITY WHERE POPULATION > 120000 AND COUNTRYCODE = 'USA' ORDER BY NAME DESC;",
    referenceSolution:
      "SELECT NAME, COUNTRYCODE FROM CITY WHERE POPULATION > 120000 AND COUNTRYCODE = 'USA' ORDER BY NAME;",
    orderMatters: true,
    tests: [
      "INSERT INTO CITY VALUES (1,'Scranton','USA','PA',50000),(2,'Portland','USA','OR',600000),(3,'Albany','USA','NY',90000);",
      "INSERT INTO CITY VALUES (1,'Zed','USA','X',200000),(2,'Ann','USA','X',200000);",
      "INSERT INTO CITY VALUES (1,'Solo','USA','X',150000);",
      "INSERT INTO CITY VALUES (1,'Tiny','USA','X',100000);",
    ],
  },
  {
    slug: 'select-all-sql',
    title: 'Select All',
    description: 'Выведите **все** столбцы и **все** строки таблицы `CITY`.',
    setup: CITY_DDL,
    starterCode: 'SELECT NAME FROM CITY;',
    referenceSolution: 'SELECT * FROM CITY;',
    orderMatters: false,
    tests: [
      "INSERT INTO CITY VALUES (1,'A','X','D',1);",
      "INSERT INTO CITY VALUES (1,'A','X','D',1),(2,'B','Y','E',2);",
      'SELECT 1;',
      "INSERT INTO CITY VALUES (9,'Z','ZZ','Z',999);",
    ],
  },
  {
    slug: 'select-by-id',
    title: 'Select by ID',
    description: 'Выведите все поля города с `ID = 1661`.',
    setup: CITY_DDL,
    starterCode: 'SELECT * FROM CITY WHERE ID = 1660;',
    referenceSolution: 'SELECT * FROM CITY WHERE ID = 1661;',
    orderMatters: false,
    tests: [
      "INSERT INTO CITY VALUES (1661,'Target','X','D',100);",
      "INSERT INTO CITY VALUES (1660,'Other','X','D',100),(1661,'Target','X','D',100);",
      "INSERT INTO CITY VALUES (1661,'A','Y','Z',1),(1662,'B','Y','Z',2);",
      "INSERT INTO CITY VALUES (1,'Only','X','D',1);",
    ],
  },
  {
    slug: 'japanese-cities-attributes',
    title: 'Japanese Cities\' Attributes',
    description: 'Все атрибуты городов с `COUNTRYCODE = \'JPN\'`.',
    setup: CITY_DDL,
    starterCode: "SELECT * FROM CITY WHERE COUNTRYCODE = 'JPN' OR COUNTRYCODE = 'CHN';",
    referenceSolution: "SELECT * FROM CITY WHERE COUNTRYCODE = 'JPN';",
    orderMatters: false,
    tests: [
      "INSERT INTO CITY VALUES (1,'Tokyo','JPN','Tokyo',9000000),(2,'Osaka','JPN','Osaka',3000000);",
      "INSERT INTO CITY VALUES (1,'Beijing','CHN','Beijing',20000000);",
      "INSERT INTO CITY VALUES (1,'Kyoto','JPN','Kyoto',1500000),(2,'Paris','FRA','Paris',2000000);",
      "INSERT INTO CITY VALUES (1,'Nagoya','JPN','Aichi',2300000);",
    ],
  },
  {
    slug: 'japanese-cities-names',
    title: 'Japanese Cities\' Names',
    description: 'Только `NAME` городов Японии (`COUNTRYCODE = \'JPN\'`).',
    setup: CITY_DDL,
    starterCode: "SELECT NAME, COUNTRYCODE FROM CITY WHERE COUNTRYCODE = 'JPN';",
    referenceSolution: "SELECT NAME FROM CITY WHERE COUNTRYCODE = 'JPN';",
    orderMatters: false,
    tests: [
      "INSERT INTO CITY VALUES (1,'Tokyo','JPN','Tokyo',9000000),(2,'Osaka','JPN','Osaka',3000000);",
      "INSERT INTO CITY VALUES (1,'Paris','FRA','Paris',2000000);",
      "INSERT INTO CITY VALUES (1,'Kyoto','JPN','Kyoto',1500000);",
      "INSERT INTO CITY VALUES (1,'A','JPN','D',1),(2,'B','JPN','D',2);",
    ],
  },
  {
    slug: 'weather-observation-station-1',
    title: 'Weather Observation Station 1',
    description:
      'Для записей с **чётным** `ID` верните `CITY` и `LONG_W` (как longitude). Сортировка по `ID`.',
    setup: STATION_DDL,
    starterCode:
      'SELECT CITY, LONG_W FROM STATION WHERE ID % 2 = 1 ORDER BY ID;',
    referenceSolution:
      'SELECT CITY, LONG_W FROM STATION WHERE ID % 2 = 0 ORDER BY ID;',
    orderMatters: true,
    tests: [
      "INSERT INTO STATION VALUES (1,'A','ST',10,20),(2,'B','ST',11,21),(3,'C','ST',12,22);",
      "INSERT INTO STATION VALUES (2,'Even','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'Odd','ST',1,1),(4,'Four','ST',2,2);",
      "INSERT INTO STATION VALUES (10,'Ten','ST',5,5);",
    ],
  },
  {
    slug: 'weather-observation-station-3',
    title: 'Weather Observation Station 3',
    description: '**Различные** `CITY` для станций с чётным `ID`.',
    setup: STATION_DDL,
    starterCode: 'SELECT CITY FROM STATION WHERE ID % 2 = 0;',
    referenceSolution: 'SELECT DISTINCT CITY FROM STATION WHERE ID % 2 = 0;',
    orderMatters: false,
    tests: [
      "INSERT INTO STATION VALUES (2,'Dup','ST',1,1),(4,'Dup','ST',2,2),(1,'Odd','ST',0,0);",
      "INSERT INTO STATION VALUES (2,'A','ST',1,1),(4,'B','ST',1,1);",
      "INSERT INTO STATION VALUES (1,'OnlyOdd','ST',0,0);",
      "INSERT INTO STATION VALUES (6,'Solo','ST',0,0);",
    ],
  },
  {
    slug: 'weather-observation-station-4',
    title: 'Weather Observation Station 4',
    description: 'Сколько городов (`CITY`) **начинаются с гласной** (A, E, I, O, U)?',
    setup: STATION_DDL,
    starterCode: "SELECT COUNT(*) FROM STATION WHERE CITY REGEXP '^[BCDFGHJKLMNPQRSTVWXYZ]';",
    referenceSolution: "SELECT COUNT(CITY) FROM STATION WHERE CITY REGEXP '^[AEIOUaeiou]';",
    orderMatters: false,
    tests: [
      "INSERT INTO STATION VALUES (1,'Apple','ST',0,0),(2,'Boston','ST',0,0),(3,'Eggs','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'Zed','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'Ulm','ST',0,0),(2,'Ulm','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'Alpha','ST',0,0),(2,'Beta','ST',0,0),(3,'Omega','ST',0,0),(4,'Chi','ST',0,0);",
    ],
  },
  {
    slug: 'weather-observation-station-5',
    title: 'Weather Observation Station 5',
    description:
      'Среди **северных** станций (`LAT_N > 0`) найдите город, **не** начинающийся с гласной, с **минимальным** именем по алфавиту. Одна строка `CITY`.',
    setup: STATION_DDL,
    starterCode:
      "SELECT CITY FROM STATION WHERE LAT_N > 0 AND CITY REGEXP '^[AEIOUaeiou]' ORDER BY CITY LIMIT 1;",
    referenceSolution:
      "SELECT CITY FROM STATION WHERE LAT_N > 0 AND CITY NOT REGEXP '^[AEIOUaeiou]' ORDER BY CITY LIMIT 1;",
    orderMatters: false,
    tests: [
      "INSERT INTO STATION VALUES (1,'Apple','ST',40,10),(2,'Boston','ST',42,-70),(3,'Zulu','ST',45,10);",
      "INSERT INTO STATION VALUES (1,'Alpha','ST',10,0),(2,'Beta','ST',20,0);",
      "INSERT INTO STATION VALUES (1,'Miami','ST',25,-80);",
      "INSERT INTO STATION VALUES (1,'Denver','ST',39,-105),(2,'Chicago','ST',41,-87);",
    ],
  },
  {
    slug: 'weather-observation-station-6',
    title: 'Weather Observation Station 6',
    description: 'Города, **не** начинающиеся с гласной. Сортировка по `CITY`.',
    setup: STATION_DDL,
    starterCode:
      "SELECT CITY FROM STATION WHERE CITY REGEXP '^[AEIOUaeiou]' ORDER BY CITY;",
    referenceSolution:
      "SELECT CITY FROM STATION WHERE CITY NOT REGEXP '^[AEIOUaeiou]' ORDER BY CITY;",
    orderMatters: true,
    tests: [
      "INSERT INTO STATION VALUES (1,'Apple','ST',0,0),(2,'Boston','ST',0,0),(3,'Eggs','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'Zed','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'Alpha','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'Beta','ST',0,0),(2,'Gamma','ST',0,0);",
    ],
  },
  {
    slug: 'weather-observation-station-7',
    title: 'Weather Observation Station 7',
    description: '**Различные** города, **заканчивающиеся** на гласную. Сортировка по `CITY`.',
    setup: STATION_DDL,
    starterCode: "SELECT CITY FROM STATION WHERE CITY REGEXP '[AEIOUaeiou]$' ORDER BY CITY;",
    referenceSolution:
      "SELECT DISTINCT CITY FROM STATION WHERE CITY REGEXP '[AEIOUaeiou]$' ORDER BY CITY;",
    orderMatters: true,
    tests: [
      "INSERT INTO STATION VALUES (1,'Alpha','ST',0,0),(2,'Alpha','ST',1,1),(3,'Beta','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'Zoo','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'End','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'A','ST',0,0),(2,'E','ST',0,0);",
    ],
  },
  {
    slug: 'weather-observation-station-8',
    title: 'Weather Observation Station 8',
    description:
      'Города с **северной** широтой (`LAT_N > 0`) и **восточной** долготой (`LONG_W > 0`). Сортировка по `CITY`.',
    setup: STATION_DDL,
    starterCode:
      'SELECT CITY FROM STATION WHERE LAT_N > 0 OR LONG_W > 0 ORDER BY CITY;',
    referenceSolution:
      'SELECT CITY FROM STATION WHERE LAT_N > 0 AND LONG_W > 0 ORDER BY CITY;',
    orderMatters: true,
    tests: [
      "INSERT INTO STATION VALUES (1,'A','ST',10,10),(2,'B','ST',-10,10),(3,'C','ST',10,-10);",
      "INSERT INTO STATION VALUES (1,'Only','ST',1,1);",
      "INSERT INTO STATION VALUES (1,'X','ST',5,5),(2,'Y','ST',5,5);",
      "INSERT INTO STATION VALUES (1,'Z','ST',-1,-1);",
    ],
  },
  {
    slug: 'weather-observation-station-9',
    title: 'Weather Observation Station 9',
    description:
      'Города с `LAT_N < 0` и `LONG_W > 0`. Верните `CITY`, `LAT_N` и `LONG_W`, округлённые до **2** знаков. Сортировка по `CITY`.',
    setup: STATION_DDL,
    starterCode:
      'SELECT CITY, LAT_N, LONG_W FROM STATION WHERE LAT_N < 0 OR LONG_W > 0 ORDER BY CITY;',
    referenceSolution:
      'SELECT CITY, ROUND(LAT_N, 2), ROUND(LONG_W, 2) FROM STATION WHERE LAT_N < 0 AND LONG_W > 0 ORDER BY CITY;',
    orderMatters: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO STATION VALUES (1,'A','ST',-33.456,77.891),(2,'B','ST',10,10);",
      "INSERT INTO STATION VALUES (1,'Solo','ST',-1.005,2.555);",
      "INSERT INTO STATION VALUES (1,'Z','ST',-0.1,0.1),(2,'Y','ST',-5.555,9.999);",
      "INSERT INTO STATION VALUES (1,'M','ST',5,5);",
    ],
  },
  {
    slug: 'weather-observation-station-10',
    title: 'Weather Observation Station 10',
    description:
      'Города **не** на экваторе (`LAT_N <> 0`). Сортировка: `LAT_N` по убыванию, затем `CITY` по возрастанию.',
    setup: STATION_DDL,
    starterCode: 'SELECT CITY FROM STATION WHERE LAT_N > 0 ORDER BY CITY;',
    referenceSolution:
      'SELECT CITY FROM STATION WHERE LAT_N <> 0 ORDER BY LAT_N DESC, CITY ASC;',
    orderMatters: true,
    tests: [
      "INSERT INTO STATION VALUES (1,'A','ST',10,0),(2,'B','ST',-5,0),(3,'C','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'North','ST',40,0),(2,'South','ST',-30,0);",
      "INSERT INTO STATION VALUES (1,'Eq','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'Z','ST',5,0),(2,'A','ST',5,0);",
    ],
  },
  {
    slug: 'weather-observation-station-11',
    title: 'Weather Observation Station 11',
    description: '**Различные** `CITY` не на экваторе. Сортировка по `CITY`.',
    setup: STATION_DDL,
    starterCode: 'SELECT CITY FROM STATION WHERE LAT_N <> 0 ORDER BY CITY;',
    referenceSolution:
      'SELECT DISTINCT CITY FROM STATION WHERE LAT_N <> 0 ORDER BY CITY;',
    orderMatters: true,
    tests: [
      "INSERT INTO STATION VALUES (1,'Dup','ST',10,0),(2,'Dup','ST',20,0),(3,'Eq','ST',0,0);",
      "INSERT INTO STATION VALUES (1,'A','ST',1,0);",
      "INSERT INTO STATION VALUES (1,'B','ST',-1,0),(2,'C','ST',2,0);",
      "INSERT INTO STATION VALUES (1,'OnlyEq','ST',0,0);",
    ],
  },
  {
    slug: 'weather-observation-station-12',
    title: 'Weather Observation Station 12',
    description:
      'Для каждой станции верните `CITY`, `LAT_N` и `LONG_W`, округлённые до **2** десятичных знаков. Сортировка по `ID`.',
    setup: STATION_DDL,
    starterCode: 'SELECT CITY, LAT_N, LONG_W FROM STATION WHERE ID < 0 ORDER BY ID;',
    referenceSolution:
      'SELECT CITY, ROUND(LAT_N, 2), ROUND(LONG_W, 2) FROM STATION ORDER BY ID;',
    orderMatters: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO STATION VALUES (1,'A','ST',33.4567,77.8912);",
      "INSERT INTO STATION VALUES (1,'B','ST',-1.005,2.5555),(2,'C','ST',0,0);",
      "INSERT INTO STATION VALUES (3,'D','ST',10.999,20.001);",
      "INSERT INTO STATION VALUES (1,'E','ST',0.004,0.006);",
    ],
  },
  {
    slug: 'higher-than-75-marks',
    title: 'Higher Than 75 Marks',
    description:
      'Имена студентов с `MARKS > 75`. Сортировка: `MARKS` по убыванию, `NAME` по возрастанию.',
    setup: STUDENTS_DDL,
    starterCode:
      'SELECT NAME FROM STUDENTS WHERE MARKS >= 75 ORDER BY MARKS DESC, NAME ASC;',
    referenceSolution:
      'SELECT NAME FROM STUDENTS WHERE MARKS > 75 ORDER BY MARKS DESC, NAME ASC;',
    orderMatters: true,
    tests: [
      "INSERT INTO STUDENTS VALUES (1,'Amy',80),(2,'Bob',76),(3,'Cal',75),(4,'Dan',90);",
      "INSERT INTO STUDENTS VALUES (1,'Zed',80),(2,'Ann',80);",
      "INSERT INTO STUDENTS VALUES (1,'Low',70);",
      "INSERT INTO STUDENTS VALUES (1,'Solo',100);",
    ],
  },
  {
    slug: 'employee-names',
    title: 'Employee Names',
    description: 'Имена сотрудников, **начинающиеся с гласной**. Сортировка по `Name`.',
    setup: EMPLOYEES_NAME_DDL,
    starterCode: "SELECT Name FROM Employees WHERE Name REGEXP '^[BCDFGHJKLMNPQRSTVWXYZ]' ORDER BY Name;",
    referenceSolution: "SELECT Name FROM Employees WHERE Name REGEXP '^[AEIOUaeiou]' ORDER BY Name;",
    orderMatters: true,
    tests: [
      "INSERT INTO Employees VALUES (1,'Amy'),(2,'Bob'),(3,'Eve');",
      "INSERT INTO Employees VALUES (1,'Zed');",
      "INSERT INTO Employees VALUES (1,'Anna'),(2,'Aaron');",
      "INSERT INTO Employees VALUES (1,'Ben');",
    ],
  },
  {
    slug: 'employee-salaries',
    title: 'Employee Salaries',
    description: 'Имена и зарплаты с `Salary > 2000`. Сортировка по `Salary`.',
    setup: EMPLOYEES_SALARY_DDL,
    starterCode: 'SELECT Name, Salary FROM Employees WHERE Salary >= 2000 ORDER BY Salary;',
    referenceSolution: 'SELECT Name, Salary FROM Employees WHERE Salary > 2000 ORDER BY Salary;',
    orderMatters: true,
    tests: [
      "INSERT INTO Employees VALUES (1,'A',2000),(2,'B',2001),(3,'C',1500);",
      "INSERT INTO Employees VALUES (1,'Solo',5000);",
      "INSERT INTO Employees VALUES (1,'X',2001),(2,'Y',3000);",
      "INSERT INTO Employees VALUES (1,'Low',1000);",
    ],
  },
];

/* ------------------------------------------------------------------ module 02 */

const TRIANGLES_DDL =
  'CREATE TABLE TRIANGLES(A INTEGER NOT NULL, B INTEGER NOT NULL, C INTEGER NOT NULL);';

const CUSTOMERS_DDL = 'CREATE TABLE Customers(Name TEXT NOT NULL);';

const OCCUPATIONS_DDL =
  'CREATE TABLE OCCUPATIONS(Occupation TEXT NOT NULL, Name TEXT NOT NULL);';

const BTREE_DDL = 'CREATE TABLE BTree(N INTEGER PRIMARY KEY, P INTEGER);';

const COMPANIES_DDL =
  'CREATE TABLE Companies(ID INTEGER PRIMARY KEY, Name TEXT NOT NULL, Founder TEXT NOT NULL);\nCREATE TABLE Lead_Company(Company_ID INTEGER NOT NULL, Lead_Company_ID INTEGER NOT NULL);';

const advancedSelectProblems: readonly HackerrankProblem[] = [
  {
    slug: 'what-type-of-triangle',
    title: 'The Type of Triangle',
    description:
      'Для каждой строки `TRIANGLES` верните тип: `Equilateral`, `Isosceles`, `Scalene` или `Not A Triangle`. Сортировка по `triangle_type`.',
    setup: TRIANGLES_DDL,
    starterCode:
      "SELECT CASE WHEN A = B AND B = C THEN 'Equilateral' ELSE 'Scalene' END AS triangle_type FROM TRIANGLES ORDER BY triangle_type;",
    referenceSolution:
      "SELECT CASE\n  WHEN A + B <= C OR A + C <= B OR B + C <= A THEN 'Not A Triangle'\n  WHEN A = B AND B = C THEN 'Equilateral'\n  WHEN A = B OR B = C OR A = C THEN 'Isosceles'\n  ELSE 'Scalene'\nEND AS triangle_type\nFROM TRIANGLES\nORDER BY triangle_type;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO TRIANGLES VALUES (2,2,3),(3,3,4),(4,5,6),(1,2,3);',
      'INSERT INTO TRIANGLES VALUES (1,1,1);',
      'INSERT INTO TRIANGLES VALUES (1,2,10);',
      'INSERT INTO TRIANGLES VALUES (5,5,5),(4,4,7);',
    ],
  },
  {
    slug: 'the-pads',
    title: 'The PADS',
    description:
      'Для каждого `Name` в `Customers`: слева дополните `-` до ширины `2*LENGTH(Name)-1`, справа дополните `|` до той же ширины; склеить. Сортировка по `Name`.',
    setup: CUSTOMERS_DDL,
    starterCode: "SELECT Name FROM Customers ORDER BY Name;",
    referenceSolution:
      "SELECT\n  SUBSTR('----------', 1, LENGTH(Name) - 1) || Name ||\n  SUBSTR(Name || '||||||||||', 1, 2 * LENGTH(Name) - 1)\nFROM Customers\nORDER BY Name;",
    orderMatters: true,
    tests: [
      "INSERT INTO Customers VALUES ('Julia'),('Maria'),('Sam');",
      "INSERT INTO Customers VALUES ('A');",
      "INSERT INTO Customers VALUES ('Bob'),('Amy');",
      "INSERT INTO Customers VALUES ('Zed');",
    ],
  },
  {
    slug: 'occupations',
    title: 'Occupations',
    description:
      'Разверните `OCCUPATIONS` в четыре колонки: `Doctor`, `Professor`, `Singer`, `Actor` — имена в алфавитном порядке по профессиям, строки выровнены по порядковому номеру внутри профессии.',
    setup: OCCUPATIONS_DDL,
    starterCode:
      "SELECT Occupation, Name FROM OCCUPATIONS ORDER BY Occupation, Name;",
    referenceSolution:
      "SELECT\n  MIN(CASE WHEN Occupation = 'Doctor' THEN Name END) AS Doctor,\n  MIN(CASE WHEN Occupation = 'Professor' THEN Name END) AS Professor,\n  MIN(CASE WHEN Occupation = 'Singer' THEN Name END) AS Singer,\n  MIN(CASE WHEN Occupation = 'Actor' THEN Name END) AS Actor\nFROM (\n  SELECT Occupation, Name,\n    ROW_NUMBER() OVER (PARTITION BY Occupation ORDER BY Name) AS rn\n  FROM OCCUPATIONS\n) t\nGROUP BY rn\nORDER BY rn;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO OCCUPATIONS VALUES ('Doctor','Ashley'),('Singer','Jane'),('Actor','Julia'),('Actor','Belinda'),('Doctor','Pam'),('Actor','Jenny'),('Doctor','Meera'),('Professor','Marie'),('Professor','Jean'),('Professor','Samuel'),('Doctor','Alice'),('Professor','Myron'),('Singer','Kristen'),('Professor','Ian');",
      "INSERT INTO OCCUPATIONS VALUES ('Doctor','Amy'),('Professor','Ben');",
      "INSERT INTO OCCUPATIONS VALUES ('Singer','A'),('Singer','B'),('Actor','C');",
      "INSERT INTO OCCUPATIONS VALUES ('Doctor','Zed'),('Doctor','Ann');",
    ],
  },
  {
    slug: 'binary-tree-nodes',
    title: 'Binary Tree Nodes',
    description:
      'Для каждого узла `BTree` (`N`, родитель `P`) верните колонки **`N`**, **`Type`**: `Root`, `Inner` или `Leaf`. Сортировка по `N`.',
    setup: BTREE_DDL,
    starterCode:
      "SELECT N, 'Leaf' AS Type FROM BTree ORDER BY N;",
    referenceSolution:
      "SELECT N,\n  CASE\n    WHEN P IS NULL THEN 'Root'\n    WHEN N IN (SELECT P FROM BTree WHERE P IS NOT NULL) THEN 'Inner'\n    ELSE 'Leaf'\n  END AS Type\nFROM BTree\nORDER BY N;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO BTree VALUES (1,NULL),(2,1),(3,1),(4,2),(5,2);',
      'INSERT INTO BTree VALUES (1,NULL),(2,1);',
      'INSERT INTO BTree VALUES (10,NULL);',
      'INSERT INTO BTree VALUES (1,NULL),(3,1);',
    ],
  },
  {
    slug: 'new-companies',
    title: 'New Companies',
    description:
      'По каждому **`Founder`**: число **различных** имён компаний (**`Companies`**) и число **различных** **`Lead_Company_ID`** (**`Lead_Companies`**). Сортировка по `Founder`.',
    setup: COMPANIES_DDL,
    starterCode:
      'SELECT Founder AS Founder, COUNT(Name) AS Companies, COUNT(Lead_Company_ID) AS Lead_Companies FROM Companies JOIN Lead_Company ON Companies.ID = Lead_Company.Company_ID GROUP BY Founder ORDER BY Founder;',
    referenceSolution:
      'SELECT C.Founder,\n  COUNT(DISTINCT C.Name) AS Companies,\n  COUNT(DISTINCT L.Lead_Company_ID) AS Lead_Companies\nFROM Companies C\nLEFT JOIN Lead_Company L ON L.Company_ID = C.ID\nGROUP BY C.Founder\nORDER BY C.Founder;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Companies VALUES (1,'A','Alice'),(2,'B','Alice'),(3,'C','Bob');\nINSERT INTO Lead_Company VALUES (1,10),(1,11),(2,10),(3,20);",
      "INSERT INTO Companies VALUES (1,'Solo','X');",
      "INSERT INTO Companies VALUES (1,'A','F'),(2,'A','F');\nINSERT INTO Lead_Company VALUES (1,5);",
      "INSERT INTO Companies VALUES (1,'Z','Y'),(2,'W','Y');\nINSERT INTO Lead_Company VALUES (1,1),(2,2);",
    ],
  },
];

/* ------------------------------------------------------------------ module 03 */

const EMPLOYEES_HR_DDL =
  'CREATE TABLE EMPLOYEES(ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, SALARY INTEGER NOT NULL);';

const aggregationProblems: readonly HackerrankProblem[] = [
  {
    slug: 'revising-aggregations-the-count-function',
    title: 'Revising Aggregations - The Count Function',
    description: 'Сколько записей в таблице `CITY`? Одно число.',
    setup: CITY_DDL,
    starterCode: 'SELECT COUNT(DISTINCT NAME) FROM CITY;',
    referenceSolution: 'SELECT COUNT(*) FROM CITY;',
    orderMatters: false,
    tests: [
      "INSERT INTO CITY VALUES (1,'A','X','D',1),(2,'B','X','D',2);",
      "INSERT INTO CITY VALUES (1,'Solo','X','D',1);",
      'SELECT 1;',
      "INSERT INTO CITY VALUES (1,'A','X','D',1),(2,'A','X','D',2);",
    ],
  },
  {
    slug: 'revising-aggregations-the-sum-function',
    title: 'Revising Aggregations - The Sum Function',
    description: 'Сумма `POPULATION` всех городов с `COUNTRYCODE = \'JPN\'`.',
    setup: CITY_DDL,
    starterCode: "SELECT SUM(POPULATION) FROM CITY WHERE COUNTRYCODE = 'CHN';",
    referenceSolution: "SELECT SUM(POPULATION) FROM CITY WHERE COUNTRYCODE = 'JPN';",
    orderMatters: false,
    tests: [
      "INSERT INTO CITY VALUES (1,'Tokyo','JPN','T',9000000),(2,'Osaka','JPN','O',3000000);",
      "INSERT INTO CITY VALUES (1,'Beijing','CHN','B',20000000);",
      "INSERT INTO CITY VALUES (1,'Kyoto','JPN','K',1500000);",
      "INSERT INTO CITY VALUES (1,'A','JPN','D',100),(2,'B','JPN','D',200);",
    ],
  },
  {
    slug: 'revising-aggregations-averages',
    title: 'Revising Aggregations - Averages',
    description:
      'Средняя `POPULATION` всех городов, **округлённая вниз** до целого (`CAST(AVG(...) AS INTEGER)`).',
    setup: CITY_DDL,
    starterCode: 'SELECT ROUND(AVG(POPULATION)) FROM CITY;',
    referenceSolution: 'SELECT CAST(AVG(POPULATION) AS INTEGER) FROM CITY;',
    orderMatters: false,
    tests: [
      "INSERT INTO CITY VALUES (1,'A','X','D',100),(2,'B','X','D',101);",
      "INSERT INTO CITY VALUES (1,'A','X','D',10),(2,'B','X','D',11),(3,'C','X','D',12);",
      "INSERT INTO CITY VALUES (1,'Solo','X','D',999);",
      "INSERT INTO CITY VALUES (1,'A','X','D',1),(2,'B','X','D',2);",
    ],
  },
  {
    slug: 'average-population',
    title: 'Average Population',
    description:
      'Для каждой пары (`NAME` города как `CITY`, `DISTRICT`) средняя `POPULATION`, округлённая **вниз** до целого. Сортировка по `CITY`, затем `DISTRICT`.',
    setup: CITY_DDL,
    starterCode:
      'SELECT NAME, DISTRICT, AVG(POPULATION) FROM CITY GROUP BY NAME, DISTRICT ORDER BY NAME, DISTRICT;',
    referenceSolution:
      'SELECT NAME AS CITY, DISTRICT, CAST(AVG(POPULATION) AS INTEGER) FROM CITY GROUP BY NAME, DISTRICT ORDER BY NAME, DISTRICT;',
    orderMatters: true,
    tests: [
      "INSERT INTO CITY VALUES (1,'A','X','D1',100),(2,'A','X','D1',200),(3,'A','X','D2',300);",
      "INSERT INTO CITY VALUES (1,'B','X','X',50);",
      "INSERT INTO CITY VALUES (1,'Z','X','D',10),(2,'Z','X','D',11);",
      "INSERT INTO CITY VALUES (1,'M','X','N',1),(2,'M','X','N',2),(3,'M','X','O',10);",
    ],
  },
  {
    slug: 'japan-population',
    title: 'Japan Population',
    description:
      'Сумма населения по каждому `DISTRICT` для `COUNTRYCODE = \'JPN\'`. Сортировка по `DISTRICT`.',
    setup: CITY_DDL,
    starterCode:
      "SELECT DISTRICT, SUM(POPULATION) FROM CITY WHERE COUNTRYCODE = 'CHN' GROUP BY DISTRICT ORDER BY DISTRICT;",
    referenceSolution:
      "SELECT DISTRICT, SUM(POPULATION) FROM CITY WHERE COUNTRYCODE = 'JPN' GROUP BY DISTRICT ORDER BY DISTRICT;",
    orderMatters: true,
    tests: [
      "INSERT INTO CITY VALUES (1,'Tokyo','JPN','Tokyo',9000000),(2,'Osaka','JPN','Osaka',3000000);",
      "INSERT INTO CITY VALUES (1,'Kyoto','JPN','Kyoto',1500000),(2,'Nara','JPN','Kyoto',500000);",
      "INSERT INTO CITY VALUES (1,'A','CHN','X',1);",
      "INSERT INTO CITY VALUES (1,'S','JPN','Solo',100);",
    ],
  },
  {
    slug: 'population-density-difference',
    title: 'Population Density Difference',
    description:
      'Разница между **максимальной** и **минимальной** плотностью (`POPULATION / SURFACEAREA`) среди стран `CONTINENT = \'Asia\'`. Округлите до ближайшего целого.',
    setup:
      'CREATE TABLE COUNTRY(CODE TEXT PRIMARY KEY, NAME TEXT NOT NULL, CONTINENT TEXT NOT NULL, REGION TEXT NOT NULL, SURFACEAREA REAL NOT NULL);\nCREATE TABLE CITY(ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, COUNTRYCODE TEXT NOT NULL, DISTRICT TEXT NOT NULL, POPULATION INTEGER NOT NULL);',
    starterCode:
      "SELECT MAX(C.POPULATION * 1.0 / CO.SURFACEAREA) - MIN(C.POPULATION * 1.0 / CO.SURFACEAREA) FROM CITY C JOIN COUNTRY CO ON C.COUNTRYCODE = CO.CODE WHERE CO.CONTINENT = 'Europe';",
    referenceSolution:
      "SELECT CAST(ROUND(\n  MAX(C.POPULATION * 1.0 / CO.SURFACEAREA) - MIN(C.POPULATION * 1.0 / CO.SURFACEAREA)\n) AS INTEGER)\nFROM CITY C\nJOIN COUNTRY CO ON C.COUNTRYCODE = CO.CODE\nWHERE CO.CONTINENT = 'Asia';",
    orderMatters: false,
    tests: [
      "INSERT INTO COUNTRY VALUES ('A1','Big','Asia','R',1000),('A2','Small','Asia','R',500);\nINSERT INTO CITY VALUES (1,'C1','A1','D',500000),(2,'C2','A2','D',100000);",
      "INSERT INTO COUNTRY VALUES ('X','Only','Asia','R',100);\nINSERT INTO CITY VALUES (1,'T','X','D',1000);",
      "INSERT INTO COUNTRY VALUES ('A','A','Asia','R',10),('B','B','Europe','R',10);\nINSERT INTO CITY VALUES (1,'T','A','D',100),(2,'U','B','D',100);",
      "INSERT INTO COUNTRY VALUES ('P','P','Asia','R',200),('Q','Q','Asia','R',400);\nINSERT INTO CITY VALUES (1,'a','P','d',1000),(2,'b','Q','d',8000);",
    ],
  },
  {
    slug: 'the-blunder',
    title: 'The Blunder',
    description:
      'Сamantha посчитала среднюю зарплату, **удалив все нули** из строкового представления зарплаты. Верните `CEIL(истинное среднее) - CEIL(искажённое среднее)`.',
    setup: EMPLOYEES_HR_DDL,
    starterCode: 'SELECT CEIL(AVG(SALARY)) FROM EMPLOYEES;',
    referenceSolution:
      "SELECT CEIL(AVG(SALARY)) - CEIL(AVG(CAST(REPLACE(CAST(SALARY AS TEXT), '0', '') AS REAL)))\nFROM EMPLOYEES\nWHERE REPLACE(CAST(SALARY AS TEXT), '0', '') <> '';",
    orderMatters: false,
    tests: [
      'INSERT INTO EMPLOYEES VALUES (1,"A",1000),(2,"B",2000),(3,"C",3000);',
      'INSERT INTO EMPLOYEES VALUES (1,"X",1010),(2,"Y",2020);',
      'INSERT INTO EMPLOYEES VALUES (1,"S",5050);',
      'INSERT INTO EMPLOYEES VALUES (1,"A",100),(2,"B",200);',
    ],
  },
  {
    slug: 'top-earners',
    title: 'Top Earners',
    description:
      'Максимальная зарплата и число сотрудников с **этой** зарплатой. Колонки: `salary`, `count`.',
    setup: EMPLOYEES_HR_DDL,
    starterCode:
      'SELECT MAX(SALARY) AS salary, COUNT(*) AS count FROM EMPLOYEES;',
    referenceSolution:
      'SELECT SALARY AS salary, COUNT(*) AS count FROM EMPLOYEES GROUP BY SALARY ORDER BY salary DESC LIMIT 1;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO EMPLOYEES VALUES (1,"A",100),(2,"B",200),(3,"C",200);',
      'INSERT INTO EMPLOYEES VALUES (1,"S",500);',
      'INSERT INTO EMPLOYEES VALUES (1,"A",10),(2,"B",20),(3,"C",20);',
      'INSERT INTO EMPLOYEES VALUES (1,"X",1),(2,"Y",2);',
    ],
  },
  {
    slug: 'weather-observation-station-2',
    title: 'Weather Observation Station 2',
    description:
      'Средние `LAT_N` и `LONG_W` по таблице `STATION`, каждое округлено до **2** знаков.',
    setup: STATION_DDL,
    starterCode: 'SELECT ROUND(AVG(LAT_N), 0), ROUND(AVG(LONG_W), 0) FROM STATION;',
    referenceSolution:
      'SELECT ROUND(AVG(LAT_N), 2), ROUND(AVG(LONG_W), 2) FROM STATION;',
    orderMatters: false,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO STATION VALUES (1,"A","S",10,20),(2,"B","S",20,30);',
      'INSERT INTO STATION VALUES (1,"S","S",1.005,2.555);',
      'INSERT INTO STATION VALUES (1,"X","S",0,0);',
      'INSERT INTO STATION VALUES (1,"A","S",-5,5),(2,"B","S",5,-5);',
    ],
  },
  {
    slug: 'weather-observation-station-13',
    title: 'Weather Observation Station 13',
    description:
      'Сумма `LAT_N` по `STATION`, **исключив** глобальный минимум и максимум широты.',
    setup: STATION_DDL,
    starterCode: 'SELECT SUM(LAT_N) FROM STATION;',
    referenceSolution:
      'SELECT SUM(LAT_N) FROM STATION WHERE LAT_N NOT IN (SELECT MIN(LAT_N) FROM STATION UNION SELECT MAX(LAT_N) FROM STATION);',
    orderMatters: false,
    tests: [
      'INSERT INTO STATION VALUES (1,"A","S",1,0),(2,"B","S",5,0),(3,"C","S",10,0);',
      'INSERT INTO STATION VALUES (1,"S","S",7,0);',
      'INSERT INTO STATION VALUES (1,"A","S",0,0),(2,"B","S",10,0);',
      'INSERT INTO STATION VALUES (1,"X","S",2,0),(2,"Y","S",3,0),(3,"Z","S",4,0);',
    ],
  },
  {
    slug: 'weather-observation-station-14',
    title: 'Weather Observation Station 14',
    description:
      'Средняя `LAT_N` (округлить до **2** знаков) среди станций с `LAT_N > 38.2445`. Одно число.',
    setup: STATION_DDL,
    starterCode:
      'SELECT ROUND(AVG(LAT_N), 2) FROM STATION WHERE LAT_N > 38.2445 AND LONG_W > 0;',
    referenceSolution:
      'SELECT ROUND(AVG(LAT_N), 2) FROM STATION WHERE LAT_N > 38.2445;',
    orderMatters: false,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO STATION VALUES (1,"Low","S",30,0),(2,"High","S",40,0),(3,"Mid","S",39,0);',
      'INSERT INTO STATION VALUES (1,"A","S",38.3,0);',
      'INSERT INTO STATION VALUES (1,"Top","S",50,0),(2,"Next","S",45,0);',
      'INSERT INTO STATION VALUES (1,"Solo","S",39.5,0);',
    ],
  },
  {
    slug: 'weather-observation-station-15',
    title: 'Weather Observation Station 15',
    description:
      'Город с **максимальной** `LAT_N` среди **западного полушария** (`LONG_W < 0`) и **северного** (`LAT_N > 0`). Колонки `CITY`, `LAT_N`, `LONG_W`.',
    setup: STATION_DDL,
    starterCode:
      'SELECT CITY, LAT_N, LONG_W FROM STATION WHERE LONG_W < 0 ORDER BY LAT_N LIMIT 1;',
    referenceSolution:
      'SELECT CITY, LAT_N, LONG_W FROM STATION WHERE LONG_W < 0 AND LAT_N > 0 ORDER BY LAT_N DESC LIMIT 1;',
    orderMatters: false,
    tests: [
      'INSERT INTO STATION VALUES (1,"A","S",40,-70),(2,"B","S",30,-80),(3,"C","S",50,10);',
      'INSERT INTO STATION VALUES (1,"South","S",-10,-50);',
      'INSERT INTO STATION VALUES (1,"Win","S",45,-100),(2,"Lose","S",44,-100);',
      'INSERT INTO STATION VALUES (1,"Only","S",10,-1);',
    ],
  },
  {
    slug: 'weather-observation-station-16',
    title: 'Weather Observation Station 16',
    description:
      'Станции с `LAT_N > 38.7880` и `LONG_W > 77.2318`. `LAT_N` — целая часть (truncate), `LONG_W` — округление **вверх** до 2 знаков (`CEIL(x*100)/100.0`). Сортировка по `LAT_N`.',
    setup: STATION_DDL,
    starterCode:
      'SELECT ROUND(LAT_N, 2), ROUND(LONG_W, 2) FROM STATION WHERE LAT_N > 38.7880 AND LONG_W > 77.2318 ORDER BY LAT_N;',
    referenceSolution:
      'SELECT CAST(LAT_N AS INTEGER) AS LAT_N, CEIL(LONG_W * 100) / 100.0 AS LONG_W FROM STATION WHERE LAT_N > 38.7880 AND LONG_W > 77.2318 ORDER BY LAT_N;',
    orderMatters: true,
    floatTolerance: 0.02,
    tests: [
      'INSERT INTO STATION VALUES (1,"A","S",40.123,80.456);',
      'INSERT INTO STATION VALUES (1,"A","S",39.9,78.1),(2,"B","S",50.2,90.0);',
      'INSERT INTO STATION VALUES (1,"X","S",38,77);',
      'INSERT INTO STATION VALUES (1,"P","S",45.999,88.001);',
    ],
  },
  {
    slug: 'weather-observation-station-17',
    title: 'Weather Observation Station 17',
    description:
      'Сумма `LAT_N` для станций с `LAT_N` между `38.7880` и `137.234` и `LONG_W` между `-122.477` и `-45.756` (включительно). Округлите до **2** знаков.',
    setup: STATION_DDL,
    starterCode:
      'SELECT SUM(LAT_N) FROM STATION WHERE LAT_N > 38.7880 AND LAT_N < 137.234;',
    referenceSolution:
      'SELECT ROUND(SUM(LAT_N), 2) FROM STATION WHERE LAT_N BETWEEN 38.7880 AND 137.234 AND LONG_W BETWEEN -122.477 AND -45.756;',
    orderMatters: false,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO STATION VALUES (1,"A","S",40,-100),(2,"B","S",50,-90);',
      'INSERT INTO STATION VALUES (1,"Out","S",10,10);',
      'INSERT INTO STATION VALUES (1,"Edge","S",38.788,-122.477);',
      'INSERT INTO STATION VALUES (1,"X","S",100,0);',
    ],
  },
  {
    slug: 'weather-observation-station-18',
    title: 'Weather Observation Station 18',
    description:
      'Города **не** из Калифорнии (`STATE <> \'CA\'`). Сортировка по `CITY`.',
    setup: STATION_DDL,
    starterCode: "SELECT CITY FROM STATION WHERE STATE = 'CA' ORDER BY CITY;",
    referenceSolution: "SELECT CITY FROM STATION WHERE STATE <> 'CA' ORDER BY CITY;",
    orderMatters: true,
    tests: [
      "INSERT INTO STATION VALUES (1,'LA','CA',0,0),(2,'NY','NY',0,0);",
      "INSERT INTO STATION VALUES (1,'OnlyCA','CA',0,0);",
      "INSERT INTO STATION VALUES (1,'A','TX',0,0),(2,'B','TX',0,0);",
      "INSERT INTO STATION VALUES (1,'Z','FL',0,0);",
    ],
  },
  {
    slug: 'weather-observation-station-19',
    title: 'Weather Observation Station 19',
    description:
      'Разница между `(MAX(LAT_N) - MIN(LAT_N))` и `(MAX(LONG_W) - MIN(LONG_W))` по `STATION`. Округлите до **4** знаков.',
    setup: STATION_DDL,
    starterCode:
      'SELECT MAX(LAT_N) - MIN(LAT_N) FROM STATION;',
    referenceSolution:
      'SELECT ROUND((MAX(LAT_N) - MIN(LAT_N)) - (MAX(LONG_W) - MIN(LONG_W)), 4) FROM STATION;',
    orderMatters: false,
    floatTolerance: 0.0001,
    tests: [
      'INSERT INTO STATION VALUES (1,"A","S",0,0),(2,"B","S",10,5);',
      'INSERT INTO STATION VALUES (1,"S","S",7,3);',
      'INSERT INTO STATION VALUES (1,"A","S",-5,10),(2,"B","S",5,-10);',
      'INSERT INTO STATION VALUES (1,"X","S",1,1),(2,"Y","S",2,4);',
    ],
  },
  {
    slug: 'weather-observation-station-20',
    title: 'Weather Observation Station 20',
    description:
      '**Медиана** `LAT_N` для северных станций (`LAT_N > 0`). Одно число, округлённое до **4** знаков (нижний средний элемент при чётном числе строк).',
    setup: STATION_DDL,
    starterCode: 'SELECT AVG(LAT_N) FROM STATION WHERE LAT_N > 0;',
    referenceSolution:
      'SELECT ROUND(\n  (SELECT LAT_N FROM STATION WHERE LAT_N > 0 ORDER BY LAT_N LIMIT 1 OFFSET (SELECT (COUNT(*) - 1) / 2 FROM STATION WHERE LAT_N > 0)),\n  4\n);',
    orderMatters: false,
    floatTolerance: 0.0001,
    tests: [
      'INSERT INTO STATION VALUES (1,"A","S",1,0),(2,"B","S",3,0),(3,"C","S",5,0);',
      'INSERT INTO STATION VALUES (1,"S","S",10,0);',
      'INSERT INTO STATION VALUES (1,"A","S",2,0),(2,"B","S",4,0),(3,"C","S",6,0),(4,"D","S",8,0);',
      'INSERT INTO STATION VALUES (1,"N","S",-1,0),(2,"P","S",7,0);',
    ],
  },
];

/* ------------------------------------------------------------------ module 04 */

const COUNTRY_CITY_DDL =
  'CREATE TABLE COUNTRY(CODE TEXT PRIMARY KEY, NAME TEXT NOT NULL, CONTINENT TEXT NOT NULL, REGION TEXT NOT NULL, SURFACEAREA REAL NOT NULL);\nCREATE TABLE CITY(ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, COUNTRYCODE TEXT NOT NULL, DISTRICT TEXT NOT NULL, POPULATION INTEGER NOT NULL);';

const basicJoinProblems: readonly HackerrankProblem[] = [
  {
    slug: 'population-census',
    title: 'Population Census',
    description:
      'Сумма `POPULATION` городов стран, у которых `NAME` **начинается с `P`** (таблицы `CITY`, `COUNTRY`).',
    setup: COUNTRY_CITY_DDL,
    starterCode:
      "SELECT SUM(C.POPULATION) FROM CITY C JOIN COUNTRY CO ON C.COUNTRYCODE = CO.CODE WHERE CO.NAME LIKE 'A%';",
    referenceSolution:
      "SELECT SUM(C.POPULATION) FROM CITY C JOIN COUNTRY CO ON C.COUNTRYCODE = CO.CODE WHERE CO.NAME LIKE 'P%';",
    orderMatters: false,
    tests: [
      "INSERT INTO COUNTRY VALUES ('PA','Pakistan','Asia','South',800000);\nINSERT INTO CITY VALUES (1,'Karachi','PA','S',15000000);",
      "INSERT INTO COUNTRY VALUES ('US','United States','North America','NA',9000000);\nINSERT INTO CITY VALUES (1,'NYC','US','NY',8000000);",
      "INSERT INTO COUNTRY VALUES ('PT','Portugal','Europe','E',90000),('FR','France','Europe','E',500000);\nINSERT INTO CITY VALUES (1,'Lisbon','PT','L',500000),(2,'Paris','FR','P',2000000);",
      "INSERT INTO COUNTRY VALUES ('PL','Poland','Europe','E',300000);\nINSERT INTO CITY VALUES (1,'Warsaw','PL','M',1700000);",
    ],
  },
  {
    slug: 'african-cities',
    title: 'African Cities',
    description:
      'Имена городов (`City`) в **Africa** (`CONTINENT = \'Africa\'`). Сортировка по `City`.',
    setup:
      'CREATE TABLE COUNTRY(CODE TEXT PRIMARY KEY, NAME TEXT NOT NULL, CONTINENT TEXT NOT NULL, REGION TEXT NOT NULL);\nCREATE TABLE CITY(ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, COUNTRYCODE TEXT NOT NULL, DISTRICT TEXT NOT NULL, POPULATION INTEGER NOT NULL);',
    starterCode:
      "SELECT CITY.NAME FROM CITY JOIN COUNTRY ON CITY.COUNTRYCODE = COUNTRY.CODE WHERE COUNTRY.CONTINENT = 'Asia' ORDER BY CITY.NAME;",
    referenceSolution:
      "SELECT CITY.NAME AS City FROM CITY JOIN COUNTRY ON CITY.COUNTRYCODE = COUNTRY.CODE WHERE COUNTRY.CONTINENT = 'Africa' ORDER BY CITY.NAME;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO COUNTRY VALUES ('EG','Egypt','Africa','North');\nINSERT INTO CITY VALUES (1,'Cairo','EG','C',9000000);",
      "INSERT INTO COUNTRY VALUES ('JP','Japan','Asia','East');\nINSERT INTO CITY VALUES (1,'Tokyo','JP','T',9000000);",
      "INSERT INTO COUNTRY VALUES ('ZA','South Africa','Africa','South'),('NG','Nigeria','Africa','West');\nINSERT INTO CITY VALUES (1,'Joburg','ZA','G',4000000),(2,'Lagos','NG','L',10000000);",
      "INSERT INTO COUNTRY VALUES ('KE','Kenya','Africa','East');\nINSERT INTO CITY VALUES (1,'Nairobi','KE','N',3000000);",
    ],
  },
  {
    slug: 'average-population-of-each-continent',
    title: 'Average Population of Each Continent',
    description:
      'По каждому `CONTINENT`: средняя `POPULATION` городов, **округлённая вниз** до целого. Сортировка по `CONTINENT`.',
    setup: COUNTRY_CITY_DDL,
    starterCode:
      'SELECT CO.CONTINENT, AVG(C.POPULATION) FROM CITY C JOIN COUNTRY CO ON C.COUNTRYCODE = CO.CODE GROUP BY CO.CONTINENT ORDER BY CO.CONTINENT DESC;',
    referenceSolution:
      'SELECT CO.CONTINENT, CAST(AVG(C.POPULATION) AS INTEGER) FROM CITY C JOIN COUNTRY CO ON C.COUNTRYCODE = CO.CODE GROUP BY CO.CONTINENT ORDER BY CO.CONTINENT;',
    orderMatters: true,
    tests: [
      "INSERT INTO COUNTRY VALUES ('A','A','Asia','R',1),('B','B','Europe','R',1);\nINSERT INTO CITY VALUES (1,'X','A','D',100),(2,'Y','A','D',200),(3,'Z','B','D',50);",
      "INSERT INTO COUNTRY VALUES ('C','C','Africa','R',1);\nINSERT INTO CITY VALUES (1,'Solo','C','D',999);",
      "INSERT INTO COUNTRY VALUES ('U','U','North America','R',1);\nINSERT INTO CITY VALUES (1,'A','U','D',10),(2,'B','U','D',20);",
      "INSERT INTO COUNTRY VALUES ('P','P','Asia','R',1),('Q','Q','Asia','R',1);\nINSERT INTO CITY VALUES (1,'a','P','d',1),(2,'b','Q','d',3);",
    ],
  },
  {
    slug: 'the-report',
    title: 'The Report',
    description:
      'Для каждого студента с `MARKS > 0` верните **`Grade`**, **`NAME`**. Шкала: `MARKS >= 90 → 1`, `>= 80 → 2`, `>= 70 → 3`, `>= 60 → 4`, `>= 50 → 5`, `>= 40 → 6`, `>= 30 → 7`, `>= 20 → 8`, `>= 10 → 9`, `< 10 → 10`. Сортировка: `Grade` возр., `NAME` возр.',
    setup: STUDENTS_DDL,
    starterCode:
      'SELECT MARKS, NAME FROM STUDENTS WHERE MARKS > 0 ORDER BY MARKS DESC, NAME;',
    referenceSolution:
      "SELECT\n  CASE\n    WHEN MARKS >= 90 THEN 1\n    WHEN MARKS >= 80 THEN 2\n    WHEN MARKS >= 70 THEN 3\n    WHEN MARKS >= 60 THEN 4\n    WHEN MARKS >= 50 THEN 5\n    WHEN MARKS >= 40 THEN 6\n    WHEN MARKS >= 30 THEN 7\n    WHEN MARKS >= 20 THEN 8\n    WHEN MARKS >= 10 THEN 9\n    ELSE 10\n  END AS Grade,\n  NAME\nFROM STUDENTS\nWHERE MARKS > 0\nORDER BY Grade ASC, NAME ASC;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO STUDENTS VALUES (1,'Amy',90),(2,'Bob',82),(3,'Cal',67);",
      "INSERT INTO STUDENTS VALUES (1,'Zed',95),(2,'Ann',95);",
      "INSERT INTO STUDENTS VALUES (1,'Zero',0),(2,'Low',5);",
      "INSERT INTO STUDENTS VALUES (1,'A',100);",
    ],
  },
  {
    slug: 'top-competitors',
    title: 'Top Competitors',
    description:
      'Студенты с `MARKS >= 70`: `Name` и метка **`The Minion(s)`**, иначе **`The Coffee Bean(s)`**. Сортировка по `Name`.',
    setup: STUDENTS_DDL,
    starterCode:
      "SELECT NAME, 'The Coffee Bean(s)' FROM STUDENTS ORDER BY NAME;",
    referenceSolution:
      "SELECT NAME,\n  CASE WHEN MARKS >= 70 THEN 'The Minion(s)' ELSE 'The Coffee Bean(s)' END\nFROM STUDENTS\nORDER BY NAME;",
    orderMatters: true,
    tests: [
      "INSERT INTO STUDENTS VALUES (1,'Amy',90),(2,'Bob',60);",
      "INSERT INTO STUDENTS VALUES (1,'Solo',70);",
      "INSERT INTO STUDENTS VALUES (1,'A',69),(2,'B',70);",
      "INSERT INTO STUDENTS VALUES (1,'Zed',100);",
    ],
  },
  {
    slug: 'ollivanders-inventory',
    title: "Ollivander's Inventory",
    description:
      'Связь `Wands.id = Wands_Property.magic_wand_id`. Группировка по `(W.code, WP.age, идеальность: WP.min_safety_level <= WP.max_safety_level)`. Для **идеальных** палочек — `MIN(W.coins_needed)`, для **неидеальных** — `MAX(W.coins_needed)`; колонки **`code`**, **`age`**, **`coins`**. Сортировка: `code`, `age`, `coins`.',
    setup:
      'CREATE TABLE Wands(id INTEGER PRIMARY KEY, code INTEGER NOT NULL, coins_needed INTEGER NOT NULL, power INTEGER NOT NULL, age INTEGER NOT NULL);\nCREATE TABLE Wands_Property(magic_wand_id INTEGER PRIMARY KEY, age INTEGER NOT NULL, is_rare INTEGER NOT NULL, min_safety_level INTEGER NOT NULL, max_safety_level INTEGER NOT NULL);',
    starterCode:
      'SELECT W.code, WP.age, MIN(W.coins_needed) FROM Wands W JOIN Wands_Property WP ON W.id = WP.magic_wand_id GROUP BY W.code, WP.age ORDER BY W.code, WP.age;',
    referenceSolution:
      'SELECT W.code, WP.age,\n  CASE WHEN WP.min_safety_level <= WP.max_safety_level THEN MIN(W.coins_needed) ELSE MAX(W.coins_needed) END AS coins\nFROM Wands W\nJOIN Wands_Property WP ON W.id = WP.magic_wand_id\nGROUP BY W.code, WP.age, WP.min_safety_level <= WP.max_safety_level\nORDER BY W.code, WP.age, coins;',
    orderMatters: true,
    tests: [
      'INSERT INTO Wands VALUES (1,10,5,100,5),(2,10,8,100,5);\nINSERT INTO Wands_Property VALUES (1,5,0,1,3),(2,5,0,4,2);',
      'INSERT INTO Wands VALUES (1,1,3,10,1);\nINSERT INTO Wands_Property VALUES (1,1,0,1,5);',
      'INSERT INTO Wands VALUES (1,2,4,10,2),(2,2,9,10,2);\nINSERT INTO Wands_Property VALUES (1,2,0,5,3),(2,2,0,1,4);',
      'INSERT INTO Wands VALUES (1,3,7,10,3);\nINSERT INTO Wands_Property VALUES (1,3,1,2,2);',
    ],
  },
  {
    slug: 'challenges',
    title: 'Challenges',
    description:
      'Список имён задач (`Challenges`) с `contest_id`. Сортировка: `contest_id`, `Challenges`.',
    setup:
      'CREATE TABLE Contests(contest_id INTEGER PRIMARY KEY, hacker_id INTEGER NOT NULL, name TEXT NOT NULL);\nCREATE TABLE Challenges(challenge_id INTEGER PRIMARY KEY, contest_id INTEGER NOT NULL, name TEXT NOT NULL);',
    starterCode:
      'SELECT C.name FROM Challenges C ORDER BY C.name;',
    referenceSolution:
      'SELECT C.contest_id, C.name AS Challenges FROM Challenges C ORDER BY C.contest_id, C.name;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Contests VALUES (1,1,'Spring');\nINSERT INTO Challenges VALUES (1,1,'Alpha'),(2,1,'Beta');",
      "INSERT INTO Contests VALUES (2,2,'Fall');\nINSERT INTO Challenges VALUES (3,2,'Zed'),(4,2,'Ann');",
      "INSERT INTO Contests VALUES (1,1,'A'),(2,2,'B');\nINSERT INTO Challenges VALUES (1,2,'Solo');",
      "INSERT INTO Contests VALUES (1,1,'X');\nINSERT INTO Challenges VALUES (1,1,'A'),(2,1,'A');",
    ],
  },
  {
    slug: 'contest-leaderboard',
    title: 'Contest Leaderboard',
    description:
      'Для каждого участника с **положительной** суммой баллов: `hacker_id`, `name`, `total_score`. Сортировка: `total_score` убыв., `hacker_id` возр.',
    setup:
      'CREATE TABLE Hackers(hacker_id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE Submissions(submission_id INTEGER PRIMARY KEY, hacker_id INTEGER NOT NULL, challenge_id INTEGER NOT NULL, score INTEGER NOT NULL);\nCREATE TABLE Challenges(challenge_id INTEGER PRIMARY KEY, contest_id INTEGER NOT NULL, name TEXT NOT NULL);',
    starterCode:
      'SELECT h.hacker_id, h.name, SUM(s.score) AS total_score FROM Hackers h JOIN Submissions s ON h.hacker_id = s.hacker_id GROUP BY h.hacker_id, h.name ORDER BY total_score;',
    referenceSolution:
      'SELECT h.hacker_id, h.name, SUM(s.score) AS total_score\nFROM Hackers h\nJOIN Submissions s ON h.hacker_id = s.hacker_id\nGROUP BY h.hacker_id, h.name\nHAVING SUM(s.score) > 0\nORDER BY total_score DESC, h.hacker_id ASC;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Hackers VALUES (1,"Amy"),(2,"Bob"),(3,"Cal");\nINSERT INTO Challenges VALUES (1,1,"A"),(2,1,"B");\nINSERT INTO Submissions VALUES (1,1,1,30),(2,1,2,20),(3,2,1,0),(4,3,2,50);',
      'INSERT INTO Hackers VALUES (1,"Solo");\nINSERT INTO Challenges VALUES (1,1,"A");\nINSERT INTO Submissions VALUES (1,1,1,10);',
      'INSERT INTO Hackers VALUES (1,"A"),(2,"B");\nINSERT INTO Challenges VALUES (1,1,"X");\nINSERT INTO Submissions VALUES (1,1,1,5),(2,2,1,5);',
      'INSERT INTO Hackers VALUES (1,"Z"),(2,"A");\nINSERT INTO Challenges VALUES (1,1,"Q");\nINSERT INTO Submissions VALUES (1,2,1,100),(2,1,1,100);',
    ],
  },
];

/* ------------------------------------------------------------------ module 05 */

const advancedJoinProblems: readonly HackerrankProblem[] = [
  {
    slug: 'sql-project-planning',
    title: 'SQL Project Planning',
    description:
      'Пары `(task_id, start_day, end_day)` задач, которые **перекрываются по дням** (один и тот же `day` в `task_start` и `task_end`). Сортировка по `task_id`, `start_day`.',
    setup:
      'CREATE TABLE task_start(task_id INTEGER NOT NULL, start_day INTEGER NOT NULL, PRIMARY KEY(task_id, start_day));\nCREATE TABLE task_end(task_id INTEGER NOT NULL, end_day INTEGER NOT NULL, PRIMARY KEY(task_id, end_day));',
    starterCode:
      'SELECT s.task_id, s.start_day, e.end_day FROM task_start s JOIN task_end e ON s.task_id = e.task_id ORDER BY s.task_id, s.start_day;',
    referenceSolution:
      'SELECT DISTINCT s.task_id, s.start_day, e.end_day\nFROM task_start s\nJOIN task_end e ON s.task_id = e.task_id\nWHERE s.start_day = e.end_day\nORDER BY s.task_id, s.start_day;',
    orderMatters: true,
    tests: [
      'INSERT INTO task_start VALUES (1,10),(1,20),(2,5);\nINSERT INTO task_end VALUES (1,10),(1,15),(2,5);',
      'INSERT INTO task_start VALUES (1,1);\nINSERT INTO task_end VALUES (1,2);',
      'INSERT INTO task_start VALUES (3,7),(3,8);\nINSERT INTO task_end VALUES (3,7),(3,9);',
      'INSERT INTO task_start VALUES (1,100);\nINSERT INTO task_end VALUES (1,100);',
    ],
  },
  {
    slug: 'placements',
    title: 'Placements',
    description:
      'Студенты из `Students`, **не** попавшие в `Placements`. Верните `id`, `name`. Сортировка по `id`.',
    setup:
      'CREATE TABLE Students(id INTEGER PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL);\nCREATE TABLE Placements(id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL, company_id INTEGER NOT NULL);',
    starterCode:
      'SELECT S.id, S.name FROM Students S JOIN Placements P ON S.id = P.student_id ORDER BY S.id;',
    referenceSolution:
      'SELECT S.id, S.name FROM Students S LEFT JOIN Placements P ON S.id = P.student_id WHERE P.student_id IS NULL ORDER BY S.id;',
    orderMatters: true,
    tests: [
      'INSERT INTO Students VALUES (1,"Amy",20),(2,"Bob",21),(3,"Cal",22);\nINSERT INTO Placements VALUES (1,1,10);',
      'INSERT INTO Students VALUES (1,"Solo",20);',
      'INSERT INTO Students VALUES (1,"A",1),(2,"B",2);\nINSERT INTO Placements VALUES (1,2,1);',
      'INSERT INTO Students VALUES (3,"Z",30),(1,"A",10);\nINSERT INTO Placements VALUES (1,3,1);',
    ],
  },
  {
    slug: 'symmetric-pairs',
    title: 'Symmetric Pairs',
    description:
      'Пары `(id, f_id)` из `Functions`, для которых существует `(f_id, id)` и `id < f_id`. Сортировка по `id`.',
    setup:
      'CREATE TABLE Functions(id INTEGER NOT NULL, f_id INTEGER NOT NULL, PRIMARY KEY(id, f_id));',
    starterCode:
      'SELECT id, f_id FROM Functions ORDER BY id;',
    referenceSolution:
      'SELECT f1.id, f1.f_id\nFROM Functions f1\nJOIN Functions f2 ON f1.id = f2.f_id AND f1.f_id = f2.id\nWHERE f1.id < f1.f_id\nORDER BY f1.id;',
    orderMatters: true,
    tests: [
      'INSERT INTO Functions VALUES (1,2),(2,1),(3,4);',
      'INSERT INTO Functions VALUES (10,20),(20,10);',
      'INSERT INTO Functions VALUES (1,1);',
      'INSERT INTO Functions VALUES (5,6),(6,5),(5,7);',
    ],
  },
  {
    slug: 'interviews',
    title: 'Interviews',
    description:
      '**Различные** названия должностей (`title`) из `Companies` и `Challenges` (объединение). Сортировка по `title`.',
    setup:
      'CREATE TABLE Companies(company_code INTEGER PRIMARY KEY, title TEXT NOT NULL, founder TEXT NOT NULL);\nCREATE TABLE Challenges(challenge_id INTEGER PRIMARY KEY, company_code INTEGER NOT NULL, title TEXT NOT NULL);',
    starterCode:
      'SELECT title FROM Companies UNION ALL SELECT title FROM Challenges ORDER BY title;',
    referenceSolution:
      'SELECT DISTINCT title FROM Companies\nUNION\nSELECT DISTINCT title FROM Challenges\nORDER BY title;',
    orderMatters: true,
    tests: [
      "INSERT INTO Companies VALUES (1,'CEO','A'),(2,'CTO','B');\nINSERT INTO Challenges VALUES (1,1,'CTO'),(2,2,'Dev');",
      "INSERT INTO Companies VALUES (1,'Solo','X');",
      "INSERT INTO Challenges VALUES (1,1,'A'),(2,1,'A');",
      "INSERT INTO Companies VALUES (1,'Z','Y'),(2,'A','Y');\nINSERT INTO Challenges VALUES (1,1,'M');",
    ],
  },
  {
    slug: '15-days-of-learning-sql',
    title: '15 Days of Learning SQL',
    description:
      'По каждому `contest_id`: `contest_date`, `total_submissions`, **накопительная** сумма `total_submissions` (`running_total`). Сортировка по `contest_date`.',
    setup:
      'CREATE TABLE Contests(contest_id INTEGER PRIMARY KEY, hacker_id INTEGER NOT NULL, name TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL);\nCREATE TABLE Submissions(submission_id INTEGER PRIMARY KEY, hacker_id INTEGER NOT NULL, challenge_id INTEGER NOT NULL, score INTEGER NOT NULL, submission_date TEXT NOT NULL);\nCREATE TABLE Challenges(challenge_id INTEGER PRIMARY KEY, contest_id INTEGER NOT NULL, name TEXT NOT NULL);',
    starterCode:
      'SELECT C.contest_id, C.start_date, COUNT(S.submission_id) FROM Contests C JOIN Challenges CH ON C.contest_id = CH.contest_id JOIN Submissions S ON CH.challenge_id = S.challenge_id GROUP BY C.contest_id ORDER BY C.start_date;',
    referenceSolution:
      'WITH daily AS (\n  SELECT C.contest_id, C.start_date AS contest_date, COUNT(S.submission_id) AS total_submissions\n  FROM Contests C\n  JOIN Challenges CH ON C.contest_id = CH.contest_id\n  JOIN Submissions S ON CH.challenge_id = S.challenge_id\n  GROUP BY C.contest_id, C.start_date\n)\nSELECT contest_id, contest_date, total_submissions,\n  SUM(total_submissions) OVER (ORDER BY contest_date ROWS UNBOUNDED PRECEDING) AS running_total\nFROM daily\nORDER BY contest_date;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Contests VALUES (1,1,'A','2016-03-01','2016-03-15'),(2,2,'B','2016-03-08','2016-03-20');\nINSERT INTO Challenges VALUES (1,1,'X'),(2,2,'Y');\nINSERT INTO Submissions VALUES (1,1,1,10,'2016-03-01'),(2,1,1,10,'2016-03-02'),(3,2,2,10,'2016-03-08');",
      "INSERT INTO Contests VALUES (1,1,'S','2016-01-01','2016-01-02');\nINSERT INTO Challenges VALUES (1,1,'C');\nINSERT INTO Submissions VALUES (1,1,1,5,'2016-01-01');",
      "INSERT INTO Contests VALUES (1,1,'A','2016-02-01','2016-02-02'),(2,1,'B','2016-02-03','2016-02-04');\nINSERT INTO Challenges VALUES (1,1,'a'),(2,2,'b');\nINSERT INTO Submissions VALUES (1,1,1,1,'2016-02-01'),(2,1,2,1,'2016-02-03');",
      "INSERT INTO Contests VALUES (1,1,'Z','2016-12-01','2016-12-31');\nINSERT INTO Challenges VALUES (1,1,'q');\nINSERT INTO Submissions VALUES (1,1,1,3,'2016-12-01'),(2,1,1,3,'2016-12-01');",
    ],
  },
];

/* ------------------------------------------------------------------ module 06 */

const PARAMS_DDL = 'CREATE TABLE params(n INTEGER NOT NULL);';

const alternativeQueryProblems: readonly HackerrankProblem[] = [
  {
    slug: 'draw-the-triangle-1',
    title: 'Draw The Triangle 1',
    description:
      'Параметр `N` в `params`. **Равнобедренный** треугольник из `*` высотой `N` (строка `i`: `N-i` пробелов и `2*i-1` звёзд). **Важен порядок строк**.',
    setup: PARAMS_DDL,
    starterCode: "SELECT '*' FROM params;",
    referenceSolution:
      "WITH RECURSIVE rows(i) AS (\n  SELECT 1\n  UNION ALL\n  SELECT i + 1 FROM rows WHERE i < (SELECT n FROM params)\n)\nSELECT printf('%*s%s', (SELECT n FROM params) - i, '', printf('%.*s', 2 * i - 1, '********************************')) AS line\nFROM rows;",
    orderMatters: true,
    tests: [
      'INSERT INTO params VALUES (3);',
      'INSERT INTO params VALUES (1);',
      'INSERT INTO params VALUES (5);',
      'INSERT INTO params VALUES (2);',
    ],
  },
  {
    slug: 'draw-the-triangle-2',
    title: 'Draw The Triangle 2',
    description:
      'Параметр `N` в `params`. Строка `i` (1..N): число `i`, повторённое `i` раз подряд **без пробелов**.',
    setup: PARAMS_DDL,
    starterCode: 'SELECT n FROM params;',
    referenceSolution:
      "WITH RECURSIVE rows(i) AS (\n  SELECT 1\n  UNION ALL\n  SELECT i + 1 FROM rows WHERE i < (SELECT n FROM params)\n)\nSELECT REPLACE(printf('%0*d', i, 0), '0', CAST(i AS TEXT)) AS line\nFROM rows;",
    orderMatters: true,
    tests: [
      'INSERT INTO params VALUES (3);',
      'INSERT INTO params VALUES (1);',
      'INSERT INTO params VALUES (4);',
      'INSERT INTO params VALUES (2);',
    ],
  },
  {
    slug: 'print-prime-numbers',
    title: 'Print Prime Numbers',
    description:
      'Параметр `N` в `params`. **Простые** числа `< N` в одной строке через пробел, по возрастанию.',
    setup: PARAMS_DDL,
    starterCode: 'SELECT n FROM params;',
    referenceSolution:
      "WITH RECURSIVE nums(x) AS (\n  SELECT 2 WHERE 2 < (SELECT n FROM params)\n  UNION ALL\n  SELECT x + 1 FROM nums WHERE x + 1 < (SELECT n FROM params)\n),\nprimes(p) AS (\n  SELECT x FROM nums\n  WHERE NOT EXISTS (\n    SELECT 1 FROM nums d WHERE d.x > 1 AND d.x < nums.x AND nums.x % d.x = 0\n  )\n)\nSELECT GROUP_CONCAT(p, ' ') FROM primes;",
    orderMatters: false,
    tests: [
      'INSERT INTO params VALUES (10);',
      'INSERT INTO params VALUES (2);',
      'INSERT INTO params VALUES (20);',
      'INSERT INTO params VALUES (15);',
    ],
  },
];

/* ------------------------------------------------------------------ modules */

export const MODULE_DEFS: readonly ModuleDef[] = [
  {
    file: '01-basic-select.module.json',
    title: 'Basic Select',
    theoryTitle: 'SELECT, WHERE, DISTINCT',
    theoryContent:
      '## Basic Select\n\n- **`SELECT`**, **`WHERE`**, **`ORDER BY`**, **`DISTINCT`**, **`LIMIT`**.\n- HackerRank часто использует таблицы `CITY`, `STATION`, `STUDENTS`.\n- Для гласных в `STATION` — **`REGEXP`** (JS RegExp в приложении): `^` / `$`, классы `[AEIOUaeiou]`.',
    svgCaption: 'WHERE отсеивает строки до проекции',
    svgDescription: 'Чётность `ID` — `ID % 2 = 0` в SQLite.',
    svgIdPrefix: 'hr01',
    quizQuestion: 'Как выбрать города, **не** начинающиеся с гласной?',
    quizOptions: [
      "WHERE CITY NOT REGEXP '^[AEIOUaeiou]'",
      "WHERE CITY LIKE 'A%'",
      'WHERE SUBSTR(CITY, 1, 1) = NULL',
      'WHERE CITY IN (vowels)',
    ],
    quizCorrect: [0],
    problems: basicSelectProblems,
  },
  {
    file: '02-advanced-select.module.json',
    title: 'Advanced Select',
    theoryTitle: 'CASE, строки, pivot',
    theoryContent:
      '## Advanced Select\n\n- **`CASE`** для классификации (треугольники, типы узлов).\n- Форматирование строк: `SUBSTR`, `||`, `printf`, «псевдо-LPAD/RPAD».\n- Pivot через `ROW_NUMBER()` + `MIN(CASE WHEN …)` (Occupations).',
    svgCaption: 'CASE возвращает метку по условию',
    svgDescription: 'Pivot выравнивает строки по rn внутри профессий.',
    svgIdPrefix: 'hr02',
    quizQuestion: 'Как пометить корень BST в таблице `(N, P)`?',
    quizOptions: ['P = 0', 'P IS NULL', 'N = 1', 'N NOT IN (SELECT N FROM BTree)'],
    quizCorrect: [1],
    problems: advancedSelectProblems,
  },
  {
    file: '03-aggregation.module.json',
    title: 'Aggregation',
    theoryTitle: 'Агрегаты и STATION 2–20',
    theoryContent:
      '## Aggregation\n\n- `COUNT`, `SUM`, `AVG`; **`CAST(AVG(...) AS INTEGER)`** — округление вниз.\n- `GROUP BY`, `HAVING`, подзапросы с `MIN`/`MAX`.\n- Станции 13–20: медиана через `OFFSET`, разница диапазонов, `BETWEEN`.',
    svgCaption: 'GROUP BY сворачивает строки',
    svgDescription: 'Исключение min/max — фильтр NOT IN (min UNION max).',
    svgIdPrefix: 'hr03',
    quizQuestion: 'Чем `COUNT(*)` отличается от `COUNT(DISTINCT col)`?',
    quizOptions: [
      'COUNT(*) считает строки, COUNT(DISTINCT) — уникальные значения',
      'Ничем',
      'COUNT(*) игнорирует NULL',
      'COUNT(DISTINCT) быстрее всегда',
    ],
    quizCorrect: [0],
    problems: aggregationProblems,
  },
  {
    file: '04-basic-join.module.json',
    title: 'Basic Join',
    theoryTitle: 'JOIN и отчёты',
    theoryContent:
      '## Basic Join\n\n- **`INNER JOIN`**, **`LEFT JOIN`**, `HAVING` после группировки.\n- Отчёты по оценкам — `CASE` + сортировка.\n- HackerRank contest schema: `Hackers`, `Submissions`, `Challenges`.',
    svgCaption: 'JOIN связывает ключи двух таблиц',
    svgDescription: 'Leaderboard: SUM(score) с HAVING > 0.',
    svgIdPrefix: 'hr04',
    quizQuestion: 'Как найти студентов **без** placement?',
    quizOptions: [
      'INNER JOIN Placements',
      'LEFT JOIN Placements WHERE Placements.student_id IS NULL',
      'CROSS JOIN',
      'UNION',
    ],
    quizCorrect: [1],
    problems: basicJoinProblems,
  },
  {
    file: '05-advanced-join.module.json',
    title: 'Advanced Join',
    theoryTitle: 'Симметрия, UNION, окна',
    theoryContent:
      '## Advanced Join\n\n- Self-join для симметричных пар.\n- **`UNION`** vs **`UNION ALL`** для списков title.\n- Накопительная сумма: **`SUM(...) OVER (ORDER BY …)`**.',
    svgCaption: 'Self-join находит пары (id, f_id) и (f_id, id)',
    svgDescription: 'Running total — окно с UNBOUNDED PRECEDING.',
    svgIdPrefix: 'hr05',
    quizQuestion: 'Как получить running total по дате?',
    quizOptions: [
      'SUM(x) GROUP BY date',
      'SUM(x) OVER (ORDER BY date ROWS UNBOUNDED PRECEDING)',
      'COUNT(*) OVER ()',
      'MAX(x) OVER (PARTITION BY date)',
    ],
    quizCorrect: [1],
    problems: advancedJoinProblems,
  },
  {
    file: '06-alternative-queries.module.json',
    title: 'Alternative Queries',
    theoryTitle: 'Рекурсия и генерация строк',
    theoryContent:
      '## Alternative Queries\n\n- Параметр **`N`**: таблица **`params(n)`** в seed.\n- **`WITH RECURSIVE`**: строки 1..N, проверка делителей для простых.\n- Треугольники: `printf` для пробелов и повторов символов.',
    svgCaption: 'RECURSIVE генерирует 1..N без таблицы чисел',
    svgDescription: 'Простые — NOT EXISTS делителя d < x.',
    svgIdPrefix: 'hr06',
    quizQuestion: 'Откуда берётся N в draw-the-triangle?',
    quizOptions: [
      'Из переменной @N',
      'Из seed: INSERT INTO params VALUES (N)',
      'Из LIMIT N',
      'Из ORDER BY N',
    ],
    quizCorrect: [1],
    problems: alternativeQueryProblems,
  },
];


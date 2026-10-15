export type SqliteProblem = {
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
  readonly problems: readonly SqliteProblem[];
};

const selectProblems: readonly SqliteProblem[] = [
  {
    leetcode: 1757,
    title: 'Recyclable and Low Fat Products',
    description:
      'Выведите `product_id` товаров, которые **одновременно** low fat (`low_fats = 1`) и recyclable (`recyclable = 1`).',
    setup:
      'CREATE TABLE Products(product_id INTEGER PRIMARY KEY, low_fats INTEGER NOT NULL, recyclable INTEGER NOT NULL);',
    starterCode: 'SELECT product_id FROM Products WHERE low_fats = 1 OR recyclable = 1;',
    referenceSolution: 'SELECT product_id FROM Products WHERE low_fats = 1 AND recyclable = 1;',
    checkColumnNames: true,
    tests: [
      "INSERT INTO Products VALUES (0,0,0),(1,1,1),(2,1,0),(3,0,1);",
      'INSERT INTO Products VALUES (1,1,1);',
      'INSERT INTO Products VALUES (1,0,0);',
    ],
  },
  {
    leetcode: 584,
    title: 'Find Customer Referee',
    description:
      'Выведите `name` клиентов, которые **не** были приглашены referee с `id = 2`. Если `referee_id` NULL — клиент тоже подходит.',
    setup: 'CREATE TABLE Customer(id INTEGER PRIMARY KEY, name TEXT NOT NULL, referee_id INTEGER);',
    starterCode: 'SELECT name FROM Customer WHERE referee_id <> 2;',
    referenceSolution:
      'SELECT name FROM Customer WHERE referee_id != 2 OR referee_id IS NULL;',
    checkColumnNames: true,
    tests: [
      "INSERT INTO Customer VALUES (1,'Will',NULL),(2,'Jane',NULL),(3,'Alex',2),(4,'Bill',NULL),(5,'Zack',1),(6,'Mark',2);",
      "INSERT INTO Customer VALUES (1,'A',2);",
      "INSERT INTO Customer VALUES (1,'B',NULL);",
    ],
  },
  {
    leetcode: 595,
    title: 'Big Countries',
    description:
      'Страна «большая», если `area >= 3000000` **или** `population >= 25000000`. Верните `name`, `population`, `area`.',
    setup:
      'CREATE TABLE World(name TEXT PRIMARY KEY, continent TEXT NOT NULL, area INTEGER NOT NULL, population INTEGER NOT NULL, gdp INTEGER NOT NULL);',
    starterCode: 'SELECT name, population, area FROM World WHERE area > 3000000 AND population > 25000000;',
    referenceSolution:
      'SELECT name, population, area FROM World WHERE area >= 3000000 OR population >= 25000000;',
    orderMatters: false,
    tests: [
      "INSERT INTO World VALUES ('Afghanistan','Asia',652230,25500100,20343000000),('Albania','Europe',28748,2831741,12960000000);",
      "INSERT INTO World VALUES ('China','Asia',9706961,1444216107,140000000000);",
      "INSERT INTO World VALUES ('Monaco','Europe',2,39244,1000000);",
    ],
  },
  {
    leetcode: 1148,
    title: 'Article Views I',
    description:
      'Авторы, которые просматривали **свои** статьи. Верните `id` (author_id) **без дубликатов**, по возрастанию.',
    setup:
      'CREATE TABLE Views(article_id INTEGER NOT NULL, author_id INTEGER NOT NULL, viewer_id INTEGER NOT NULL, view_date TEXT NOT NULL);',
    starterCode: 'SELECT author_id AS id FROM Views WHERE author_id = viewer_id;',
    referenceSolution:
      'SELECT DISTINCT author_id AS id FROM Views WHERE author_id = viewer_id ORDER BY id;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Views VALUES (1,3,5,"2019-08-01"),(1,3,6,"2019-08-02"),(2,7,7,"2019-08-01"),(2,7,6,"2019-08-02"),(4,7,1,"2019-08-01"),(3,4,4,"2019-08-02"),(3,4,4,"2019-08-02");',
      'INSERT INTO Views VALUES (1,1,2,"2019-01-01");',
      'INSERT INTO Views VALUES (1,2,2,"2019-01-01");',
    ],
  },
  {
    leetcode: 1683,
    title: 'Invalid Tweets',
    description: 'Невалидный твит: длина `content` **строго больше** 15 символов. Верните `tweet_id`.',
    setup: 'CREATE TABLE Tweets(tweet_id INTEGER PRIMARY KEY, content TEXT NOT NULL);',
    starterCode: 'SELECT tweet_id FROM Tweets WHERE LENGTH(content) >= 15;',
    referenceSolution: 'SELECT tweet_id FROM Tweets WHERE LENGTH(content) > 15;',
    tests: [
      "INSERT INTO Tweets VALUES (1,'Vote for Biden'),(2,'Let us make America great again!');",
      "INSERT INTO Tweets VALUES (1,'123456789012345');",
      "INSERT INTO Tweets VALUES (1,'1234567890123456');",
    ],
  },
];

const basicJoinsProblems: readonly SqliteProblem[] = [
  {
    leetcode: 1378,
    title: 'Replace Employee ID With The Unique Identifier',
    description:
      'Свяжите `Employees` и `EmployeeUNI` по `id`. Верните `unique_id` и `name`; если unique_id нет — NULL.',
    setup:
      'CREATE TABLE Employees(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE EmployeeUNI(id INTEGER PRIMARY KEY, unique_id INTEGER NOT NULL);',
    starterCode:
      'SELECT e.id AS unique_id, e.name FROM Employees e INNER JOIN EmployeeUNI u ON e.id = u.id;',
    referenceSolution:
      'SELECT u.unique_id, e.name FROM Employees e LEFT JOIN EmployeeUNI u ON e.id = u.id;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Employees VALUES (1,'Alice'),(7,'Bob'),(11,'Meir'),(90,'Winston'),(3,'Jonathan');\nINSERT INTO EmployeeUNI VALUES (3,1),(11,2),(90,3);",
      "INSERT INTO Employees VALUES (1,'A');",
      "INSERT INTO Employees VALUES (1,'A');\nINSERT INTO EmployeeUNI VALUES (1,10);",
    ],
  },
  {
    leetcode: 1581,
    title: 'Customer Who Never Order',
    description: 'Клиенты, которые **ни разу** не делали заказ. Колонка результата: `Customers` (имя).',
    setup:
      'CREATE TABLE Customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE Orders(id INTEGER PRIMARY KEY, customerId INTEGER NOT NULL);',
    starterCode: 'SELECT name AS Customers FROM Customers;',
    referenceSolution:
      'SELECT c.name AS Customers FROM Customers c LEFT JOIN Orders o ON c.id = o.customerId WHERE o.customerId IS NULL;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Customers VALUES (1,'Joe'),(2,'Henry'),(3,'Sam'),(4,'Max');\nINSERT INTO Orders VALUES (1,3),(2,1);",
      "INSERT INTO Customers VALUES (1,'A');",
      "INSERT INTO Customers VALUES (1,'A');\nINSERT INTO Orders VALUES (1,1);",
    ],
  },
  {
    leetcode: 1068,
    title: 'Product Sales Analysis I',
    description:
      'Для каждой продажи: `product_name`, `year`, `price` (название из `Product`, год и цена из `Sales`).',
    setup:
      'CREATE TABLE Sales(sale_id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, year INTEGER NOT NULL, quantity INTEGER NOT NULL, price INTEGER NOT NULL);\nCREATE TABLE Product(product_id INTEGER PRIMARY KEY, product_name TEXT NOT NULL);',
    starterCode:
      'SELECT product_id, year, price FROM Sales;',
    referenceSolution:
      'SELECT p.product_name, s.year, s.price FROM Sales s JOIN Product p ON s.product_id = p.product_id;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Sales VALUES (1,100,2008,10,5000),(2,100,2009,12,5000);\nINSERT INTO Product VALUES (100,'Nokia');",
      "INSERT INTO Sales VALUES (1,1,2020,1,10);\nINSERT INTO Product VALUES (1,'A'),(2,'B');",
    ],
  },
  {
    leetcode: 1075,
    title: 'Project Employees I',
    description:
      'Средний `experience_years` по каждому `project_id`, округлённый до **2** знаков, колонка `average_years`.',
    setup:
      'CREATE TABLE Project(project_id INTEGER NOT NULL, employee_id INTEGER NOT NULL, PRIMARY KEY(project_id, employee_id));\nCREATE TABLE Employee(employee_id INTEGER PRIMARY KEY, name TEXT NOT NULL, experience_years INTEGER NOT NULL);',
    starterCode: 'SELECT project_id, AVG(experience_years) AS average_years FROM Employee GROUP BY project_id;',
    referenceSolution:
      'SELECT p.project_id, ROUND(AVG(e.experience_years), 2) AS average_years FROM Project p JOIN Employee e ON p.employee_id = e.employee_id GROUP BY p.project_id;',
    orderMatters: false,
    checkColumnNames: true,
    floatTolerance: 0.001,
    tests: [
      'INSERT INTO Project VALUES (1,1),(1,2),(1,3),(2,1),(2,4);\nINSERT INTO Employee VALUES (1,"Khaled",3),(2,"Ali",2),(3,"John",1),(4,"Doe",2);',
      'INSERT INTO Project VALUES (1,1);\nINSERT INTO Employee VALUES (1,"A",5);',
    ],
  },
  {
    leetcode: 197,
    title: 'Rising Temperature',
    description:
      'Id записей, где температура **строго выше**, чем в **предыдущий календарный день** (`recordDate`).',
    setup: 'CREATE TABLE Weather(id INTEGER PRIMARY KEY, recordDate TEXT NOT NULL, temperature INTEGER NOT NULL);',
    starterCode: 'SELECT id FROM Weather ORDER BY recordDate;',
    referenceSolution:
      'SELECT w1.id FROM Weather w1 JOIN Weather w2 ON w1.recordDate = DATE(w2.recordDate, "+1 day") WHERE w1.temperature > w2.temperature;',
    tests: [
      'INSERT INTO Weather VALUES (1,"2015-01-01",10),(2,"2015-01-02",25),(3,"2015-01-03",20),(4,"2015-01-04",30);',
      'INSERT INTO Weather VALUES (1,"2015-01-01",10),(2,"2015-01-02",10);',
      'INSERT INTO Weather VALUES (1,"2015-01-01",10);',
    ],
  },
  {
    leetcode: 577,
    title: 'Employee Bonus',
    description:
      'Имена сотрудников с `bonus < 1000` (или bonus NULL). Колонки: `Employee`, `Bonus`.',
    setup:
      'CREATE TABLE Employee(empId INTEGER PRIMARY KEY, name TEXT NOT NULL, supervisor INTEGER, salary INTEGER NOT NULL);\nCREATE TABLE Bonus(empId INTEGER PRIMARY KEY, bonus INTEGER);',
    starterCode: 'SELECT name AS Employee, bonus AS Bonus FROM Employee JOIN Bonus USING(empId);',
    referenceSolution:
      'SELECT e.name AS Employee, b.bonus AS Bonus FROM Employee e LEFT JOIN Bonus b ON e.empId = b.empId WHERE b.bonus < 1000 OR b.bonus IS NULL;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Employee VALUES (3,"Brad",NULL,4000),(1,"John",3,1000),(2,"Dan",3,2000),(4,"Thomas",3,4000);\nINSERT INTO Bonus VALUES (2,500),(4,2000);',
      'INSERT INTO Employee VALUES (1,"A",NULL,1);',
    ],
  },
  {
    leetcode: 570,
    title: 'Managers with at Least 5 Direct Reports',
    description: 'Имена менеджеров, у которых **≥ 5** прямых подчинённых (`managerId`).',
    setup:
      'CREATE TABLE Employee(id INTEGER PRIMARY KEY, name TEXT NOT NULL, department TEXT, managerId INTEGER);',
    starterCode: 'SELECT name FROM Employee WHERE id IN (SELECT managerId FROM Employee);',
    referenceSolution:
      'SELECT name FROM Employee WHERE id IN (SELECT managerId FROM Employee GROUP BY managerId HAVING COUNT(*) >= 5);',
    tests: [
      'INSERT INTO Employee VALUES (101,"John","A",NULL),(102,"Dan","A",101),(103,"James","A",101),(104,"Amy","A",101),(105,"Anne","A",101),(106,"Ron","A",101),(107,"Bob","B",101);',
      'INSERT INTO Employee VALUES (1,"M",NULL,NULL),(2,"A","X",1),(3,"B","X",1);',
    ],
  },
  {
    leetcode: 1280,
    title: 'Students and Examinations',
    description:
      'Для каждой пары студент × предмет выведите `student_id`, `student_name`, `subject_name` и `attended_exams` — сколько раз студент сдавал экзамен по этому предмету (0, если не сдавал). Сортировка: `student_id`, затем `subject_name`.',
    setup:
      'CREATE TABLE Students(student_id INTEGER PRIMARY KEY, student_name TEXT NOT NULL);\nCREATE TABLE Subjects(subject_name TEXT PRIMARY KEY);\nCREATE TABLE Examinations(student_id INTEGER NOT NULL, subject_name TEXT NOT NULL);',
    starterCode:
      'SELECT student_id, student_name, subject_name, COUNT(*) AS attended_exams FROM Examinations GROUP BY student_id, subject_name;',
    referenceSolution:
      'SELECT s.student_id, s.student_name, sub.subject_name, COUNT(e.student_id) AS attended_exams FROM Students s CROSS JOIN Subjects sub LEFT JOIN Examinations e ON s.student_id = e.student_id AND sub.subject_name = e.subject_name GROUP BY s.student_id, s.student_name, sub.subject_name ORDER BY s.student_id, sub.subject_name;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Students VALUES (1,'Alice'),(2,'Bob'),(13,'John'),(6,'Alex');\nINSERT INTO Subjects VALUES ('Math'),('Physics'),('Programming');\nINSERT INTO Examinations VALUES (1,'Math'),(1,'Math'),(1,'Physics'),(2,'Programming'),(2,'Physics'),(13,'Math'),(13,'Math'),(13,'Math'),(13,'Programming'),(6,'Math');",
    ],
  },
  {
    leetcode: 1934,
    title: 'Confirmation Rate',
    description:
      'Для каждого `user_id` — `confirmation_rate`: доля `confirmed` среди **timeout** и **confirmed** (rounded to 2 decimals). Нет таких действий → `0.00`.',
    setup:
      'CREATE TABLE Signups(user_id INTEGER PRIMARY KEY, time_stamp TEXT NOT NULL);\nCREATE TABLE Confirmations(user_id INTEGER NOT NULL, time_stamp TEXT NOT NULL, action TEXT NOT NULL);',
    starterCode: 'SELECT user_id, 1.0 AS confirmation_rate FROM Signups;',
    referenceSolution:
      'SELECT s.user_id, ROUND(COALESCE(SUM(c.action = "confirmed") * 1.0 / NULLIF(SUM(c.action IN ("confirmed","timeout")), 0), 0), 2) AS confirmation_rate FROM Signups s LEFT JOIN Confirmations c ON s.user_id = c.user_id GROUP BY s.user_id;',
    orderMatters: false,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO Signups VALUES (3,"2020-03-21 10:16:13"),(7,"2020-01-04 13:57:59"),(2,"2020-07-29 23:09:44"),(6,"2020-12-09 10:39:37");\nINSERT INTO Confirmations VALUES (3,"2021-01-06 03:30:46","timeout"),(3,"2021-07-14 14:00:00","timeout"),(7,"2021-06-12 11:57:29","confirmed"),(7,"2021-06-13 12:57:29","confirmed"),(7,"2021-06-14 13:57:29","confirmed"),(2,"2021-06-14 13:57:29","confirmed"),(2,"2021-06-15 13:57:29","timeout");',
      'INSERT INTO Signups VALUES (1,"2020-01-01");\nINSERT INTO Confirmations VALUES (1,"2020-01-02","confirmed");',
    ],
  },
];

const basicAggregateProblems: readonly SqliteProblem[] = [
  {
    leetcode: 620,
    title: 'Not Boring Movies',
    description:
      "Фильмы: нечётный `id`, `description` **не** «boring», сортировка по `rating` **убыванию**.",
    setup:
      'CREATE TABLE Cinema(id INTEGER PRIMARY KEY, movie TEXT NOT NULL, description TEXT NOT NULL, rating REAL NOT NULL);',
    starterCode: 'SELECT * FROM Cinema ORDER BY rating DESC;',
    referenceSolution:
      "SELECT * FROM Cinema WHERE id % 2 = 1 AND description != 'boring' ORDER BY rating DESC;",
    orderMatters: true,
    tests: [
      "INSERT INTO Cinema VALUES (1,'War','great 3D',8.9),(2,'Science','fiction',8.5),(3,'irish','boring',6.2),(4,'Ice song','Fantacy',8.6),(5,'House card','Interesting',9.1);",
      "INSERT INTO Cinema VALUES (1,'A','boring',5);",
    ],
  },
  {
    leetcode: 1251,
    title: 'Average Selling Price',
    description:
      'Средняя цена продажи каждого `product_id` за период (Units с `purchase_date` между «2019-01-01» и «2019-06-30»). Колонка `average_price`, округление 2 знака; нет продаж → NULL.',
    setup:
      'CREATE TABLE Products(product_id INTEGER PRIMARY KEY, start_date TEXT NOT NULL, end_date TEXT NOT NULL, price INTEGER NOT NULL);\nCREATE TABLE Units(product_id INTEGER NOT NULL, purchase_date TEXT NOT NULL, amount INTEGER NOT NULL);',
    starterCode: 'SELECT product_id, AVG(price) AS average_price FROM Products GROUP BY product_id;',
    referenceSolution:
      'SELECT p.product_id, ROUND(AVG(u.amount * p.price * 1.0) / NULLIF(SUM(u.amount), 0), 2) AS average_price FROM Products p LEFT JOIN Units u ON p.product_id = u.product_id AND u.purchase_date BETWEEN p.start_date AND p.end_date AND u.purchase_date BETWEEN "2019-01-01" AND "2019-06-30" GROUP BY p.product_id;',
    orderMatters: false,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO Products VALUES (1,"2019-02-17","2019-02-28",5),(2,"2019-06-01","2019-06-30",8);\nINSERT INTO Units VALUES (1,"2019-02-25",100),(1,"2019-03-01",15),(2,"2019-06-03",50);',
      'INSERT INTO Products VALUES (1,"2019-01-01","2019-12-31",10);',
    ],
  },
  {
    leetcode: 1661,
    title: 'Average Time of Process per Machine',
    description:
      'Среднее время обработки (`processing_time`, округление **3** знака) для каждой `machine_id`: по каждой паре `(machine_id, process_id)` время = `end` − `start`, затем среднее по машине.',
    setup:
      'CREATE TABLE Activity(machine_id INTEGER NOT NULL, process_id INTEGER NOT NULL, activity_type TEXT NOT NULL, timestamp REAL NOT NULL);',
    starterCode:
      'SELECT machine_id, AVG(timestamp) AS processing_time FROM Activity GROUP BY machine_id;',
    referenceSolution:
      'SELECT machine_id, ROUND(AVG(end_time - start_time), 3) AS processing_time FROM (SELECT machine_id, process_id, MAX(CASE WHEN activity_type = "start" THEN timestamp END) AS start_time, MAX(CASE WHEN activity_type = "end" THEN timestamp END) AS end_time FROM Activity GROUP BY machine_id, process_id) t GROUP BY machine_id;',
    orderMatters: false,
    checkColumnNames: true,
    floatTolerance: 0.001,
    tests: [
      'INSERT INTO Activity VALUES (0,0,"start",0.712),(0,0,"end",1.52),(0,1,"start",3.14),(0,1,"end",4.12),(1,0,"start",0.55),(1,0,"end",1.55),(1,1,"start",0.43),(1,1,"end",1.42),(2,0,"start",0.1),(2,0,"end",0.2),(2,1,"start",2.5),(2,1,"end",5);',
      'INSERT INTO Activity VALUES (1,1,"start",1),(1,1,"end",3);',
    ],
  },
  {
    leetcode: 1633,
    title: 'Percentage of Users Attended a Contest',
    description:
      'Доля пользователей, участвовавших в **хотя бы одном** контесте (`registered_in_contest`), округлить до 2 знаков — `percentage`.',
    setup:
      'CREATE TABLE Users(user_id INTEGER PRIMARY KEY, user_name TEXT NOT NULL);\nCREATE TABLE Register(contest_id INTEGER NOT NULL, user_id INTEGER NOT NULL, PRIMARY KEY(contest_id, user_id));',
    starterCode: 'SELECT 100.0 AS percentage;',
    referenceSolution:
      'SELECT ROUND(COUNT(DISTINCT r.user_id) * 100.0 / (SELECT COUNT(*) FROM Users), 2) AS percentage FROM Register r;',
    orderMatters: false,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO Users VALUES (6,"Alice"),(2,"Bob"),(7,"Alex");\nINSERT INTO Register VALUES (215,6),(209,2),(208,2);',
      'INSERT INTO Users VALUES (1,"A");',
    ],
  },
  {
    leetcode: 1193,
    title: 'Monthly Transactions I',
    description:
      'По `(month, country)`: `approved_count`, `approved_amount` (только state approved), `chargeback_count`, `chargeback_amount` (только chargeback). Месяц — `YYYY-MM` из `trans_date`.',
    setup:
      'CREATE TABLE Transactions(id INTEGER PRIMARY KEY, country TEXT NOT NULL, state TEXT NOT NULL, amount INTEGER NOT NULL, trans_date TEXT NOT NULL);',
    starterCode: 'SELECT country, trans_date FROM Transactions;',
    referenceSolution:
      'SELECT strftime("%Y-%m", trans_date) AS month, country,\n  COUNT(CASE WHEN state = "approved" THEN 1 END) AS approved_count,\n  SUM(CASE WHEN state = "approved" THEN amount ELSE 0 END) AS approved_amount,\n  COUNT(CASE WHEN state = "chargeback" THEN 1 END) AS chargeback_count,\n  SUM(CASE WHEN state = "chargeback" THEN amount ELSE 0 END) AS chargeback_amount\nFROM Transactions GROUP BY month, country ORDER BY month, country;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Transactions VALUES (101,"US","approved",1000,"2019-05-18"),(102,"US","approved",3000,"2019-05-19"),(103,"US","chargeback",1000,"2019-06-17"),(104,"US","approved",2000,"2019-06-18");',
    ],
  },
  {
    leetcode: 1174,
    title: 'Immediate Food Delivery II',
    description:
      'Доля заказов первого заказа клиента (`order_number=1`), доставленных в **первый** день (`order_date = customer_pref_delivery_date`), в процентах `immediate_percentage` (2 знака).',
    setup:
      'CREATE TABLE Delivery(delivery_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, order_date TEXT NOT NULL, customer_pref_delivery_date TEXT NOT NULL, delivery_date TEXT NOT NULL);',
    starterCode: 'SELECT 100 AS immediate_percentage;',
    referenceSolution:
      'SELECT ROUND(SUM(order_date = customer_pref_delivery_date) * 100.0 / COUNT(*), 2) AS immediate_percentage FROM Delivery WHERE (customer_id, order_date) IN (SELECT customer_id, MIN(order_date) FROM Delivery GROUP BY customer_id);',
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO Delivery VALUES (1,1,"2019-08-01","2019-08-02","2019-08-02"),(2,2,"2019-08-02","2019-08-02","2019-08-02"),(3,1,"2019-08-11","2019-08-12","2019-08-12"),(4,3,"2019-08-24","2019-08-24","2019-08-24"),(5,3,"2019-08-21","2019-08-22","2019-08-22"),(6,2,"2019-08-11","2019-08-13","2019-08-13"),(7,4,"2019-08-09","2019-08-09","2019-08-09");',
    ],
  },
  {
    leetcode: 550,
    title: 'Game Play Analysis IV',
    description:
      'Доля игроков, которые заходили **на следующий календарный день** после дня первого входа. Одна строка: `fraction` (округлить 2 знака).',
    setup: 'CREATE TABLE Activity(player_id INTEGER NOT NULL, device_id INTEGER NOT NULL, event_date TEXT NOT NULL, games_played INTEGER NOT NULL);',
    starterCode: 'SELECT 0.0 AS fraction;',
    referenceSolution:
      'WITH first_login AS (SELECT player_id, MIN(event_date) AS fd FROM Activity GROUP BY player_id)\nSELECT ROUND((SELECT COUNT(DISTINCT a.player_id) FROM Activity a JOIN first_login f ON a.player_id = f.player_id WHERE a.event_date = DATE(f.fd, "+1 day")) * 1.0 / COUNT(DISTINCT player_id), 2) AS fraction FROM Activity;',
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO Activity VALUES (1,2,"2016-03-01",5),(1,2,"2016-03-02",6),(2,3,"2017-06-25",1),(3,1,"2016-03-02",0),(3,4,"2018-07-03",5);',
      'INSERT INTO Activity VALUES (1,1,"2020-01-01",1),(1,1,"2020-01-02",1),(2,1,"2020-01-01",1);',
    ],
  },
  {
    leetcode: 1211,
    title: 'Queries Quality and Percentage',
    description:
      'По каждому `query_name`: `quality` = avg(rating/position), `poor_query_percentage` = % rating < 3 (оба округлить 2 знака).',
    setup:
      'CREATE TABLE Queries(query_name TEXT NOT NULL, result TEXT NOT NULL, position INTEGER NOT NULL, rating INTEGER NOT NULL);',
    starterCode: 'SELECT query_name FROM Queries GROUP BY query_name;',
    referenceSolution:
      'SELECT query_name,\n  ROUND(AVG(rating * 1.0 / position), 2) AS quality,\n  ROUND(SUM(rating < 3) * 100.0 / COUNT(*), 2) AS poor_query_percentage\nFROM Queries GROUP BY query_name;',
    orderMatters: false,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO Queries VALUES ("Dog","Pluto",1,1),("Dog","Cereal",3,2),("Dog","Grain",1,3),("Cat","Milk",4,4),("Cat","Tiger",5,5),("Cat","Pigeon",6,6);',
    ],
  },
];

const sortingGroupingProblems: readonly SqliteProblem[] = [
  {
    leetcode: 2356,
    title: 'Number of Unique Subjects Taught by Each Teacher',
    description: 'Для каждого `teacher_id` — число **разных** `subject` (`count`); без предметов — не выводить.',
    setup:
      'CREATE TABLE Teacher(teacher_id INTEGER NOT NULL, subject TEXT NOT NULL, dept TEXT NOT NULL);',
    starterCode: 'SELECT teacher_id, COUNT(subject) AS count FROM Teacher GROUP BY teacher_id;',
    referenceSolution:
      'SELECT teacher_id, COUNT(DISTINCT subject) AS count FROM Teacher GROUP BY teacher_id;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Teacher VALUES (1,"Math","A"),(1,"Physics","A"),(1,"Math","A"),(2,"Programming","B"),(2,"Math","B");',
      'INSERT INTO Teacher VALUES (1,"X","A");',
    ],
  },
  {
    leetcode: 1141,
    title: 'User Activity for the Past 30 Days I',
    description:
      'По каждой дате `activity_day`: число **уникальных** `user_id` с активностью. Только даты в пределах 30 дней до «2019-07-27» (включительно).',
    setup:
      'CREATE TABLE Activity(user_id INTEGER NOT NULL, session_id INTEGER NOT NULL, activity_date TEXT NOT NULL, activity_type TEXT NOT NULL);',
    starterCode: 'SELECT activity_date AS day, COUNT(user_id) AS active_users FROM Activity GROUP BY activity_date;',
    referenceSolution:
      'SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users FROM Activity WHERE activity_date BETWEEN DATE("2019-07-27", "-29 days") AND "2019-07-27" GROUP BY activity_date ORDER BY day;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Activity VALUES (1,1,"2019-07-20","open"),(1,1,"2019-07-20","click"),(2,1,"2019-07-20","open"),(3,1,"2019-07-20","open"),(4,1,"2019-07-20","open"),(1,1,"2019-07-21","open"),(2,1,"2019-07-21","open"),(3,1,"2019-07-21","open"),(1,1,"2019-07-21","click"),(3,1,"2019-07-21","click"),(1,1,"2019-07-22","open"),(2,1,"2019-07-22","open"),(5,1,"2019-07-22","open"),(3,1,"2019-07-23","open"),(3,1,"2019-07-23","click"),(1,1,"2019-07-24","open"),(2,1,"2019-07-24","open"),(3,1,"2019-07-24","open"),(3,1,"2019-07-24","click"),(1,1,"2019-07-25","open"),(2,1,"2019-07-25","open"),(1,1,"2019-07-26","open"),(2,1,"2019-07-26","open"),(3,1,"2019-07-26","open"),(1,1,"2019-07-27","open"),(3,1,"2019-07-27","open"),(1,1,"2019-07-28","open"),(2,1,"2019-07-28","open"),(3,1,"2019-07-28","open");',
    ],
  },
  {
    leetcode: 1070,
    title: 'Product Sales Analysis III',
    description:
      'Первый и последний год продаж каждого `product_id` (`first_year`, `last_year`) — только товары, продававшиеся **≥ 2 разных** года.',
    setup:
      'CREATE TABLE Sales(sale_id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, year INTEGER NOT NULL);',
    starterCode: 'SELECT product_id, MIN(year), MAX(year) FROM Sales GROUP BY product_id;',
    referenceSolution:
      'SELECT product_id, MIN(year) AS first_year, MAX(year) AS last_year FROM Sales GROUP BY product_id HAVING COUNT(DISTINCT year) >= 2;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Sales VALUES (1,100,2008),(2,100,2009),(7,200,2008),(8,200,2009),(9,200,2010);',
      'INSERT INTO Sales VALUES (1,1,2020);',
    ],
  },
  {
    leetcode: 596,
    title: 'Classes More Than 5 Students',
    description: 'Классы (`class`), в которых **≥ 5** **разных** студентов (`student`).',
    setup: 'CREATE TABLE Courses(student TEXT NOT NULL, class TEXT NOT NULL);',
    starterCode: 'SELECT class FROM Courses LIMIT 1;',
    referenceSolution:
      'SELECT class FROM Courses GROUP BY class HAVING COUNT(DISTINCT student) >= 5;',
    tests: [
      'INSERT INTO Courses VALUES ("A","Math"),("B","English"),("C","Math"),("D","Biology"),("E","Math"),("F","Math"),("G","Math"),("H","Math"),("I","Math");',
      'INSERT INTO Courses VALUES ("A","X"),("B","X"),("C","X"),("D","X");',
    ],
  },
  {
    leetcode: 1729,
    title: 'Find Followers Count',
    description: 'Для каждого `user_id` — `followers_count` (число подписчиков). Сортировка: `user_id` по возрастанию.',
    setup: 'CREATE TABLE Followers(user_id INTEGER NOT NULL, follower_id INTEGER NOT NULL);',
    starterCode: 'SELECT user_id, COUNT(follower_id) AS followers_count FROM Followers GROUP BY user_id ORDER BY user_id DESC;',
    referenceSolution:
      'SELECT user_id, COUNT(follower_id) AS followers_count FROM Followers GROUP BY user_id ORDER BY user_id;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Followers VALUES (0,1),(0,2),(1,0),(1,3),(2,2),(2,3);',
    ],
  },
  {
    leetcode: 619,
    title: 'Biggest Single Number',
    description:
      'Число, которое встречается **ровно один раз** и больше всех таких; если нет — `NULL` (колонка `num`).',
    setup: 'CREATE TABLE MyNumbers(num INTEGER NOT NULL);',
    starterCode: 'SELECT MAX(num) AS num FROM MyNumbers;',
    referenceSolution:
      'SELECT MAX(num) AS num FROM (SELECT num FROM MyNumbers GROUP BY num HAVING COUNT(*) = 1);',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO MyNumbers VALUES (8),(8),(3),(3),(1),(4),(5),(6);',
      'INSERT INTO MyNumbers VALUES (1),(1);',
      'INSERT INTO MyNumbers VALUES (5);',
    ],
  },
  {
    leetcode: 1045,
    title: 'Customers Who Bought All Products',
    description:
      'Клиенты, купившие **все** продукты из каталога `Product`. Колонка `customer_id`.',
    setup:
      'CREATE TABLE Customer(customer_id INTEGER NOT NULL, product_key INTEGER NOT NULL);\nCREATE TABLE Product(product_key INTEGER PRIMARY KEY);',
    starterCode: 'SELECT DISTINCT customer_id FROM Customer;',
    referenceSolution:
      'SELECT customer_id FROM Customer GROUP BY customer_id HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product);',
    tests: [
      'INSERT INTO Customer VALUES (1,5),(2,6),(3,5),(3,6),(1,6);\nINSERT INTO Product VALUES (5),(6);',
      'INSERT INTO Product VALUES (1);\nINSERT INTO Customer VALUES (1,1);',
    ],
  },
];

const advancedSelectProblems: readonly SqliteProblem[] = [
  {
    leetcode: 1731,
    title: 'The Number of Employees Which Report to Each Employee',
    description:
      'Для каждого менеджера (`employee_id` из `Employees`): `reports_count`, `average_age` (округлить 0 знаков) подчинённых. Только менеджеры с ≥1 подчинённым.',
    setup:
      'CREATE TABLE Employees(employee_id INTEGER PRIMARY KEY, employee_name TEXT NOT NULL, reports_to INTEGER, age INTEGER NOT NULL);',
    starterCode: 'SELECT employee_id, COUNT(*) FROM Employees GROUP BY reports_to;',
    referenceSolution:
      'SELECT e.employee_id, COUNT(r.employee_id) AS reports_count, ROUND(AVG(r.age), 0) AS average_age FROM Employees e JOIN Employees r ON e.employee_id = r.reports_to GROUP BY e.employee_id ORDER BY e.employee_id;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Employees VALUES (9,"Gabe",NULL,40),(6,"Tyler",9,25),(4,"Benjamin",9,20),(5,"Alice",9,22),(11,"Daniel",9,40);',
    ],
  },
  {
    leetcode: 1789,
    title: 'Primary Department for Each Employee',
    description:
      'Для каждого сотрудника — **основной** отдел: если одна запись в `Employee` — она; если две — где `primary_flag = "Y"`. Колонки: `employee_id`, `department_id`.',
    setup:
      'CREATE TABLE Employee(employee_id INTEGER NOT NULL, department_id INTEGER NOT NULL, primary_flag TEXT NOT NULL);',
    starterCode: 'SELECT employee_id, department_id FROM Employee;',
    referenceSolution:
      'SELECT employee_id, department_id FROM Employee WHERE primary_flag = "Y" OR employee_id IN (SELECT employee_id FROM Employee GROUP BY employee_id HAVING COUNT(*) = 1);',
    orderMatters: false,
    tests: [
      'INSERT INTO Employee VALUES (1,1,"N"),(2,1,"Y"),(2,2,"N"),(3,3,"N"),(4,3,"N"),(4,4,"Y");',
    ],
  },
  {
    leetcode: 177,
    title: 'Triangle Judgement',
    description:
      'Строки `(x,y,z)`, которые могут быть сторонами **нестороннего** треугольника (сумма любых двух > третьей). Колонка `triangle` = «Yes»/«No».',
    setup: 'CREATE TABLE Triangle(x INTEGER NOT NULL, y INTEGER NOT NULL, z INTEGER NOT NULL);',
    starterCode: 'SELECT x, y, z, "No" AS triangle FROM Triangle;',
    referenceSolution:
      'SELECT x, y, z, CASE WHEN x + y > z AND x + z > y AND y + z > x THEN "Yes" ELSE "No" END AS triangle FROM Triangle;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Triangle VALUES (13,15,30),(10,20,15);',
      'INSERT INTO Triangle VALUES (1,1,1);',
    ],
  },
  {
    leetcode: 180,
    title: 'Consecutive Numbers',
    description:
      'Числа, встречающиеся **≥ 3 раз подряд** (по `id`). Верните `num` **без дубликатов**.',
    setup: 'CREATE TABLE Logs(id INTEGER PRIMARY KEY, num INTEGER NOT NULL);',
    starterCode: 'SELECT DISTINCT num FROM Logs;',
    referenceSolution:
      'SELECT DISTINCT l1.num FROM Logs l1 JOIN Logs l2 ON l1.id = l2.id - 1 JOIN Logs l3 ON l2.id = l3.id - 1 WHERE l1.num = l2.num AND l2.num = l3.num;',
    tests: [
      'INSERT INTO Logs VALUES (1,1),(2,1),(3,1),(4,2),(5,1),(6,2),(7,2);',
      'INSERT INTO Logs VALUES (1,1),(2,2);',
    ],
  },
  {
    leetcode: 1164,
    title: 'Product Price at a Given Date',
    description:
      'Цена каждого `product_id` на «2019-08-16»: последняя известная цена на эту дату или раньше. Колонка `price`.',
    setup:
      'CREATE TABLE Products(product_id INTEGER NOT NULL, new_price INTEGER NOT NULL, change_date TEXT NOT NULL);',
    starterCode: 'SELECT product_id, new_price AS price FROM Products;',
    referenceSolution:
      'SELECT DISTINCT product_id, FIRST_VALUE(new_price) OVER (PARTITION BY product_id ORDER BY change_date DESC) AS price FROM Products WHERE change_date <= "2019-08-16";',
    orderMatters: false,
    tests: [
      'INSERT INTO Products VALUES (1,20,"2019-08-01"),(2,50,"2019-08-01"),(1,30,"2019-08-14"),(1,35,"2019-08-18"),(2,65,"2019-08-22");',
    ],
  },
  {
    leetcode: 1204,
    title: 'Last Person to Fit in the Bus',
    description:
      'Люди садятся в автобус по `turn` по очереди; вместимость 1000 кг. Кто **последний** успел сесть? Колонка `person_name`.',
    setup:
      'CREATE TABLE Queue(person_id INTEGER PRIMARY KEY, person_name TEXT NOT NULL, weight INTEGER NOT NULL, turn INTEGER NOT NULL);',
    starterCode: 'SELECT person_name FROM Queue ORDER BY turn DESC LIMIT 1;',
    referenceSolution:
      'SELECT person_name FROM (SELECT person_name, turn, SUM(weight) OVER (ORDER BY turn) AS running FROM Queue) WHERE running <= 1000 ORDER BY turn DESC LIMIT 1;',
    checkColumnNames: true,
    tests: [
      'INSERT INTO Queue VALUES (5,"Alice",250,1),(4,"Bob",175,5),(3,"Alex",700,2),(6,"John",375,3),(1,"David",200,4);',
    ],
  },
  {
    leetcode: 1907,
    title: 'Count Salary Categories',
    description:
      'Три категории окладов всех сотрудников: `Low Salary` (<20000), `Average Salary` ([20000,50000]), `High Salary` (>50000). Колонки `category`, `accounts_count` (0 если никого).',
    setup: 'CREATE TABLE Accounts(account_id INTEGER PRIMARY KEY, income INTEGER NOT NULL);',
    starterCode: 'SELECT "Low Salary" AS category, COUNT(*) FROM Accounts;',
    referenceSolution:
      'SELECT category, COUNT(a.income) AS accounts_count FROM (SELECT "Low Salary" AS category UNION SELECT "Average Salary" UNION SELECT "High Salary") c LEFT JOIN Accounts a ON (c.category = "Low Salary" AND a.income < 20000) OR (c.category = "Average Salary" AND a.income BETWEEN 20000 AND 50000) OR (c.category = "High Salary" AND a.income > 50000) GROUP BY category ORDER BY category;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Accounts VALUES (3,108039),(2,12747),(8,87709),(6,91796);',
      'INSERT INTO Accounts VALUES (1,1000);',
    ],
  },
];

const subqueryProblems: readonly SqliteProblem[] = [
  {
    leetcode: 1773,
    title: 'Employees Whose Manager Left the Company',
    description:
      'Сотрудники, чей `managerId` **не существует** в таблице (менеджер «уволился»). Колонка `employee_id`.',
    setup:
      'CREATE TABLE Employees(employee_id INTEGER PRIMARY KEY, name TEXT NOT NULL, manager_id INTEGER);',
    starterCode: 'SELECT employee_id FROM Employees;',
    referenceSolution:
      'SELECT employee_id FROM Employees WHERE manager_id IS NOT NULL AND manager_id NOT IN (SELECT employee_id FROM Employees);',
    tests: [
      'INSERT INTO Employees VALUES (3,"Mila",9),(12,"Anton",NULL),(13,"Alex",NULL),(10,"Alice",NULL);',
    ],
  },
  {
    leetcode: 626,
    title: 'Exchange Seats',
    description:
      'Поменяйте местами соседей: нечётный `id` меняется с `id+1`, последний нечётный остаётся. Колонка `id` (новый порядок), `student`.',
    setup: 'CREATE TABLE Seat(id INTEGER PRIMARY KEY, student TEXT NOT NULL);',
    starterCode: 'SELECT id, student FROM Seat;',
    referenceSolution:
      'SELECT CASE WHEN id % 2 = 1 AND id = (SELECT MAX(id) FROM Seat) THEN id WHEN id % 2 = 1 THEN id + 1 ELSE id - 1 END AS id, student FROM Seat ORDER BY id;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Seat VALUES (1,'Abbot'),(2,'Doris'),(3,'Emerson'),(4,'Green'),(5,'Jeames');",
      "INSERT INTO Seat VALUES (1,'A'),(2,'B'),(3,'C');",
    ],
  },
  {
    leetcode: 1341,
    title: 'Movie Rating',
    description:
      'Две строки, одна колонка `results`: (1) имя пользователя с **наибольшим** числом оценок (при ничьей — по алфавиту); (2) название фильма с **наибольшим средним** рейтингом в **феврале 2020** (при ничьей — по алфавиту).',
    setup:
      'CREATE TABLE Movies(movie_id INTEGER PRIMARY KEY, title TEXT NOT NULL);\nCREATE TABLE Users(user_id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE MovieRating(movie_id INTEGER NOT NULL, user_id INTEGER NOT NULL, rating INTEGER NOT NULL, created_at TEXT NOT NULL);',
    starterCode: 'SELECT name AS results FROM Users ORDER BY name LIMIT 1;',
    referenceSolution:
      'SELECT results FROM (SELECT u.name AS results FROM Users u JOIN MovieRating mr ON u.user_id = mr.user_id GROUP BY u.user_id, u.name ORDER BY COUNT(*) DESC, u.name LIMIT 1) UNION ALL SELECT results FROM (SELECT m.title AS results FROM Movies m JOIN MovieRating mr ON m.movie_id = mr.movie_id WHERE strftime("%Y-%m", mr.created_at) = "2020-02" GROUP BY m.movie_id, m.title ORDER BY AVG(mr.rating) DESC, m.title LIMIT 1);',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Movies VALUES (1,"Avengers"),(2,"Frozen 2"),(3,"Joker");\nINSERT INTO Users VALUES (1,"Daniel"),(2,"Monica"),(3,"Maria"),(4,"James");\nINSERT INTO MovieRating VALUES (1,1,3,"2020-03-01"),(1,2,4,"2020-03-01"),(2,1,5,"2020-03-01"),(2,4,2,"2020-03-01"),(3,1,3,"2020-03-01"),(3,2,4,"2020-03-01"),(3,3,5,"2020-03-01"),(3,4,2,"2020-03-01"),(2,1,5,"2020-02-05"),(2,2,5,"2020-02-06"),(3,1,4,"2020-02-01");',
    ],
  },
  {
    leetcode: 1321,
    title: 'Restaurant Growth',
    description:
      'Скользящая сумма `amount` за **7** дней по `visited_on` (окно из 7 последовательных дней с данными). Колонки `visited_on`, `amount`, `average_amount` (округлить 2). Только даты, от которых есть 7 дней истории.',
    setup:
      'CREATE TABLE Customer(customer_id INTEGER NOT NULL, name TEXT NOT NULL, visited_on TEXT NOT NULL, amount INTEGER NOT NULL);',
    starterCode: 'SELECT visited_on, SUM(amount) FROM Customer GROUP BY visited_on;',
    referenceSolution:
      'WITH daily AS (SELECT visited_on, SUM(amount) AS amount FROM Customer GROUP BY visited_on)\nSELECT d1.visited_on, SUM(d2.amount) AS amount, ROUND(SUM(d2.amount) * 1.0 / 7, 2) AS average_amount FROM daily d1 JOIN daily d2 ON julianday(d2.visited_on) BETWEEN julianday(d1.visited_on) - 6 AND julianday(d1.visited_on) GROUP BY d1.visited_on HAVING COUNT(DISTINCT d2.visited_on) = 7 ORDER BY d1.visited_on;',
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO Customer VALUES (1,"Jade","2019-01-01",100),(2,"Jeremy","2019-01-02",200),(3,"Jasmine","2019-01-03",150),(1,"Jade","2019-01-04",80),(2,"Jeremy","2019-01-05",700),(3,"Jasmine","2019-01-06",200),(1,"Jade","2019-01-07",100),(2,"Jeremy","2019-01-08",300);',
    ],
  },
  {
    leetcode: 602,
    title: 'Friend Requests II: Who Has the Most Friends',
    description:
      'Пользователь с **наибольшим** числом друзей (связь в `RequestAccepted` **неориентированная**). Колонка `friend` (id), `friend_count`.',
    setup:
      'CREATE TABLE RequestAccepted(requester_id INTEGER NOT NULL, accepter_id INTEGER NOT NULL, accept_date TEXT NOT NULL);',
    starterCode: 'SELECT requester_id AS friend, COUNT(*) FROM RequestAccepted GROUP BY requester_id;',
    referenceSolution:
      'SELECT id AS friend, COUNT(*) AS friend_count FROM (SELECT requester_id AS id FROM RequestAccepted UNION ALL SELECT accepter_id FROM RequestAccepted) GROUP BY id ORDER BY friend_count DESC LIMIT 1;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO RequestAccepted VALUES (1,2,"2016-06-03"),(1,3,"2016-06-08"),(2,3,"2016-06-08"),(3,4,"2016-06-09");',
    ],
  },
  {
    leetcode: 585,
    title: 'Investments in 2016',
    description:
      'Сумма `tiv_2016` полисов, у которых `tiv_2015` **совпадает хотя бы у двух** разных полисов, а пара `(lat, lon)` **уникальна** в таблице (встречается ровно один раз). Колонка `tiv_2016` (округлить 2).',
    setup:
      'CREATE TABLE Insurance(pid INTEGER PRIMARY KEY, tiv_2015 REAL NOT NULL, tiv_2016 REAL NOT NULL, lat REAL NOT NULL, lon REAL NOT NULL);',
    starterCode: 'SELECT 0 AS tiv_2016;',
    referenceSolution:
      'SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016 FROM Insurance WHERE (lat, lon) IN (SELECT lat, lon FROM Insurance GROUP BY lat, lon HAVING COUNT(*) = 1) AND tiv_2015 IN (SELECT tiv_2015 FROM Insurance GROUP BY tiv_2015 HAVING COUNT(*) > 1);',
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      'INSERT INTO Insurance VALUES (1,10,5,10,10),(2,10,20,20,20),(3,5,30,30,30);',
    ],
  },
  {
    leetcode: 185,
    title: 'Department Top Three Salaries',
    description:
      'Сотрудники, входящие в **топ-3** оклада **в своём** отделе. Колонки: `Department`, `Employee`, `Salary`.',
    setup:
      'CREATE TABLE Employee(id INTEGER PRIMARY KEY, name TEXT NOT NULL, salary INTEGER NOT NULL, departmentId INTEGER NOT NULL);\nCREATE TABLE Department(id INTEGER PRIMARY KEY, name TEXT NOT NULL);',
    starterCode:
      'SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id;',
    referenceSolution:
      'SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id WHERE (SELECT COUNT(DISTINCT e2.salary) FROM Employee e2 WHERE e2.departmentId = e.departmentId AND e2.salary >= e.salary) <= 3 ORDER BY Department, Salary DESC;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Employee VALUES (1,"Joe",85000,1),(2,"Henry",80000,2),(3,"Sam",60000,2),(4,"Max",90000,1),(5,"Janet",69000,1),(6,"Randy",85000,1),(7,"Will",70000,1);\nINSERT INTO Department VALUES (1,"IT"),(2,"Sales");',
    ],
  },
];

const advancedStringProblems: readonly SqliteProblem[] = [
  {
    leetcode: 1667,
    title: 'Fix Names in a Table',
    description:
      'Имена: первая буква заглавная, остальные строчные. Колонки `user_id`, `name`. Сортировка по `user_id`.',
    setup: 'CREATE TABLE Users(user_id INTEGER PRIMARY KEY, name TEXT NOT NULL);',
    starterCode: 'SELECT user_id, name FROM Users;',
    referenceSolution:
      'SELECT user_id, UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2)) AS name FROM Users ORDER BY user_id;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Users VALUES (1,'aLice'),(2,'bOB');",
      "INSERT INTO Users VALUES (1,'a');",
    ],
  },
  {
    leetcode: 1527,
    title: 'Patients With a Condition',
    description:
      'Пациенты с кодом, **начинающимся** с `DIAB1` (коды через пробел). Колонки `patient_id`, `patient_name`, `conditions`.',
    setup:
      'CREATE TABLE Patients(patient_id INTEGER PRIMARY KEY, patient_name TEXT NOT NULL, conditions TEXT NOT NULL);',
    starterCode:
      "SELECT patient_id, patient_name, conditions FROM Patients WHERE conditions LIKE '%DIAB1%';",
    referenceSolution:
      "SELECT patient_id, patient_name, conditions FROM Patients WHERE conditions REGEXP '(^| )DIAB1';",
    tests: [
      "INSERT INTO Patients VALUES (1,'Daniel','YFEV COUGH'),(2,'Alice',''),(3,'Bob','DIAB100 MYOP'),(4,'George','ACNE DIAB100'),(5,'Alain','DIAB201'),(6,'Zed','SADIAB100');",
    ],
  },
  {
    leetcode: 196,
    title: 'Delete Duplicate Emails',
    description:
      'Удалите дубликаты `email`, оставив строку с **минимальным** `id`.',
    setup: 'CREATE TABLE Person(id INTEGER PRIMARY KEY, email TEXT NOT NULL);',
    starterCode: 'SELECT * FROM Person;',
    referenceSolution:
      'DELETE FROM Person WHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email);',
    checkQuery: 'SELECT id, email FROM Person ORDER BY id;',
    orderMatters: true,
    tests: [
      "INSERT INTO Person VALUES (1,'john@example.com'),(2,'bob@example.com'),(3,'john@example.com');",
      "INSERT INTO Person VALUES (1,'a@b.c');",
    ],
  },
  {
    leetcode: 176,
    title: 'Second Highest Salary',
    description:
      'Второй по величине **уникальный** оклад как `SecondHighestSalary`; если нет — одна строка `NULL`.',
    setup: 'CREATE TABLE Employee(id INTEGER PRIMARY KEY, salary INTEGER NOT NULL);',
    starterCode:
      'SELECT salary AS SecondHighestSalary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1;',
    referenceSolution:
      'SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1) AS SecondHighestSalary;',
    checkColumnNames: true,
    tests: [
      'INSERT INTO Employee VALUES (1,100),(2,200),(3,300);',
      'INSERT INTO Employee VALUES (1,100);',
      'INSERT INTO Employee VALUES (1,100),(2,100);',
    ],
  },
  {
    leetcode: 1484,
    title: 'Group Sold Products By The Date',
    description:
      'По каждой `sell_date` — строка `sold_num` (число **разных** товаров) и `sold_products` (имена через запятую **по алфавиту**).',
    setup:
      'CREATE TABLE Activities(sell_date TEXT NOT NULL, product TEXT NOT NULL);',
    starterCode: 'SELECT sell_date, product FROM Activities;',
    referenceSolution:
      "SELECT sell_date, COUNT(DISTINCT product) AS sold_num, GROUP_CONCAT(DISTINCT product) AS sold_products FROM Activities GROUP BY sell_date ORDER BY sell_date;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Activities VALUES ('2020-05-30','Headphone'),('2020-05-30','Notebook'),('2020-05-30','Mouse'),('2020-05-31','Notebook'),('2020-05-31','Mouse');",
    ],
  },
  {
    leetcode: 1327,
    title: 'List the Products Ordered in a Period',
    description:
      'Товары с **≥ 100** единиц, заказанных в период «2020-02-01»–«2020-02-28». Колонка `product` (имя), без дубликатов.',
    setup:
      'CREATE TABLE Products(product_id INTEGER PRIMARY KEY, product_name TEXT NOT NULL, product_category TEXT);\nCREATE TABLE Orders(product_id INTEGER NOT NULL, order_date TEXT NOT NULL, unit INTEGER NOT NULL);',
    starterCode: 'SELECT product_name AS product FROM Products;',
    referenceSolution:
      'SELECT DISTINCT p.product_name AS product FROM Orders o JOIN Products p ON o.product_id = p.product_id WHERE o.order_date BETWEEN "2020-02-01" AND "2020-02-28" GROUP BY p.product_id, p.product_name HAVING SUM(o.unit) >= 100;',
    tests: [
      'INSERT INTO Products VALUES (1,"Leetcode Solutions",NULL),(2,"Jewels of Stringology",NULL),(3,"HP",NULL),(4,"Handbook",NULL);\nINSERT INTO Orders VALUES (1,"2020-02-05",60),(1,"2020-02-10",70),(2,"2020-01-18",30),(2,"2020-02-11",80),(3,"2020-02-17",2),(3,"2020-02-24",3),(4,"2020-03-01",20);',
    ],
  },
  {
    leetcode: 1517,
    title: 'Find Users With Valid E-Mails',
    description:
      'Валидный email: имя из букв/цифр/`_`, `@`, домен из букв/цифр, `.`, `com|net|org`. Колонки `user_id`, `name`, `mail`.',
    setup: 'CREATE TABLE Users(user_id INTEGER PRIMARY KEY, name TEXT NOT NULL, mail TEXT NOT NULL);',
    starterCode: 'SELECT user_id, name, mail FROM Users WHERE mail LIKE "%@%.%";',
    referenceSolution:
      "SELECT user_id, name, mail FROM Users WHERE mail REGEXP '^[A-Za-z0-9_]+@[A-Za-z0-9]+\\.(com|net|org)$';",
    tests: [
      "INSERT INTO Users VALUES (1,'Winston','winston@leetcode.com'),(2,'Jonathan','jonathan@example.com'),(3,'Annabelle','annabelle@example.com'),(4,'Sally','sally@example.com'),(5,'Marwan','marwan@example.com'),(6,'David','david@example.com'),(7,'Bad','m@bad.co');",
    ],
  },
];

export const MODULE_DEFS: readonly ModuleDef[] = [
  {
    file: '01-select.module.json',
    title: 'Select',
    theoryTitle: 'Фильтрация и проекция',
    theoryContent:
      '## SELECT\n\n- **`WHERE`**: `AND` / `OR`, не забывайте **`IS NULL`**.\n- **`DISTINCT`**, **`ORDER BY`**, **`LIMIT`**.\n- SQLite: `LENGTH(text)` вместо `CHAR_LENGTH`.',
    svgCaption: 'SELECT возвращает подмножество строк/столбцов',
    svgDescription: 'Условие в WHERE отсеивает строки до проекции.',
    svgIdPrefix: 'lsq01',
    quizQuestion: 'Клиент с `referee_id IS NULL` попадает в «не referee 2»?',
    quizOptions: ['Нет, NULL не сравнивается', 'Да, если явно учесть NULL в WHERE', 'Только с INNER JOIN', 'Только если referee_id = 0'],
    quizCorrect: [1],
    problems: selectProblems,
  },
  {
    file: '02-basic-joins.module.json',
    title: 'Basic Joins',
    theoryTitle: 'JOIN и NULL в связях',
    theoryContent:
      '## JOIN\n\n- **`INNER JOIN`** — только совпадения.\n- **`LEFT JOIN`** — все строки слева; нет пары → NULL справа.\n- Сравнение дат: `DATE(col, "+1 day")` в SQLite.',
    svgCaption: 'LEFT JOIN сохраняет левую таблицу',
    svgDescription: 'Для «никогда не …» часто LEFT JOIN + `IS NULL`.',
    svgIdPrefix: 'lsq02',
    quizQuestion: 'Как найти клиентов без заказов?',
    quizOptions: [
      'INNER JOIN Orders',
      'LEFT JOIN Orders WHERE Orders.id IS NULL',
      'CROSS JOIN',
      'UNION ALL',
    ],
    quizCorrect: [1],
    problems: basicJoinsProblems,
  },
  {
    file: '03-basic-aggregate.module.json',
    title: 'Basic Aggregate Functions',
    theoryTitle: 'Агрегаты и FILTER',
    theoryContent:
      '## Агрегаты\n\n`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. `COUNT(DISTINCT x)`. Условная агрегация: `SUM(CASE WHEN …)` или `COUNT(*) FILTER (WHERE …)` (SQLite 3.30+).',
    svgCaption: 'GROUP BY сворачивает строки',
    svgDescription: 'Без GROUP BY агрегат по всей таблице.',
    svgIdPrefix: 'lsq03',
    quizQuestion: 'Что вернёт SUM(amount) на пустой таблице?',
    quizOptions: ['0', 'NULL', 'Пустой result set', 'Ошибка'],
    quizCorrect: [1],
    problems: basicAggregateProblems,
  },
  {
    file: '04-sorting-grouping.module.json',
    title: 'Sorting and Grouping',
    theoryTitle: 'GROUP BY, HAVING, ORDER BY',
    theoryContent:
      '## Группировка\n\n`HAVING` фильтрует **группы**. `ORDER BY` после `GROUP BY`. Для «ровно один раз» — `HAVING COUNT(*) = 1`.',
    svgCaption: 'HAVING — WHERE для групп',
    svgDescription: 'Сначала GROUP BY, затем HAVING и ORDER BY.',
    svgIdPrefix: 'lsq04',
    quizQuestion: 'Как отобрать классы с ≥ 5 разными студентами?',
    quizOptions: [
      'WHERE COUNT(DISTINCT student) >= 5',
      'HAVING COUNT(DISTINCT student) >= 5',
      'ORDER BY COUNT(student)',
      'DISTINCT class',
    ],
    quizCorrect: [1],
    problems: sortingGroupingProblems,
  },
  {
    file: '05-advanced-select-joins.module.json',
    title: 'Advanced Select and Joins',
    theoryTitle: 'Оконные функции и сложные JOIN',
    theoryContent:
      '## Окна\n\n`SUM() OVER (ORDER BY …)`, `FIRST_VALUE`, `ROW_NUMBER`. Для «топ-N в группе» — оконные функции или коррелированные подзапросы.',
    svgCaption: 'PARTITION BY задаёт группы для окна',
    svgDescription: 'ORDER BY внутри OVER задаёт порядок строк в окне.',
    svgIdPrefix: 'lsq05',
    quizQuestion: 'Чем `HAVING` отличается от `WHERE`?',
    quizOptions: [
      'HAVING фильтрует группы после GROUP BY',
      'WHERE работает только с JOIN',
      'HAVING нельзя использовать с агрегатами',
      'Ничем',
    ],
    quizCorrect: [0],
    problems: advancedSelectProblems,
  },
  {
    file: '06-subqueries.module.json',
    title: 'Subqueries',
    theoryTitle: 'Подзапросы и CTE',
    theoryContent:
      '## Подзапросы\n\n`IN`, `NOT IN`, `EXISTS`, скалярные подзапросы. **`WITH`** (CTE) для читаемости. Осторожно с `NOT IN` и NULL.',
    svgCaption: 'Подзапрос в FROM — производная таблица',
    svgDescription: 'Коррелированный подзапрос ссылается на внешнюю строку.',
    svgIdPrefix: 'lsq06',
    quizQuestion: 'Почему `NOT IN (SELECT …)` может дать неожиданный результат?',
    quizOptions: [
      'Если подзапрос вернул NULL среди значений',
      'SQLite не поддерживает NOT IN',
      'Только с LEFT JOIN',
      'Из-за ORDER BY',
    ],
    quizCorrect: [0],
    problems: subqueryProblems,
  },
  {
    file: '07-advanced-string-regex.module.json',
    title: 'Advanced String / Regex / Clause',
    theoryTitle: 'Строки, REGEXP, DML',
    theoryContent:
      '## Строки\n\n`SUBSTR`, `||`, `LOWER`/`UPPER`. **`REGEXP`** — JS RegExp. DML с **`checkQuery`**: проверяется состояние таблиц.',
    svgCaption: 'DELETE/UPDATE проверяются через checkQuery',
    svgDescription: 'Результат DELETE без SELECT сравнивается по checkQuery.',
    svgIdPrefix: 'lsq07',
    quizQuestion: 'Как проверяется задача DELETE в этом приложении?',
    quizOptions: [
      'По числу затронутых строк DELETE',
      'По результату checkQuery SELECT',
      'Только по сообщению OK',
      'По последнему SELECT ученика',
    ],
    quizCorrect: [1],
    problems: advancedStringProblems,
  },
];

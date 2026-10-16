/**
 * Module data for the rest of LeetCode's free SQL problems (vt-84).
 * Run: npm run generate:leetcode-sql-course (modules 08–12).
 */
import type { ModuleDef, SqliteProblem } from './leetcode-sql-50-modules-data.mts';

/* ------------------------------------------------------------------ module 08 */

const joinsDmlProblems: readonly SqliteProblem[] = [
  {
    leetcode: 175,
    title: 'Combine Two Tables',
    description:
      'Для каждой записи `Person` верните `firstName`, `lastName`, `city`, `state`; если адреса нет — `NULL`. Сортировка по `personId`.',
    setup:
      'CREATE TABLE Person(personId INTEGER PRIMARY KEY, lastName TEXT NOT NULL, firstName TEXT NOT NULL);\nCREATE TABLE Address(addressId INTEGER PRIMARY KEY, personId INTEGER NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL);',
    starterCode:
      'SELECT p.firstName, p.lastName, a.city, a.state FROM Person p JOIN Address a ON p.personId = a.personId ORDER BY p.personId;',
    referenceSolution:
      'SELECT p.firstName, p.lastName, a.city, a.state FROM Person p LEFT JOIN Address a ON p.personId = a.personId ORDER BY p.personId;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Person VALUES (1,'Wang','Allen'),(2,'Alice','Bob');\nINSERT INTO Address VALUES (1,2,'New York City','New York'),(2,3,'Leetcode','California');",
      "INSERT INTO Person VALUES (1,'Solo','Han');",
      "INSERT INTO Person VALUES (1,'A','X'),(2,'B','Y');",
      "INSERT INTO Person VALUES (3,'C','Z');\nINSERT INTO Address VALUES (9,3,'Boston','MA');",
    ],
  },
  {
    leetcode: 181,
    title: 'Employees Earning More Than Their Managers',
    description:
      'Верните `name` сотрудников, которые зарабатывают **больше** своего менеджера. Колонка `Employee`.',
    setup:
      'CREATE TABLE Employee(id INTEGER PRIMARY KEY, name TEXT NOT NULL, salary INTEGER NOT NULL, managerId INTEGER);',
    starterCode:
      'SELECT e.name AS Employee FROM Employee e JOIN Employee m ON e.managerId = m.id;',
    referenceSolution:
      'SELECT e.name AS Employee FROM Employee e JOIN Employee m ON e.managerId = m.id WHERE e.salary > m.salary;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Employee VALUES (1,'Joe',70000,3),(2,'Henry',80000,4),(3,'Sam',60000,NULL),(4,'Max',90000,NULL);",
      "INSERT INTO Employee VALUES (1,'A',10,2),(2,'B',20,NULL);",
      "INSERT INTO Employee VALUES (1,'A',30,2),(2,'B',20,NULL);",
      "INSERT INTO Employee VALUES (1,'Solo',100,NULL);",
    ],
  },
  {
    leetcode: 183,
    title: 'Customers Who Never Order',
    description:
      'Клиенты, не сделавшие **ни одного** заказа. Верните `name` с псевдонимом `Customers`, сортировка по `id`.',
    setup:
      'CREATE TABLE Customers(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE Orders(id INTEGER PRIMARY KEY, customerId INTEGER NOT NULL);',
    starterCode:
      'SELECT c.name AS Customers FROM Customers c JOIN Orders o ON c.id = o.customerId ORDER BY c.id;',
    referenceSolution:
      'SELECT c.name AS Customers FROM Customers c LEFT JOIN Orders o ON c.id = o.customerId WHERE o.id IS NULL ORDER BY c.id;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Customers VALUES (1,'Joe'),(2,'Henry'),(3,'Sam'),(4,'Max');\nINSERT INTO Orders VALUES (1,3),(2,1);",
      "INSERT INTO Customers VALUES (1,'Solo');",
      "INSERT INTO Customers VALUES (1,'A'),(2,'B');\nINSERT INTO Orders VALUES (1,1),(2,1),(3,2);",
      "INSERT INTO Customers VALUES (1,'Solo'),(2,'Other');\nINSERT INTO Orders VALUES (1,2);",
    ],
  },
  {
    leetcode: 607,
    title: 'Sales Person',
    description:
      'Имя продавца (`name`), у которого **нет** ни одного заказа от компании с именем `RED`.',
    setup:
      'CREATE TABLE SalesPerson(sales_id INTEGER PRIMARY KEY, name TEXT NOT NULL, salary INTEGER NOT NULL, commission_rate INTEGER NOT NULL, hire_date TEXT NOT NULL);\nCREATE TABLE Company(com_id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);\nCREATE TABLE Orders(order_id INTEGER PRIMARY KEY, order_date TEXT NOT NULL, com_id INTEGER NOT NULL, sales_id INTEGER NOT NULL, amount INTEGER NOT NULL);',
    starterCode:
      "SELECT s.name FROM SalesPerson s JOIN Orders o ON s.sales_id = o.sales_id JOIN Company c ON o.com_id = c.com_id WHERE c.name = 'RED';",
    referenceSolution:
      "SELECT s.name FROM SalesPerson s WHERE s.sales_id NOT IN (SELECT o.sales_id FROM Orders o JOIN Company c ON o.com_id = c.com_id WHERE c.name = 'RED');",
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO SalesPerson VALUES (1,'John',100000,6,'2006-04-01'),(2,'Amy',12000,5,'2010-05-01'),(3,'Mark',65000,12,'2008-12-25'),(4,'Pam',25000,25,'2005-01-01'),(5,'Alex',5000,10,'2007-02-03');\nINSERT INTO Company VALUES (1,'RED','Boston'),(2,'ORANGE','New York'),(3,'YELLOW','Boston'),(4,'GREEN','Austin');\nINSERT INTO Orders VALUES (1,'2014-01-01',3,4,10000),(2,'2014-02-01',4,5,5000),(3,'2014-03-01',1,1,50000),(4,'2014-04-01',1,4,60000);",
      "INSERT INTO SalesPerson VALUES (1,'A',1,1,'2020-01-01'),(2,'B',1,1,'2020-01-01');\nINSERT INTO Company VALUES (1,'RED','X');\nINSERT INTO Orders VALUES (1,'2020-01-01',1,1,10),(2,'2020-01-01',1,2,10);",
      "INSERT INTO SalesPerson VALUES (1,'Solo',1,1,'2020-01-01');\nINSERT INTO Company VALUES (1,'RED','X');\nINSERT INTO Orders VALUES (1,'2020-01-01',2,1,10);",
    ],
  },
  {
    leetcode: 627,
    title: 'Swap Salary',
    description:
      'Поменяйте значения `sex` (`m` ↔ `f`) одним `UPDATE` — без промежуточной таблицы. Проверяется состояние таблицы после запроса.',
    setup:
      'CREATE TABLE Salary(id INTEGER PRIMARY KEY, name TEXT NOT NULL, sex TEXT NOT NULL, salary INTEGER NOT NULL);',
    starterCode: 'SELECT * FROM Salary;',
    referenceSolution:
      "UPDATE Salary SET sex = CASE WHEN sex = 'm' THEN 'f' ELSE 'm' END;",
    checkQuery: 'SELECT id, name, sex, salary FROM Salary ORDER BY id;',
    orderMatters: true,
    tests: [
      "INSERT INTO Salary VALUES (1,'A','m',2500),(2,'B','f',1500),(3,'C','m',5500),(4,'D','f',500);",
      "INSERT INTO Salary VALUES (1,'X','m',100);",
      "INSERT INTO Salary VALUES (1,'Y','f',100),(2,'Z','m',200);",
    ],
  },
  {
    leetcode: 1407,
    title: 'Top Travellers',
    description:
      'Для каждого `name`: `travelled_distance` — суммарная дистанция, `0` если поездок не было. Сортировка по дистанции убыв., затем по имени возр.',
    setup:
      'CREATE TABLE Users(id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE Rides(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, distance INTEGER NOT NULL);',
    starterCode:
      'SELECT u.name, SUM(r.distance) AS travelled_distance FROM Users u JOIN Rides r ON u.id = r.user_id GROUP BY u.id ORDER BY travelled_distance DESC, u.name ASC;',
    referenceSolution:
      'SELECT u.name, COALESCE(SUM(r.distance), 0) AS travelled_distance FROM Users u LEFT JOIN Rides r ON u.id = r.user_id GROUP BY u.id ORDER BY travelled_distance DESC, u.name ASC;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Users VALUES (1,'Alice'),(2,'Bob'),(3,'Alex');\nINSERT INTO Rides VALUES (1,1,120),(2,2,317),(3,3,222),(4,1,100);",
      "INSERT INTO Users VALUES (1,'A'),(2,'B');\nINSERT INTO Rides VALUES (1,1,10);",
      "INSERT INTO Users VALUES (1,'A');",
      "INSERT INTO Users VALUES (1,'Zed'),(2,'Ann');\nINSERT INTO Rides VALUES (1,1,50),(2,2,50);",
    ],
  },
  {
    leetcode: 1158,
    title: 'Market Analysis I',
    description:
      'Для каждого покупателя: `buyer_id`, `join_date` и `orders_in_2019` — число заказов за 2019 год (`0`, если заказов нет). Сортировка по `buyer_id`.',
    setup:
      'CREATE TABLE Users(user_id INTEGER PRIMARY KEY, join_date TEXT NOT NULL, favorite_brand TEXT NOT NULL);\nCREATE TABLE Orders(order_id INTEGER PRIMARY KEY, order_date TEXT NOT NULL, item_id INTEGER NOT NULL, buyer_id INTEGER NOT NULL, seller_id INTEGER NOT NULL);\nCREATE TABLE Items(item_id INTEGER PRIMARY KEY, item_brand TEXT NOT NULL);',
    starterCode:
      "SELECT u.user_id AS buyer_id, u.join_date, COUNT(o.order_id) AS orders_in_2019 FROM Users u JOIN Orders o ON u.user_id = o.buyer_id WHERE strftime('%Y', o.order_date) = '2019' GROUP BY u.user_id ORDER BY u.user_id;",
    referenceSolution:
      "SELECT u.user_id AS buyer_id, u.join_date, COUNT(o.order_id) AS orders_in_2019 FROM Users u LEFT JOIN Orders o ON u.user_id = o.buyer_id AND strftime('%Y', o.order_date) = '2019' GROUP BY u.user_id ORDER BY u.user_id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Users VALUES (1,'2018-01-01','Lenovo'),(2,'2018-02-09','Samsung'),(3,'2018-01-19','LG'),(4,'2018-05-21','HP');\nINSERT INTO Orders VALUES (1,'2019-08-01',4,1,2),(2,'2018-08-02',2,1,3),(3,'2019-08-03',3,2,3),(4,'2018-08-04',1,4,2),(5,'2018-08-04',1,3,4),(6,'2019-08-05',2,4,2);\nINSERT INTO Items VALUES (1,'Samsung'),(2,'Lenovo'),(3,'LG'),(4,'HP');",
      "INSERT INTO Users VALUES (1,'2019-01-01','X');\nINSERT INTO Items VALUES (1,'X');",
      "INSERT INTO Users VALUES (1,'2018-01-01','X'),(2,'2018-01-02','Y');\nINSERT INTO Orders VALUES (1,'2020-01-01',1,1,2);\nINSERT INTO Items VALUES (1,'X');",
    ],
  },
  {
    leetcode: 3570,
    title: 'Find Books with No Available Copies',
    description:
      'Книги, которые **сейчас на руках** (`return_date IS NULL`) и у которых не осталось свободных экземпляров (число невозвращённых = `total_copies`). Колонки `book_id`, `title`, `author`, `genre`, `publication_year`, `current_borrowers`; сортировка по `current_borrowers` убыв., затем `title` возр.',
    setup:
      'CREATE TABLE library_books(book_id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, genre TEXT NOT NULL, publication_year INTEGER NOT NULL, total_copies INTEGER NOT NULL);\nCREATE TABLE borrowing_records(record_id INTEGER PRIMARY KEY, book_id INTEGER NOT NULL, borrower_name TEXT NOT NULL, borrow_date TEXT NOT NULL, return_date TEXT);',
    starterCode:
      'SELECT b.book_id, b.title, b.author, b.genre, b.publication_year, COUNT(*) AS current_borrowers FROM library_books b JOIN borrowing_records r ON b.book_id = r.book_id GROUP BY b.book_id ORDER BY current_borrowers DESC, b.title ASC;',
    referenceSolution:
      'SELECT b.book_id, b.title, b.author, b.genre, b.publication_year, COUNT(*) AS current_borrowers FROM library_books b JOIN borrowing_records r ON b.book_id = r.book_id AND r.return_date IS NULL GROUP BY b.book_id HAVING COUNT(*) = b.total_copies ORDER BY current_borrowers DESC, b.title ASC;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO library_books VALUES (1,'The Great Gatsby','F. Scott','Fiction',1925,3),(2,'To Kill a Mockingbird','Harper Lee','Fiction',1960,3),(3,'1984','George Orwell','Dystopian',1949,1),(4,'Pride and Prejudice','Jane Austen','Romance',1813,2),(5,'The Catcher in the Rye','J.D. Salinger','Fiction',1951,1),(6,'Brave New World','Aldous Huxley','Dystopian',1932,4);\nINSERT INTO borrowing_records VALUES (1,1,'Alice Smith','2024-01-15',NULL),(2,1,'Bob Johnson','2024-01-20',NULL),(3,2,'Carol White','2024-01-10','2024-01-25'),(4,3,'David Brown','2024-02-01',NULL),(5,4,'Emma Wilson','2024-01-05',NULL),(6,5,'Frank Davis','2024-01-18','2024-02-10'),(7,1,'Grace Miller','2024-02-05',NULL),(8,6,'Henry Taylor','2024-01-12',NULL),(9,2,'Ivan Clark','2024-02-12',NULL),(10,2,'Jane Adams','2024-02-15',NULL);",
      "INSERT INTO library_books VALUES (1,'Solo','A','G',2000,2),(2,'Other','B','G',2001,5);\nINSERT INTO borrowing_records VALUES (1,1,'P','2024-01-01',NULL),(2,1,'Q','2024-01-02',NULL),(3,2,'R','2024-01-03',NULL);",
      "INSERT INTO library_books VALUES (1,'Only','A','G',2000,2);\nINSERT INTO borrowing_records VALUES (1,1,'P','2024-01-01','2024-01-05'),(2,1,'Q','2024-01-02',NULL);",
    ],
  },
];

/* ------------------------------------------------------------------ module 09 */

const aggregationPivotProblems: readonly SqliteProblem[] = [
  {
    leetcode: 182,
    title: 'Duplicate Emails',
    description: 'Email-адреса (`email`), встречающиеся **более одного раза**.',
    setup: 'CREATE TABLE Person(id INTEGER PRIMARY KEY, email TEXT NOT NULL);',
    starterCode: 'SELECT email FROM Person GROUP BY email HAVING COUNT(*) = 1;',
    referenceSolution: 'SELECT email FROM Person GROUP BY email HAVING COUNT(*) > 1;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Person VALUES (1,'a@b.com'),(2,'c@d.com'),(3,'a@b.com');",
      "INSERT INTO Person VALUES (1,'a@b.com'),(2,'c@d.com');",
      "INSERT INTO Person VALUES (1,'x@y.z'),(2,'x@y.z'),(3,'x@y.z');",
      "INSERT INTO Person VALUES (1,'solo@x.com');",
    ],
  },
  {
    leetcode: 511,
    title: 'Game Play Analysis I',
    description: 'Для каждого `player_id` — дата первой игры как `first_login`.',
    setup:
      'CREATE TABLE Activity(player_id INTEGER NOT NULL, device_id INTEGER NOT NULL, event_date TEXT NOT NULL, games_played INTEGER NOT NULL);',
    starterCode:
      'SELECT player_id, MAX(event_date) AS first_login FROM Activity GROUP BY player_id;',
    referenceSolution:
      'SELECT player_id, MIN(event_date) AS first_login FROM Activity GROUP BY player_id;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Activity VALUES (1,2,'2016-03-01',5),(1,2,'2016-05-02',6),(2,3,'2017-06-25',1),(3,1,'2016-03-02',0),(3,4,'2018-07-03',5);",
      "INSERT INTO Activity VALUES (1,1,'2020-01-01',1),(1,1,'2020-01-02',1);",
      "INSERT INTO Activity VALUES (5,1,'2019-12-31',2);",
    ],
  },
  {
    leetcode: 586,
    title: 'Customer Placing the Largest Number of Orders',
    description: '`customer_number` клиента с наибольшим числом заказов.',
    setup: 'CREATE TABLE Orders(order_number INTEGER PRIMARY KEY, customer_number INTEGER NOT NULL);',
    starterCode:
      'SELECT customer_number FROM Orders GROUP BY customer_number ORDER BY COUNT(*) ASC LIMIT 1;',
    referenceSolution:
      'SELECT customer_number FROM Orders GROUP BY customer_number ORDER BY COUNT(*) DESC LIMIT 1;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Orders VALUES (1,1),(2,2),(3,3),(4,3);',
      'INSERT INTO Orders VALUES (1,5);',
      'INSERT INTO Orders VALUES (1,1),(2,1),(3,2);',
    ],
  },
  {
    leetcode: 1050,
    title: 'Actors and Directors Who Cooperated At Least Three Times',
    description:
      'Пары `actor_id`, `director_id`, работавшие вместе **≥ 3** раз (`timestamp`).',
    setup:
      'CREATE TABLE ActorDirector(actor_id INTEGER NOT NULL, director_id INTEGER NOT NULL, timestamp INTEGER PRIMARY KEY);',
    starterCode:
      'SELECT actor_id, director_id FROM ActorDirector GROUP BY actor_id, director_id HAVING COUNT(*) >= 2;',
    referenceSolution:
      'SELECT actor_id, director_id FROM ActorDirector GROUP BY actor_id, director_id HAVING COUNT(*) >= 3;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO ActorDirector VALUES (1,1,0),(1,1,1),(1,1,2),(1,2,3),(1,2,4),(2,1,5),(2,1,6);',
      'INSERT INTO ActorDirector VALUES (1,1,0),(1,1,1);',
      'INSERT INTO ActorDirector VALUES (3,4,1),(3,4,2),(3,4,3),(3,4,4);',
    ],
  },
  {
    leetcode: 1084,
    title: 'Sales Analysis III',
    description:
      '`product_id`, `product_name` товаров, которые продавались **только** в первом квартале 2019 (`2019-01-01`–`2019-03-31`).',
    setup:
      'CREATE TABLE Product(product_id INTEGER PRIMARY KEY, product_name TEXT NOT NULL, unit_price INTEGER NOT NULL);\nCREATE TABLE Sales(seller_id INTEGER NOT NULL, product_id INTEGER NOT NULL, buyer_id INTEGER NOT NULL, sale_date TEXT NOT NULL, quantity INTEGER NOT NULL, price INTEGER NOT NULL);',
    starterCode:
      "SELECT p.product_id, p.product_name FROM Product p JOIN Sales s ON p.product_id = s.product_id WHERE s.sale_date BETWEEN '2019-01-01' AND '2019-03-31';",
    referenceSolution:
      "SELECT p.product_id, p.product_name FROM Product p JOIN Sales s ON p.product_id = s.product_id GROUP BY p.product_id HAVING MIN(s.sale_date) >= '2019-01-01' AND MAX(s.sale_date) <= '2019-03-31';",
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Product VALUES (1,'S8',1000),(2,'G4',800),(3,'iPhone',1400);\nINSERT INTO Sales VALUES (1,1,1,'2019-01-21',2,2000),(1,2,2,'2019-02-17',1,800),(2,2,3,'2019-06-02',1,800),(3,3,4,'2019-05-13',2,2800);",
      "INSERT INTO Product VALUES (1,'A',10),(2,'B',20);\nINSERT INTO Sales VALUES (1,1,1,'2019-01-01',1,10),(1,1,1,'2019-03-31',1,10),(1,2,1,'2019-04-01',1,20);",
      "INSERT INTO Product VALUES (1,'A',10);",
    ],
  },
  {
    leetcode: 1179,
    title: 'Reformat Department Table',
    description:
      'Разверните `Department` по месяцам: колонки `id`, `Jan_Revenue`, …, `Dec_Revenue`; сумма `revenue` за месяц и `id`, `NULL` если данных нет. Сортировка по `id`.',
    setup: 'CREATE TABLE Department(id INTEGER NOT NULL, revenue INTEGER NOT NULL, month TEXT NOT NULL);',
    starterCode: 'SELECT id, revenue, month FROM Department ORDER BY id;',
    referenceSolution:
      "SELECT id,\n  SUM(CASE WHEN month = 'Jan' THEN revenue END) AS Jan_Revenue,\n  SUM(CASE WHEN month = 'Feb' THEN revenue END) AS Feb_Revenue,\n  SUM(CASE WHEN month = 'Mar' THEN revenue END) AS Mar_Revenue,\n  SUM(CASE WHEN month = 'Apr' THEN revenue END) AS Apr_Revenue,\n  SUM(CASE WHEN month = 'May' THEN revenue END) AS May_Revenue,\n  SUM(CASE WHEN month = 'Jun' THEN revenue END) AS Jun_Revenue,\n  SUM(CASE WHEN month = 'Jul' THEN revenue END) AS Jul_Revenue,\n  SUM(CASE WHEN month = 'Aug' THEN revenue END) AS Aug_Revenue,\n  SUM(CASE WHEN month = 'Sep' THEN revenue END) AS Sep_Revenue,\n  SUM(CASE WHEN month = 'Oct' THEN revenue END) AS Oct_Revenue,\n  SUM(CASE WHEN month = 'Nov' THEN revenue END) AS Nov_Revenue,\n  SUM(CASE WHEN month = 'Dec' THEN revenue END) AS Dec_Revenue\nFROM Department GROUP BY id ORDER BY id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Department VALUES (1,8000,'Jan'),(2,9000,'Jan'),(3,10000,'Feb'),(1,7000,'Feb'),(1,6000,'Mar');",
      "INSERT INTO Department VALUES (1,100,'Dec');",
      "INSERT INTO Department VALUES (2,50,'Jun'),(2,60,'Jun');",
    ],
  },
  {
    leetcode: 1587,
    title: 'Bank Account Summary II',
    description:
      'Имя владельца (`name`) и `balance` — сумма всех транзакций по счёту, если она **больше 10000**.',
    setup:
      'CREATE TABLE Users(account INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE Transactions(trans_id INTEGER PRIMARY KEY, account INTEGER NOT NULL, amount INTEGER NOT NULL, trans_date TEXT NOT NULL);',
    starterCode:
      'SELECT u.name, SUM(t.amount) AS balance FROM Users u JOIN Transactions t ON u.account = t.account GROUP BY u.account;',
    referenceSolution:
      'SELECT u.name, SUM(t.amount) AS balance FROM Users u JOIN Transactions t ON u.account = t.account GROUP BY u.account HAVING SUM(t.amount) > 10000;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Users VALUES (900001,'Alice'),(900002,'Bob'),(900003,'Charlie');\nINSERT INTO Transactions VALUES (1,900001,7000,'2020-09-01'),(2,900001,7000,'2020-09-02'),(3,900001,7000,'2020-09-03'),(4,900002,5000,'2020-09-04'),(5,900003,1000,'2020-09-05'),(6,900003,6000,'2020-09-06');",
      "INSERT INTO Users VALUES (1,'A');\nINSERT INTO Transactions VALUES (1,1,10000,'2020-01-01');",
      "INSERT INTO Users VALUES (1,'A'),(2,'B');\nINSERT INTO Transactions VALUES (1,1,20000,'2020-01-01'),(2,2,-5000,'2020-01-02');",
    ],
  },
  {
    leetcode: 1693,
    title: 'Daily Leads and Partners',
    description:
      'По `date_id`, `make_name`: `unique_leads` (разные `lead_id`) и `unique_partners` (разные `partner_id`).',
    setup:
      'CREATE TABLE DailySales(date_id TEXT NOT NULL, make_name TEXT NOT NULL, lead_id INTEGER NOT NULL, partner_id INTEGER NOT NULL);',
    starterCode:
      'SELECT date_id, make_name, COUNT(lead_id) AS unique_leads, COUNT(partner_id) AS unique_partners FROM DailySales GROUP BY date_id, make_name;',
    referenceSolution:
      'SELECT date_id, make_name, COUNT(DISTINCT lead_id) AS unique_leads, COUNT(DISTINCT partner_id) AS unique_partners FROM DailySales GROUP BY date_id, make_name;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO DailySales VALUES ('2020-12-08','toyota',0,1),('2020-12-08','toyota',1,0),('2020-12-08','toyota',1,2),('2020-12-07','toyota',0,2),('2020-12-07','toyota',0,1),('2020-12-08','honda',1,2),('2020-12-08','honda',1,2),('2020-12-07','honda',0,1),('2020-12-07','honda',2,1);",
      "INSERT INTO DailySales VALUES ('2021-01-01','X',1,1);",
      "INSERT INTO DailySales VALUES ('2021-01-02','Y',1,2),('2021-01-02','Y',1,2);",
    ],
  },
  {
    leetcode: 1741,
    title: 'Find Total Time Spent by Each Employee',
    description:
      'Для пары `(emp_id, event_day)`: `day` и `total_time` = сумма `out_time - in_time`.',
    setup:
      'CREATE TABLE Employees(emp_id INTEGER NOT NULL, event_day TEXT NOT NULL, in_time INTEGER NOT NULL, out_time INTEGER NOT NULL);',
    starterCode:
      'SELECT event_day AS day, emp_id, SUM(out_time + in_time) AS total_time FROM Employees GROUP BY emp_id, event_day;',
    referenceSolution:
      'SELECT event_day AS day, emp_id, SUM(out_time - in_time) AS total_time FROM Employees GROUP BY emp_id, event_day;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Employees VALUES (1,'2020-11-28',7,13),(1,'2020-12-09',9,15),(1,'2020-11-28',9,16),(2,'2020-11-28',8,16),(2,'2020-12-09',8,12),(3,'2020-11-28',9,16),(3,'2020-12-09',9,16);",
      "INSERT INTO Employees VALUES (1,'2020-01-01',1,2);",
      "INSERT INTO Employees VALUES (1,'2020-01-01',9,9);",
    ],
  },
  {
    leetcode: 1890,
    title: 'The Latest Login in 2020',
    description:
      'Для каждого `user_id` — последний вход (`last_stamp`) **в 2020 году**. Пользователи без входов в 2020 не выводятся.',
    setup: 'CREATE TABLE Logins(user_id INTEGER NOT NULL, time_stamp TEXT NOT NULL);',
    starterCode:
      'SELECT user_id, MAX(time_stamp) AS last_stamp FROM Logins GROUP BY user_id;',
    referenceSolution:
      "SELECT user_id, MAX(time_stamp) AS last_stamp FROM Logins WHERE strftime('%Y', time_stamp) = '2020' GROUP BY user_id;",
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Logins VALUES (6,'2020-06-30 15:06:07'),(6,'2021-04-21 14:06:06'),(6,'2019-03-07 00:18:15'),(8,'2020-02-01 05:10:53'),(8,'2020-12-30 00:46:50'),(2,'2020-01-16 02:49:50'),(2,'2019-08-25 07:59:08'),(14,'2019-07-14 09:00:55'),(14,'2021-01-25 06:00:28');",
      "INSERT INTO Logins VALUES (1,'2021-01-01 00:00:00');",
      "INSERT INTO Logins VALUES (5,'2020-01-01 10:00:00'),(5,'2020-01-02 10:00:00');",
    ],
  },
  {
    leetcode: 1393,
    title: 'Capital Gain/Loss',
    description:
      'Для каждой акции (`stock_name`) — `capital_gain_loss` = Σ(продажи) − Σ(покупки), т.е. сумма `price` со знаком минус для `Buy`.',
    setup: 'CREATE TABLE Stocks(stock_name TEXT NOT NULL, operation TEXT NOT NULL, price INTEGER NOT NULL);',
    starterCode:
      'SELECT stock_name, SUM(price) AS capital_gain_loss FROM Stocks GROUP BY stock_name;',
    referenceSolution:
      "SELECT stock_name, SUM(CASE WHEN operation = 'Buy' THEN -price ELSE price END) AS capital_gain_loss FROM Stocks GROUP BY stock_name;",
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Stocks VALUES ('Leetcode','Buy',1000),('Corona Masks','Buy',10),('Leetcode','Sell',9000),('Handbags','Buy',30000),('Corona Masks','Sell',1010),('Handbags','Buy',15000),('Corona Masks','Buy',1000),('Handbags','Sell',60000),('Leetcode','Sell',7000);",
      "INSERT INTO Stocks VALUES ('A','Buy',100),('A','Sell',50);",
      "INSERT INTO Stocks VALUES ('A','Buy',100),('B','Buy',200);",
    ],
  },
  {
    leetcode: 3220,
    title: 'Odd and Even Transactions',
    description:
      'По каждой `transaction_date`: `odd_sum` (сумма нечётных `amount`) и `even_sum` (сумма чётных), `0` если таких нет. Сортировка по дате.',
    setup:
      'CREATE TABLE transactions(transaction_id INTEGER PRIMARY KEY, amount INTEGER NOT NULL, transaction_date TEXT NOT NULL);',
    starterCode:
      'SELECT transaction_date, SUM(CASE WHEN amount % 2 = 1 THEN amount ELSE 0 END) AS odd_sum, SUM(CASE WHEN amount % 2 = 1 THEN amount ELSE 0 END) AS even_sum FROM transactions GROUP BY transaction_date ORDER BY transaction_date;',
    referenceSolution:
      'SELECT transaction_date, SUM(CASE WHEN amount % 2 = 1 THEN amount ELSE 0 END) AS odd_sum, SUM(CASE WHEN amount % 2 = 0 THEN amount ELSE 0 END) AS even_sum FROM transactions GROUP BY transaction_date ORDER BY transaction_date;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO transactions VALUES (1,150,'2024-07-01'),(2,200,'2024-07-01'),(3,75,'2024-07-01'),(4,300,'2024-07-02'),(5,50,'2024-07-02'),(6,120,'2024-07-03');",
      "INSERT INTO transactions VALUES (1,7,'2024-01-01');",
      "INSERT INTO transactions VALUES (1,2,'2024-01-01'),(2,4,'2024-01-01');",
    ],
  },
];

/* ------------------------------------------------------------------ module 10 */

const subquerySetTreeProblems: readonly SqliteProblem[] = [
  {
    leetcode: 1873,
    title: 'Calculate Special Bonus',
    description:
      '`bonus` = `salary`, если `employee_id` нечётный **и** `name` не начинается с `M`; иначе `0`. Сортировка по `employee_id`.',
    setup: 'CREATE TABLE Employees(employee_id INTEGER PRIMARY KEY, name TEXT NOT NULL, salary INTEGER NOT NULL);',
    starterCode:
      "SELECT employee_id, CASE WHEN employee_id % 2 = 1 THEN salary ELSE 0 END AS bonus FROM Employees ORDER BY employee_id;",
    referenceSolution:
      "SELECT employee_id, CASE WHEN employee_id % 2 = 1 AND name NOT LIKE 'M%' THEN salary ELSE 0 END AS bonus FROM Employees ORDER BY employee_id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Employees VALUES (2,'Meir',3000),(3,'Michael',3800),(7,'Addilyn',7400),(8,'Juan',6100),(9,'Kannon',7700);",
      "INSERT INTO Employees VALUES (1,'M',100);",
      "INSERT INTO Employees VALUES (2,'A',100);",
      "INSERT INTO Employees VALUES (3,'B',100);",
    ],
  },
  {
    leetcode: 1795,
    title: 'Rearrange Products Table',
    description:
      'Разверните `Products` в длинный формат: `product_id`, `store` (`store1`/`store2`/`store3`), `price`; строки с `NULL` не выводятся. Сортировка по `product_id`, `store`.',
    setup: 'CREATE TABLE Products(product_id INTEGER PRIMARY KEY, store1 INTEGER, store2 INTEGER, store3 INTEGER);',
    starterCode: "SELECT product_id, 'store1' AS store, store1 AS price FROM Products;",
    referenceSolution:
      "SELECT product_id, 'store1' AS store, store1 AS price FROM Products WHERE store1 IS NOT NULL\nUNION ALL SELECT product_id, 'store2', store2 FROM Products WHERE store2 IS NOT NULL\nUNION ALL SELECT product_id, 'store3', store3 FROM Products WHERE store3 IS NOT NULL\nORDER BY product_id, store;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Products VALUES (0,95,100,105),(1,70,NULL,80);',
      'INSERT INTO Products VALUES (1,NULL,NULL,NULL);',
      'INSERT INTO Products VALUES (1,10,NULL,NULL);',
      'INSERT INTO Products VALUES (1,NULL,20,NULL),(2,NULL,NULL,30);',
    ],
  },
  {
    leetcode: 1965,
    title: 'Employees With Missing Information',
    description:
      '`employee_id` сотрудников, у которых нет `name` **или** нет `salary`. Сортировка по `employee_id`.',
    setup:
      'CREATE TABLE Employees(employee_id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE Salaries(employee_id INTEGER PRIMARY KEY, salary INTEGER NOT NULL);',
    starterCode: 'SELECT employee_id FROM Employees UNION SELECT employee_id FROM Salaries ORDER BY employee_id;',
    referenceSolution:
      'SELECT employee_id FROM (\n  SELECT e.employee_id AS employee_id FROM Employees e LEFT JOIN Salaries s ON e.employee_id = s.employee_id WHERE s.employee_id IS NULL\n  UNION\n  SELECT s.employee_id AS employee_id FROM Salaries s LEFT JOIN Employees e ON e.employee_id = s.employee_id WHERE e.employee_id IS NULL\n)\nORDER BY employee_id;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Employees VALUES (2,'Crew'),(4,'Haven'),(5,'Kristian');\nINSERT INTO Salaries VALUES (5,76071),(1,22517),(4,63539);",
      "INSERT INTO Employees VALUES (1,'A');\nINSERT INTO Salaries VALUES (1,100);",
      "INSERT INTO Employees VALUES (1,'A'),(2,'B');",
      "INSERT INTO Salaries VALUES (9,10);",
    ],
  },
  {
    leetcode: 184,
    title: 'Department Highest Salary',
    description:
      'Для каждого отдела — сотрудники с **максимальной** зарплатой в нём. Колонки `Department`, `Employee`, `Salary`.',
    setup:
      'CREATE TABLE Employee(id INTEGER PRIMARY KEY, name TEXT NOT NULL, salary INTEGER NOT NULL, departmentId INTEGER NOT NULL);\nCREATE TABLE Department(id INTEGER PRIMARY KEY, name TEXT NOT NULL);',
    starterCode:
      'SELECT d.name AS Department, e.name AS Employee, MAX(e.salary) AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id GROUP BY d.id;',
    referenceSolution:
      'SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id WHERE (SELECT COUNT(DISTINCT e2.salary) FROM Employee e2 WHERE e2.departmentId = e.departmentId AND e2.salary > e.salary) = 0;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Employee VALUES (1,'Joe',70000,1),(2,'Jim',90000,1),(3,'Henry',80000,2),(4,'Sam',60000,2),(5,'Max',90000,1);\nINSERT INTO Department VALUES (1,'IT'),(2,'Sales');",
      "INSERT INTO Employee VALUES (1,'A',10,1),(2,'B',10,1),(3,'C',5,2);\nINSERT INTO Department VALUES (1,'D1'),(2,'D2');",
      "INSERT INTO Employee VALUES (1,'A',10,9);\nINSERT INTO Department VALUES (1,'Other');",
    ],
  },
  {
    leetcode: 608,
    title: 'Tree Node',
    description:
      'Для каждого узла `Tree` верните `id` и `type`: `Root` (нет `p_id`), `Inner` (есть потомки), `Leaf`. Сортировка по `id`.',
    setup: 'CREATE TABLE Tree(id INTEGER PRIMARY KEY, p_id INTEGER);',
    starterCode:
      "SELECT id, CASE WHEN p_id IS NULL THEN 'Leaf' ELSE 'Root' END AS type FROM Tree ORDER BY id;",
    referenceSolution:
      "SELECT id, CASE WHEN p_id IS NULL THEN 'Root' WHEN id IN (SELECT DISTINCT p_id FROM Tree WHERE p_id IS NOT NULL) THEN 'Inner' ELSE 'Leaf' END AS type FROM Tree ORDER BY id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Tree VALUES (1,NULL),(2,1),(3,1),(4,2),(5,2);',
      'INSERT INTO Tree VALUES (1,NULL);',
      'INSERT INTO Tree VALUES (1,NULL),(2,1);',
    ],
  },
  {
    leetcode: 3497,
    title: 'Analyze Subscription Conversion',
    description:
      'Пользователи, перешедшие с `free_trial` на `paid`: `user_id`, `trial_avg_duration`, `paid_avg_duration` — средние `activity_duration` за соответствующий период (округлить до 2 знаков). Строки `cancelled` игнорируются. Сортировка по `user_id`.',
    setup:
      'CREATE TABLE UserActivity(user_id INTEGER NOT NULL, activity_date TEXT NOT NULL, activity_type TEXT NOT NULL, activity_duration INTEGER NOT NULL);',
    starterCode:
      "SELECT user_id, ROUND(AVG(activity_duration), 2) AS trial_avg_duration, ROUND(AVG(activity_duration), 2) AS paid_avg_duration FROM UserActivity WHERE activity_type <> 'cancelled' GROUP BY user_id ORDER BY user_id;",
    referenceSolution:
      "WITH t AS (SELECT user_id, activity_type, ROUND(SUM(activity_duration) * 1.0 / COUNT(*), 2) AS duration FROM UserActivity WHERE activity_type <> 'cancelled' GROUP BY user_id, activity_type)\nSELECT f.user_id, f.duration AS trial_avg_duration, p.duration AS paid_avg_duration FROM t f JOIN t p ON f.user_id = p.user_id WHERE f.activity_type = 'free_trial' AND p.activity_type = 'paid' ORDER BY f.user_id;",
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO UserActivity VALUES (1,'2023-01-01','free_trial',45),(1,'2023-01-02','free_trial',30),(1,'2023-01-05','free_trial',60),(1,'2023-01-10','paid',75),(1,'2023-01-12','paid',90),(1,'2023-01-15','paid',65),(2,'2023-02-01','free_trial',55),(2,'2023-02-03','free_trial',25),(2,'2023-02-07','free_trial',50),(2,'2023-02-10','cancelled',0),(3,'2023-03-05','free_trial',70),(3,'2023-03-06','free_trial',60),(3,'2023-03-08','free_trial',80),(3,'2023-03-12','paid',50),(3,'2023-03-15','paid',55),(3,'2023-03-20','paid',85),(4,'2023-04-01','free_trial',40),(4,'2023-04-03','free_trial',35),(4,'2023-04-05','paid',45),(4,'2023-04-07','cancelled',0);",
      "INSERT INTO UserActivity VALUES (1,'2023-01-01','free_trial',10),(1,'2023-01-02','paid',20);",
      "INSERT INTO UserActivity VALUES (1,'2023-01-01','free_trial',10);",
    ],
  },
  {
    leetcode: 3521,
    title: 'Find Product Recommendation Pairs',
    description:
      'Пары товаров (`product1_id` < `product2_id`), купленные **≥ 3** разными покупателями: колонки `product1_id`, `product2_id`, `product1_category`, `product2_category`, `customer_count`. Сортировка: `customer_count` убыв., затем `product1_id`, `product2_id` возр.',
    setup:
      'CREATE TABLE ProductPurchases(user_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, PRIMARY KEY(user_id, product_id));\nCREATE TABLE ProductInfo(product_id INTEGER PRIMARY KEY, category TEXT NOT NULL, price INTEGER NOT NULL);',
    starterCode:
      'SELECT a.product_id AS product1_id, b.product_id AS product2_id, ai.category AS product1_category, bi.category AS product2_category, COUNT(*) AS customer_count FROM ProductPurchases a JOIN ProductPurchases b ON a.user_id = b.user_id AND a.product_id < b.product_id JOIN ProductInfo ai ON ai.product_id = a.product_id JOIN ProductInfo bi ON bi.product_id = b.product_id GROUP BY a.product_id, b.product_id ORDER BY customer_count DESC, product1_id, product2_id;',
    referenceSolution:
      'SELECT a.product_id AS product1_id, b.product_id AS product2_id, ai.category AS product1_category, bi.category AS product2_category, COUNT(DISTINCT a.user_id) AS customer_count FROM ProductPurchases a JOIN ProductPurchases b ON a.user_id = b.user_id AND a.product_id < b.product_id JOIN ProductInfo ai ON ai.product_id = a.product_id JOIN ProductInfo bi ON bi.product_id = b.product_id GROUP BY a.product_id, b.product_id HAVING COUNT(DISTINCT a.user_id) >= 3 ORDER BY customer_count DESC, product1_id, product2_id;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO ProductPurchases VALUES (1,101,2),(1,102,1),(1,103,3),(2,101,1),(2,102,5),(2,104,1),(3,101,2),(3,103,1),(3,105,4),(4,101,1),(4,102,1),(4,103,2),(4,104,3),(5,102,2),(5,104,1);\nINSERT INTO ProductInfo VALUES (101,'Electronics',100),(102,'Books',20),(103,'Clothing',35),(104,'Kitchen',50),(105,'Sports',75);",
      "INSERT INTO ProductPurchases VALUES (1,1,1),(1,2,1),(2,1,1),(2,2,1),(3,1,1),(3,3,1);\nINSERT INTO ProductInfo VALUES (1,'A',1),(2,'B',1),(3,'C',1);",
      "INSERT INTO ProductPurchases VALUES (1,1,1),(1,2,1),(2,1,1),(2,2,1),(3,1,1),(3,2,1),(4,1,1),(4,2,1);\nINSERT INTO ProductInfo VALUES (1,'A',1),(2,'B',1);",
    ],
  },
  {
    leetcode: 3554,
    title: 'Find Category Recommendation Pairs',
    description:
      'Пары **категорий** (`category1` < `category2`), товары из которых покупали **≥ 3** разных покупателя: колонки `category1`, `category2`, `customer_count`. Сортировка: `customer_count` убыв., затем `category1`, `category2` возр.',
    setup:
      'CREATE TABLE ProductPurchases(user_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL, PRIMARY KEY(user_id, product_id));\nCREATE TABLE ProductInfo(product_id INTEGER PRIMARY KEY, category TEXT NOT NULL, price INTEGER NOT NULL);',
    starterCode:
      'WITH user_category AS (SELECT DISTINCT p.user_id, i.category FROM ProductPurchases p JOIN ProductInfo i ON p.product_id = i.product_id)\nSELECT a.category AS category1, b.category AS category2, COUNT(*) AS customer_count FROM user_category a JOIN user_category b ON a.user_id = b.user_id AND a.category < b.category GROUP BY a.category, b.category ORDER BY customer_count DESC, category1, category2;',
    referenceSolution:
      'WITH user_category AS (SELECT DISTINCT p.user_id, i.category FROM ProductPurchases p JOIN ProductInfo i ON p.product_id = i.product_id)\nSELECT a.category AS category1, b.category AS category2, COUNT(DISTINCT a.user_id) AS customer_count FROM user_category a JOIN user_category b ON a.user_id = b.user_id AND a.category < b.category GROUP BY a.category, b.category HAVING COUNT(DISTINCT a.user_id) >= 3 ORDER BY customer_count DESC, category1, category2;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO ProductPurchases VALUES (1,101,2),(1,102,1),(1,201,3),(1,301,1),(2,101,1),(2,102,2),(2,103,1),(2,201,5),(3,101,2),(3,103,1),(3,301,4),(3,401,2),(4,101,1),(4,201,3),(4,301,1),(4,401,2),(5,102,2),(5,103,1),(5,201,2),(5,202,3);\nINSERT INTO ProductInfo VALUES (101,'Electronics',100),(102,'Books',20),(103,'Books',35),(201,'Clothing',45),(202,'Clothing',60),(301,'Sports',75),(401,'Kitchen',50);",
      "INSERT INTO ProductPurchases VALUES (1,1,1),(1,2,1),(2,1,1),(2,2,1);\nINSERT INTO ProductInfo VALUES (1,'A',1),(2,'B',1);",
      "INSERT INTO ProductPurchases VALUES (1,1,1),(1,2,1),(2,1,1),(2,2,1),(3,1,1),(3,2,1);\nINSERT INTO ProductInfo VALUES (1,'A',1),(2,'B',1);",
    ],
  },
  {
    leetcode: 3764,
    title: 'Most Common Course Pairs',
    description:
      'Для «сильных» студентов (≥ 5 курсов и средний `course_rating` ≥ 4) — последовательные пары курсов в порядке `completion_date`: `first_course`, `second_course`, `transition_count`. Сортировка: `transition_count` убыв., затем названия курсов возр.',
    setup:
      'CREATE TABLE course_completions(user_id INTEGER NOT NULL, course_id INTEGER NOT NULL, course_name TEXT NOT NULL, completion_date TEXT NOT NULL, course_rating INTEGER NOT NULL, PRIMARY KEY(user_id, course_id));',
    starterCode:
      'WITH pairs AS (SELECT course_name AS first_course, LEAD(course_name) OVER (PARTITION BY user_id ORDER BY completion_date, course_id) AS second_course FROM course_completions)\nSELECT first_course, second_course, COUNT(*) AS transition_count FROM pairs WHERE second_course IS NOT NULL GROUP BY first_course, second_course ORDER BY transition_count DESC, first_course, second_course;',
    referenceSolution:
      'WITH top_students AS (SELECT user_id FROM course_completions GROUP BY user_id HAVING COUNT(*) >= 5 AND AVG(course_rating) >= 4),\npairs AS (SELECT c.course_name AS first_course, LEAD(c.course_name) OVER (PARTITION BY c.user_id ORDER BY c.completion_date, c.course_id) AS second_course FROM course_completions c JOIN top_students t ON t.user_id = c.user_id)\nSELECT first_course, second_course, COUNT(*) AS transition_count FROM pairs WHERE second_course IS NOT NULL GROUP BY first_course, second_course ORDER BY transition_count DESC, first_course, second_course;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO course_completions VALUES (1,101,'Python Basics','2024-01-05',5),(1,102,'SQL Fundamentals','2024-02-10',4),(1,103,'JavaScript','2024-03-15',5),(1,104,'React Basics','2024-04-20',4),(1,105,'Node.js','2024-05-25',5),(1,106,'Docker','2024-06-30',4),(2,101,'Python Basics','2024-01-08',4),(2,104,'React Basics','2024-02-14',5),(2,105,'Node.js','2024-03-20',4),(2,106,'Docker','2024-04-25',5),(2,107,'AWS Fundamentals','2024-05-30',4),(3,101,'Python Basics','2024-01-10',3),(3,102,'SQL Fundamentals','2024-02-12',3),(3,103,'JavaScript','2024-03-18',3),(3,104,'React Basics','2024-04-22',2),(3,105,'Node.js','2024-05-28',3),(4,101,'Python Basics','2024-01-12',5),(4,108,'Data Science','2024-02-16',5),(4,109,'Machine Learning','2024-03-22',5);",
      "INSERT INTO course_completions VALUES (1,1,'A','2024-01-01',4),(1,2,'B','2024-02-01',4),(1,3,'C','2024-03-01',4),(1,4,'D','2024-04-01',4),(1,5,'E','2024-05-01',3);",
      "INSERT INTO course_completions VALUES (1,1,'A','2024-01-01',5),(1,2,'B','2024-02-01',5),(1,3,'C','2024-03-01',5),(1,4,'D','2024-04-01',5);",
    ],
  },
];

/* ------------------------------------------------------------------ module 11 */

const windowCteProblems: readonly SqliteProblem[] = [
  {
    leetcode: 177,
    title: 'Nth Highest Salary',
    description:
      'Верните N-й по величине **уникальный** оклад как `getNthHighestSalary`; значение `N` лежит в таблице `params` (колонка `n`). Если такого нет — одна строка `NULL`.',
    setup:
      'CREATE TABLE Employee(id INTEGER PRIMARY KEY, salary INTEGER NOT NULL);\nCREATE TABLE params(n INTEGER NOT NULL);',
    starterCode: 'SELECT MAX(salary) AS getNthHighestSalary FROM Employee;',
    referenceSolution:
      'SELECT (SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET (SELECT n - 1 FROM params)) AS getNthHighestSalary;',
    orderMatters: false,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Employee VALUES (1,100),(2,200),(3,300);\nINSERT INTO params VALUES (2);',
      'INSERT INTO Employee VALUES (1,100);\nINSERT INTO params VALUES (2);',
      'INSERT INTO Employee VALUES (1,100),(2,100);\nINSERT INTO params VALUES (2);',
      'INSERT INTO Employee VALUES (1,100),(2,200),(3,300);\nINSERT INTO params VALUES (3);',
    ],
  },
  {
    leetcode: 178,
    title: 'Rank Scores',
    description:
      'Для каждой `score` — `rank` без пропусков (dense rank) по убыванию score. Сортировка по `score` убыв.',
    setup: 'CREATE TABLE Scores(id INTEGER PRIMARY KEY, score REAL NOT NULL);',
    starterCode:
      'SELECT score, ROW_NUMBER() OVER (ORDER BY score DESC) AS "rank" FROM Scores ORDER BY score DESC;',
    referenceSolution:
      'SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS "rank" FROM Scores ORDER BY score DESC;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      'INSERT INTO Scores VALUES (1,3.50),(2,3.65),(3,4.00),(4,3.85),(5,4.00),(6,3.65);',
      'INSERT INTO Scores VALUES (1,1.0);',
      'INSERT INTO Scores VALUES (1,10.0),(2,5.0),(3,5.0);',
    ],
  },
  {
    leetcode: 262,
    title: 'Trips and Users',
    description:
      'Для дат `2013-10-01`–`2013-10-03`: `Day` и `Cancellation Rate` — доля отменённых поездок (статус ≠ `completed`) среди поездок, где и клиент, и водитель не забанены. Округлить до 2 знаков, сортировка по дате.',
    setup:
      'CREATE TABLE Trips(id INTEGER PRIMARY KEY, client_id INTEGER NOT NULL, driver_id INTEGER NOT NULL, city_id INTEGER NOT NULL, status TEXT NOT NULL, request_at TEXT NOT NULL);\nCREATE TABLE Users(users_id INTEGER PRIMARY KEY, banned TEXT NOT NULL, role TEXT NOT NULL);',
    starterCode:
      'SELECT t.request_at AS Day, ROUND(SUM(CASE WHEN t.status = \'completed\' THEN 1 ELSE 0 END) * 1.0 / COUNT(*), 2) AS "Cancellation Rate" FROM Trips t WHERE t.request_at BETWEEN \'2013-10-01\' AND \'2013-10-03\' GROUP BY t.request_at ORDER BY t.request_at;',
    referenceSolution:
      'SELECT t.request_at AS Day, ROUND(SUM(CASE WHEN t.status <> \'completed\' THEN 1 ELSE 0 END) * 1.0 / COUNT(*), 2) AS "Cancellation Rate" FROM Trips t JOIN Users c ON t.client_id = c.users_id AND c.banned = \'No\' JOIN Users d ON t.driver_id = d.users_id AND d.banned = \'No\' WHERE t.request_at BETWEEN \'2013-10-01\' AND \'2013-10-03\' GROUP BY t.request_at ORDER BY t.request_at;',
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO Trips VALUES (1,1,10,1,'completed','2013-10-01'),(2,2,11,1,'cancelled_by_driver','2013-10-01'),(3,3,12,6,'completed','2013-10-01'),(4,4,13,6,'cancelled_by_client','2013-10-01'),(5,1,10,1,'completed','2013-10-02'),(6,2,11,6,'completed','2013-10-02'),(7,3,12,6,'completed','2013-10-02'),(8,2,12,12,'completed','2013-10-03'),(9,3,10,12,'completed','2013-10-03'),(10,4,13,12,'cancelled_by_driver','2013-10-03');\nINSERT INTO Users VALUES (1,'No','client'),(2,'Yes','client'),(3,'No','client'),(4,'No','client'),(10,'No','driver'),(11,'No','driver'),(12,'No','driver'),(13,'No','driver');",
      "INSERT INTO Trips VALUES (1,1,10,1,'completed','2013-10-01'),(2,1,10,1,'completed','2013-10-01');\nINSERT INTO Users VALUES (1,'No','client'),(10,'No','driver');",
      "INSERT INTO Trips VALUES (1,2,11,1,'cancelled_by_client','2013-10-02'),(2,1,10,1,'completed','2013-10-02');\nINSERT INTO Users VALUES (2,'Yes','client'),(1,'No','client'),(11,'No','driver'),(10,'No','driver');",
    ],
  },
  {
    leetcode: 601,
    title: 'Human Traffic of Stadium',
    description:
      'Строки стадиона, где `people >= 100` у **трёх и более** последовательных `id`. Колонки `id`, `visit_date`, `people`; сортировка по `visit_date`.',
    setup: 'CREATE TABLE Stadium(id INTEGER PRIMARY KEY, visit_date TEXT NOT NULL, people INTEGER NOT NULL);',
    starterCode:
      'SELECT id, visit_date, people FROM Stadium WHERE people >= 100 ORDER BY visit_date;',
    referenceSolution:
      'WITH t AS (SELECT id, visit_date, people, id - ROW_NUMBER() OVER (ORDER BY id) AS grp FROM Stadium WHERE people >= 100)\nSELECT id, visit_date, people FROM t WHERE grp IN (SELECT grp FROM t GROUP BY grp HAVING COUNT(*) >= 3) ORDER BY visit_date;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Stadium VALUES (1,'2017-01-01',10),(2,'2017-01-02',109),(3,'2017-01-03',150),(4,'2017-01-04',99),(5,'2017-01-05',145),(6,'2017-01-06',1455),(7,'2017-01-07',199),(8,'2017-01-08',188);",
      "INSERT INTO Stadium VALUES (1,'2017-01-01',100),(2,'2017-01-02',100);",
      "INSERT INTO Stadium VALUES (1,'2017-01-01',200),(2,'2017-01-02',300),(3,'2017-01-03',100);",
      "INSERT INTO Stadium VALUES (10,'2017-01-01',100),(11,'2017-01-02',100),(12,'2017-01-03',100);",
    ],
  },
  {
    leetcode: 3421,
    title: 'Find Students Who Improved',
    description:
      'Студенты, у которых минимум два экзамена по предмету и **последний** балл выше **первого**: `student_id`, `subject`, `first_score`, `latest_score`. Сортировка по `student_id`, `subject`.',
    setup:
      'CREATE TABLE Scores(student_id INTEGER NOT NULL, subject TEXT NOT NULL, score INTEGER NOT NULL, exam_date TEXT NOT NULL, PRIMARY KEY(student_id, subject, exam_date));',
    starterCode:
      'SELECT student_id, subject, MIN(score) AS first_score, MAX(score) AS latest_score FROM Scores GROUP BY student_id, subject;',
    referenceSolution:
      'WITH ranked AS (SELECT student_id, subject, score, ROW_NUMBER() OVER (PARTITION BY student_id, subject ORDER BY exam_date) AS rn_first, ROW_NUMBER() OVER (PARTITION BY student_id, subject ORDER BY exam_date DESC) AS rn_last FROM Scores)\nSELECT f.student_id, f.subject, f.score AS first_score, l.score AS latest_score FROM ranked f JOIN ranked l ON f.student_id = l.student_id AND f.subject = l.subject AND f.rn_first = 1 AND l.rn_last = 1 WHERE l.score > f.score ORDER BY f.student_id, f.subject;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Scores VALUES (101,'Math',70,'2023-01-15'),(101,'Math',85,'2023-02-15'),(101,'Physics',65,'2023-01-15'),(101,'Physics',60,'2023-02-15'),(102,'Math',80,'2023-01-15'),(102,'Math',85,'2023-02-15'),(103,'Math',90,'2023-01-15'),(104,'Physics',75,'2023-01-15'),(104,'Physics',85,'2023-02-15');",
      "INSERT INTO Scores VALUES (1,'Math',50,'2023-01-01');",
      "INSERT INTO Scores VALUES (1,'Math',90,'2023-01-01'),(1,'Math',80,'2023-02-01');",
    ],
  },
  {
    leetcode: 3482,
    title: 'Analyze Organization Hierarchy',
    description:
      'Для каждого сотрудника: `level` (CEO = 1), `team_size` (все подчинённые, прямые и косвенные), `budget` (свой оклад + оклады всех подчинённых). Колонки `employee_id`, `employee_name`, `level`, `team_size`, `budget`. Сортировка: `level` возр., `budget` убыв., `employee_name` возр.',
    setup:
      'CREATE TABLE Employees(employee_id INTEGER PRIMARY KEY, employee_name TEXT NOT NULL, manager_id INTEGER, salary INTEGER NOT NULL, department TEXT NOT NULL);',
    starterCode:
      'SELECT employee_id, employee_name, 1 AS level, 0 AS team_size, salary AS budget FROM Employees ORDER BY level, budget DESC, employee_name;',
    referenceSolution:
      'WITH RECURSIVE pairs(ancestor_id, descendant_id, salary) AS (SELECT employee_id, employee_id, salary FROM Employees\nUNION ALL SELECT p.ancestor_id, e.employee_id, e.salary FROM pairs p JOIN Employees e ON e.manager_id = p.descendant_id),\nup AS (SELECT descendant_id AS employee_id, COUNT(*) AS level FROM pairs GROUP BY descendant_id),\ndown AS (SELECT ancestor_id AS employee_id, COUNT(*) - 1 AS team_size, SUM(salary) AS budget FROM pairs GROUP BY ancestor_id)\nSELECT e.employee_id, e.employee_name, u.level, d.team_size, d.budget FROM Employees e JOIN up u ON u.employee_id = e.employee_id JOIN down d ON d.employee_id = e.employee_id ORDER BY u.level, d.budget DESC, e.employee_name;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Employees VALUES (1,'Alice',NULL,12000,'Executive'),(2,'Bob',1,10000,'Sales'),(3,'Charlie',1,10000,'Engineering'),(4,'David',2,7500,'Sales'),(5,'Eva',2,7500,'Sales'),(6,'Frank',3,9000,'Engineering'),(7,'Grace',3,8500,'Engineering'),(8,'Hank',4,6000,'Sales'),(9,'Ivy',6,7000,'Engineering'),(10,'Judy',6,7000,'Engineering');",
      "INSERT INTO Employees VALUES (1,'Solo',NULL,5000,'Exec');",
      "INSERT INTO Employees VALUES (1,'Boss',NULL,100,'X'),(2,'A',1,50,'X'),(3,'B',1,60,'X');",
    ],
  },
  {
    leetcode: 3564,
    title: 'Seasonal Sales Analysis',
    description:
      'Самый популярный `category` каждого сезона (Winter: 12/01/02, Spring: 03/04/05, Summer: 06/07/08, Fall: 09/10/11) по сумме `quantity`; при равенстве — по выручке `quantity * price`, затем по алфавиту. Колонки `season`, `category`, `total_quantity`, `total_revenue`; сортировка по `season`.',
    setup:
      'CREATE TABLE sales(sale_id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL, sale_date TEXT NOT NULL, quantity INTEGER NOT NULL, price REAL NOT NULL);\nCREATE TABLE products(product_id INTEGER PRIMARY KEY, product_name TEXT NOT NULL, category TEXT NOT NULL);',
    starterCode:
      "SELECT 'Fall' AS season, p.category, SUM(s.quantity) AS total_quantity, SUM(s.quantity * s.price) AS total_revenue FROM sales s JOIN products p ON p.product_id = s.product_id GROUP BY p.category;",
    referenceSolution:
      "WITH seasonal AS (SELECT CASE WHEN strftime('%m', s.sale_date) IN ('12','01','02') THEN 'Winter' WHEN strftime('%m', s.sale_date) IN ('03','04','05') THEN 'Spring' WHEN strftime('%m', s.sale_date) IN ('06','07','08') THEN 'Summer' ELSE 'Fall' END AS season, p.category, SUM(s.quantity) AS total_quantity, SUM(s.quantity * s.price) AS total_revenue FROM sales s JOIN products p ON p.product_id = s.product_id GROUP BY season, p.category),\nranked AS (SELECT *, RANK() OVER (PARTITION BY season ORDER BY total_quantity DESC, total_revenue DESC, category ASC) AS rk FROM seasonal)\nSELECT season, category, total_quantity, total_revenue FROM ranked WHERE rk = 1 ORDER BY season;",
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO sales VALUES (1,1,'2023-01-15',5,10.00),(2,2,'2023-01-20',4,15.00),(3,3,'2023-03-10',3,18.00),(4,4,'2023-04-05',1,20.00),(5,1,'2023-05-20',2,10.00),(6,2,'2023-06-12',4,15.00),(7,5,'2023-06-15',5,12.00),(8,3,'2023-07-24',2,18.00),(9,4,'2023-08-01',5,20.00),(10,5,'2023-09-03',3,12.00),(11,1,'2023-09-25',6,10.00),(12,2,'2023-11-10',4,15.00),(13,3,'2023-12-05',6,18.00),(14,4,'2023-12-22',3,20.00),(15,5,'2024-02-14',2,12.00);\nINSERT INTO products VALUES (1,'Warm Jacket','Apparel'),(2,'Designer Jeans','Apparel'),(3,'Cutting Board','Kitchen'),(4,'Smart Speaker','Tech'),(5,'Yoga Mat','Fitness');",
      "INSERT INTO sales VALUES (1,1,'2023-01-05',3,10.0);\nINSERT INTO products VALUES (1,'A','Alpha');",
      "INSERT INTO sales VALUES (1,1,'2023-01-05',5,10.0),(2,2,'2023-01-06',5,20.0);\nINSERT INTO products VALUES (1,'A','Alpha'),(2,'B','Beta');",
    ],
  },
  {
    leetcode: 3580,
    title: 'Find Consistently Improving Employees',
    description:
      'Сотрудники (≥ 3 отзыва), у которых **последние три** отзыва строго возрастают: `employee_id`, `name`, `improvement_score` = последний − первый из этих трёх. Сортировка: `improvement_score` убыв., `name` возр.',
    setup:
      'CREATE TABLE employees(employee_id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE performance_reviews(review_id INTEGER PRIMARY KEY, employee_id INTEGER NOT NULL, review_date TEXT NOT NULL, rating INTEGER NOT NULL);',
    starterCode:
      'SELECT e.employee_id, e.name, MAX(p.rating) - MIN(p.rating) AS improvement_score FROM employees e JOIN performance_reviews p ON p.employee_id = e.employee_id GROUP BY e.employee_id ORDER BY improvement_score DESC, e.name;',
    referenceSolution:
      'WITH recent AS (SELECT employee_id, rating, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY review_date DESC, review_id DESC) AS rn FROM performance_reviews),\nlast3 AS (SELECT employee_id, MAX(CASE WHEN rn = 1 THEN rating END) AS r1, MAX(CASE WHEN rn = 2 THEN rating END) AS r2, MAX(CASE WHEN rn = 3 THEN rating END) AS r3, COUNT(*) AS cnt FROM recent WHERE rn <= 3 GROUP BY employee_id)\nSELECT e.employee_id, e.name, l.r1 - l.r3 AS improvement_score FROM last3 l JOIN employees e ON e.employee_id = l.employee_id WHERE l.cnt = 3 AND l.r1 > l.r2 AND l.r2 > l.r3 ORDER BY improvement_score DESC, e.name;',
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO employees VALUES (1,'Alice Johnson'),(2,'Bob Smith'),(3,'Carol Davis'),(4,'David Wilson'),(5,'Emma Brown');\nINSERT INTO performance_reviews VALUES (1,1,'2023-01-15',2),(2,1,'2023-04-15',3),(3,1,'2023-07-15',4),(4,1,'2023-10-15',5),(5,2,'2023-02-01',3),(6,2,'2023-05-01',2),(7,2,'2023-08-01',4),(8,2,'2023-11-01',5),(9,3,'2023-03-10',1),(10,3,'2023-06-10',2),(11,3,'2023-09-10',3),(12,3,'2023-12-10',4),(13,4,'2023-01-20',4),(14,4,'2023-04-20',4),(15,4,'2023-07-20',4),(16,5,'2023-02-15',3),(17,5,'2023-05-15',2);",
      "INSERT INTO employees VALUES (1,'Only');\nINSERT INTO performance_reviews VALUES (1,1,'2023-01-01',1),(2,1,'2023-02-01',2),(3,1,'2023-03-01',3);",
      "INSERT INTO employees VALUES (1,'Flat');\nINSERT INTO performance_reviews VALUES (1,1,'2023-01-01',3),(2,1,'2023-02-01',3),(3,1,'2023-03-01',3),(4,1,'2023-04-01',3);",
    ],
  },
  {
    leetcode: 3601,
    title: 'Find Drivers with Improved Fuel Efficiency',
    description:
      'Водители, у которых средняя эффективность (`distance_km / fuel_consumed`) во **второй** половине года выше, чем в **первой** (янв–июн / июл–дек). Колонки `driver_id`, `driver_name`, `first_half_avg`, `second_half_avg`, `efficiency_improvement` (округлить до 2). Сортировка: улучшение убыв., имя возр.',
    setup:
      'CREATE TABLE drivers(driver_id INTEGER PRIMARY KEY, driver_name TEXT NOT NULL);\nCREATE TABLE trips(trip_id INTEGER PRIMARY KEY, driver_id INTEGER NOT NULL, trip_date TEXT NOT NULL, distance_km REAL NOT NULL, fuel_consumed REAL NOT NULL);',
    starterCode:
      "WITH halves AS (SELECT driver_id, CASE WHEN CAST(strftime('%m', trip_date) AS INTEGER) <= 6 THEN 1 ELSE 2 END AS half, AVG(distance_km / fuel_consumed) AS avg_eff FROM trips GROUP BY driver_id, half)\nSELECT h1.driver_id, d.driver_name, ROUND(h1.avg_eff, 2) AS first_half_avg, ROUND(h2.avg_eff, 2) AS second_half_avg, ROUND(h2.avg_eff - h1.avg_eff, 2) AS efficiency_improvement FROM halves h1 JOIN halves h2 ON h1.driver_id = h2.driver_id AND h1.half = 1 AND h2.half = 2 JOIN drivers d ON d.driver_id = h1.driver_id ORDER BY efficiency_improvement DESC, d.driver_name;",
    referenceSolution:
      "WITH halves AS (SELECT driver_id, CASE WHEN CAST(strftime('%m', trip_date) AS INTEGER) <= 6 THEN 1 ELSE 2 END AS half, AVG(distance_km / fuel_consumed) AS avg_eff FROM trips GROUP BY driver_id, half)\nSELECT h1.driver_id, d.driver_name, ROUND(h1.avg_eff, 2) AS first_half_avg, ROUND(h2.avg_eff, 2) AS second_half_avg, ROUND(h2.avg_eff - h1.avg_eff, 2) AS efficiency_improvement FROM halves h1 JOIN halves h2 ON h1.driver_id = h2.driver_id AND h1.half = 1 AND h2.half = 2 JOIN drivers d ON d.driver_id = h1.driver_id WHERE h2.avg_eff > h1.avg_eff ORDER BY efficiency_improvement DESC, d.driver_name;",
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO drivers VALUES (1,'Alice Johnson'),(2,'Bob Smith'),(3,'Carol Davis'),(4,'David Wilson'),(5,'Emma Brown');\nINSERT INTO trips VALUES (1,1,'2023-02-15',120.5,10.2),(2,1,'2023-03-20',200.0,16.5),(3,1,'2023-08-10',150.0,11.0),(4,1,'2023-09-25',180.0,12.5),(5,2,'2023-01-10',100.0,9.0),(6,2,'2023-04-15',250.0,22.0),(7,2,'2023-10-05',200.0,15.0),(8,3,'2023-03-12',80.0,8.5),(9,3,'2023-05-18',90.0,9.2),(10,4,'2023-07-22',160.0,12.8),(11,4,'2023-11-30',140.0,11.0),(12,5,'2023-02-28',110.0,11.5);",
      "INSERT INTO drivers VALUES (1,'Worse');\nINSERT INTO trips VALUES (1,1,'2023-02-01',100.0,10.0),(2,1,'2023-08-01',100.0,20.0);",
      "INSERT INTO drivers VALUES (1,'Half');\nINSERT INTO trips VALUES (1,1,'2023-02-01',100.0,10.0);",
    ],
  },
];

/* ------------------------------------------------------------------ module 12 */

const stringsAnalyticsProblems: readonly SqliteProblem[] = [
  {
    leetcode: 3436,
    title: 'Find Valid Emails',
    description:
      'Валидный email: ровно один `@`, локальная часть из букв/цифр/`_`, домен только из букв и заканчивается на `.com`. Колонки `user_id`, `email`; сортировка по `user_id`.',
    setup: 'CREATE TABLE Users(user_id INTEGER PRIMARY KEY, email TEXT NOT NULL);',
    starterCode:
      "SELECT user_id, email FROM Users WHERE email REGEXP '^.+@[A-Za-z]+\\.com$' ORDER BY user_id;",
    referenceSolution:
      "SELECT user_id, email FROM Users WHERE email REGEXP '^[A-Za-z0-9_]+@[A-Za-z]+\\.com$' ORDER BY user_id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Users VALUES (1,'alice@example.com'),(2,'bob_at_example.com'),(3,'charlie@example.net'),(4,'david@domain.com'),(5,'eve@invalid');",
      "INSERT INTO Users VALUES (1,'a-b@x.com');",
      "INSERT INTO Users VALUES (1,'a_b@x.com');",
      "INSERT INTO Users VALUES (1,'a@b.c.com');",
    ],
  },
  {
    leetcode: 3465,
    title: 'Find Products with Valid Serial Numbers',
    description:
      'Товары, в описании которых есть серийный номер вида `SN` + ровно 4 цифры + `-` + ровно 4 цифры (границы слова). Колонки `product_id`, `product_name`, `description`; сортировка по `product_id`.',
    setup:
      'CREATE TABLE products(product_id INTEGER PRIMARY KEY, product_name TEXT NOT NULL, description TEXT NOT NULL);',
    starterCode:
      "SELECT product_id, product_name, description FROM products WHERE description LIKE '%SN____-____%' ORDER BY product_id;",
    referenceSolution:
      "SELECT product_id, product_name, description FROM products WHERE description REGEXP '\\bSN[0-9]{4}-[0-9]{4}\\b' ORDER BY product_id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO products VALUES (1,'Widget A','This is a sample product with SN1234-5678'),(2,'Widget B','A product with serial SN9876-1234 in the description'),(3,'Widget C','Product SN1234-56789 is available now'),(4,'Widget D','No serial number here'),(5,'Widget E','Check out SN4321-8765 in this description');",
      "INSERT INTO products VALUES (1,'X','code xSN1234-5678 here');",
      "INSERT INTO products VALUES (1,'X','valid SN0000-0000 code');",
      "INSERT INTO products VALUES (1,'X','nothing');",
    ],
  },
  {
    leetcode: 3475,
    title: 'DNA Pattern Recognition',
    description:
      'Для каждой последовательности верните `sample_id`, `dna_sequence`, `species` и флаги: `has_start` (начинается с `ATG`), `has_stop` (заканчивается `TAA`/`TAG`/`TGA`), `has_atat` (содержит `ATAT`), `has_ggg` (есть ≥ 3 подряд `G`). Сортировка по `sample_id`.',
    setup: 'CREATE TABLE Samples(sample_id INTEGER PRIMARY KEY, dna_sequence TEXT NOT NULL, species TEXT NOT NULL);',
    starterCode:
      "SELECT sample_id, dna_sequence, species, dna_sequence LIKE 'ATG%' AS has_start, dna_sequence LIKE '%TAA%' AS has_stop, dna_sequence LIKE '%ATAT%' AS has_atat, dna_sequence LIKE '%GGG%' AS has_ggg FROM Samples ORDER BY sample_id;",
    referenceSolution:
      "SELECT sample_id, dna_sequence, species, dna_sequence LIKE 'ATG%' AS has_start, dna_sequence REGEXP 'TAA$|TAG$|TGA$' AS has_stop, dna_sequence LIKE '%ATAT%' AS has_atat, dna_sequence REGEXP 'GGG' AS has_ggg FROM Samples ORDER BY sample_id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO Samples VALUES (1,'ATGCTAGCTAGCTAA','Human'),(2,'GGGTCAATCATC','Human'),(3,'ATATATCGTAGCTA','Human'),(4,'ATGGGGTCATCATAA','Mouse'),(5,'TCAGTCAGTCAG','Mouse'),(6,'ATATCGCGCTAG','Zebrafish'),(7,'CGTATGCGTCGTA','Zebrafish');",
      "INSERT INTO Samples VALUES (1,'TAAXXXX','X');",
      "INSERT INTO Samples VALUES (1,'GGGG','X');",
      "INSERT INTO Samples VALUES (1,'ATGATATAA','X');",
    ],
  },
  {
    leetcode: 3374,
    title: 'First Letter Capitalization II',
    description:
      'Преобразуйте каждое слово `content_text`: если слово начинается не с английской буквы — без изменений; если это 2+ части из английских букв через `-` — каждую часть с заглавной; иначе — первая буква заглавная, остальные строчные. Колонки `content_id`, `original_text`, `converted_text`.',
    setup: 'CREATE TABLE user_content(content_id INTEGER PRIMARY KEY, content_text TEXT NOT NULL);',
    starterCode:
      'SELECT content_id, content_text AS original_text, UPPER(SUBSTR(content_text, 1, 1)) || LOWER(SUBSTR(content_text, 2)) AS converted_text FROM user_content ORDER BY content_id;',
    referenceSolution:
      "WITH RECURSIVE splitwords(content_id, idx, word, rest) AS (SELECT content_id, 1, CASE WHEN instr(content_text, ' ') = 0 THEN content_text ELSE substr(content_text, 1, instr(content_text, ' ') - 1) END, CASE WHEN instr(content_text, ' ') = 0 THEN '' ELSE substr(content_text, instr(content_text, ' ') + 1) END FROM user_content\nUNION ALL SELECT content_id, idx + 1, CASE WHEN instr(rest, ' ') = 0 THEN rest ELSE substr(rest, 1, instr(rest, ' ') - 1) END, CASE WHEN instr(rest, ' ') = 0 THEN '' ELSE substr(rest, instr(rest, ' ') + 1) END FROM splitwords WHERE rest <> ''),\nparts(content_id, idx, part_idx, part, rest) AS (SELECT content_id, idx, 1, CASE WHEN instr(word, '-') = 0 THEN word ELSE substr(word, 1, instr(word, '-') - 1) END, CASE WHEN instr(word, '-') = 0 THEN '' ELSE substr(word, instr(word, '-') + 1) END FROM splitwords\nUNION ALL SELECT content_id, idx, part_idx + 1, CASE WHEN instr(rest, '-') = 0 THEN rest ELSE substr(rest, 1, instr(rest, '-') - 1) END, CASE WHEN instr(rest, '-') = 0 THEN '' ELSE substr(rest, instr(rest, '-') + 1) END FROM parts WHERE rest <> ''),\nhyphen(content_id, idx, part_idx, acc) AS (SELECT content_id, idx, 1, UPPER(SUBSTR(part, 1, 1)) || LOWER(SUBSTR(part, 2)) FROM parts WHERE part_idx = 1\nUNION ALL SELECT p.content_id, p.idx, p.part_idx, h.acc || '-' || UPPER(SUBSTR(p.part, 1, 1)) || LOWER(SUBSTR(p.part, 2)) FROM hyphen h JOIN parts p ON p.content_id = h.content_id AND p.idx = h.idx AND p.part_idx = h.part_idx + 1),\nwordinfo AS (SELECT w.content_id, w.idx, w.word, COUNT(p.part_idx) AS part_count, MAX(CASE WHEN p.part_idx = 1 AND SUBSTR(p.part, 1, 1) GLOB '[A-Za-z]' THEN 1 ELSE 0 END) AS starts_letter, MIN(CASE WHEN p.part <> '' AND p.part NOT GLOB '*[^A-Za-z]*' THEN 1 ELSE 0 END) AS all_letters FROM splitwords w JOIN parts p ON p.content_id = w.content_id AND p.idx = w.idx GROUP BY w.content_id, w.idx),\nconverted AS (SELECT content_id, idx, CASE WHEN starts_letter = 0 THEN word WHEN all_letters = 1 AND part_count >= 2 THEN (SELECT acc FROM hyphen h WHERE h.content_id = wordinfo.content_id AND h.idx = wordinfo.idx ORDER BY h.part_idx DESC LIMIT 1) ELSE UPPER(SUBSTR(word, 1, 1)) || LOWER(SUBSTR(word, 2)) END AS conv FROM wordinfo),\nbuilt(content_id, idx, out) AS (SELECT content_id, idx, conv FROM converted WHERE idx = 1\nUNION ALL SELECT b.content_id, c.idx, b.out || ' ' || c.conv FROM built b JOIN converted c ON c.content_id = b.content_id AND c.idx = b.idx + 1)\nSELECT uc.content_id, uc.content_text AS original_text, COALESCE((SELECT out FROM built b WHERE b.content_id = uc.content_id ORDER BY b.idx DESC LIMIT 1), '') AS converted_text FROM user_content uc ORDER BY uc.content_id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO user_content VALUES (1,'hello world of SQL'),(2,'the QUICK-brown fox'),(3,'modern-day DATA science'),(4,'web-based FRONT-end development');",
      "INSERT INTO user_content VALUES (1,'123abc DEF');",
      "INSERT INTO user_content VALUES (1,'a-b-c x');",
      "INSERT INTO user_content VALUES (1,'@tag hello');",
    ],
  },
  {
    leetcode: 3451,
    title: 'Find Invalid IP Addresses',
    description:
      'Невалидный IPv4: не 4 октета, октет > 255 или октет с ведущим нулём. Колонки `ip`, `invalid_count`; сортировка по `invalid_count` и `ip` убыв.',
    setup: 'CREATE TABLE logs(log_id INTEGER PRIMARY KEY, ip TEXT NOT NULL, status_code INTEGER NOT NULL);',
    starterCode:
      "SELECT ip, COUNT(*) AS invalid_count FROM logs WHERE length(ip) - length(replace(ip, '.', '')) <> 3 GROUP BY ip ORDER BY invalid_count DESC, ip DESC;",
    referenceSolution:
      "WITH RECURSIVE split(log_id, ip, octet, rest, cnt) AS (SELECT log_id, ip, CASE WHEN instr(ip, '.') = 0 THEN ip ELSE substr(ip, 1, instr(ip, '.') - 1) END, CASE WHEN instr(ip, '.') = 0 THEN '' ELSE substr(ip, instr(ip, '.') + 1) END, CASE WHEN instr(ip, '.') = 0 THEN 1 ELSE 2 END FROM logs\nUNION ALL SELECT log_id, ip, CASE WHEN instr(rest, '.') = 0 THEN rest ELSE substr(rest, 1, instr(rest, '.') - 1) END, CASE WHEN instr(rest, '.') = 0 THEN '' ELSE substr(rest, instr(rest, '.') + 1) END, cnt + 1 FROM split WHERE rest <> ''),\nper_ip AS (SELECT log_id, ip, COUNT(*) AS octets, SUM(CASE WHEN octet = '' OR octet GLOB '*[^0-9]*' OR octet GLOB '0*[0-9]*' OR CAST(octet AS INTEGER) > 255 THEN 1 ELSE 0 END) AS bad FROM split GROUP BY log_id)\nSELECT ip, COUNT(*) AS invalid_count FROM per_ip WHERE octets <> 4 OR bad > 0 OR substr(ip, -1) = '.' GROUP BY ip ORDER BY invalid_count DESC, ip DESC;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO logs VALUES (1,'192.168.1.1',200),(2,'256.1.2.3',404),(3,'192.168.001.1',200),(4,'192.168.1.1',200),(5,'192.168.1',500),(6,'256.1.2.3',404),(7,'192.168.001.1',200);",
      "INSERT INTO logs VALUES (1,'0.0.0.0',200),(2,'01.0.0.0',200);",
      "INSERT INTO logs VALUES (1,'1.2.3.4.5',200),(2,'1.2.3.4',200);",
    ],
  },
  {
    leetcode: 3586,
    title: 'Find COVID Recovery Patients',
    description:
      'Пациенты, у которых был положительный тест, а позже — отрицательный: `patient_id`, `patient_name`, `age`, `recovery_time` (дней от **первого** положительного до **первого** следующего отрицательного). Сортировка: `recovery_time` возр., имя возр.',
    setup:
      'CREATE TABLE patients(patient_id INTEGER PRIMARY KEY, patient_name TEXT NOT NULL, age INTEGER NOT NULL);\nCREATE TABLE covid_tests(test_id INTEGER PRIMARY KEY, patient_id INTEGER NOT NULL, test_date TEXT NOT NULL, result TEXT NOT NULL);',
    starterCode:
      "SELECT p.patient_id, p.patient_name, p.age, 0 AS recovery_time FROM patients p JOIN covid_tests t ON t.patient_id = p.patient_id GROUP BY p.patient_id ORDER BY recovery_time, p.patient_name;",
    referenceSolution:
      "WITH pos AS (SELECT patient_id, MIN(test_date) AS fp FROM covid_tests WHERE result = 'Positive' GROUP BY patient_id),\nneg AS (SELECT t.patient_id, MIN(t.test_date) AS fn FROM covid_tests t JOIN pos ON pos.patient_id = t.patient_id WHERE t.result = 'Negative' AND t.test_date > pos.fp GROUP BY t.patient_id)\nSELECT p.patient_id, p.patient_name, p.age, CAST(ROUND(julianday(n.fn) - julianday(o.fp)) AS INTEGER) AS recovery_time FROM patients p JOIN pos o ON o.patient_id = p.patient_id JOIN neg n ON n.patient_id = p.patient_id ORDER BY recovery_time, p.patient_name;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO patients VALUES (1,'Alice Smith',28),(2,'Bob Johnson',35),(3,'Carol Davis',42),(4,'David Wilson',31),(5,'Emma Brown',29);\nINSERT INTO covid_tests VALUES (1,1,'2023-01-15','Positive'),(2,1,'2023-01-25','Negative'),(3,2,'2023-02-01','Positive'),(4,2,'2023-02-05','Inconclusive'),(5,2,'2023-02-12','Negative'),(6,3,'2023-01-20','Negative'),(7,3,'2023-02-10','Positive'),(8,3,'2023-02-20','Negative'),(9,4,'2023-01-10','Positive'),(10,4,'2023-01-18','Positive'),(11,5,'2023-02-15','Negative'),(12,5,'2023-02-20','Negative');",
      "INSERT INTO patients VALUES (1,'Only Pos',20);\nINSERT INTO covid_tests VALUES (1,1,'2023-01-01','Positive'),(2,1,'2023-01-05','Positive');",
      "INSERT INTO patients VALUES (1,'Same Day',20);\nINSERT INTO covid_tests VALUES (1,1,'2023-01-01','Positive'),(2,1,'2023-01-01','Negative');",
    ],
  },
  {
    leetcode: 3611,
    title: 'Find Overbooked Employees',
    description:
      'Сотрудники, у которых **больше 50%** рабочей недели (40 ч) уходит на встречи: суммарно **> 20 ч** за календарную неделю (Пн–Вс), таких недель **≥ 2**. Колонки `employee_id`, `employee_name`, `department`, `meeting_heavy_weeks`. Сортировка: недели убыв., имя возр.',
    setup:
      'CREATE TABLE employees(employee_id INTEGER PRIMARY KEY, employee_name TEXT NOT NULL, department TEXT NOT NULL);\nCREATE TABLE meetings(meeting_id INTEGER PRIMARY KEY, employee_id INTEGER NOT NULL, meeting_date TEXT NOT NULL, meeting_type TEXT NOT NULL, duration_hours REAL NOT NULL);',
    starterCode:
      'SELECT e.employee_id, e.employee_name, e.department, COUNT(*) AS meeting_heavy_weeks FROM meetings m JOIN employees e ON e.employee_id = m.employee_id WHERE m.duration_hours > 20 GROUP BY e.employee_id ORDER BY meeting_heavy_weeks DESC, e.employee_name;',
    referenceSolution:
      "WITH weekly AS (SELECT employee_id, strftime('%Y-%W', meeting_date) AS wk, SUM(duration_hours) AS hours FROM meetings GROUP BY employee_id, wk)\nSELECT e.employee_id, e.employee_name, e.department, COUNT(*) AS meeting_heavy_weeks FROM weekly w JOIN employees e ON e.employee_id = w.employee_id WHERE w.hours > 20 GROUP BY e.employee_id HAVING COUNT(*) >= 2 ORDER BY meeting_heavy_weeks DESC, e.employee_name;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO employees VALUES (1,'Alice Johnson','Engineering'),(2,'Bob Smith','Marketing'),(3,'Carol Davis','Sales'),(4,'David Wilson','Engineering'),(5,'Emma Brown','HR');\nINSERT INTO meetings VALUES (1,1,'2023-06-05','Team',8.0),(2,1,'2023-06-06','Client',6.0),(3,1,'2023-06-07','Training',7.0),(4,1,'2023-06-12','Team',12.0),(5,1,'2023-06-13','Client',9.0),(6,2,'2023-06-05','Team',15.0),(7,2,'2023-06-06','Client',8.0),(8,2,'2023-06-12','Training',10.0),(9,3,'2023-06-05','Team',4.0),(10,3,'2023-06-06','Client',3.0),(11,4,'2023-06-05','Team',25.0),(12,4,'2023-06-19','Client',22.0),(13,5,'2023-06-05','Training',2.0);",
      "INSERT INTO employees VALUES (1,'One Week','X');\nINSERT INTO meetings VALUES (1,1,'2023-06-05','Team',21.0);",
      "INSERT INTO employees VALUES (1,'Two Weeks','X');\nINSERT INTO meetings VALUES (1,1,'2023-06-05','Team',11.0),(2,1,'2023-06-06','Team',10.0),(3,1,'2023-06-12','Team',25.0);",
    ],
  },
  {
    leetcode: 3617,
    title: 'Find Students with Study Spiral Pattern',
    description:
      'Студенты, которые изучают ≥ 3 разных предмета повторяющимся циклом (минимум 2 полных цикла, ≥ 6 сессий), причём все соседние сессии идут без разрыва больше 2 дней. Колонки `student_id`, `student_name`, `major`, `cycle_length`, `total_study_hours`. Сортировка: `cycle_length` убыв., часы убыв.',
    setup:
      'CREATE TABLE students(student_id INTEGER PRIMARY KEY, student_name TEXT NOT NULL, major TEXT NOT NULL);\nCREATE TABLE study_sessions(session_id INTEGER PRIMARY KEY, student_id INTEGER NOT NULL, subject TEXT NOT NULL, session_date TEXT NOT NULL, hours_studied REAL NOT NULL);',
    starterCode:
      'SELECT s.student_id, s.student_name, s.major, COUNT(DISTINCT ss.subject) AS cycle_length, SUM(ss.hours_studied) AS total_study_hours FROM students s JOIN study_sessions ss ON ss.student_id = s.student_id GROUP BY s.student_id HAVING COUNT(DISTINCT ss.subject) >= 3 ORDER BY cycle_length DESC, total_study_hours DESC;',
    referenceSolution:
      "WITH ranked AS (SELECT student_id, session_id, session_date, subject, hours_studied, julianday(session_date) - julianday(LAG(session_date) OVER (PARTITION BY student_id ORDER BY session_date, session_id)) AS gap, ROW_NUMBER() OVER (PARTITION BY student_id ORDER BY session_date, session_id) AS idx FROM study_sessions),\ncontig AS (SELECT student_id FROM ranked GROUP BY student_id HAVING SUM(CASE WHEN gap > 2 THEN 1 ELSE 0 END) = 0),\nstats AS (SELECT r.student_id, COUNT(*) AS cnt, COUNT(DISTINCT r.subject) AS k FROM ranked r JOIN contig c ON c.student_id = r.student_id GROUP BY r.student_id HAVING COUNT(DISTINCT r.subject) >= 3 AND COUNT(*) >= 2 * COUNT(DISTINCT r.subject) AND COUNT(*) % COUNT(DISTINCT r.subject) = 0),\ngood AS (SELECT st.student_id, st.k FROM stats st WHERE NOT EXISTS (SELECT 1 FROM ranked cur JOIN ranked cyc ON cyc.student_id = cur.student_id AND cyc.idx = ((cur.idx - 1) % st.k) + 1 WHERE cur.student_id = st.student_id AND cur.subject <> cyc.subject))\nSELECT s.student_id, s.student_name, s.major, g.k AS cycle_length, ROUND((SELECT SUM(r.hours_studied) FROM ranked r WHERE r.student_id = g.student_id), 2) AS total_study_hours FROM good g JOIN students s ON s.student_id = g.student_id ORDER BY cycle_length DESC, total_study_hours DESC;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO students VALUES (1,'Alice Chen','Computer Science'),(2,'Bob Johnson','Mathematics'),(3,'Carol Davis','Physics'),(4,'David Wilson','Chemistry'),(5,'Emma Brown','Biology');\nINSERT INTO study_sessions VALUES (1,1,'Math','2023-10-01',2.5),(2,1,'Physics','2023-10-02',3.0),(3,1,'Chemistry','2023-10-03',2.0),(4,1,'Math','2023-10-04',2.5),(5,1,'Physics','2023-10-05',3.0),(6,1,'Chemistry','2023-10-06',2.0),(7,2,'Algebra','2023-10-01',4.0),(8,2,'Calculus','2023-10-02',3.5),(9,2,'Statistics','2023-10-03',2.5),(10,2,'Geometry','2023-10-04',3.0),(11,2,'Algebra','2023-10-05',4.0),(12,2,'Calculus','2023-10-06',3.5),(13,2,'Statistics','2023-10-07',2.5),(14,2,'Geometry','2023-10-08',3.0),(15,3,'Biology','2023-10-01',2.0),(16,3,'Chemistry','2023-10-02',2.5),(17,3,'Biology','2023-10-03',2.0),(18,3,'Chemistry','2023-10-04',2.5),(19,4,'Organic','2023-10-01',3.0),(20,4,'Physical','2023-10-05',2.5);",
      "INSERT INTO students VALUES (9,'Broken Cycle','X'),(10,'Gappy','X');\nINSERT INTO study_sessions VALUES (1,9,'A','2023-10-01',1.0),(2,9,'B','2023-10-02',1.0),(3,9,'C','2023-10-03',1.0),(4,9,'A','2023-10-04',1.0),(5,9,'B','2023-10-05',1.0),(6,9,'D','2023-10-06',1.0),(7,10,'A','2023-10-01',1.0),(8,10,'B','2023-10-02',1.0),(9,10,'C','2023-10-03',1.0),(10,10,'A','2023-10-09',1.0),(11,10,'B','2023-10-10',1.0),(12,10,'C','2023-10-11',1.0);",
      "INSERT INTO students VALUES (7,'Valid','X');\nINSERT INTO study_sessions VALUES (1,7,'A','2023-10-01',1.0),(2,7,'B','2023-10-02',1.0),(3,7,'C','2023-10-03',1.0),(4,7,'A','2023-10-04',1.0),(5,7,'B','2023-10-05',1.0),(6,7,'C','2023-10-06',1.0);",
    ],
  },
  {
    leetcode: 3626,
    title: 'Find Stores with Inventory Imbalance',
    description:
      'Магазины (≥ 3 товара), где количество **самого дорогого** товара меньше, чем **самого дешёвого**: колонки `store_id`, `store_name`, `location`, `most_exp_product`, `cheapest_product`, `imbalance_ratio` (округлить до 2). Сортировка: ratio убыв., имя магазина возр.',
    setup:
      'CREATE TABLE stores(store_id INTEGER PRIMARY KEY, store_name TEXT NOT NULL, location TEXT NOT NULL);\nCREATE TABLE inventory(inventory_id INTEGER PRIMARY KEY, store_id INTEGER NOT NULL, product_name TEXT NOT NULL, quantity INTEGER NOT NULL, price REAL NOT NULL);',
    starterCode:
      'WITH t AS (SELECT store_id, product_name, quantity, RANK() OVER (PARTITION BY store_id ORDER BY price DESC, quantity DESC) AS rk_exp, RANK() OVER (PARTITION BY store_id ORDER BY price ASC, quantity DESC) AS rk_cheap, COUNT(*) OVER (PARTITION BY store_id) AS cnt FROM inventory)\nSELECT s.store_id, s.store_name, s.location, e.product_name AS most_exp_product, c.product_name AS cheapest_product, ROUND(c.quantity * 1.0 / e.quantity, 2) AS imbalance_ratio FROM t e JOIN t c ON c.store_id = e.store_id AND c.rk_cheap = 1 JOIN stores s ON s.store_id = e.store_id WHERE e.rk_exp = 1 ORDER BY imbalance_ratio DESC, s.store_name;',
    referenceSolution:
      'WITH t AS (SELECT store_id, product_name, quantity, RANK() OVER (PARTITION BY store_id ORDER BY price DESC, quantity DESC) AS rk_exp, RANK() OVER (PARTITION BY store_id ORDER BY price ASC, quantity DESC) AS rk_cheap, COUNT(*) OVER (PARTITION BY store_id) AS cnt FROM inventory)\nSELECT s.store_id, s.store_name, s.location, e.product_name AS most_exp_product, c.product_name AS cheapest_product, ROUND(c.quantity * 1.0 / e.quantity, 2) AS imbalance_ratio FROM t e JOIN t c ON c.store_id = e.store_id AND c.rk_cheap = 1 JOIN stores s ON s.store_id = e.store_id WHERE e.rk_exp = 1 AND e.cnt >= 3 AND e.quantity < c.quantity ORDER BY imbalance_ratio DESC, s.store_name;',
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO stores VALUES (1,'Downtown Tech','New York'),(2,'Suburb Mall','Chicago'),(3,'City Center','Los Angeles'),(4,'Corner Shop','Miami'),(5,'Plaza Store','Seattle');\nINSERT INTO inventory VALUES (1,1,'Laptop',5,999.99),(2,1,'Mouse',50,19.99),(3,1,'Keyboard',25,79.99),(4,1,'Monitor',15,299.99),(5,2,'Phone',3,699.99),(6,2,'Charger',100,25.99),(7,2,'Case',75,15.99),(8,2,'Headphones',20,149.99),(9,3,'Tablet',2,499.99),(10,3,'Stylus',80,29.99),(11,3,'Cover',60,39.99),(12,4,'Watch',10,299.99),(13,4,'Band',25,49.99),(14,5,'Camera',8,599.99),(15,5,'Lens',12,199.99);",
      "INSERT INTO stores VALUES (1,'Balanced','X'),(2,'Small','Y');\nINSERT INTO inventory VALUES (1,1,'Exp',10,100.0),(2,1,'Mid',5,50.0),(3,1,'Cheap',3,10.0),(4,2,'Only',1,5.0),(5,2,'Other',2,6.0);",
      "INSERT INTO stores VALUES (1,'Tie','Z');\nINSERT INTO inventory VALUES (1,1,'A',3,10.0),(2,1,'B',3,10.0),(3,1,'C',3,10.0);",
    ],
  },
  {
    leetcode: 3642,
    title: 'Find Books with Polarized Opinions',
    description:
      'Книги (≥ 5 сессий) с оценками и ≥ 4, и ≤ 2, где доля крайних оценок (≤ 2 или ≥ 4) **≥ 0.6**: колонки `book_id`, `title`, `author`, `genre`, `pages`, `rating_spread`, `polarization_score` (округлить до 2). Сортировка: score убыв., title убыв.',
    setup:
      'CREATE TABLE books(book_id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, genre TEXT NOT NULL, pages INTEGER NOT NULL);\nCREATE TABLE reading_sessions(session_id INTEGER PRIMARY KEY, book_id INTEGER NOT NULL, reader_name TEXT NOT NULL, pages_read INTEGER NOT NULL, session_rating INTEGER NOT NULL);',
    starterCode:
      'SELECT b.book_id, b.title, b.author, b.genre, b.pages, MAX(s.session_rating) - MIN(s.session_rating) AS rating_spread, ROUND((SUM(CASE WHEN s.session_rating <= 2 THEN 1 ELSE 0 END) + SUM(CASE WHEN s.session_rating >= 4 THEN 1 ELSE 0 END)) * 1.0 / COUNT(*), 2) AS polarization_score FROM books b JOIN reading_sessions s ON s.book_id = b.book_id GROUP BY b.book_id ORDER BY polarization_score DESC, b.title DESC;',
    referenceSolution:
      'SELECT b.book_id, b.title, b.author, b.genre, b.pages, MAX(s.session_rating) - MIN(s.session_rating) AS rating_spread, ROUND((SUM(CASE WHEN s.session_rating <= 2 THEN 1 ELSE 0 END) + SUM(CASE WHEN s.session_rating >= 4 THEN 1 ELSE 0 END)) * 1.0 / COUNT(*), 2) AS polarization_score FROM books b JOIN reading_sessions s ON s.book_id = b.book_id GROUP BY b.book_id HAVING COUNT(*) >= 5 AND MAX(s.session_rating) >= 4 AND MIN(s.session_rating) <= 2 AND 5 * (SUM(CASE WHEN s.session_rating <= 2 THEN 1 ELSE 0 END) + SUM(CASE WHEN s.session_rating >= 4 THEN 1 ELSE 0 END)) >= 3 * COUNT(*) ORDER BY polarization_score DESC, b.title DESC;',
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO books VALUES (1,'The Great Gatsby','F. Scott','Fiction',180),(2,'To Kill a Mockingbird','Harper Lee','Fiction',281),(3,'1984','George Orwell','Dystopian',328),(4,'Pride and Prejudice','Jane Austen','Romance',432),(5,'The Catcher in the Rye','J.D. Salinger','Fiction',277);\nINSERT INTO reading_sessions VALUES (1,1,'Alice',50,5),(2,1,'Bob',60,1),(3,1,'Carol',40,4),(4,1,'David',30,2),(5,1,'Emma',45,5),(6,2,'Frank',80,4),(7,2,'Grace',70,4),(8,2,'Henry',90,5),(9,2,'Ivy',60,4),(10,2,'Jack',75,4),(11,3,'Kate',100,2),(12,3,'Liam',120,1),(13,3,'Mia',80,2),(14,3,'Noah',90,1),(15,3,'Olivia',110,4),(16,3,'Paul',95,5),(17,4,'Quinn',150,3),(18,4,'Ruby',140,3),(19,5,'Sam',80,1),(20,5,'Tara',70,2);",
      "INSERT INTO books VALUES (1,'Mixed','A','X',100);\nINSERT INTO reading_sessions VALUES (1,1,'A',1,3),(2,1,'B',1,3),(3,1,'C',1,3),(4,1,'D',1,4),(5,1,'E',1,5);",
      "INSERT INTO books VALUES (1,'All High','A','X',100);\nINSERT INTO reading_sessions VALUES (1,1,'A',1,4),(2,1,'B',1,5),(3,1,'C',1,4),(4,1,'D',1,5),(5,1,'E',1,4);",
    ],
  },
  {
    leetcode: 3657,
    title: 'Find Loyal Customers',
    description:
      'Лояльные клиенты: ≥ 3 покупки, активность ≥ 30 дней и доля возвратов < 20%. Колонка `customer_id`, сортировка по возрастанию.',
    setup:
      'CREATE TABLE customer_transactions(transaction_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, transaction_date TEXT NOT NULL, amount REAL NOT NULL, transaction_type TEXT NOT NULL);',
    starterCode:
      "SELECT customer_id FROM customer_transactions GROUP BY customer_id HAVING COUNT(*) >= 3 AND SUM(CASE WHEN transaction_type = 'refund' THEN 1 ELSE 0 END) * 1.0 / COUNT(*) < 0.2 ORDER BY customer_id;",
    referenceSolution:
      "SELECT customer_id FROM customer_transactions GROUP BY customer_id HAVING COUNT(*) >= 3 AND SUM(CASE WHEN transaction_type = 'refund' THEN 1 ELSE 0 END) * 1.0 / COUNT(*) < 0.2 AND (julianday(MAX(transaction_date)) - julianday(MIN(transaction_date))) >= 30 ORDER BY customer_id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO customer_transactions VALUES (1,101,'2024-01-05',150.00,'purchase'),(2,101,'2024-01-15',200.00,'purchase'),(3,101,'2024-02-10',180.00,'purchase'),(4,101,'2024-02-20',250.00,'purchase'),(5,102,'2024-01-10',100.00,'purchase'),(6,102,'2024-01-12',120.00,'purchase'),(7,102,'2024-01-15',80.00,'refund'),(8,102,'2024-01-18',90.00,'refund'),(9,102,'2024-02-15',130.00,'purchase'),(10,103,'2024-01-01',500.00,'purchase'),(11,103,'2024-01-02',450.00,'purchase'),(12,103,'2024-01-03',400.00,'purchase'),(13,104,'2024-01-01',200.00,'purchase'),(14,104,'2024-02-01',250.00,'purchase'),(15,104,'2024-02-15',300.00,'purchase'),(16,104,'2024-03-01',350.00,'purchase'),(17,104,'2024-03-10',280.00,'purchase'),(18,104,'2024-03-15',100.00,'refund');",
      "INSERT INTO customer_transactions VALUES (1,1,'2024-01-01',10.0,'purchase'),(2,1,'2024-01-02',10.0,'purchase'),(3,1,'2024-01-03',10.0,'purchase');",
      "INSERT INTO customer_transactions VALUES (1,2,'2024-01-01',10.0,'purchase'),(2,2,'2024-01-02',10.0,'purchase');",
    ],
  },
  {
    leetcode: 3673,
    title: 'Find Zombie Sessions',
    description:
      '«Зомби-сессии»: длительность **> 30** минут, ≥ 5 `scroll`, отношение `click`/`scroll` **< 0.20**, ни одной покупки. Колонки `session_id`, `user_id`, `session_duration_minutes`, `scroll_count`. Сортировка: scroll убыв., `session_id` возр.',
    setup:
      'CREATE TABLE app_events(event_id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, event_timestamp TEXT NOT NULL, event_type TEXT NOT NULL, session_id TEXT NOT NULL, event_value INTEGER);',
    starterCode:
      "SELECT session_id, user_id, CAST(ROUND((julianday(MAX(event_timestamp)) - julianday(MIN(event_timestamp))) * 1440) AS INTEGER) AS session_duration_minutes, SUM(CASE WHEN event_type = 'scroll' THEN 1 ELSE 0 END) AS scroll_count FROM app_events GROUP BY session_id, user_id HAVING (julianday(MAX(event_timestamp)) - julianday(MIN(event_timestamp))) * 1440 > 30 AND SUM(CASE WHEN event_type = 'scroll' THEN 1 ELSE 0 END) >= 5 ORDER BY scroll_count DESC, session_id;",
    referenceSolution:
      "SELECT session_id, user_id, CAST(ROUND((julianday(MAX(event_timestamp)) - julianday(MIN(event_timestamp))) * 1440) AS INTEGER) AS session_duration_minutes, SUM(CASE WHEN event_type = 'scroll' THEN 1 ELSE 0 END) AS scroll_count FROM app_events GROUP BY session_id, user_id HAVING (julianday(MAX(event_timestamp)) - julianday(MIN(event_timestamp))) * 1440 > 30 AND SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) * 1.0 / SUM(CASE WHEN event_type = 'scroll' THEN 1 ELSE 0 END) < 0.2 AND SUM(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) = 0 AND SUM(CASE WHEN event_type = 'scroll' THEN 1 ELSE 0 END) >= 5 ORDER BY scroll_count DESC, session_id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO app_events VALUES (1,201,'2024-03-01 10:00:00','app_open','S001',NULL),(2,201,'2024-03-01 10:05:00','scroll','S001',500),(3,201,'2024-03-01 10:10:00','scroll','S001',750),(4,201,'2024-03-01 10:15:00','scroll','S001',600),(5,201,'2024-03-01 10:20:00','scroll','S001',800),(6,201,'2024-03-01 10:25:00','scroll','S001',550),(7,201,'2024-03-01 10:30:00','scroll','S001',900),(8,201,'2024-03-01 10:35:00','app_close','S001',NULL),(9,202,'2024-03-01 11:00:00','app_open','S002',NULL),(10,202,'2024-03-01 11:02:00','click','S002',NULL),(11,202,'2024-03-01 11:05:00','scroll','S002',400),(12,202,'2024-03-01 11:08:00','click','S002',NULL),(13,202,'2024-03-01 11:10:00','scroll','S002',350),(14,202,'2024-03-01 11:15:00','purchase','S002',50),(15,202,'2024-03-01 11:20:00','app_close','S002',NULL),(16,203,'2024-03-01 12:00:00','app_open','S003',NULL),(17,203,'2024-03-01 12:10:00','scroll','S003',1000),(18,203,'2024-03-01 12:20:00','scroll','S003',1200),(19,203,'2024-03-01 12:25:00','click','S003',NULL),(20,203,'2024-03-01 12:30:00','scroll','S003',800),(21,203,'2024-03-01 12:40:00','scroll','S003',900),(22,203,'2024-03-01 12:50:00','scroll','S003',1100),(23,203,'2024-03-01 13:00:00','app_close','S003',NULL),(24,204,'2024-03-01 14:00:00','app_open','S004',NULL),(25,204,'2024-03-01 14:05:00','scroll','S004',600),(26,204,'2024-03-01 14:08:00','scroll','S004',700),(27,204,'2024-03-01 14:10:00','click','S004',NULL),(28,204,'2024-03-01 14:12:00','app_close','S004',NULL);",
      "INSERT INTO app_events VALUES (1,1,'2024-01-01 10:00:00','app_open','Z1',NULL),(2,1,'2024-01-01 10:40:00','scroll','Z1',10),(3,1,'2024-01-01 10:41:00','scroll','Z1',10),(4,1,'2024-01-01 10:42:00','scroll','Z1',10),(5,1,'2024-01-01 10:43:00','scroll','Z1',10),(6,1,'2024-01-01 10:44:00','scroll','Z1',10);",
      "INSERT INTO app_events VALUES (1,2,'2024-01-01 10:00:00','app_open','N1',NULL),(2,2,'2024-01-01 10:45:00','scroll','N1',10),(3,2,'2024-01-01 10:46:00','click','N1',NULL),(4,2,'2024-01-01 10:47:00','click','N1',NULL),(5,2,'2024-01-01 10:48:00','scroll','N1',10),(6,2,'2024-01-01 10:49:00','scroll','N1',10),(7,2,'2024-01-01 10:50:00','scroll','N1',10);",
    ],
  },
  {
    leetcode: 3705,
    title: 'Find Golden Hour Customers',
    description:
      '«Золотые» клиенты: ≥ 3 заказа, ≥ 60% заказов в часы пик (`11:00`–`14:00` или `18:00`–`21:00`), средняя оценка оценённых заказов ≥ 4.0 и оценено ≥ 50% заказов. Колонки `customer_id`, `total_orders`, `peak_hour_percentage`, `average_rating`. Сортировка: рейтинг убыв., `customer_id` убыв.',
    setup:
      'CREATE TABLE restaurant_orders(order_id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, order_timestamp TEXT NOT NULL, order_amount REAL NOT NULL, payment_method TEXT NOT NULL, order_rating INTEGER);',
    starterCode:
      "SELECT customer_id, COUNT(*) AS total_orders, CAST(ROUND(SUM(CASE WHEN substr(order_timestamp, 12, 5) BETWEEN '11:00' AND '14:00' OR substr(order_timestamp, 12, 5) BETWEEN '18:00' AND '21:00' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 0) AS INTEGER) AS peak_hour_percentage, ROUND(AVG(order_rating), 2) AS average_rating FROM restaurant_orders GROUP BY customer_id HAVING COUNT(*) >= 3 AND SUM(CASE WHEN substr(order_timestamp, 12, 5) BETWEEN '11:00' AND '14:00' OR substr(order_timestamp, 12, 5) BETWEEN '18:00' AND '21:00' THEN 1 ELSE 0 END) * 5 >= 3 * COUNT(*) AND AVG(order_rating) >= 4.0 ORDER BY average_rating DESC, customer_id DESC;",
    referenceSolution:
      "SELECT customer_id, COUNT(*) AS total_orders, CAST(ROUND(SUM(CASE WHEN substr(order_timestamp, 12, 5) BETWEEN '11:00' AND '14:00' OR substr(order_timestamp, 12, 5) BETWEEN '18:00' AND '21:00' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 0) AS INTEGER) AS peak_hour_percentage, ROUND(AVG(order_rating), 2) AS average_rating FROM restaurant_orders GROUP BY customer_id HAVING COUNT(*) >= 3 AND SUM(CASE WHEN substr(order_timestamp, 12, 5) BETWEEN '11:00' AND '14:00' OR substr(order_timestamp, 12, 5) BETWEEN '18:00' AND '21:00' THEN 1 ELSE 0 END) * 5 >= 3 * COUNT(*) AND AVG(order_rating) >= 4.0 AND SUM(CASE WHEN order_rating IS NOT NULL THEN 1 ELSE 0 END) * 1.0 / COUNT(*) >= 0.5 ORDER BY average_rating DESC, customer_id DESC;",
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO restaurant_orders VALUES (1,101,'2024-03-01 12:30:00',25.50,'card',5),(2,101,'2024-03-02 19:15:00',32.00,'app',4),(3,101,'2024-03-03 13:45:00',28.75,'card',5),(4,101,'2024-03-04 20:30:00',41.00,'app',NULL),(5,102,'2024-03-01 11:30:00',18.50,'cash',4),(6,102,'2024-03-02 12:00:00',22.00,'card',3),(7,102,'2024-03-03 15:30:00',19.75,'cash',NULL),(8,103,'2024-03-01 19:00:00',55.00,'app',5),(9,103,'2024-03-02 20:45:00',48.50,'app',4),(10,103,'2024-03-03 18:30:00',62.00,'card',5),(11,104,'2024-03-01 10:00:00',15.00,'cash',3),(12,104,'2024-03-02 09:30:00',18.00,'cash',2),(13,104,'2024-03-03 16:00:00',20.00,'card',3),(14,105,'2024-03-01 12:15:00',30.00,'app',4),(15,105,'2024-03-02 13:00:00',35.50,'app',5),(16,105,'2024-03-03 11:45:00',28.00,'card',4);",
      "INSERT INTO restaurant_orders VALUES (1,201,'2024-01-01 12:00:00',10.0,'card',5),(2,201,'2024-01-02 13:00:00',10.0,'card',5),(3,201,'2024-01-03 18:30:00',10.0,'card',5),(4,201,'2024-01-04 19:00:00',10.0,'card',NULL);",
      "INSERT INTO restaurant_orders VALUES (1,301,'2024-01-01 09:00:00',10.0,'cash',5),(2,301,'2024-01-02 09:00:00',10.0,'cash',5),(3,301,'2024-01-03 09:00:00',10.0,'cash',5);",
      "INSERT INTO restaurant_orders VALUES (1,401,'2024-02-01 12:00:00',10.0,'card',5),(2,401,'2024-02-02 13:00:00',10.0,'card',5),(3,401,'2024-02-03 18:30:00',10.0,'card',NULL),(4,401,'2024-02-04 09:00:00',10.0,'cash',NULL),(5,401,'2024-02-05 08:00:00',10.0,'cash',NULL);",
    ],
  },
  {
    leetcode: 3716,
    title: 'Find Churn Risk Customers',
    description:
      'Клиенты «в зоне риска»: последнее событие не `cancel`, есть хотя бы один `downgrade`, текущая выручка < 50% исторического максимума и стаж ≥ 60 дней. Колонки `user_id`, `current_plan`, `current_monthly_amount`, `max_historical_amount`, `days_as_subscriber`. Сортировка: дни убыв., `user_id` возр.',
    setup:
      'CREATE TABLE subscription_events(event_id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, event_date TEXT NOT NULL, event_type TEXT NOT NULL, plan_name TEXT, monthly_amount REAL NOT NULL);',
    starterCode:
      'SELECT user_id, MAX(plan_name) AS current_plan, MAX(monthly_amount) AS current_monthly_amount, MAX(monthly_amount) AS max_historical_amount, 0 AS days_as_subscriber FROM subscription_events GROUP BY user_id ORDER BY days_as_subscriber DESC, user_id;',
    referenceSolution:
      "WITH last_event AS (SELECT user_id, event_type, plan_name, monthly_amount, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_date DESC, event_id DESC) AS rn FROM subscription_events),\nhist AS (SELECT user_id, MIN(event_date) AS start_date, MAX(event_date) AS last_date, MAX(monthly_amount) AS max_amount, SUM(CASE WHEN event_type = 'downgrade' THEN 1 ELSE 0 END) AS downgrades FROM subscription_events GROUP BY user_id)\nSELECT l.user_id, l.plan_name AS current_plan, ROUND(l.monthly_amount, 2) AS current_monthly_amount, ROUND(h.max_amount, 2) AS max_historical_amount, CAST(ROUND(julianday(h.last_date) - julianday(h.start_date)) AS INTEGER) AS days_as_subscriber FROM last_event l JOIN hist h ON h.user_id = l.user_id WHERE l.rn = 1 AND l.event_type <> 'cancel' AND h.downgrades >= 1 AND l.monthly_amount < 0.5 * h.max_amount AND (julianday(h.last_date) - julianday(h.start_date)) >= 60 ORDER BY days_as_subscriber DESC, l.user_id;",
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO subscription_events VALUES (1,501,'2024-01-01','start','premium',29.99),(2,501,'2024-02-15','downgrade','standard',19.99),(3,501,'2024-03-20','downgrade','basic',9.99),(4,502,'2024-01-05','start','standard',19.99),(5,502,'2024-02-10','upgrade','premium',29.99),(6,502,'2024-03-15','downgrade','basic',9.99),(7,503,'2024-01-10','start','basic',9.99),(8,503,'2024-02-20','upgrade','standard',19.99),(9,503,'2024-03-25','upgrade','premium',29.99),(10,504,'2024-01-15','start','premium',29.99),(11,504,'2024-03-01','downgrade','standard',19.99),(12,504,'2024-03-30','cancel',NULL,0.00),(13,505,'2024-02-01','start','basic',9.99),(14,505,'2024-02-28','upgrade','standard',19.99),(15,506,'2024-01-20','start','premium',29.99),(16,506,'2024-03-10','downgrade','basic',9.99);",
      "INSERT INTO subscription_events VALUES (1,601,'2024-01-01','start','premium',100.0),(2,601,'2024-04-01','downgrade','basic',10.0);",
      "INSERT INTO subscription_events VALUES (1,602,'2024-01-01','start','premium',100.0),(2,602,'2024-02-01','downgrade','basic',10.0),(3,602,'2024-03-01','cancel',NULL,0.0);",
    ],
  },
  {
    leetcode: 3793,
    title: 'Find Users with High Token Usage',
    description:
      'По каждому `user_id`: `prompt_count` и `avg_tokens` (округлить до 2). Только пользователи с ≥ 3 промптами, у которых есть промпт с числом токенов выше собственного среднего. Сортировка: среднее убыв., `user_id` возр.',
    setup: 'CREATE TABLE prompts(user_id INTEGER NOT NULL, prompt TEXT NOT NULL, tokens INTEGER NOT NULL, PRIMARY KEY(user_id, prompt));',
    starterCode:
      'SELECT user_id, COUNT(*) AS prompt_count, ROUND(AVG(tokens), 2) AS avg_tokens FROM prompts GROUP BY user_id HAVING COUNT(*) >= 3 ORDER BY avg_tokens DESC, user_id;',
    referenceSolution:
      'SELECT user_id, COUNT(*) AS prompt_count, ROUND(AVG(tokens), 2) AS avg_tokens FROM prompts GROUP BY user_id HAVING COUNT(*) >= 3 AND MAX(tokens) > AVG(tokens) ORDER BY avg_tokens DESC, user_id;',
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO prompts VALUES (1,'Write a blog outline',120),(1,'Generate SQL query',80),(1,'Summarize an article',200),(2,'Create resume bullet',60),(2,'Improve LinkedIn bio',70),(3,'Explain neural networks',300),(3,'Generate interview Q&A',250),(3,'Write cover letter',180),(3,'Optimize Python code',220);",
      "INSERT INTO prompts VALUES (1,'a',100),(1,'b',100),(1,'c',100);",
      "INSERT INTO prompts VALUES (1,'a',100),(1,'b',100),(1,'c',100),(1,'d',200);",
    ],
  },
  {
    leetcode: 3808,
    title: 'Find Emotionally Consistent Users',
    description:
      'Пользователи с ≥ 5 реакциями, у которых **≥ 60%** реакций одного типа: колонки `user_id`, `dominant_reaction`, `reaction_ratio` (округлить до 2). Сортировка: ratio убыв., `user_id` возр.',
    setup: 'CREATE TABLE reactions(user_id INTEGER NOT NULL, content_id INTEGER NOT NULL, reaction TEXT NOT NULL, PRIMARY KEY(user_id, content_id));',
    starterCode:
      'WITH t AS (SELECT user_id, reaction, COUNT(*) AS cnt FROM reactions GROUP BY user_id, reaction)\nSELECT t.user_id, t.reaction AS dominant_reaction, ROUND(t.cnt * 1.0 / (SELECT SUM(cnt) FROM (SELECT user_id, reaction, COUNT(*) AS cnt FROM reactions GROUP BY user_id, reaction) x WHERE x.user_id = t.user_id), 2) AS reaction_ratio FROM t ORDER BY reaction_ratio DESC, t.user_id;',
    referenceSolution:
      'WITH t AS (SELECT user_id, reaction, COUNT(*) AS cnt FROM reactions GROUP BY user_id, reaction),\ns AS (SELECT user_id, MAX(cnt) AS mx, SUM(cnt) AS total FROM t GROUP BY user_id HAVING SUM(cnt) >= 5 AND 5 * MAX(cnt) >= 3 * SUM(cnt))\nSELECT s.user_id, t.reaction AS dominant_reaction, ROUND(t.cnt * 1.0 / s.total, 2) AS reaction_ratio FROM s JOIN t ON t.user_id = s.user_id WHERE t.cnt = s.mx ORDER BY reaction_ratio DESC, s.user_id;',
    orderMatters: true,
    checkColumnNames: true,
    floatTolerance: 0.01,
    tests: [
      "INSERT INTO reactions VALUES (1,101,'like'),(1,102,'like'),(1,103,'like'),(1,104,'wow'),(1,105,'like'),(2,201,'like'),(2,202,'wow'),(2,203,'sad'),(2,204,'like'),(2,205,'wow'),(3,301,'love'),(3,302,'love'),(3,303,'love'),(3,304,'love'),(3,305,'love');",
      "INSERT INTO reactions VALUES (1,1,'like'),(1,2,'like'),(1,3,'like'),(1,4,'like');",
      "INSERT INTO reactions VALUES (1,1,'like'),(1,2,'like'),(1,3,'like'),(1,4,'wow'),(1,5,'wow');",
    ],
  },
  {
    leetcode: 3832,
    title: 'Find Users with Persistent Behavior Patterns',
    description:
      'Самый длинный интервал (≥ 5 дней) подряд, где у пользователя **ровно одно** действие в день и одно и то же действие каждый день: `user_id`, `action`, `streak_length`, `start_date`, `end_date`. Сортировка: длина убыв., `user_id` возр.',
    setup: 'CREATE TABLE activity(user_id INTEGER NOT NULL, action_date TEXT NOT NULL, action TEXT NOT NULL, PRIMARY KEY(user_id, action_date, action));',
    starterCode:
      'WITH grp AS (SELECT user_id, action, action_date, date(action_date, \'-\' || ROW_NUMBER() OVER (PARTITION BY user_id, action ORDER BY action_date) || \' days\') AS g FROM activity)\nSELECT user_id, action, COUNT(*) AS streak_length, MIN(action_date) AS start_date, MAX(action_date) AS end_date FROM grp GROUP BY user_id, action, g HAVING COUNT(*) >= 3 ORDER BY streak_length DESC, user_id;',
    referenceSolution:
      "WITH single AS (SELECT user_id, action_date, action FROM activity WHERE (SELECT COUNT(*) FROM activity a2 WHERE a2.user_id = activity.user_id AND a2.action_date = activity.action_date) = 1),\ngrp AS (SELECT user_id, action, action_date, date(action_date, '-' || ROW_NUMBER() OVER (PARTITION BY user_id, action ORDER BY action_date) || ' days') AS g FROM single),\nstreaks AS (SELECT user_id, action, COUNT(*) AS streak_length, MIN(action_date) AS start_date, MAX(action_date) AS end_date, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY COUNT(*) DESC) AS rn FROM grp GROUP BY user_id, action, g HAVING COUNT(*) >= 5)\nSELECT user_id, action, streak_length, start_date, end_date FROM streaks WHERE rn = 1 ORDER BY streak_length DESC, user_id;",
    orderMatters: true,
    checkColumnNames: true,
    tests: [
      "INSERT INTO activity VALUES (1,'2024-01-01','login'),(1,'2024-01-02','login'),(1,'2024-01-03','login'),(1,'2024-01-04','login'),(1,'2024-01-05','login'),(1,'2024-01-06','logout'),(2,'2024-01-01','click'),(2,'2024-01-02','click'),(2,'2024-01-03','click'),(2,'2024-01-04','click'),(3,'2024-01-01','view'),(3,'2024-01-02','view'),(3,'2024-01-03','view'),(3,'2024-01-04','view'),(3,'2024-01-05','view'),(3,'2024-01-06','view'),(3,'2024-01-07','view');",
      "INSERT INTO activity VALUES (1,'2024-01-01','a'),(1,'2024-01-01','b'),(1,'2024-01-02','a'),(1,'2024-01-03','a'),(1,'2024-01-04','a'),(1,'2024-01-05','a'),(1,'2024-01-06','a');",
      "INSERT INTO activity VALUES (1,'2024-01-01','a'),(1,'2024-01-02','a'),(1,'2024-01-03','a'),(1,'2024-01-04','a'),(1,'2024-01-05','a');",
    ],
  },
];

/* ------------------------------------------------------------------ modules */

export const FREE_REST_MODULE_DEFS: readonly ModuleDef[] = [
  {
    file: '08-joins-and-dml.module.json',
    title: 'Additional Joins and DML',
    theoryTitle: 'LEFT JOIN, анти-джойны и UPDATE',
    theoryContent:
      '## Ещё раз про JOIN и DML\n\n- **Анти-джойн**: `LEFT JOIN … WHERE right.id IS NULL` — «у левого нет пары».\n- **`NOT IN` + подзапрос** — «нет ни одной связанной записи с условием».\n- **`COALESCE(SUM(x), 0)`** — ноль вместо `NULL` при `LEFT JOIN`.\n- **`UPDATE … SET col = CASE WHEN … END`** — DML-задачи проверяются по состоянию таблицы после запроса.',
    svgCaption: 'LEFT JOIN + IS NULL отсеивает пары',
    svgDescription: 'Анти-джойн возвращает строки левой таблицы без совпадений.',
    svgIdPrefix: 'lsq08',
    quizQuestion: 'Как вернуть клиентов без заказов?',
    quizOptions: [
      'INNER JOIN Orders',
      'LEFT JOIN Orders и условие Orders.id IS NULL',
      'CROSS JOIN Orders',
      "WHERE Orders.status = 'none'",
    ],
    quizCorrect: [1],
    problems: joinsDmlProblems,
  },
  {
    file: '09-aggregation-and-pivoting.module.json',
    title: 'Aggregation and Pivoting',
    theoryTitle: 'Агрегаты, HAVING и разворот в колонки',
    theoryContent:
      '## Агрегация и pivot\n\n- `COUNT(DISTINCT x)` считает **разные** значения, `COUNT(x)` — непустые.\n- `HAVING` фильтрует группы; агрегат можно сравнивать с агрегатом (`HAVING SUM(a) > 10000`).\n- «Разворот» в колонки — `SUM(CASE WHEN month = … THEN revenue END)` по одной колонке на месяц.\n- Целочисленное деление в SQLite: `SUM(x) * 1.0 / COUNT(*)`, иначе дробная часть теряется.',
    svgCaption: 'Условный SUM(CASE …) строит колонки-месяцы',
    svgDescription: 'Pivot одной таблицы без отдельного pivot-оператора.',
    svgIdPrefix: 'lsq09',
    quizQuestion: 'Чем `COUNT(DISTINCT lead_id)` отличается от `COUNT(lead_id)`?',
    quizOptions: [
      'Ничем',
      'Первое считает уникальные значения, второе — все непустые',
      'Первое работает только с числами',
      'Второе игнорирует NULL, первое нет',
    ],
    quizCorrect: [1],
    problems: aggregationPivotProblems,
  },
  {
    file: '10-subqueries-set-and-trees.module.json',
    title: 'Subqueries, Sets and Trees',
    theoryTitle: 'Подзапросы, UNION и иерархии',
    theoryContent:
      '## Подзапросы и множества\n\n- Коррелированный подзапрос считает условие «для каждой строки» (например, нет сотрудника с большей зарплатой в отделе).\n- **`UNION`** убирает дубликаты, **`UNION ALL`** — нет; обе ветви требуют одинаковых колонок.\n- Дерево (`id`, `p_id`): `Root` — нет родителя, `Inner` — встречается как чей-то родитель, остальные — `Leaf`.\n- **`LEAD(...) OVER (PARTITION BY … ORDER BY …)`** даёт следующую строку окна — удобно для пар «соседних» событий.',
    svgCaption: 'UNION склеивает две выборки, UNION ALL сохраняет дубли',
    svgDescription: 'Анти-джойны в обе стороны находят «дыры» в данных.',
    svgIdPrefix: 'lsq10',
    quizQuestion: 'Что делает коррелированный подзапрос в `WHERE (SELECT COUNT(*) … ) = 0`?',
    quizOptions: [
      'Выполняется один раз для всей таблицы',
      'Выполняется для каждой строки внешнего запроса',
      'Работает только с GROUP BY',
      'Всегда возвращает NULL',
    ],
    quizCorrect: [1],
    problems: subquerySetTreeProblems,
  },
  {
    file: '11-window-functions-and-cte.module.json',
    title: 'Window Functions and CTE',
    theoryTitle: 'Оконные функции, ранжирование и рекурсия',
    theoryContent:
      '## Окна и CTE\n\n- `ROW_NUMBER` / `RANK` / `DENSE_RANK` — нумерация внутри окна; `RANK` пропускает номера при ничьих, `DENSE_RANK` — нет.\n- `LAG`/`LEAD` — предыдущая/следующая строка окна.\n- «3+ подряд» — `id - ROW_NUMBER() OVER (ORDER BY id)` даёт одинаковую группу у последовательных строк.\n- `WITH RECURSIVE` — иерархии: уровень = `уровень менеджера + 1`.\n- Пара «стран-функция»: параметр N кладётся в таблицу `params` — `LIMIT 1 OFFSET (SELECT n - 1 FROM params)`.',
    svgCaption: 'PARTITION BY делит строки на независимые окна',
    svgDescription: 'WITH RECURSIVE разворачивает дерево от корня к листьям.',
    svgIdPrefix: 'lsq11',
    quizQuestion: 'Чем `RANK` отличается от `DENSE_RANK` при ничьей?',
    quizOptions: [
      'Ничем',
      'RANK пропускает номера, DENSE_RANK — нет',
      'DENSE_RANK работает только с числами',
      'RANK нельзя использовать с PARTITION BY',
    ],
    quizCorrect: [1],
    problems: windowCteProblems,
  },
  {
    file: '12-strings-regex-analytics.module.json',
    title: 'Strings, Regex and Behavioral Analytics',
    theoryTitle: 'Строки, regex и оконная аналитика',
    theoryContent:
      "## Строки и аналитика\n\n- **`REGEXP`** в приложении — **JavaScript**-регулярка (регистрозависимая): `^…$`, `[0-9]{4}`, `\\b` (граница слова).\n- Даты хранятся как `TEXT` (`YYYY-MM-DD`), сравниваются лексикографически; разница в днях — `julianday(a) - julianday(b)`.\n- Неделя: `strftime('%Y-%W', d)`; время суток — `substr(ts, 12, 5)`.\n- «Интервалы подряд» — приём `date(action_date, '-' || ROW_NUMBER() … || ' days')`: одинаковая метка у последовательных дней.\n- `GLOB` проверяет по маске и возвращает 0/1: `x GLOB '[A-Za-z]'`, `x NOT GLOB '*[^A-Za-z]*'`.",
    svgCaption: 'REGEXP — JS-регулярка, GLOB — маска SQLite',
    svgDescription: 'Разница дат через julianday, неделя через strftime.',
    svgIdPrefix: 'lsq12',
    quizQuestion: 'Как в приложении получить разницу в днях между датами `a` и `b`?',
    quizOptions: [
      'DATEDIFF(a, b)',
      'julianday(a) - julianday(b)',
      'date(a) - date(b)',
      'TIMESTAMPDIFF(DAY, b, a)',
    ],
    quizCorrect: [1],
    problems: stringsAnalyticsProblems,
  },
];

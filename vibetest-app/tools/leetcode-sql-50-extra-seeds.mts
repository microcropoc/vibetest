/** Additional seed SQL merged at generate time (vt-83); each problem should end with 3–5 cases. */
export const EXTRA_SEEDS: Readonly<Record<number, readonly string[]>> = {
  1068: [
    "INSERT INTO Product VALUES (1,'Solo');",
    "INSERT INTO Sales VALUES (1,1,2020,1,9),(2,1,2021,1,10);\nINSERT INTO Product VALUES (1,'A'),(2,'B');",
  ],
  1075: [
    'INSERT INTO Project VALUES (9,1);\nINSERT INTO Employee VALUES (1,"Only",4);',
  ],
  577: [
    'INSERT INTO Employee VALUES (1,"Rich",NULL,1);\nINSERT INTO Bonus VALUES (1,5000);',
  ],
  570: [
    'INSERT INTO Employee VALUES (1,"Boss",NULL,NULL),(2,"A","X",1),(3,"B","X",1),(4,"C","X",1),(5,"D","X",1);',
  ],
  1280: [
    "INSERT INTO Students VALUES (1,'Ann');\nINSERT INTO Subjects VALUES ('Bio');",
    "INSERT INTO Students VALUES (1,'Ann');\nINSERT INTO Subjects VALUES ('Bio');\nINSERT INTO Examinations VALUES (1,'Bio');",
  ],
  1934: [
    'INSERT INTO Signups VALUES (1,"2020-01-01");\nINSERT INTO Confirmations VALUES (1,"2020-01-02","timeout");',
  ],
  620: [
    "INSERT INTO Cinema VALUES (2,'Dull','boring',9);",
  ],
  1251: [
    'INSERT INTO Products VALUES (9,"2020-01-01","2020-12-31",100);',
  ],
  1661: [
    'INSERT INTO Activity VALUES (5,0,"start",0),(5,0,"end",10);',
    'INSERT INTO Activity VALUES (1,0,"start",0),(1,0,"end",2),(1,1,"start",1),(1,1,"end",3);',
  ],
  1633: [
    'INSERT INTO Users VALUES (1,"Solo"),(2,"Other");',
  ],
  1193: [
    'INSERT INTO Transactions VALUES (201,"DE","approved",500,"2019-05-20");',
    'INSERT INTO Transactions VALUES (301,"US","chargeback",100,"2019-06-01");',
  ],
  1174: [
    'INSERT INTO Delivery VALUES (1,1,"2019-01-01","2019-01-05","2019-01-06");',
    'INSERT INTO Delivery VALUES (1,1,"2019-02-01","2019-02-01","2019-02-01"),(2,1,"2019-02-02","2019-02-03","2019-02-03");',
  ],
  550: [
    'INSERT INTO Activity VALUES (1,1,"2020-06-01",1);',
    'INSERT INTO Activity VALUES (1,1,"2020-06-01",1),(2,1,"2020-06-01",1),(2,1,"2020-06-03",1);',
  ],
  1211: [
    'INSERT INTO Queries VALUES ("Solo","x",1,5);',
    'INSERT INTO Queries VALUES ("A","r",2,2),("A","s",1,1);',
  ],
  2356: [
    'INSERT INTO Teacher VALUES (9,"Art","Z"),(9,"Art","Z");',
  ],
  1141: [
    'INSERT INTO Activity VALUES (1,1,"2019-06-01",1);',
    'INSERT INTO Activity VALUES (1,1,"2019-07-27",1),(2,1,"2019-07-27",1);',
  ],
  1070: [
    'INSERT INTO Sales VALUES (1,1,2020),(2,1,2020);',
  ],
  596: [
    'INSERT INTO Courses VALUES ("P1","Z"),("P2","Z"),("P3","Z"),("P4","Z");',
  ],
  1729: [
    'INSERT INTO Followers VALUES (1,2);',
    'INSERT INTO Followers VALUES (0,1),(0,2),(1,0);',
  ],
  1045: [
    'INSERT INTO Product VALUES (1),(2);\nINSERT INTO Customer VALUES (1,1);',
  ],
  1731: [
    'INSERT INTO Employees VALUES (1,"Lead",NULL,30),(2,"Rep",1,20);',
    'INSERT INTO Employees VALUES (9,"Head",NULL,50),(8,"A",9,22),(7,"B",9,24);',
  ],
  1789: [
    'INSERT INTO Employee VALUES (5,9,"Y");',
    'INSERT INTO Employee VALUES (1,1,"N"),(2,2,"N");',
  ],
  177: [
    'INSERT INTO Triangle VALUES (1,2,10);',
  ],
  180: [
    'INSERT INTO Logs VALUES (1,9),(2,9);',
  ],
  1164: [
    'INSERT INTO Products VALUES (9,99,"2019-09-01");',
    'INSERT INTO Products VALUES (1,10,"2019-08-01"),(1,20,"2019-08-20");',
  ],
  1204: [
    'INSERT INTO Queue VALUES (1,"Solo",500,1);',
    'INSERT INTO Queue VALUES (1,"A",400,1),(2,"B",400,2);',
  ],
  1907: [
    'INSERT INTO Accounts VALUES (1,60000);',
  ],
  1773: [
    'INSERT INTO Employees VALUES (1,"Root",NULL);',
    'INSERT INTO Employees VALUES (2,"Orphan",99);',
  ],
  626: [
    "INSERT INTO Seat VALUES (1,'Only');",
  ],
  1341: [
    'INSERT INTO Movies VALUES (1,"M");\nINSERT INTO Users VALUES (1,"U");\nINSERT INTO MovieRating VALUES (1,1,5,"2020-02-01");',
    'INSERT INTO Movies VALUES (1,"A"),(2,"B");\nINSERT INTO Users VALUES (1,"U"),(2,"V");\nINSERT INTO MovieRating VALUES (1,1,5,"2020-02-01"),(1,1,5,"2020-02-02"),(2,2,3,"2020-02-01"),(2,2,3,"2020-02-02");',
  ],
  1321: [
    'INSERT INTO Customer VALUES (1,"A","2019-01-01",10),(1,"A","2019-01-02",20);',
    'INSERT INTO Customer VALUES (1,"A","2019-01-01",10),(1,"A","2019-01-02",20),(1,"A","2019-01-03",30),(1,"A","2019-01-04",40),(1,"A","2019-01-05",50),(1,"A","2019-01-06",60),(1,"A","2019-01-07",70);',
  ],
  602: [
    'INSERT INTO RequestAccepted VALUES (1,2,"2016-01-01");',
    'INSERT INTO RequestAccepted VALUES (1,2,"2016-01-01"),(1,3,"2016-01-02"),(3,4,"2016-01-03");',
  ],
  585: [
    'INSERT INTO Insurance VALUES (1,1,1,0,0);',
    'INSERT INTO Insurance VALUES (1,7,1,1,1),(2,7,2,2,2);',
  ],
  185: [
    'INSERT INTO Employee VALUES (1,"Low",1000,1);\nINSERT INTO Department VALUES (1,"D");',
    'INSERT INTO Employee VALUES (1,"A",90000,1),(2,"B",80000,1),(3,"C",70000,1),(4,"D",60000,1);\nINSERT INTO Department VALUES (1,"IT");',
  ],
  1667: [
    "INSERT INTO Users VALUES (3,'mc');",
  ],
  1527: [
    "INSERT INTO Patients VALUES (9,'X','HEADACHE');",
    "INSERT INTO Patients VALUES (1,'Y','DIAB1'),(2,'Z','');",
  ],
  196: [
    "INSERT INTO Person VALUES (1,'a@x.com'),(2,'a@x.com'),(3,'b@y.com');",
  ],
  1484: [
    "INSERT INTO Activities VALUES ('2020-06-01','Solo');",
    "INSERT INTO Activities VALUES ('2020-05-30','B'),('2020-05-30','A');",
  ],
  1327: [
    'INSERT INTO Products VALUES (9,"Tiny",NULL);\nINSERT INTO Orders VALUES (9,"2020-02-10",50);',
    'INSERT INTO Products VALUES (1,"Big",NULL);\nINSERT INTO Orders VALUES (1,"2020-02-01",100);',
  ],
  1517: [
    "INSERT INTO Users VALUES (8,'X','bad@domain');",
    "INSERT INTO Users VALUES (9,'Y','a@b.com');",
  ],
};

export const FORCE_CHECK_COLUMN_NAMES = new Set<number>([
  595, 1683, 197, 570, 620, 596, 1045, 1789, 180, 1164, 1773, 1527, 1327, 1517,
]);

export function mergeProblemTests(leetcode: number, base: readonly string[]): string[] {
  const extra = EXTRA_SEEDS[leetcode] ?? [];
  const merged = [...base, ...extra];
  if (merged.length > 5) {
    throw new Error(`Problem ${leetcode}: ${merged.length} seeds (max 5)`);
  }
  if (merged.length < 3) {
    throw new Error(`Problem ${leetcode}: ${merged.length} seeds (min 3)`);
  }
  return merged;
}

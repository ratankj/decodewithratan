export interface Challenge {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  expectedOutput: string;
  schemaInfo: string;
  setupSQL: string;
  solutionSQL: string;
  tablePreview: { columns: string[]; rows: (string | number | null)[][] };
}

export const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Identify High-Impact Managers',
    difficulty: 'MEDIUM',
    description: 'Find managers supervising 5+ unique employees. Handle duplicates.',
    expectedOutput: 'Return columns: manager_id, team_size (count of distinct employees)',
    schemaInfo: 'corporate_employees (employee_id, employee_name, department, manager_id)',
    setupSQL: `
      CREATE TABLE corporate_employees (
        employee_id INTEGER, employee_name TEXT, department TEXT, manager_id INTEGER
      );
      INSERT INTO corporate_employees VALUES
        (1,'Ramesh','Finance',NULL),(2,'Sonal','Finance',1),(3,'Kunal','Finance',1),
        (4,'Ritika','Finance',1),(4,'Ritika','Finance',1),(5,'Varun','Finance',1),
        (6,'Devika','Finance',1),(7,'Amit','IT',NULL),(8,'Priya','IT',7),
        (9,'Rahul','IT',7),(10,'Neha','IT',7),(11,'Karan','IT',7),(12,'Meera','IT',7);
    `,
    solutionSQL: `SELECT manager_id, COUNT(DISTINCT employee_id) as team_size FROM corporate_employees WHERE manager_id IS NOT NULL GROUP BY manager_id HAVING COUNT(DISTINCT employee_id) >= 5`,
    tablePreview: {
      columns: ['employee_id', 'employee_name', 'department', 'manager_id'],
      rows: [
        [1, 'Ramesh', 'Finance', null],
        [2, 'Sonal', 'Finance', 1],
        [3, 'Kunal', 'Finance', 1],
        [4, 'Ritika', 'Finance', 1],
        [4, 'Ritika', 'Finance', 1],
        [5, 'Varun', 'Finance', 1],
        [6, 'Devika', 'Finance', 1],
        [7, 'Amit', 'IT', null],
      ],
    },
  },
  {
    id: '2',
    title: 'Classroom Seating Swap',
    difficulty: 'HARD',
    description: 'Swap the seat IDs of consecutive students. If there is an odd number of students, the last student keeps their seat.',
    expectedOutput: 'Return columns: id (swapped), name — ordered by id',
    schemaInfo: 'students (id, name)',
    setupSQL: `
      CREATE TABLE students (id INTEGER, name TEXT);
      INSERT INTO students VALUES (1,'Alice'),(2,'Bob'),(3,'Charlie'),(4,'Diana'),(5,'Eve');
    `,
    solutionSQL: `SELECT CASE WHEN id % 2 = 1 AND id = (SELECT MAX(id) FROM students) THEN id WHEN id % 2 = 1 THEN id + 1 ELSE id - 1 END AS id, name FROM students ORDER BY id`,
    tablePreview: {
      columns: ['id', 'name'],
      rows: [[1, 'Alice'], [2, 'Bob'], [3, 'Charlie'], [4, 'Diana'], [5, 'Eve']],
    },
  },
  {
    id: '3',
    title: 'Top 3 Salaries per Department',
    difficulty: 'EASY',
    description: 'Find the top 3 highest salaries in each department.',
    schemaInfo: 'employees (id, name, salary, department)',
    setupSQL: `
      CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER, department TEXT);
      INSERT INTO employees VALUES
        (1,'John',100000,'Engineering'),(2,'Jane',95000,'Engineering'),(3,'Bob',90000,'Engineering'),
        (4,'Alice',88000,'Engineering'),(5,'Eve',120000,'Sales'),(6,'Frank',110000,'Sales'),
        (7,'Grace',105000,'Sales'),(8,'Hank',100000,'Sales');
    `,
    solutionSQL: `SELECT department, name, salary FROM (SELECT *, DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rnk FROM employees) ranked WHERE rnk <= 3`,
    tablePreview: {
      columns: ['id', 'name', 'salary', 'department'],
      rows: [
        [1, 'John', 100000, 'Engineering'],
        [2, 'Jane', 95000, 'Engineering'],
        [3, 'Bob', 90000, 'Engineering'],
        [4, 'Alice', 88000, 'Engineering'],
        [5, 'Eve', 120000, 'Sales'],
      ],
    },
  },
];

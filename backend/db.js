const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS students');
  db.run('DROP TABLE IF EXISTS employees');
  db.run('DROP TABLE IF EXISTS departments');

  db.run(`CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    department_id INTEGER,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  )`);

  db.run(`CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    department_id INTEGER,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  )`);

  db.exec(`
    INSERT INTO departments (id, name) VALUES 
    (1, 'Computer Science'),
    (2, 'Computer Engineering'),
    (3, 'Information Technology');
    
    INSERT INTO students (id, first_name, last_name, phone, email, department_id) VALUES
    (1, 'Remy', 'Mugisha', '072-256-0000', 'remym@gmail.com', 1),
    (2, 'Bertin', 'Gatari', '078-654-0000', 'berting@gmail.com', 2),
    (3, 'Didier', 'Manzi', '078-883-0000', 'didierm@gmail.com', 3);
    
    INSERT INTO employees (id, first_name, last_name, phone, email, department_id) VALUES
    (4, 'Sarah', 'Ishimwe', '072-987-0000', 'sarahi@gmail.com', 1),
    (5, 'David', 'Manzi', '078-456-0000', 'davidm@gmail.com', 2),
    (6, 'Emilyne', 'Munezero', '078-789-0000', 'emilynem@gmail.com', 3);
  `);
});

module.exports = db;
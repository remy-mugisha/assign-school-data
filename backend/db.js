const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    department_id INTEGER,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    department_id INTEGER,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  )`);

  // Insert sample data if tables are empty
  db.get("SELECT COUNT(*) as count FROM departments", (err, row) => {
    if (row.count === 0) {
      db.exec(`
        INSERT INTO departments (id, name) VALUES 
        (1, 'Computer Science'),
        (2, 'Computer Engineering'),
        (3, 'Information Technology');
        
        INSERT INTO students (id, first_name, last_name, phone, email, department_id) VALUES
        (1, 'John', 'Doe', '123-456-7890', 'john.doe@cs.edu', 1),
        (2, 'Jane', 'Smith', '987-654-3210', 'jane.smith@ce.edu', 2),
        (3, 'Mike', 'Johnson', '555-123-4567', 'mike.johnson@it.edu', 3);
        
        INSERT INTO employees (id, first_name, last_name, phone, email, department_id) VALUES
        (4, 'Sarah', 'Williams', '555-987-6543', 'sarah@cs.edu', 1),
        (5, 'David', 'Brown', '555-456-7890', 'david@ce.edu', 2),
        (6, 'Emily', 'Davis', '555-789-0123', 'emily@it.edu', 3);
      `);
    }
  });
});

module.exports = db;
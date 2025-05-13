const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('request', (requestData, callback) => {
    console.log('Received request:', requestData);
    const { type, payload } = requestData;

    const handleError = (error) => {
      console.error('Server error:', error);
      callback({
        success: false,
        error: error.message
      });
    };

    try {
      switch(type) {
        case 'GET_EMAIL':
          let emailQuery = `
            SELECT email FROM ${payload.type}s 
            WHERE ${payload.firstName ? 'first_name = ? AND ' : ''}
            last_name = ?
            ${payload.department ? 'AND department_id = ?' : ''}
          `;
          
          db.all(
            emailQuery,
            [
              ...(payload.firstName ? [payload.firstName] : []),
              payload.lastName,
              ...(payload.department ? [payload.department] : [])
            ],
            (err, rows) => {
              if (err) return handleError(err);
              callback({
                success: true,
                data: rows.map(r => r.email)
              });
            }
          );
          break;

        case 'GET_PHONE':
          db.all(
            `SELECT phone FROM ${payload.type}s 
             WHERE ${payload.firstName ? 'first_name = ? AND ' : ''}
             last_name = ?
             ${payload.department ? 'AND department_id = ?' : ''}`,
            [
              ...(payload.firstName ? [payload.firstName] : []),
              payload.lastName,
              ...(payload.department ? [payload.department] : [])
            ],
            (err, rows) => {
              if (err) return handleError(err);
              callback({
                success: true,
                data: rows.map(r => r.phone)
              });
            }
          );
          break;

        case 'GET_DEPARTMENT_MEMBERS':
          // Query for students
          db.all(
            `SELECT 'student' as type, first_name, last_name, email, d.name as department 
             FROM students s
             JOIN departments d ON s.department_id = d.id
             WHERE d.id = ?`,
            [payload.department],
            (err, studentRows) => {
              if (err) return handleError(err);
              
              // Query for employees
              db.all(
                `SELECT 'employee' as type, first_name, last_name, email, d.name as department 
                 FROM employees e
                 JOIN departments d ON e.department_id = d.id
                 WHERE d.id = ?`,
                [payload.department],
                (err, employeeRows) => {
                  if (err) return handleError(err);
                  
                  const allMembers = [...studentRows, ...employeeRows];
                  
                  if (allMembers.length === 0) {
                    return callback({
                      success: false,
                      error: 'No members found in this department'
                    });
                  }
                  
                  callback({
                    success: true,
                    data: allMembers.map(row => ({
                      type: row.type,
                      name: `${row.first_name} ${row.last_name}`,
                      email: row.email,
                      department: row.department
                    }))
                  });
                }
              );
            }
          );
          break;

        default:
          throw new Error('Invalid request type');
      }
    } catch (error) {
      handleError(error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
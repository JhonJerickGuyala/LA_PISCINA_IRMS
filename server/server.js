const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Create DB connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',          // your MySQL password
  database: 'irms_db',   // your DB name
});

// Make db accessible in routes
app.locals.db = db;

// Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(5000, () => console.log('Server running on port 5000'));

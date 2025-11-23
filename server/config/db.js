const mysql = require('mysql2');
require('dotenv').config(); // Para magamit ang .env variables

// Gumamit ng 'createPool' para sa mas mahusay na performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost', // Karaniwan 'localhost' o '127.0.0.1'
  user: process.env.DB_USER || 'root',     // Default sa XAMPP
  password: process.env.DB_PASSWORD || '', // Default sa XAMPP ay blank
  database: process.env.DB_NAME,         // Ilagay mo sa .env file ang pangalan ng DB mo
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// I-export ang promise-based query para magamit sa routes
module.exports = pool.promise();
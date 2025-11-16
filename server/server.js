// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads/am_images', express.static(path.join(__dirname, 'uploads', 'am_images')));

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'irms_db'
});

// Make db accessible
app.locals.db = db;

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.get('/api/amenities', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM amenitiestbl WHERE available = 1');
    
    const amenities = rows.map((amenity) => {
      return {
        id: amenity.id,
        name: amenity.name,
        type: amenity.type,
        description: amenity.description,
        capacity: amenity.capacity,
        price: amenity.price,
        available: amenity.available,
        image: amenity.image ? `http://localhost:5000/uploads/am_images/${amenity.image}` : null
      };
    });
    
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
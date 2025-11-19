const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database connection config
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'irms_db'
};

// GET Sales Data
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if sales table exists, if not return empty array
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'sales'"
    );
    
    if (tables.length === 0) {
      await connection.end();
      return res.json({ sales: [] });
    }
    
    const [sales] = await connection.execute(
      'SELECT * FROM sales WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate]
    );
    
    await connection.end();
    res.json({ sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Error fetching sales data', sales: [] });
  }
});

// GET Feedback Data
router.get('/feedback', async (req, res) => {
  try {
    const { startDate, endDate, filter } = req.query;
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if feedback table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'feedback'"
    );
    
    if (tables.length === 0) {
      await connection.end();
      return res.json({ feedback: [] });
    }
    
    let query = 'SELECT * FROM feedback WHERE date BETWEEN ? AND ?';
    const params = [startDate, endDate];
    
    if (filter === 'positive') {
      query += ' AND rating >= 4';
    } else if (filter === 'negative') {
      query += ' AND rating <= 2';
    } else if (filter === 'neutral') {
      query += ' AND rating = 3';
    }
    
    query += ' ORDER BY date DESC';
    
    const [feedback] = await connection.execute(query, params);
    
    await connection.end();
    res.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback data', feedback: [] });
  }
});

// GET All Amenities (FIXED - matches customer API structure)
router.get('/amenities', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get ALL amenities (no availability filter for owner)
    const [amenities] = await connection.execute(
      'SELECT * FROM amenitiestbl ORDER BY id DESC'
    );
    
    // FIXED: Match customer API structure exactly
    const formattedAmenities = amenities.map(amenity => {
      // Get the image path from database
      const imagePath = amenity.image_path || amenity.image;
      
      // Create proper image URL (same as customer API)
      let imageUrl;
      if (imagePath) {
        if (imagePath.startsWith('http')) {
          imageUrl = imagePath;
        } else if (imagePath.startsWith('/uploads')) {
          imageUrl = `http://localhost:5000${imagePath}`;
        } else {
          imageUrl = `http://localhost:5000/uploads/${imagePath}`;
        }
      } else {
        imageUrl = '/images/default-amenity.jpg';
      }
      
      // Convert availability to boolean (same as customer API)
      let available = false;
      if (amenity.available === 'Yes' || amenity.available === 1 || amenity.available === true) {
        available = true;
      }
      
      return {
        id: amenity.id,
        name: amenity.name,
        type: amenity.type || 'General',
        description: amenity.description,
        capacity: amenity.capacity,
        price: parseFloat(amenity.price),
        available: available,
        image: imageUrl
      };
    });
    
    await connection.end();
    res.json({ amenities: formattedAmenities });
  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({ message: 'Error fetching amenities', amenities: [] });
  }
});

// POST New Amenity (FIXED - matches frontend expectations)
router.post('/amenities', async (req, res) => {
  try {
    const { name, description, price, type, capacity, available, image } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    // Convert boolean available to 'Yes'/'No' for database
    const availableDb = available ? 'Yes' : 'No';
    
    // Handle image path (extract filename if full URL provided)
    let imagePath = 'default.jpg';
    if (image && image !== '/images/default-amenity.jpg') {
      if (image.startsWith('http://localhost:5000/uploads/')) {
        imagePath = image.replace('http://localhost:5000/uploads/', '');
      } else if (image.startsWith('/uploads/')) {
        imagePath = image.replace('/uploads/', '');
      } else {
        imagePath = image;
      }
    }
    
    const [result] = await connection.execute(
      'INSERT INTO amenitiestbl (image, name, type, description, capacity, price, available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [imagePath, name, type, description, capacity, price, availableDb]
    );
    
    await connection.end();
    res.json({ message: 'Amenity added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding amenity:', error);
    res.status(500).json({ message: 'Error adding amenity' });
  }
});

// PUT Update Amenity (FIXED - matches frontend expectations)
router.put('/amenities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, type, capacity, available, image } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    
    // Convert boolean available to 'Yes'/'No' for database
    const availableDb = available ? 'Yes' : 'No';
    
    // Handle image path (extract filename if full URL provided)
    let imagePath = 'default.jpg';
    if (image && image !== '/images/default-amenity.jpg') {
      if (image.startsWith('http://localhost:5000/uploads/')) {
        imagePath = image.replace('http://localhost:5000/uploads/', '');
      } else if (image.startsWith('/uploads/')) {
        imagePath = image.replace('/uploads/', '');
      } else {
        imagePath = image;
      }
    }
    
    await connection.execute(
      'UPDATE amenitiestbl SET name = ?, description = ?, price = ?, type = ?, capacity = ?, available = ?, image = ? WHERE id = ?',
      [name, description, price, type, capacity, availableDb, imagePath, id]
    );
    
    await connection.end();
    res.json({ message: 'Amenity updated successfully' });
  } catch (error) {
    console.error('Error updating amenity:', error);
    res.status(500).json({ message: 'Error updating amenity' });
  }
});

// DELETE Amenity
router.delete('/amenities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute('DELETE FROM amenitiestbl WHERE id = ?', [id]);
    
    await connection.end();
    res.json({ message: 'Amenity deleted successfully' });
  } catch (error) {
    console.error('Error deleting amenity:', error);
    res.status(500).json({ message: 'Error deleting amenity' });
  }
});

// Debug route to check database data
router.get('/amenities/debug', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [amenities] = await connection.execute(
      'SELECT id, name, type, available, capacity, price, image FROM amenitiestbl'
    );
    
    await connection.end();
    
    console.log('Raw database data from owner API:', amenities);
    res.json({ 
      rawData: amenities,
      message: 'Check server console for detailed data' 
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
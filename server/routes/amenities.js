// routes/amenities.js
const express = require('express');
const router = express.Router();

// GET all amenities
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Adjust the query based on your actual table structure
    const [rows] = await db.execute(`
      SELECT * FROM amenitiestbl 
      WHERE available = 1 
      ORDER BY created_at DESC
    `);
    
    // Map to match frontend expected structure with proper image URLs
    const amenities = rows.map(amenity => {
      // Get the image path from database
      const imagePath = amenity.image_path || amenity.image;
      
      // Create proper image URL
      let imageUrl;
      if (imagePath) {
        // If it's already a full URL, use it as is
        if (imagePath.startsWith('http')) {
          imageUrl = imagePath;
        } 
        // If it starts with /uploads, make it a full URL
        else if (imagePath.startsWith('/uploads')) {
          imageUrl = `http://localhost:5000${imagePath}`;
        }
        // If it's just a filename, assume it's in uploads
        else {
          imageUrl = `http://localhost:5000/uploads/${imagePath}`;
        }
      } else {
        // Fallback image
        imageUrl = '/images/default-amenity.jpg';
      }
      
      return {
        id: amenity.id,
        name: amenity.name,
        type: amenity.type || 'General',
        description: amenity.description,
        capacity: amenity.capacity,
        price: parseFloat(amenity.price),
        available: Boolean(amenity.available),
        image: imageUrl
      };
    });
    
    res.json(amenities);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

// GET single amenity
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const [rows] = await db.execute(
      'SELECT * FROM amenitiestbl WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Amenity not found' });
    }
    
    const amenity = rows[0];
    
    // Create proper image URL
    const imagePath = amenity.image_path || amenity.image;
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
    
    res.json({
      id: amenity.id,
      name: amenity.name,
      type: amenity.type || 'General',
      description: amenity.description,
      capacity: amenity.capacity,
      price: parseFloat(amenity.price),
      available: Boolean(amenity.available),
      image: imageUrl
    });
  } catch (error) {
    console.error('Error fetching amenity:', error);
    res.status(500).json({ error: 'Failed to fetch amenity' });
  }
});

// Debug route to check image paths in database
router.get('/debug/images', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.execute('SELECT id, name, image_path, image FROM amenitiestbl');
    
    const debugInfo = rows.map(row => ({
      id: row.id,
      name: row.name,
      image_path: row.image_path,
      image: row.image,
      constructed_url: row.image_path ? `http://localhost:5000${row.image_path}` : 'No image path'
    }));
    
    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book amenity
router.post('/:id/book', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, booking_date, guests, notes } = req.body;
    const db = req.app.locals.db;

    // Check if amenity exists and is available
    const [amenityRows] = await db.execute(
      'SELECT * FROM amenitiestbl WHERE id = ? AND available = 1',
      [id]
    );
    
    if (amenityRows.length === 0) {
      return res.status(400).json({ error: 'Amenity not available' });
    }

    const amenity = amenityRows[0];
    
    // Check capacity
    if (guests > amenity.capacity) {
      return res.status(400).json({ 
        error: `Maximum capacity is ${amenity.capacity} guests` 
      });
    }

    // Calculate total price
    const totalPrice = amenity.price * guests;
    
    // Insert booking
    const [result] = await db.execute(
      `INSERT INTO bookings (amenity_id, user_id, booking_date, guests, notes, status, total_price) 
       VALUES (?, ?, ?, ?, ?, 'confirmed', ?)`,
      [id, user_id, booking_date, guests, notes, totalPrice]
    );
    
    res.json({ 
      message: 'Booking successful', 
      booking_id: result.insertId,
      total_price: totalPrice
    });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle case where bookings table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: 'Bookings table not found. Please create the bookings table first.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

module.exports = router;
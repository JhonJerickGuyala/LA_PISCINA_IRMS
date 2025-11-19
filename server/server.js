const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Images
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

// --- OWNER ROUTES FILES ---
const ownerSalesRoutes = require('./routes/ownerSales');
const ownerFeedbackRoutes = require('./routes/ownerFeedback');
const ownerAmenitiesRoutes = require('./routes/ownerAmenities');

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);

// Owner Routes Mounting
app.use('/api/owner/sales', ownerSalesRoutes);         
app.use('/api/owner/feedback', ownerFeedbackRoutes);   
app.use('/api/owner/amenities', ownerAmenitiesRoutes); 

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// ==================================================
// CUSTOMER SIDE ROUTE (FIXED & FINAL)
// ==================================================
app.get('/api/amenities', async (req, res) => {
  try {
    // 1. KUNIN LAHAT (Available man o Hindi) at i-sort mula bago pababa
    const [rows] = await db.execute('SELECT * FROM amenitiestbl ORDER BY id DESC');
    
    const amenities = rows.map((amenity) => {
      
      // 2. IMAGE FIX: Check kung full URL na o filename lang
      let imageUrl = null;
      if (amenity.image && amenity.image !== 'default.jpg') {
        if (amenity.image.startsWith('http')) {
             imageUrl = amenity.image; // Kung galing internet/placeholder
        } else {
             imageUrl = `http://localhost:5000/uploads/am_images/${amenity.image}`; // Kung inupload
        }
      }

      // 3. AVAILABILITY FIX: Convert "Yes"/"No" o 1/0 to true/false
      // Para maintindihan ng Frontend kahit anong format ang nasa database
      let isAvailable = false;
      if (amenity.available === 'Yes' || amenity.available === 'true' || amenity.available === 1 || amenity.available === true) {
        isAvailable = true;
      }

      return {
        id: amenity.id,
        name: amenity.name,
        type: amenity.type,
        description: amenity.description,
        capacity: amenity.capacity,
        price: amenity.price,
        available: isAvailable, // Ito ang mahalaga para sa button logic
        image: imageUrl
      };
    });
    
    res.json(amenities);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const express = require('express');
const router = express.Router();
const db = require('../../config/db'); 

// GET all amenities (Updated with Real-time Availability Logic)
router.get('/', async (req, res) => {
  try {
    // 1. QUERY: Isama ang pagbilang ng active bookings ngayong araw (CURDATE)
    const query = `
      SELECT a.*, 
      (SELECT COUNT(*) FROM bookingtbl b 
       WHERE b.amenity_id = a.id 
       AND b.date = CURDATE() 
       AND b.status IN ('Confirmed', 'Checked-In')) as booked_today
      FROM amenitiestbl a 
      ORDER BY a.id DESC
    `;

    const [rows] = await db.execute(query);
    
    const amenities = rows.map(amenity => {
      // Image Logic
      const imagePath = amenity.image_path || amenity.image;
      let imageUrl;
      
      if (imagePath && imagePath !== 'default.jpg') {
        if (imagePath.startsWith('http')) {
          imageUrl = imagePath;
        } 
        else if (imagePath.startsWith('/uploads')) {
          imageUrl = `http://localhost:5000${imagePath}`;
        }
        else {
          imageUrl = `http://localhost:5000/uploads/am_images/${imagePath}`;
        }
      } else {
        imageUrl = '/images/default-amenity.jpg';
      }
      
      // --- UPDATED AVAILABILITY LOGIC ---

      // 1. Kunin ang Total Quantity (Inventory)
      // Kung undefined o null, gawing 0.
      const totalQuantity = (amenity.quantity !== undefined && amenity.quantity !== null) 
                            ? parseInt(amenity.quantity) 
                            : 0; 

      // 2. Kunin ang Bookings Ngayon
      const currentBooked = amenity.booked_today || 0;

      // 3. Check kung PUNO na (Bookings >= Quantity)
      // Kung quantity ay 0, automatic na true ito (0 >= 0), so FULLY BOOKED agad.
      const isFullyBooked = currentBooked >= totalQuantity;

      // 4. Check ang Manual Switch (Yes/No sa Database)
      const isManuallyAvailable = (amenity.available == 1 || amenity.available === 'Yes' || amenity.available === 'true');

      // 5. FINAL STATUS: 
      // Dapat naka-YES ang switch AT HINDI pa puno/fully booked.
      const finalAvailable = isManuallyAvailable && !isFullyBooked;

      return {
        id: amenity.id,
        name: amenity.name,
        type: amenity.type || 'General',
        description: amenity.description,
        capacity: amenity.capacity,
        price: parseFloat(amenity.price),
        available: finalAvailable, // Ito na ang tamang status (False pag puno na)
        quantity: totalQuantity,   // Optional: Kung gusto mo ipakita ilang slots pa
        remaining: Math.max(0, totalQuantity - currentBooked), // Optional: Slots left
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
    
    // Updated query din para sa single item view
    const query = `
      SELECT a.*, 
      (SELECT COUNT(*) FROM bookingtbl b 
       WHERE b.amenity_id = a.id 
       AND b.date = CURDATE() 
       AND b.status IN ('Confirmed', 'Checked-In')) as booked_today
      FROM amenitiestbl a 
      WHERE a.id = ?
    `;

    const [rows] = await db.execute(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Amenity not found' });
    }
    
    const amenity = rows[0];
    
    // Image Logic
    const imagePath = amenity.image_path || amenity.image;
    let imageUrl;
    if (imagePath && imagePath !== 'default.jpg') {
        if (imagePath.startsWith('http')) imageUrl = imagePath;
        else if (imagePath.startsWith('/uploads')) imageUrl = `http://localhost:5000${imagePath}`;
        else imageUrl = `http://localhost:5000/uploads/am_images/${imagePath}`;
    } else {
        imageUrl = null;
    }

    // Availability Logic for Single Item
    const totalQuantity = (amenity.quantity !== undefined && amenity.quantity !== null) ? parseInt(amenity.quantity) : 0;
    const currentBooked = amenity.booked_today || 0;
    const isFullyBooked = currentBooked >= totalQuantity;
    const isManuallyAvailable = (amenity.available == 1 || amenity.available === 'Yes');
    
    res.json({
      id: amenity.id,
      name: amenity.name,
      type: amenity.type,
      description: amenity.description,
      capacity: amenity.capacity,
      price: parseFloat(amenity.price),
      available: isManuallyAvailable && !isFullyBooked, // Updated logic
      quantity: totalQuantity,
      remaining: Math.max(0, totalQuantity - currentBooked),
      image: imageUrl
    });
  } catch (error) {
    console.error('Error fetching amenity:', error);
    res.status(500).json({ error: 'Failed to fetch amenity' });
  }
});

module.exports = router;
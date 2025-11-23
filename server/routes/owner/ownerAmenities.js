const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs'); 
const db = require('../../config/db'); // Database config
const upload = require('../../middleware/upload'); 

// GET All Amenities
router.get('/', async (req, res) => {
  try {
    // Kukunin natin ang amenities at bibilangin ang bookings ngayon
    // Mahalaga ang subquery na ito para sa real-time calculation
    const query = `
      SELECT a.*, 
      (SELECT COUNT(*) FROM bookingtbl b 
       WHERE b.amenity_id = a.id 
       AND b.date = CURDATE() 
       AND b.status IN ('Confirmed', 'Checked-In')) as booked_today
      FROM amenitiestbl a 
      ORDER BY a.id DESC
    `;
    
    const [amenities] = await db.execute(query);
    
    const formattedAmenities = amenities.map(amenity => {
      const imageFilename = amenity.image;
      let imageUrl = null;
      
      if (imageFilename && imageFilename !== 'default.jpg') {
        if (imageFilename.startsWith('http')) {
          imageUrl = imageFilename;
        } else {
          imageUrl = `http://localhost:5000/uploads/am_images/${imageFilename}`;
        }
      }
      
      // --- CORRECTION HERE ---
      // Dati: amenity.quantity || 1 (Mali ito kasi ang 0 nagiging 1)
      // Bago: Check kung null o undefined lang. Kung 0, 0 talaga ang kukunin.
      const totalQuantity = (amenity.quantity !== undefined && amenity.quantity !== null) 
                            ? parseInt(amenity.quantity) 
                            : 0; // Default sa 0 (Unavailable)

      const currentBooked = amenity.booked_today || 0;

      // Logic: Kapag 0 ang quantity, 0 >= 0 is TRUE -> Fully Booked agad
      const isFullyBooked = currentBooked >= totalQuantity;

      // Manual Switch Check
      const isManuallyAvailable = (amenity.available === 'Yes' || amenity.available === 1 || amenity.available === true || amenity.available === 'available');

      // Final Check: Available lang kung (Switch ON) AND (Hindi Puno)
      const finalAvailable = isManuallyAvailable && !isFullyBooked;
      
      return {
        id: amenity.id,
        name: amenity.name,
        type: amenity.type || 'General',
        description: amenity.description,
        capacity: amenity.capacity,
        price: parseFloat(amenity.price),
        quantity: totalQuantity, 
        booked: currentBooked,
        available: finalAvailable, // Magiging FALSE ito pag 0 ang quantity
        image: imageUrl
      };
    });
    
    res.json({ amenities: formattedAmenities });
  } catch (error) {
    console.error('Error:', error);
    // Fallback kung sakaling mag-fail ang complex query
    try {
        const [fallbackAmenities] = await db.execute('SELECT * FROM amenitiestbl ORDER BY id DESC');
        const fallbackFormatted = fallbackAmenities.map(amenity => ({
            ...amenity,
            quantity: (amenity.quantity !== undefined && amenity.quantity !== null) ? amenity.quantity : 0, // Fix din dito
            available: (amenity.available === 'Yes' || amenity.available === 'available'),
            booked: 0
        }));
        return res.json({ amenities: fallbackFormatted });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching amenities', amenities: [] });
    }
  }
});

// POST New Amenity
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, status, capacity, quantity } = req.body;
    
    const finalType = category || req.body.type || 'kubo';
    const imageFilename = req.file ? req.file.filename : 'default.jpg';
    const available = (status === 'available' || status === 'true') ? 'Yes' : 'No';
    
    // --- CORRECTION HERE ---
    // Kung empty string or undefined, gawing 0. Kung "0", gawing 0.
    const finalQuantity = (quantity !== undefined && quantity !== '') ? parseInt(quantity) : 0;
    
    const [result] = await db.execute(
      'INSERT INTO amenitiestbl (image, name, type, description, capacity, price, available, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [imageFilename, name, finalType, description, capacity, price, available, finalQuantity]
    );
    
    res.json({ message: 'Amenity added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding amenity: ' + error.message });
  }
});

// PUT Update Amenity
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, status, capacity, quantity } = req.body;
    
    const finalType = category || req.body.type || 'kubo';
    const available = (status === 'available' || status === 'true') ? 'Yes' : 'No';
    
    // --- CORRECTION HERE ---
    // Tanggapin ang 0 bilang valid value
    const finalQuantity = (quantity !== undefined && quantity !== '') ? parseInt(quantity) : 0;

    if (req.file) {
      // Delete old image logic
      const [rows] = await db.execute('SELECT image FROM amenitiestbl WHERE id = ?', [id]);
      if (rows.length > 0) {
          const oldImage = rows[0].image;
          if (oldImage && oldImage !== 'default.jpg' && !oldImage.startsWith('http')) {
              const oldPath = path.join(__dirname, '../../uploads/am_images', oldImage);
              if (fs.existsSync(oldPath)) {
                  try { fs.unlinkSync(oldPath); } catch(err) { console.error(err); }
              }
          }
      }

      await db.execute(
        'UPDATE amenitiestbl SET name=?, description=?, price=?, type=?, available=?, capacity=?, quantity=?, image=? WHERE id=?',
        [name, description, price, finalType, available, capacity, finalQuantity, req.file.filename, id]
      );
    } else {
      await db.execute(
        'UPDATE amenitiestbl SET name=?, description=?, price=?, type=?, available=?, capacity=?, quantity=? WHERE id=?',
        [name, description, price, finalType, available, capacity, finalQuantity, id]
      );
    }
    
    res.json({ message: 'Amenity updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating amenity: ' + error.message });
  }
});

// DELETE Amenity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT image FROM amenitiestbl WHERE id = ?', [id]);
    if (rows.length > 0) {
        const imageFilename = rows[0].image;
        if (imageFilename && imageFilename !== 'default.jpg' && !imageFilename.startsWith('http')) {
            const filePath = path.join(__dirname, '../../uploads/am_images', imageFilename);
            if (fs.existsSync(filePath)) fs.unlink(filePath, (err) => { if (err) console.error(err); });
        }
    }
    await db.execute('DELETE FROM amenitiestbl WHERE id = ?', [id]);
    res.json({ message: 'Amenity deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: 'Error deleting amenity' });
  }
});

module.exports = router;
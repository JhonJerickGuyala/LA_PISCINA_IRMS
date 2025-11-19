const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // ← IMPORTANTE: Ito ang taga-bura ng file

const dbConfig = {
  host: 'localhost', user: 'root', password: '', database: 'irms_db'
};

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Siguraduhing tama ang path (kailangan umakyat ng isang folder mula routes)
    cb(null, path.join(__dirname, '../uploads/am_images/')); 
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '_' + cleanName);
  }
});
const upload = multer({ storage: storage });

// GET All Amenities
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [amenities] = await connection.execute('SELECT * FROM amenitiestbl ORDER BY id DESC');
    
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
      
      let available = false;
      if (amenity.available === 'Yes' || amenity.available === 1 || amenity.available === true || amenity.available === 'available') {
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
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching amenities', amenities: [] });
  }
});

// POST New Amenity
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, status, capacity } = req.body;
    const finalType = category || req.body.type || 'kubo';
    const imageFilename = req.file ? req.file.filename : 'default.jpg';
    const available = (status === 'available' || status === 'true') ? 'Yes' : 'No';
    
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO amenitiestbl (image, name, type, description, capacity, price, available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [imageFilename, name, finalType, description, capacity, price, available]
    );
    
    await connection.end();
    res.json({ message: 'Amenity added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error adding amenity: ' + error.message });
  }
});

// PUT Update Amenity
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, status, capacity } = req.body;
    const finalType = category || req.body.type || 'kubo';
    const available = (status === 'available' || status === 'true') ? 'Yes' : 'No';
    const connection = await mysql.createConnection(dbConfig);

    if (req.file) {
      // KUNG MAY BAGONG IMAGE: Burahin muna ang luma para makatipid sa space
      const [rows] = await connection.execute('SELECT image FROM amenitiestbl WHERE id = ?', [id]);
      if (rows.length > 0) {
          const oldImage = rows[0].image;
          // Huwag burahin ang default.jpg o online links
          if (oldImage && oldImage !== 'default.jpg' && !oldImage.startsWith('http')) {
              const oldPath = path.join(__dirname, '../uploads/am_images', oldImage);
              // Check kung nag-eexist bago burahin
              if (fs.existsSync(oldPath)) {
                  fs.unlinkSync(oldPath);
              }
          }
      }

      // Tapos i-save ang bago
      await connection.execute(
        'UPDATE amenitiestbl SET name=?, description=?, price=?, type=?, available=?, capacity=?, image=? WHERE id=?',
        [name, description, price, finalType, available, capacity, req.file.filename, id]
      );
    } else {
      await connection.execute(
        'UPDATE amenitiestbl SET name=?, description=?, price=?, type=?, available=?, capacity=? WHERE id=?',
        [name, description, price, finalType, available, capacity, id]
      );
    }
    
    await connection.end();
    res.json({ message: 'Amenity updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating amenity: ' + error.message });
  }
});

// DELETE Amenity (WITH FILE DELETION)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    // 1. HANAPIN MUNA ANG FILENAME BAGO I-DELETE SA DB
    const [rows] = await connection.execute('SELECT image FROM amenitiestbl WHERE id = ?', [id]);
    
    if (rows.length > 0) {
        const imageFilename = rows[0].image;

        // 2. BURAHIN ANG FILE SA FOLDER (Kung hindi default at hindi online link)
        if (imageFilename && imageFilename !== 'default.jpg' && !imageFilename.startsWith('http')) {
            const filePath = path.join(__dirname, '../uploads/am_images', imageFilename);
            
            // Check kung nag-eexist yung file, tapos burahin
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting file:", err);
                    else console.log("File deleted successfully:", imageFilename);
                });
            }
        }
    }

    // 3. BURAHIN NA SA DATABASE
    await connection.execute('DELETE FROM amenitiestbl WHERE id = ?', [id]);
    
    await connection.end();
    res.json({ message: 'Amenity deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: 'Error deleting amenity' });
  }
});

module.exports = router;
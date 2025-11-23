// FILE: server/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // __dirname = server/middleware
    // ../ = server
    // Target: server/uploads/am_images/
    cb(null, path.join(__dirname, '../uploads/am_images/')); 
  },
  filename: function (req, file, cb) {
    // Linisin ang filename (tanggalin ang spaces)
    const cleanName = file.originalname.replace(/\s+/g, '_');
    // Dagdagan ng timestamp para unique
    cb(null, Date.now() + '_' + cleanName);
  }
});

// Initialize upload variable
const upload = multer({ storage: storage });

module.exports = upload;
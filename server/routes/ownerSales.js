const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost', user: 'root', password: '', database: 'irms_db'
};

// GET Sales Data
// Route: /api/owner/sales
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const connection = await mysql.createConnection(dbConfig);
    
    const [tables] = await connection.execute("SHOW TABLES LIKE 'sales'");
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

module.exports = router;
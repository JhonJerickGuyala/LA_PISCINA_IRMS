const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost', user: 'root', password: '', database: 'irms_db'
};

// GET Feedback Data
// Route: /api/owner/feedback
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, filter } = req.query;
    const connection = await mysql.createConnection(dbConfig);
    
    const [tables] = await connection.execute("SHOW TABLES LIKE 'feedback'");
    if (tables.length === 0) {
      await connection.end();
      return res.json({ feedback: [] });
    }
    
    let query = 'SELECT * FROM feedback WHERE date BETWEEN ? AND ?';
    const params = [startDate, endDate];
    
    if (filter === 'positive') query += ' AND rating >= 4';
    else if (filter === 'negative') query += ' AND rating <= 2';
    else if (filter === 'neutral') query += ' AND rating = 3';
    
    query += ' ORDER BY date DESC';
    
    const [feedback] = await connection.execute(query, params);
    
    await connection.end();
    res.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback data', feedback: [] });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../../config/db'); 

// GET Feedback Data
// Supports Requirement 7.1 (Time Period) & 7.2 (Categorization)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, filter } = req.query;

    let query = 'SELECT * FROM feedback';
    const params = [];
    const conditions = [];

    // 1. DATE FILTER (Requirement 7.1)
    // Fix: Nagdagdag ako ng time (00:00:00 hanggang 23:59:59) para makuha buong araw
    if (startDate && endDate) {
      conditions.push('date BETWEEN ? AND ?');
      params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    }

    // 2. CATEGORY FILTER (Requirement 7.2)
    if (filter === 'positive') {
        conditions.push('rating >= 4');
    } else if (filter === 'negative') {
        conditions.push('rating <= 2');
    } else if (filter === 'neutral') {
        conditions.push('rating = 3');
    }

    // Pagsamahin ang mga conditions kung meron man
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort by newest first (Standard for reports)
    query += ' ORDER BY date DESC';
    
    const [feedback] = await db.execute(query, params);
    
    res.json({ feedback });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    
    // Handle case kung wala pang table (Non-Functional Robustness)
    if (error.code === 'ER_NO_SUCH_TABLE') {
        return res.json({ feedback: [] }); 
    }
    res.status(500).json({ message: 'Error fetching feedback data', feedback: [] });
  }
});

module.exports = router;
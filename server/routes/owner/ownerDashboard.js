const express = require('express');
const router = express.Router();
const db = require('../../config/db'); 

// GET Dashboard Overview Stats
router.get('/stats', async (req, res) => {
  try {
    // 1. TOTAL REVENUE & TRANSACTIONS (All Time)
    const [salesStats] = await db.execute(`
      SELECT 
        IFNULL(SUM(amount), 0) as totalRevenue, 
        COUNT(*) as totalTransactions 
      FROM sales
    `);

    // 2. SALES BY SERVICE TYPE (Pie Chart)
    // Kukuha sa column na 'serviceType' (Kubo, Cabin, etc.)
    const [salesByService] = await db.execute(`
      SELECT serviceType as name, SUM(amount) as value 
      FROM sales 
      GROUP BY serviceType 
      ORDER BY value DESC
    `);

    // 3. FEEDBACK STATS
    const [feedbackStats] = await db.execute(`
      SELECT COUNT(*) as totalFeedback FROM feedback
    `);

    // 4. FEEDBACK DISTRIBUTION
    const [feedbackDist] = await db.execute(`
      SELECT 
        CASE 
          WHEN rating >= 4 THEN 'Positive'
          WHEN rating = 3 THEN 'Neutral'
          ELSE 'Negative'
        END as name,
        COUNT(*) as value
      FROM feedback
      GROUP BY 
        CASE 
          WHEN rating >= 4 THEN 'Positive'
          WHEN rating = 3 THEN 'Neutral'
          ELSE 'Negative'
        END
    `);

    res.json({
      totalRevenue: salesStats[0].totalRevenue,
      totalTransactions: salesStats[0].totalTransactions,
      totalFeedback: feedbackStats[0].totalFeedback,
      salesByService,
      feedbackDistribution: feedbackDist
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      totalRevenue: 0, 
      totalTransactions: 0, 
      totalFeedback: 0, 
      salesByService: [], 
      feedbackDistribution: [] 
    });
  }
});

module.exports = router;
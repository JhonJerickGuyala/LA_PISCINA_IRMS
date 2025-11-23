const express = require('express');
const router = express.Router();
const db = require('../../config/db'); 

// GET Available Years
router.get('/years', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT DISTINCT YEAR(date) as year FROM sales ORDER BY year DESC');
    const years = rows.map(r => r.year);
    res.json(years);
  } catch (error) {
    res.status(500).json([]);
  }
});

// GET Main Sales Data (Dashboard)
router.get('/', async (req, res) => {
  try {
    // --- SAFETY NET ---
    const currentDate = new Date();
    const year = req.query.year || currentDate.getFullYear();
    const month = req.query.month || (currentDate.getMonth() + 1);
    const filterType = req.query.filterType || 'monthly';

    let chartQuery = '';
    let chartParams = [];

    // 1. REVENUE GRAPH QUERY
    if (filterType === 'monthly') {
      chartQuery = `SELECT DATE_FORMAT(date, '%b') as label, SUM(amount) as total FROM sales WHERE YEAR(date) = ? GROUP BY MONTH(date), DATE_FORMAT(date, '%b') ORDER BY MONTH(date)`;
      chartParams = [year];
    } else if (filterType === 'weekly') {
      chartQuery = `SELECT CONCAT('Week ', WEEK(date)) as label, SUM(amount) as total FROM sales WHERE YEAR(date) = ? GROUP BY WEEK(date) ORDER BY WEEK(date)`;
      chartParams = [year];
    } else if (filterType === 'daily') {
      chartQuery = `SELECT DATE_FORMAT(date, '%d') as label, SUM(amount) as total FROM sales WHERE YEAR(date) = ? AND MONTH(date) = ? GROUP BY DAY(date) ORDER BY DAY(date)`;
      chartParams = [year, month];
    }

    // 2. PIE CHART QUERY
    let serviceQuery = `SELECT serviceType as name, SUM(amount) as value FROM sales WHERE YEAR(date) = ?`;
    let serviceParams = [year];

    if (filterType === 'daily') {
        serviceQuery += ` AND MONTH(date) = ?`;
        serviceParams.push(month);
    }
    serviceQuery += ` GROUP BY serviceType ORDER BY value DESC`;

    const [serviceData] = await db.execute(serviceQuery, serviceParams);

    // 3. STATS LOGIC
    const [todayRows] = await db.execute('SELECT SUM(amount) as total FROM sales WHERE DATE(date) = CURDATE()');
    const [monthRows] = await db.execute('SELECT SUM(amount) as total FROM sales WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())');
    const [yearRows] = await db.execute('SELECT SUM(amount) as total FROM sales WHERE YEAR(date) = YEAR(CURDATE())');

    // 4. EXECUTE CHART QUERY
    let chartData = [];
    if (chartQuery) {
        const [rows] = await db.execute(chartQuery, chartParams);
        chartData = rows;
    }
    
    // 5. RECENT TRANSACTIONS (UPDATED LIMIT to 100)
    const [recentSales] = await db.execute('SELECT * FROM sales ORDER BY date DESC LIMIT 100');

    res.json({ 
      chartData,
      serviceData, 
      recentSales,
      stats: {
        today: todayRows[0].total || 0,
        thisMonth: monthRows[0].total || 0,
        thisYear: yearRows[0].total || 0
      }
    });

  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Error', chartData: [], serviceData:[], recentSales: [], stats: {} });
  }
});

// GET Full Transaction History with Filters (NEW ENDPOINT)
router.get('/history', async (req, res) => {
  try {
    const { startDate, endDate, category, paymentMethod } = req.query;

    let query = 'SELECT * FROM sales WHERE 1=1';
    let params = [];

    // Filter by Date Range
    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
    }

    // Filter by Category (serviceType)
    if (category && category !== 'All') {
      query += ' AND serviceType = ?';
      params.push(category);
    }

    // Filter by Payment Method
    if (paymentMethod && paymentMethod !== 'All') {
      query += ' AND paymentMethod = ?';
      params.push(paymentMethod);
    }

    query += ' ORDER BY date DESC';

    const [history] = await db.execute(query, params);
    res.json(history);

  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json([]);
  }
});

module.exports = router;
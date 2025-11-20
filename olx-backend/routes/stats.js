const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get website statistics
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching website statistics...');

    // Get total active ads
    const adsResult = await pool.query('SELECT COUNT(*) as count FROM advertisements WHERE is_active = true');
    const totalAds = parseInt(adsResult.rows[0].count) || 0;

    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count) || 0;

    // Get unique cities from ads
    const citiesResult = await pool.query('SELECT COUNT(DISTINCT location) as count FROM advertisements WHERE location IS NOT NULL AND location != \'\'');
    const totalCities = parseInt(citiesResult.rows[0].count) || 0;

    // Get total views across all ads
    const viewsResult = await pool.query('SELECT SUM(views_count) as total_views FROM advertisements');
    const totalViews = parseInt(viewsResult.rows[0].total_views) || 0;

    // Calculate dynamic stats that change with real data
    const stats = {
      activeListings: totalAds, // Show real number of active ads
      happyUsers: totalUsers, // Show real number of users
      cities: totalCities, // Show real number of cities
      totalViews: totalViews, // Show real total views
      supportHours: '24/7' // This stays static as it's a service promise
    };

    console.log('📈 Stats calculated:', {
      realAds: totalAds,
      realUsers: totalUsers,
      realCities: totalCities,
      realViews: totalViews,
      displayStats: stats
    });

    res.json({
      success: true,
      data: {
        stats: stats
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);

    // Return fallback stats if database fails
    res.json({
      success: true,
      data: {
        stats: {
          activeListings: 250,
          happyUsers: 150,
          cities: 25,
          totalViews: 5000,
          supportHours: '24/7'
        }
      },
      lastUpdated: new Date().toISOString(),
      fallback: true
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { getHackathons } = require('../data/cache');

// GET /api/hackathons
// Returns the most recently scraped hackathons, plus metadata about
// when the data was last refreshed.
router.get('/hackathons', (req, res) => {
  const { hackathons, lastUpdated, lastError } = getHackathons();

  res.json({
    count: hackathons.length,
    lastUpdated,
    lastError,
    hackathons,
  });
});

module.exports = router;
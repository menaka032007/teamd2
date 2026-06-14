const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const { chromium } = require('playwright');

const hackathonsRoute = require('./routes/hackathons');
const { scrapeDevfolio } = require('./scrapers/devfolio');
const { scrapeUnstop } = require('./scrapers/unstop');
const { setHackathons, setError } = require('./data/cache');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve API routes
app.use('/api', hackathonsRoute);

// Serve static frontend files (index.html, script.js, style.css)
app.use(express.static(path.join(__dirname)));

// Manual refresh endpoint to trigger scraping on-demand
app.post('/api/refresh', async (req, res) => {
  try {
    await refreshHackathons();
    return res.json({ status: 'ok', message: 'Refresh triggered' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * Runs both scrapers using a single shared browser instance,
 * merges results, and updates the cache.
 */
async function refreshHackathons() {
  console.log(`[${new Date().toISOString()}] Refreshing hackathon data...`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    const [devfolio, unstop] = await Promise.all([
      scrapeDevfolio(browser),
      scrapeUnstop(browser),
    ]);

    const combined = [...devfolio, ...unstop];

    console.log(
      `[${new Date().toISOString()}] Scrape complete — Devfolio: ${devfolio.length}, Unstop: ${unstop.length}`
    );

    setHackathons(combined);
  } catch (err) {
    console.error('Refresh failed:', err.message);
    setError(err.message);
  } finally {
    if (browser) await browser.close();
  }
}

// Run once on startup, then every 30 minutes.
refreshHackathons();
cron.schedule('*/30 * * * *', refreshHackathons);

// Serve the SPA root for any non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TeamD hackathon server running on http://localhost:${PORT}`);
  console.log(`Hackathon data: http://localhost:${PORT}/api/hackathons`);
});
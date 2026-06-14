/**
 * Devfolio scraper
 * --------------------------------------------------
 * Devfolio's hackathon listing pages are rendered client-side (React/Next.js SPA),
 * so a plain HTTP fetch will not return hackathon cards in the HTML.
 * We use Playwright (headless Chromium) to load the page, wait for the
 * hackathon cards to render, then extract the data from the DOM.
 *
 * NOTE: Devfolio may change its markup/class names at any time. If this
 * scraper starts returning an empty array, inspect https://devfolio.co/hackathons/open
 * in a real browser, find the new card container selector, and update
 * CARD_SELECTOR / field selectors below.
 * --------------------------------------------------
 */

const OPEN_HACKATHONS_URL = 'https://devfolio.co/hackathons/open';

// Update this selector if Devfolio changes its DOM structure.
const CARD_SELECTOR = '[class*="HackathonCard"], a[href^="/hackathons/"]';

async function scrapeDevfolio(browser) {
  const page = await browser.newPage({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });

  try {
    await page.goto(OPEN_HACKATHONS_URL, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });

    // Give the SPA a moment to hydrate and render cards.
    await page.waitForTimeout(3000);

    const hackathons = await page.evaluate((selector) => {
      const cards = Array.from(document.querySelectorAll(selector));
      const seen = new Set();
      const results = [];

      for (const card of cards) {
        // Try to find a title — usually the most prominent heading/text in the card
        const titleEl =
          card.querySelector('h1, h2, h3, h4, [class*="title"], [class*="Title"]') ||
          card;
        const title = titleEl?.textContent?.trim();

        if (!title || title.length < 3) continue;

        // Resolve link
        let link = card.getAttribute('href') || card.querySelector('a')?.getAttribute('href');
        if (link && link.startsWith('/')) {
          link = `https://devfolio.co${link}`;
        }
        if (!link) link = 'https://devfolio.co/hackathons/open';

        // De-duplicate by title
        const key = title.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        // Try to find a date/timeline string near the card
        const dateEl = card.querySelector('[class*="date"], [class*="Date"], time');
        const dateText = dateEl?.textContent?.trim() || null;

        results.push({
          title,
          link,
          date: dateText,
        });
      }

      return results.slice(0, 15);
    }, CARD_SELECTOR);

    return hackathons.map((h) => ({
      ...h,
      source: 'Devfolio',
    }));
  } catch (err) {
    console.error('[devfolio] scrape failed:', err.message);
    return [];
  } finally {
    await page.close();
  }
}

module.exports = { scrapeDevfolio, OPEN_HACKATHONS_URL };
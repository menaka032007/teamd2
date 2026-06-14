/**
 * Unstop scraper
 * --------------------------------------------------
 * Unstop's hackathon listing page (https://unstop.com/hackathons) is also
 * a JS-rendered SPA. We use Playwright to load it, wait for the competition
 * cards to render, and extract title/link/deadline info.
 *
 * NOTE: Unstop frequently changes class names (often hashed/obfuscated,
 * e.g. "ListingCard_xxxxx"). If this scraper returns an empty array,
 * open https://unstop.com/hackathons in a browser, inspect a card element,
 * and update CARD_SELECTOR and the field selectors inside page.evaluate().
 * --------------------------------------------------
 */

const HACKATHONS_URL = 'https://unstop.com/hackathons';

// Update this selector if Unstop changes its DOM structure.
const CARD_SELECTOR = 'app-competition-listing app-card, [class*="listingCard"], a[href*="/hackathons/"]';

async function scrapeUnstop(browser) {
  const page = await browser.newPage({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });

  try {
    await page.goto(HACKATHONS_URL, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });

    await page.waitForTimeout(3000);

    const hackathons = await page.evaluate((selector) => {
      const cards = Array.from(document.querySelectorAll(selector));
      const seen = new Set();
      const results = [];

      for (const card of cards) {
        const titleEl =
          card.querySelector('h2, h3, h4, [class*="title"], [class*="Title"]') ||
          card;
        const title = titleEl?.textContent?.trim();

        if (!title || title.length < 3) continue;

        let link = card.getAttribute('href') || card.querySelector('a')?.getAttribute('href');
        if (link && link.startsWith('/')) {
          link = `https://unstop.com${link}`;
        }
        if (!link) link = 'https://unstop.com/hackathons';

        const key = title.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const dateEl = card.querySelector('[class*="date"], [class*="Date"], [class*="deadline"]');
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
      source: 'Unstop',
    }));
  } catch (err) {
    console.error('[unstop] scrape failed:', err.message);
    return [];
  } finally {
    await page.close();
  }
}

module.exports = { scrapeUnstop, HACKATHONS_URL };
/**
 * Fallback hackathon data.
 *
 * This is shown when:
 *  - the server has just started and hasn't completed its first scrape yet, or
 *  - both scrapers returned zero results (e.g. site blocked the scraper / changed markup).
 *
 * Feel free to edit these manually as a short-term backup list.
 */

module.exports = [
  {
    title: 'Explore open hackathons on Devfolio',
    link: 'https://devfolio.co/hackathons/open',
    date: null,
    source: 'Devfolio',
  },
  {
    title: 'Explore live hackathons on Unstop',
    link: 'https://unstop.com/hackathons',
    date: null,
    source: 'Unstop',
  },
];
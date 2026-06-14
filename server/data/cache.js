/**
 * In-memory cache for scraped hackathon data.
 * A real production app might persist this to a file or small DB
 * so it survives restarts, but in-memory is fine for a periodically
 * refreshed cache behind an API.
 */

const fallback = require('./fallback-hackathons');

let cache = {
  hackathons: fallback,
  lastUpdated: null,
  lastError: null,
};

function getHackathons() {
  return cache;
}

function setHackathons(hackathons) {
  cache = {
    hackathons: hackathons.length > 0 ? hackathons : fallback,
    lastUpdated: new Date().toISOString(),
    lastError: null,
  };
}

function setError(message) {
  cache = {
    ...cache,
    lastError: message,
  };
}

module.exports = { getHackathons, setHackathons, setError };
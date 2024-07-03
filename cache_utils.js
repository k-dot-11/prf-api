const fs = require('fs');
const path = require('path');
const cacheFilePath = path.join(__dirname, 'cache.json');

// Load cache from file
function loadCache() {
    if (!fs.existsSync(cacheFilePath)) {
        return {};
    }
    const cacheRaw = fs.readFileSync(cacheFilePath);
    return JSON.parse(cacheRaw);
}

// Save cache to file
function saveCache(cache) {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
}

// Get cache key
function getCacheKey(url, isHomeTeam) {
    return `${url}_${isHomeTeam}`;
}

// Check if cache entry is valid
function isCacheValid(entry) {
    if (!entry) return false;
    const now = new Date().getTime();
    return now < entry.expiry;
}

// Get cached response
function getCachedResponse(url, isHomeTeam) {
    const cache = loadCache();
    const key = getCacheKey(url, isHomeTeam);
    const entry = cache[key];
    if (isCacheValid(entry)) {
        return entry.data;
    }
    return null;
}

// Cache response
function cacheResponse(url, isHomeTeam, data) {
    const cache = loadCache();
    const key = getCacheKey(url, isHomeTeam);
    const expiry = new Date().getTime() + (2 * 7 * 24 * 60 * 60 * 1000); // 2 weeks
    cache[key] = { data, expiry };
    saveCache(cache);
}

module.exports = {
    getCachedResponse,
    cacheResponse,
};
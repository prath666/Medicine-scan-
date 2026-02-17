const CACHE_PREFIX = 'medscan_';
const CACHE_EXPIRY_DAYS = 7;

/**
 * Get cached medicine data by name.
 * Returns null if not found or expired.
 */
export const getFromCache = (medicineName) => {
    if (!medicineName) return null;

    const key = CACHE_PREFIX + medicineName.toLowerCase().trim();

    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const cached = JSON.parse(raw);

        // Check expiry
        const now = Date.now();
        const ageMs = now - cached.timestamp;
        const expiryMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        if (ageMs > expiryMs) {
            localStorage.removeItem(key);
            console.log(`🗑️ Cache expired for: ${medicineName}`);
            return null;
        }

        console.log(`⚡ Cache HIT for: ${medicineName}`);
        return cached.data;
    } catch (err) {
        console.error('Cache read error:', err);
        return null;
    }
};

/**
 * Save medicine data to cache.
 */
export const saveToCache = (medicineName, data) => {
    if (!medicineName || !data) return;

    const key = CACHE_PREFIX + medicineName.toLowerCase().trim();

    try {
        const entry = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(entry));
        console.log(`💾 Cached: ${medicineName}`);
    } catch (err) {
        // localStorage might be full
        console.error('Cache write error:', err);
    }
};

/**
 * Clear all medicine cache entries.
 */
export const clearAllCache = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
    console.log(`🧹 Cleared ${keys.length} cached entries`);
    return keys.length;
};

/**
 * Get count of cached medicines.
 */
export const getCacheCount = () => {
    return Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).length;
};

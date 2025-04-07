/**
 * Parse a duration string into milliseconds
 * Supports formats: 1s, 5m, 2h, 3d, 1w, 1y
 * Also supports Turkish formats: 1sn, 5dk, 2sa, 3g, 1h, 1y
 * 
 * @param {string} durationString - The duration string to parse
 * @returns {number|null} - The duration in milliseconds, or null if invalid
 */
function parseDuration(durationString) {
    if (!durationString) return null;

    const normalized = durationString.trim().toLowerCase();

    const regex = /^(\d+)([smhdwy]|sn|dk|sa|g|h|y)$/;
    const match = normalized.match(regex);

    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's':
        case 'sn':
            return value * 1000; // seconds
        case 'm':
        case 'dk':
            return value * 60 * 1000; // minutes
        case 'h':
        case 'sa':
            return value * 60 * 60 * 1000; // hours
        case 'd':
        case 'g':
            return value * 24 * 60 * 60 * 1000; // days
        case 'w':
        case 'h':
            return value * 7 * 24 * 60 * 60 * 1000; // weeks
        case 'y':
        case 'y':
            return value * 365 * 24 * 60 * 60 * 1000; // years (approximate)
        default:
            return null;
    }
}

/**
 * Format a duration in milliseconds to a human-readable string
 * 
 * @param {number} milliseconds - The duration in milliseconds
 * @param {string} locale - The locale to use for formatting (en or tr)
 * @returns {string} - The formatted duration string
 */
function formatDuration(milliseconds, locale = 'en') {
    if (!milliseconds || milliseconds <= 0) {
        return locale === 'tr' ? 'Kalıcı' : 'Permanent';
    }

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return `${years} ${locale === 'tr' ? 'yıl' : 'year'}${years > 1 && locale === 'en' ? 's' : ''}`;
    } else if (weeks > 0) {
        return `${weeks} ${locale === 'tr' ? 'hafta' : 'week'}${weeks > 1 && locale === 'en' ? 's' : ''}`;
    } else if (days > 0) {
        return `${days} ${locale === 'tr' ? 'gün' : 'day'}${days > 1 && locale === 'en' ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} ${locale === 'tr' ? 'saat' : 'hour'}${hours > 1 && locale === 'en' ? 's' : ''}`;
    } else if (minutes > 0) {
        return `${minutes} ${locale === 'tr' ? 'dakika' : 'minute'}${minutes > 1 && locale === 'en' ? 's' : ''}`;
    } else {
        return `${seconds} ${locale === 'tr' ? 'saniye' : 'second'}${seconds > 1 && locale === 'en' ? 's' : ''}`;
    }
}

module.exports = {
    parseDuration,
    formatDuration
};

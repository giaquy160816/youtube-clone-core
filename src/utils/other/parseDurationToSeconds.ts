/**
 * Convert string like "10h", "5d", "30m", "15s" to seconds
 */
export function parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/i);

    if (!match) {
        throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 3600;
        case 'd': return value * 86400;
        default:
            throw new Error(`Unsupported time unit: ${unit}`);
    }
}

/**
 * Convert string like "10h", "5d", "30m", "15s" to milliseconds
 */
export function parseDurationToMilliseconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/i);

    if (!match) {
        throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 3600 * 1000;
        case 'd': return value * 86400 * 1000;
        default:
            throw new Error(`Unsupported time unit: ${unit}`);
    }
}
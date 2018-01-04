export function createAnimationDelay(percent, timeoutMs) {
    return percent / 100 * timeoutMs;
}

export const MINOR_DELAY = 500; 
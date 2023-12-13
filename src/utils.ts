export function lerp(t, start, end) {
    return start + t * (end - start);
}

export function constrain(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

export function advancedLog(message: string, color: string = "green", prefix: string = "") {
    const formattedMessage = prefix ? `[${prefix}] ${message}` : message;
    console.log(`%c${formattedMessage}`, `color: ${color}`);
}
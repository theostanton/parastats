export function validateStravaActivityId(id: string): boolean {
    return Boolean(id && id.length > 0 && /^\d+$/.test(id));
}

export function validatePilotId(id: string | number): boolean {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    return !isNaN(numId) && numId > 0;
}

export function validateDateParam(dateStr: string): Date | null {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) ? date : null;
}

export function validateWing(wing: string): boolean {
    return Boolean(wing && wing.length > 0 && wing.length <= 100);
}

export function sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}
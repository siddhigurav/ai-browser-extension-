export function isValidToken(t) { return typeof t === 'string' && t.trim().length > 10; }
export function truncate(s, n = 300) { return s && s.length > n ? s.slice(0, n) + '...' : s; }

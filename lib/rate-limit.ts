const requestMap = new Map<string, { count: number; expiresAt: number }>();

export const assertRateLimit = (key: string, limit = 25, windowMs = 60_000) => {
  const now = Date.now();
  const existing = requestMap.get(key);

  if (!existing || existing.expiresAt < now) {
    requestMap.set(key, { count: 1, expiresAt: now + windowMs });
    return;
  }

  if (existing.count >= limit) {
    throw new Error("RATE_LIMITED");
  }

  existing.count += 1;
};

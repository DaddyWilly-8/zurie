/**
 * Duplicate-submit protection for money-creating POSTs. The backend
 * (EnsureIdempotency middleware) replays the first successful result when
 * it sees the same `Idempotency-Key` again, so a double-click or a retry
 * after a dropped connection can't create a second order/payment.
 *
 * One key per *intent*, not per click: the same payload re-sent while the
 * first attempt is unresolved reuses its key; once an attempt succeeds the
 * key is forgotten, so a genuinely new identical order gets a fresh one.
 * A failed attempt keeps the key — the server releases failed keys, so a
 * corrected retry (different payload) simply gets its own key anyway.
 */
const pendingKeys = new Map<string, string>();

const newKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

export const withIdempotency = async <T>(
  scope: string,
  payload: unknown,
  send: (headers: Record<string, string>) => Promise<T>,
): Promise<T> => {
  const signature = `${scope}:${JSON.stringify(payload)}`;
  const key = pendingKeys.get(signature) ?? newKey();
  pendingKeys.set(signature, key);

  const result = await send({ "Idempotency-Key": key });
  pendingKeys.delete(signature);

  return result;
};

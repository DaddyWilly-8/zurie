export type ApiError = {
  message: string;
  status: number;
  details?: unknown;
};

export type ApiRequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | null | undefined>;
  timeoutMs?: number;
};

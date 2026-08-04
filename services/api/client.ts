import { API_BASE_URL, API_TIMEOUT_MS } from "@/services/api/config";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import type { ApiRequestOptions } from "@/services/api/types";

const joinUrl = (path: string, query?: ApiRequestOptions["query"]) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  if (!query) return url;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const withTimeout = async (request: Promise<Response>, timeoutMs: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<Response>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
  });

  try {
    const response = await Promise.race([request, timeoutPromise]);
    return response as Response;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const parseJsonSafely = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const getApiOrigin = () => {
  try {
    return new URL(API_BASE_URL, typeof window !== "undefined" ? window.location.origin : undefined).origin;
  } catch {
    return "";
  }
};

const readCookieValue = (name: string) => {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  if (!match) return "";
  const value = match.slice(name.length + 1);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

let csrfBootstrapPromise: Promise<void> | null = null;

const ensureCsrfCookie = async () => {
  if (typeof window === "undefined") return;
  if (readCookieValue("XSRF-TOKEN")) return;
  if (csrfBootstrapPromise) {
    await csrfBootstrapPromise;
    return;
  }

  const apiOrigin = getApiOrigin();
  const csrfUrl = `${apiOrigin}${API_ENDPOINTS.auth.csrfCookie}`;

  csrfBootstrapPromise = fetch(csrfUrl, {
    method: "GET",
    credentials: "include",
  }).then(() => undefined);

  try {
    await csrfBootstrapPromise;
  } finally {
    csrfBootstrapPromise = null;
  }
};

export const apiClient = {
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { query, timeoutMs = API_TIMEOUT_MS, headers, ...init } = options;
    const method = (init.method ?? "GET").toUpperCase();
    const needsCsrf = MUTATING_METHODS.has(method);

    if (needsCsrf) {
      await ensureCsrfCookie();
    }

    const isFormData =
      typeof FormData !== "undefined" && init.body instanceof FormData;
    const mergedHeaders = new Headers(headers ?? undefined);
    if (!isFormData && !mergedHeaders.has("Content-Type")) {
      mergedHeaders.set("Content-Type", "application/json");
    }

    if (needsCsrf && !mergedHeaders.has("X-XSRF-TOKEN")) {
      const csrfToken = readCookieValue("XSRF-TOKEN");
      if (csrfToken) {
        mergedHeaders.set("X-XSRF-TOKEN", csrfToken);
      }
    }

    const url = joinUrl(path, query);

    const send = () =>
      withTimeout(
        fetch(url, {
          ...init,
          method,
          credentials: "include",
          headers: mergedHeaders,
        }),
        timeoutMs,
      );

    let response = await send();

    if (response.status === 419 && needsCsrf) {
      await ensureCsrfCookie();
      const csrfToken = readCookieValue("XSRF-TOKEN");
      if (csrfToken) {
        mergedHeaders.set("X-XSRF-TOKEN", csrfToken);
      }
      response = await send();
    }

    const payload = await parseJsonSafely(response);

    if (!response.ok) {
      const message =
        (payload as { error?: string; message?: string } | null)?.message ||
        (payload as { error?: string; message?: string } | null)?.error ||
        "Request failed";
      throw new Error(message);
    }

    return payload as T;
  },

  get<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, options?: Omit<ApiRequestOptions, "method">) {
    return this.request<T>(path, {
      ...options,
      method: "DELETE",
    });
  },
};

import { API_BASE_URL, API_TIMEOUT_MS } from "@/services/api/config";
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

export const apiClient = {
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { query, timeoutMs = API_TIMEOUT_MS, headers, ...init } = options;
    const isFormData =
      typeof FormData !== "undefined" && init.body instanceof FormData;
    const mergedHeaders = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    };

    const response = await withTimeout(
      fetch(joinUrl(path, query), {
        ...init,
        credentials: "include",
        headers: mergedHeaders,
      }),
      timeoutMs,
    );

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

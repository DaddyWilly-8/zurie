import axios, { AxiosError } from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "@/services/api/config";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import type { ApiRequestOptions } from "@/services/api/types";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

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

  csrfBootstrapPromise = axios
    .get(csrfUrl, { withCredentials: true, timeout: API_TIMEOUT_MS })
    .then(() => undefined);

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
    const mergedHeaders: Record<string, string> = {};
    Object.entries(headers ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        mergedHeaders[key] = String(value);
      }
    });

    if (!isFormData && !mergedHeaders["Content-Type"]) {
      mergedHeaders["Content-Type"] = "application/json";
    }

    if (needsCsrf && !mergedHeaders["X-XSRF-TOKEN"]) {
      const csrfToken = readCookieValue("XSRF-TOKEN");
      if (csrfToken) {
        mergedHeaders["X-XSRF-TOKEN"] = csrfToken;
      }
    }

    const execute = async () => {
      const response = await axiosClient.request<T>({
        url: path,
        method: method as ApiRequestOptions["method"],
        params: query,
        headers: mergedHeaders,
        data: init.body,
        timeout: timeoutMs,
      });

      return response.data;
    };

    try {
      return await execute();
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;

      if (axiosError.response?.status === 419 && needsCsrf) {
        await ensureCsrfCookie();
        const csrfToken = readCookieValue("XSRF-TOKEN");
        if (csrfToken) {
          mergedHeaders["X-XSRF-TOKEN"] = csrfToken;
        }
        return await execute();
      }

      const message = axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || "Request failed";
      throw new Error(message);
    }
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

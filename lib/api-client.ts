const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");
const trimLeadingSlash = (value: string) => value.replace(/^\//, "");

const getApiBaseUrl = () => {
  const clientBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (clientBase && clientBase.length > 0) {
    return trimTrailingSlash(clientBase);
  }

  if (typeof window === "undefined") {
    const serverBase = process.env.API_BASE_URL;
    if (serverBase && serverBase.length > 0) {
      return trimTrailingSlash(serverBase);
    }
  }

  return "";
};

export const buildApiUrl = (path: string) => {
  const normalizedPath = trimLeadingSlash(path);
  const base = getApiBaseUrl();

  if (!base) {
    return `/api/${normalizedPath}`;
  }

  return `${base}/${normalizedPath}`;
};

export const apiFetch = (path: string, init?: RequestInit) => {
  return fetch(buildApiUrl(path), init);
};

/**
 * Unified API Client for HHK Platform
 * Handles credentials, JSON/FormData formatting, and centralized error parsing.
 */
export async function api(path, init = {}) {
  const isFormData = init?.body instanceof FormData;
  const headers = isFormData
    ? { ...(init?.headers ?? {}) }
    : { "Content-Type": "application/json", ...(init?.headers ?? {}) };

  const response = await fetch(`/api${path}`, {
    credentials: "include",
    ...init,
    headers,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }
  return data;
}

export default api;

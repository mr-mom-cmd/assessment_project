const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const resp = await fetch(url, {
    ...options
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `Request failed: ${resp.status}`);
  }

  const contentType = resp.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return (await resp.json()) as T;
  }

  // @ts-expect-error (non-json caller should handle raw response)
  return resp;
}

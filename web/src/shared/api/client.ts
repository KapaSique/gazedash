export type Session = {
  id: string;
  started_at: string;
  source: string;
  notes?: string | null;
};

export const __debug_client_version = "v1";

const envBaseUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE_URL =
  envBaseUrl && envBaseUrl.trim().length > 0
    ? envBaseUrl
    : "http://localhost:8000";

type RequestOptions = RequestInit & { signal?: AbortSignal };

async function requestJson<T>(path: string, options?: RequestOptions): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let details = "";
    try {
      const data = (await res.json()) as { detail?: unknown };
      if (data?.detail) {
        details = `: ${typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)}`;
      }
    } catch {
      // Ignore parsing errors and fall back to status text only.
    }
    throw new Error(`API ${res.status} ${res.statusText}${details}`);
  }

  return (await res.json()) as T;
}

export async function getSessions(signal?: AbortSignal): Promise<Session[]> {
  return requestJson<Session[]>("/sessions", { signal });
}

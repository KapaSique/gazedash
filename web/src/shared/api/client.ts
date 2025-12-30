const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export type Session = {
  id: string;
  started_at: string;
  source: string;
  notes?: string | null;
};

export type Event = {
  ts: string;
  type: string; // attention/offroad/phone/drowsy
  value: number | boolean;
  confidence: number;
};

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function getSessions(signal?: AbortSignal): Promise<Session[]> {
  return requestJson<Session[]>(`${API_URL}/sessions`, signal);
}

export function getSession(id: string, signal?: AbortSignal): Promise<Session> {
  return requestJson<Session>(`${API_URL}/sessions/${id}`, signal);
}

export function getSessionEvents(id: string, signal?: AbortSignal): Promise<Event[]> {
  return requestJson<Event[]>(`${API_URL}/sessions/${id}/events`, signal);
}
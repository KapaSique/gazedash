import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as api from "../shared/api/client";

type Session = api.Session;
type Event = api.Event;

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();

  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (id ? `Session ${id}` : "Session"), [id]);

  useEffect(() => {
    if (!id) return;

    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [s, ev] = await Promise.all([
          api.getSession(id, ac.signal),
          api.getSessionEvents(id, ac.signal),
        ]);

        setSession(s);
        setEvents(ev);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id]);

  if (!id) return <div style={{ padding: 16 }}>No session id in URL.</div>;
  if (loading) return <div style={{ padding: 16 }}>Loading session…</div>;
  if (error) return <div style={{ padding: 16 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/sessions">← Back to sessions</Link>
      </div>

      <h2>{title}</h2>

      {session ? (
        <div style={{ opacity: 0.85, marginBottom: 16 }}>
          <div><b>Started:</b> {new Date(session.started_at).toLocaleString()}</div>
          <div><b>Source:</b> {session.source}</div>
          {session.notes ? <div><b>Notes:</b> {session.notes}</div> : null}
        </div>
      ) : null}

      <h3>Events</h3>
      {events.length === 0 ? (
        <div>No events.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.8 }}>
              <th style={{ padding: 8, borderBottom: "1px solid #333" }}>Time</th>
              <th style={{ padding: 8, borderBottom: "1px solid #333" }}>Type</th>
              <th style={{ padding: 8, borderBottom: "1px solid #333" }}>Value</th>
              <th style={{ padding: 8, borderBottom: "1px solid #333" }}>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                  {new Date(e.ts).toLocaleTimeString()}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{e.type}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>
                  {typeof e.value === "boolean" ? (e.value ? "true" : "false") : e.value.toFixed(2)}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #222" }}>{e.confidence.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
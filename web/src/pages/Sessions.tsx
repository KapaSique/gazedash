import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../shared/api/client";

type Session = api.Session;

export default function Sessions() {
  const [data, setData] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async() => {
      try {
        setLoading(true);
        setError(null);
        console.log("client module:", api.__debug_client_version, api);
        const sessions = await api.getSessions(ac.signal);
        setData(sessions);
      } catch (e){
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);
  if (loading) return <div style = {{ padding: 16}}>Loading sessions...</div>;
  if (error) return <div style={{ padding: 16 }}>Error: {error}</div>;

  return (
    <div style = {{padding: 16}}>
      <h2>Sessions</h2>
      {data.length === 0 ? (<div>No sessions yet.</div>
      ): (
        <ul style = {{lineHeight: 1.8 }}>
          {data.map((s) => (
            <li key = {s.id}>
              <Link to = {`/sessions/${s.id}`}>{s.id}</Link>{" "}
              <span style = {{opacity: 0.7}}>
                {new Date(s.started_at).toLocaleString()}
              </span>
              {s.notes ? <span> — {s.notes}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
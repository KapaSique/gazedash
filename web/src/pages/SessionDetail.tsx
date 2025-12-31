import { useEffect, useMemo, useState } from "react";
import { Link, useParams} from "react-router-dom";
import * as api from "../shared/api/client";

type Session = api.Session;
type Event = api.Event;
type Stats = api.Stats;

export default function SessionDetail() {
  const { id } = useParams<{ id: string}>();

  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<api.Stats | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc"> ("asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const page: React.CSSProperties = {padding: 16};
  const cell: React.CSSProperties = {padding: 8, borderBottom: "1px solid #222"};
  const headCell: React.CSSProperties = {padding: 8, borderBottom: "1px solid #333"};
  const statsCell: React.CSSProperties = {padding: 12, border: "1px solid #222", borderRadius: 8};

  const title = useMemo(() => (id ? `Session ${id}` : "Session"), [id]);

  const eventTypes = useMemo(() => {
    const uniq = Array.from(new Set(events.map(e => e.type)));
    uniq.sort();
    return ["all", ...uniq];
  }, [events]);

  const filteredEvents = useMemo(() =>{
    const arr = typeFilter === "all" ? events : events.filter(e => e.type === typeFilter);
    
    const sorted = [...arr].sort((a, b) => {
      const ta = new Date(a.ts).getTime();
      const tb = new Date(b.ts).getTime();
      return sortDir === "asc" ? ta - tb : tb - ta;
    });
    return sorted;
  }, [events, typeFilter, sortDir]);

  useEffect(() => {
    if (!id) return;
    
    const ac = new AbortController();
    (async() => {
      try {
        setLoading(true);
        setError(null);

        const [s, ev, st] = await Promise.all([
          api.getSession(id, ac.signal),
          api.getSessionEvents(id, ac.signal),
          api.getSessionStats(id, ac.signal),
        ]);

        setSession(s);
        setEvents(ev);
        setStats(st);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id]);

  if (!id) return <div style = {page}>No session id in URL</div>;
  if (loading) return <div style = {page}>Loading session...</div>;
  if (error) return <div style = {page}>Error: {error}</div>;

  return (
    <div style = {page}>
      <div style = {{marginBottom : 12}}>
        <Link to = "/sessions">Back to sessions</Link>
      </div>

      <h2>{title}</h2>

      {session ? (
        <div style = {{opacity: 0.85, marginBottom: 16}}>
          <div><b>Started:</b> {new Date(session.started_at).toLocaleString()}</div>
          <div><b>Source:</b> {session.source}</div>
          {session.notes ? <div><b>Notes:</b> {session.notes}</div> : null}
        </div>
      ) : null}
      <div style = {{display: "flex", gap: 12, alignItems: "center", margin: "8px 0 12px"}}>
        <label style = {{opacity: 0.8}}>Type:</label>
        <select value ={typeFilter} onChange={(e => setTypeFilter(e.target.value))}>
          {eventTypes.map((t) => (
            <option key = {t} value = {t}>{t}</option>
          ))}
        </select>
        <button
        onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
        style = {{padding: "6px 10px", borderRadius: 10, border: "1px solid #333", background: "transparent"}}>
          Sort: {sortDir.toUpperCase()}
        </button>
      </div>

      {stats ? (
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={statsCell}>Attention avg: {stats.attention_avg.toFixed(2)}</div>
          <div style={statsCell}>Offroad: {stats.offroad_count}</div>
          <div style={statsCell}>Phone: {stats.phone_count}</div>
          <div style={statsCell}>Drowsy: {stats.drowsy_count}</div>
          <div style={statsCell}>Events: {stats.events_total}</div>
        </div>
      ) : null}

      <h3>Events</h3>
      {events.length === 0 ?(
        <div>No events</div>
      ) : (
        <table style={{width: "100%", borderCollapse: "collapse"}}>
        <thead>
          <tr style = {{textAlign: "left", opacity: 0.8}}>
            <th style = {headCell}>Time</th>
            <th style = {headCell}>Type</th>
            <th style = {headCell}>Value</th>
            <th style = {headCell}>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.map((e, idx) => (
            <tr key={`${e.ts}-${e.type}`}>
              <td style = {cell}>
                {new Date(e.ts).toLocaleTimeString()}
              </td>
              <td style = {cell}>{e.type}</td>
              <td style = {cell}>
                {typeof e.value === "boolean" ? (e.value ? "true" : "false") : e.value.toFixed(2)}
              </td>
              <td style ={cell}>{e.confidence.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        </table>
      )}
    </div>
  );
} 

function StatCard({label, value} : {label: string; value: React.ReactNode,}){
  return (
    <div style = {{
      border: "1px solid #333",
      borderRadius: 12,
      padding: 12,
      minWidth: 160,
      background: "rgba(255, 255, 255, 0.02)"
    }}>
      <div style = {{opacity: 0.75, fontSize: 12}}>{label}</div>
      <div style = {{fontSize: 22, fontWeight: 700}}>{value}</div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as api from "../shared/api/client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

type Point = { t: number; label: string; attention: number};

function fmtTime(d: Date) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit"});
}

export default function Timeline() {
    const { id } = useParams<{ id: string }>();

    const [events, setEvents] = useState<api.Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const ac = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const ev = await api.getSessionEvents(id, ac.signal);
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

    const data = useMemo<Point[]>(() => {
        const att = events
        .filter((e) => e.type === "attention" && typeof e.value === "number")
        .map((e) => ({ ts: new Date(e.ts).getTime(), v: Number(e.value) }))
        .sort((a, b) => a.ts - b.ts);
    
    if (att.length === 0) return [];

    const binSec = 5;
    const start = att[0].ts;

    const buckets = new Map<number, { sum: number; n: number; ts:number}>();

    for (const p of att){
        const SecFromStart = Math.floor((p.ts - start) / 1000);
        const bucket = Math.floor(SecFromStart / binSec) * binSec;

        const cur = buckets.get(bucket);
        if (!cur) buckets.set(bucket, { sum: p.v, n: 1, ts: start + bucket * 1000});
        else buckets.set(bucket, { sum: cur.sum + p.v, n: cur.n + 1, ts: cur.ts});
    }
    
    return Array.from(buckets.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([tSec, b]) => ({
            t: tSec,
            label: fmtTime(new Date(b.ts)),
            attention: b.sum / b.n,
        }));
    }, [events]);

    if (!id) return <div style = {{padding: 16}}>No session id</div>;
    if (loading) return <div style = {{padding: 16}}>Loading timeline...</div>;
    if (error) return <div style = {{padding: 16}}>Error: {error}</div>;

    return (
        <div style = {{padding: 16}}>
            <div style = {{marginBottom: 12}}>
                <Link to={`/sessions/${id}/stats`}>Back to session</Link>
                <span style = {{margin: "0 8px", opacity: 0.5}}>|</span>
                <Link to="/sessions">Sessions</Link>
            </div>
            <h2>Timeline - Sessions {id}</h2>

            {data.length === 0 ? (
                <div>No attention poins yet</div>
            ) : (
                <div style={{width: "100%", height: 380, marginTop: 12}}>
                    <ResponsiveContainer>
                        <LineChart data={data} margin = {{top: 10, right: 20, left: 0, bottom: 10}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="label"/>
                            <YAxis domain={[0, 1]}/>
                            <Tooltip />
                            <Line type="monotone" dataKey="attention" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
            <div style={{marginTop: 10, opacity: 0.7, fontSize: 12}}>
                Bin: 5s, value = avg(attention)
            </div>
        </div>
    );
}

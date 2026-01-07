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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Point = { t: number; label: string; attention: number };

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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

    const buckets = new Map<number, { sum: number; n: number; ts: number }>();

    for (const p of att) {
      const SecFromStart = Math.floor((p.ts - start) / 1000);
      const bucket = Math.floor(SecFromStart / binSec) * binSec;

      const cur = buckets.get(bucket);
      if (!cur) buckets.set(bucket, { sum: p.v, n: 1, ts: start + bucket * 1000 });
      else buckets.set(bucket, { sum: cur.sum + p.v, n: cur.n + 1, ts: cur.ts });
    }

    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([tSec, b]) => ({
        t: tSec,
        label: fmtTime(new Date(b.ts)),
        attention: b.sum / b.n,
      }));
  }, [events]);

  if (!id) {
    return (
      <Alert>
        <AlertTitle>No session id</AlertTitle>
        <AlertDescription>В URL нет id сессии.</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="px-2">
          <Link to={`/sessions/${id}/stats`}>{"<-"} Back to session</Link>
        </Button>
        <Badge variant="outline" className="font-mono">
          #{id}
        </Badge>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl font-semibold">Timeline</CardTitle>
          <p className="text-sm text-muted-foreground">
            Attention over time (bin 5s, avg).
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {data.length === 0 ? (
            <div className="text-sm text-muted-foreground">No attention points yet</div>
          ) : (
            <div className="h-[360px] w-full">
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="attention"
                    dot={false}
                    strokeWidth={3}
                    stroke="hsl(var(--primary))"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

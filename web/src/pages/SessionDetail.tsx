import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HttpError } from "../shared/api/http";
import * as api from "../shared/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/shared/ui/MetricCard";

type Session = api.Session;
type Event = api.Event;
type Stats = api.Stats;

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();

  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const uniqueTypes = useMemo(() => {
    const uniq = Array.from(new Set(events.map((e) => e.type)));
    uniq.sort();
    return uniq;
  }, [events]);

  const filteredEvents = useMemo(() => {
    const arr = typeFilter === "all" ? events : events.filter((e) => e.type === typeFilter);

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
    (async () => {
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

        if (e instanceof HttpError) {
          const body = e.body;
          const detail =
            body && typeof body === "object" && "detail" in body
              ? String((body as Record<string, unknown>).detail)
              : "";
          setError(detail ? `${e.status}: ${detail}` : `${e.status}: ${e.message}`);
          return;
        }

        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [id]);

  if (!id) {
    return (
      <Alert>
        <AlertTitle>No session id</AlertTitle>
        <AlertDescription>В URL нет id сессии.</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link className="text-primary hover:underline" to="/sessions">
          Back to sessions
        </Link>
        <span className="text-muted-foreground">|</span>
        <Link className="text-primary hover:underline" to={`/sessions/${id}/timeline`}>
          Timeline
        </Link>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">Session {id}</h1>

      {session ? (
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Started:</span>{" "}
            {new Date(session.started_at).toLocaleString()}
          </div>
          <div>
            <span className="font-medium text-foreground">Source:</span>{" "}
            <Badge variant="secondary">{session.source}</Badge>
          </div>
          {session.notes ? (
            <div>
              <span className="font-medium text-foreground">Notes:</span> {session.notes}
            </div>
          ) : null}
        </div>
      ) : null}

      <Separator className="my-4" />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Type:</span>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              {uniqueTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
        >
          Sort: {sortDir.toUpperCase()}
        </Button>
      </div>

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <MetricCard title="Events total" value={`${stats.events_total}`} />
          <MetricCard title="Duration" value={`${Math.round(stats.duration_sec)}s`} />
          <MetricCard title="Attention" value={`${stats.attention_pct.toFixed(1)}%`} />
          <MetricCard title="Offroad" value={`${stats.offroad_pct.toFixed(1)}%`} />
          <MetricCard title="Phone" value={`${stats.phone_pct.toFixed(1)}%`} />
          <MetricCard title="Drowsy" value={`${stats.drowsy_pct.toFixed(1)}%`} />
        </div>
      ) : null}

      <h2 className="mt-8 text-xl font-semibold">Events</h2>

      {filteredEvents.length === 0 ? (
        <div className="mt-3 text-sm text-muted-foreground">No events</div>
      ) : (
        <div className="mt-3 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEvents.map((e, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {new Date(e.ts).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {typeof e.value === "boolean"
                      ? e.value
                        ? "true"
                        : "false"
                      : Number(e.value).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(e.confidence).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

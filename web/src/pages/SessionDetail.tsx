import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { HttpError } from "../shared/api/http";
import * as api from "../shared/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-56 w-full rounded-xl" />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Link className="text-primary hover:underline" to="/sessions">
            Back to sessions
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link className="text-primary hover:underline" to={`/sessions/${id}/timeline`}>
            Timeline
          </Link>
        </div>
        {session ? <Badge variant="outline" className="font-mono">{session.source}</Badge> : null}
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Session
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">#{id}</h1>
          </div>
          <Badge variant="secondary" className="h-8 rounded-full px-3 text-xs uppercase">
            {filteredEvents.length} events
          </Badge>
        </div>

        {session ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoRow label="Started" value={new Date(session.started_at).toLocaleString()} />
            <InfoRow label="Source" value={<Badge variant="outline">{session.source}</Badge>} />
            {session.notes ? <InfoRow label="Notes" value={session.notes} className="sm:col-span-2" /> : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card/60 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Type</span>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
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

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Events</h2>
        <Badge variant="secondary" className="tabular-nums">
          {filteredEvents.length}
        </Badge>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {filteredEvents.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No events</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="w-[140px] text-xs uppercase tracking-wider">
                  Time
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-xs uppercase tracking-wider">Value</TableHead>
                <TableHead className="text-right text-xs uppercase tracking-wider">
                  Confidence
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEvents.map((e, idx) => (
                <TableRow key={`${e.ts}-${idx}`} className="hover:bg-muted/40">
                  <TableCell className="font-mono tabular-nums">
                    {new Date(e.ts).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {e.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {typeof e.value === "boolean"
                      ? e.value
                        ? "true"
                        : "false"
                      : Number(e.value).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(e.confidence).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={["flex flex-col gap-1", className].filter(Boolean).join(" ")}>
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="text-base font-medium leading-tight text-foreground">{value}</span>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  differenceInCalendarDays,
} from "date-fns";
import type { Locale as DateFnsLocale } from "date-fns";
import { ka } from "date-fns/locale/ka";
import { ru } from "date-fns/locale/ru";
import { enUS } from "date-fns/locale/en-US";
import { ChevronLeft, ChevronRight, CalendarDays, Rows3 } from "lucide-react";
import { Booking, BookingStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";
import { useCurrency } from "@/contexts/currency-context";
import { useLanguage } from "@/contexts/language-context";
import type { Locale, Translations } from "@/lib/i18n/translations";

const dateFnsLocales: Record<Locale, DateFnsLocale> = { en: enUS, ka, ru };

type CalStrings = Translations["bookings"]["calendar"];

// Status colors for calendar bars (matches status-badge palette).
const statusBar: Record<BookingStatus, string> = {
  draft: "bg-gray-200 text-gray-800 border-gray-300",
  confirmed: "bg-purple-200 text-purple-900 border-purple-300",
  active: "bg-blue-200 text-blue-900 border-blue-300",
  returned: "bg-green-200 text-green-900 border-green-300",
  cancelled: "bg-red-200 text-red-900 border-red-300",
};

type CalView = "month" | "timeline";

function parseDay(d: string): Date {
  // booking dates are "YYYY-MM-DD" — parse as local midnight, no TZ shift.
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day);
}

interface BookingCalendarProps {
  bookings: Booking[];
}

export function BookingCalendar({ bookings }: BookingCalendarProps) {
  const { t, locale } = useLanguage();
  const c = t.bookings.calendar;
  const loc = dateFnsLocales[locale];
  const [view, setView] = useState<CalView>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [selected, setSelected] = useState<Booking | null>(null);

  // Hide cancelled.
  const visible = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled"),
    [bookings]
  );

  const monthLabel = format(cursor, "LLLL yyyy", { locale: loc });

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor((c) => addMonths(c, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold w-36 text-center tabular-nums">{monthLabel}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor((c) => addMonths(c, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setCursor(startOfDay(new Date()))}>
              {c.today}
            </Button>
          </div>

          <div className="flex items-center gap-1 rounded-lg border p-0.5">
            <button
              type="button"
              onClick={() => setView("month")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" /> {c.month}
            </button>
            <button
              type="button"
              onClick={() => setView("timeline")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                view === "timeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Rows3 className="h-3.5 w-3.5" /> {c.timeline}
            </button>
          </div>
        </div>

        {view === "month" ? (
          <MonthView cursor={cursor} bookings={visible} onSelect={setSelected} loc={loc} c={c} />
        ) : (
          <TimelineView cursor={cursor} bookings={visible} onSelect={setSelected} c={c} />
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-muted-foreground">
          {(["confirmed", "active", "returned", "draft"] as BookingStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm border", statusBar[s])} /> <span>{t.status.booking[s]}</span>
            </span>
          ))}
        </div>
      </CardContent>

      {selected && <BookingPopover booking={selected} onClose={() => setSelected(null)} c={c} />}
    </Card>
  );
}

/* ----------------------------- Month grid ----------------------------- */

function MonthView({
  cursor,
  bookings,
  onSelect,
  loc,
  c,
}: {
  cursor: Date;
  bookings: Booking[];
  onSelect: (b: Booking) => void;
  loc: DateFnsLocale;
  c: CalStrings;
}) {
  const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  // Weekday labels in active locale, Monday-first (matches weekStartsOn: 1).
  const weekdayLabels = days.slice(0, 7).map((d) => format(d, "EEEEEE", { locale: loc }));

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {weekdayLabels.map((d, i) => (
          <div key={i} className="px-2 py-1.5 text-center text-[11px] font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div>
        {weeks.map((week, wi) => (
          <WeekRow key={wi} week={week} cursor={cursor} bookings={bookings} onSelect={onSelect} c={c} />
        ))}
      </div>
    </div>
  );
}

const MAX_BARS = 3;

function WeekRow({
  week,
  cursor,
  bookings,
  onSelect,
  c,
}: {
  week: Date[];
  cursor: Date;
  bookings: Booking[];
  onSelect: (b: Booking) => void;
  c: CalStrings;
}) {
  const weekStart = week[0];
  const weekEnd = week[6];

  // Bookings overlapping this week, with their column span clipped to the week.
  const bars = bookings
    .map((b) => {
      const s = parseDay(b.startDate);
      const e = parseDay(b.endDate);
      if (e < weekStart || s > weekEnd) return null;
      const startCol = Math.max(0, differenceInCalendarDays(s, weekStart));
      const endCol = Math.min(6, differenceInCalendarDays(e, weekStart));
      return { booking: b, startCol, endCol };
    })
    .filter((x): x is { booking: Booking; startCol: number; endCol: number } => x !== null)
    .sort((a, b) => a.startCol - b.startCol || a.endCol - b.endCol);

  // Assign each bar to a lane (row) avoiding overlap.
  const lanes: { startCol: number; endCol: number }[][] = [];
  const placed = bars.map((bar) => {
    let lane = lanes.findIndex((l) => l.every((x) => bar.startCol > x.endCol || bar.endCol < x.startCol));
    if (lane === -1) {
      lane = lanes.length;
      lanes.push([]);
    }
    lanes[lane].push({ startCol: bar.startCol, endCol: bar.endCol });
    return { ...bar, lane };
  });

  const overflow: Record<number, number> = {};
  placed.forEach((p) => {
    if (p.lane >= MAX_BARS) {
      for (let col = p.startCol; col <= p.endCol; col++) overflow[col] = (overflow[col] ?? 0) + 1;
    }
  });

  return (
    <div className="relative grid grid-cols-7 border-b last:border-b-0" style={{ minHeight: 96 }}>
      {/* Day cells */}
      {week.map((day, di) => {
        const inMonth = isSameMonth(day, cursor);
        const today = isSameDay(day, new Date());
        return (
          <div key={di} className={cn("border-r last:border-r-0 p-1", !inMonth && "bg-muted/20")}>
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium",
                today ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              {format(day, "d")}
            </div>
          </div>
        );
      })}

      {/* Booking bars overlaid */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-7" style={{ paddingTop: 28 }}>
        {placed
          .filter((p) => p.lane < MAX_BARS)
          .map((p) => (
            <button
              key={p.booking.id}
              type="button"
              onClick={() => onSelect(p.booking)}
              style={{
                gridColumn: `${p.startCol + 1} / ${p.endCol + 2}`,
                gridRow: 1,
                marginTop: p.lane * 22,
              }}
              className={cn(
                "pointer-events-auto mx-0.5 truncate rounded border px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight hover:opacity-80",
                statusBar[p.booking.status]
              )}
              title={`${p.booking.assetName} — ${p.booking.customerName}`}
            >
              {p.booking.assetName}
            </button>
          ))}
        {/* Overflow markers */}
        {Object.entries(overflow).map(([col, n]) => (
          <span
            key={col}
            style={{ gridColumn: `${Number(col) + 1} / ${Number(col) + 2}`, gridRow: 1, marginTop: MAX_BARS * 22 }}
            className="pointer-events-none mx-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {c.moreCount.replace("{n}", String(n))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Resource timeline --------------------------- */

function TimelineView({
  cursor,
  bookings,
  onSelect,
  c,
}: {
  cursor: Date;
  bookings: Booking[];
  onSelect: (b: Booking) => void;
  c: CalStrings;
}) {
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dayCount = days.length;

  // Group bookings by asset.
  const assets = useMemo(() => {
    const map = new Map<string, { id: string; name: string; bookings: Booking[] }>();
    bookings.forEach((b) => {
      if (!map.has(b.assetId)) map.set(b.assetId, { id: b.assetId, name: b.assetName, bookings: [] });
      map.get(b.assetId)!.bookings.push(b);
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  const colPct = 100 / dayCount;

  if (assets.length === 0) {
    return <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">{c.noBookingsMonth}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <div className="min-w-[640px]">
        {/* Day header */}
        <div className="flex border-b bg-muted/40">
          <div className="w-36 flex-shrink-0 border-r px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">{c.asset}</div>
          <div className="flex flex-1">
            {days.map((d) => (
              <div
                key={d.toISOString()}
                className={cn(
                  "flex-1 py-1.5 text-center text-[10px] font-medium tabular-nums",
                  isSameDay(d, new Date()) ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {format(d, "d")}
              </div>
            ))}
          </div>
        </div>

        {/* Asset rows */}
        {assets.map((asset) => (
          <div key={asset.id} className="flex border-b last:border-b-0">
            <div className="w-36 flex-shrink-0 truncate border-r px-2 py-2 text-xs font-medium" title={asset.name}>
              {asset.name}
            </div>
            <div className="relative flex-1" style={{ minHeight: 36 }}>
              {asset.bookings.map((b) => {
                const s = parseDay(b.startDate);
                const e = parseDay(b.endDate);
                if (e < monthStart || s > monthEnd) return null;
                const startIdx = Math.max(0, differenceInCalendarDays(s, monthStart));
                const endIdx = Math.min(dayCount - 1, differenceInCalendarDays(e, monthStart));
                const left = startIdx * colPct;
                const width = (endIdx - startIdx + 1) * colPct;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelect(b)}
                    style={{ left: `${left}%`, width: `${width}%`, top: 6 }}
                    className={cn(
                      "absolute truncate rounded border px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight hover:opacity-80",
                      statusBar[b.status]
                    )}
                    title={`${b.assetName} — ${b.customerName}`}
                  >
                    {b.customerName}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Popover ------------------------------ */

function BookingPopover({ booking, onClose, c }: { booking: Booking; onClose: () => void; c: CalStrings }) {
  const { formatCurrency } = useCurrency();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div ref={ref} className="w-full max-w-xs rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{booking.assetName}</h3>
          <BookingStatusBadge status={booking.status} />
        </div>
        <dl className="mt-3 space-y-1.5 text-sm">
          <Row label={c.customer} value={booking.customerName} />
          <Row label={c.from} value={formatDate(booking.startDate)} />
          <Row label={c.to} value={formatDate(booking.endDate)} />
          <Row label={c.total} value={formatCurrency(booking.totalAmount)} />
          <Row label={c.deposit} value={formatCurrency(booking.depositAmount)} />
          {booking.notes && <Row label={c.notes} value={booking.notes} />}
        </dl>
        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onClose}>
          {c.close}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

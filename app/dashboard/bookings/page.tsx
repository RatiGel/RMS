"use client";

import { useState } from "react";
import { Plus, Search, List, CalendarRange } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { BookingFormDialog } from "@/components/bookings/booking-form-dialog";
import { BookingCalendar } from "@/components/bookings/booking-calendar";
import { cn } from "@/lib/utils";
import { Booking, BookingStatus, Asset, Customer } from "@/types";
import { formatDate } from "@/utils/format";
import { useCurrency } from "@/contexts/currency-context";
import { useLanguage } from "@/contexts/language-context";

export default function BookingsPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: () => fetch("/api/bookings").then((r) => r.json()),
  });

  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: () => fetch("/api/assets").then((r) => r.json()),
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Booking>) =>
      fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Failed to create booking");
        return json;
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["bookings"] }); toast.success("Booking created"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.assetName.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.bookings.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.bookings.subtitle.replace("{total}", bookings.length.toString())}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> {t.bookings.newBooking}
        </Button>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 rounded-lg border p-0.5 w-fit">
        <button
          type="button"
          onClick={() => setView("list")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
          )}
        >
          <List className="h-4 w-4" /> {t.bookings.calendar.list}
        </button>
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
          )}
        >
          <CalendarRange className="h-4 w-4" /> {t.bookings.calendar.calendar}
        </button>
      </div>

      {view === "calendar" ? (
        isLoading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : (
          <BookingCalendar bookings={bookings} />
        )
      ) : (
      <>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t.bookings.searchPlaceholder} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BookingStatus | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t.common.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.bookings.allStatuses}</SelectItem>
            <SelectItem value="draft">{t.status.booking.draft}</SelectItem>
            <SelectItem value="confirmed">{t.status.booking.confirmed}</SelectItem>
            <SelectItem value="active">{t.status.booking.active}</SelectItem>
            <SelectItem value="returned">{t.status.booking.returned}</SelectItem>
            <SelectItem value="cancelled">{t.status.booking.cancelled}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.asset}</TableHead>
                  <TableHead>{t.table.customer}</TableHead>
                  <TableHead>{t.table.startDate}</TableHead>
                  <TableHead>{t.table.endDate}</TableHead>
                  <TableHead>{t.table.amount}</TableHead>
                  <TableHead>{t.table.deposit}</TableHead>
                  <TableHead>{t.table.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">{t.bookings.noBookings}</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.assetName}</TableCell>
                      <TableCell className="text-muted-foreground">{b.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(b.startDate)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(b.endDate)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(b.totalAmount)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(b.depositAmount)}</TableCell>
                      <TableCell><BookingStatusBadge status={b.status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      </>
      )}

      <BookingFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assets={assets}
        customers={customers}
        onSave={(data) => {
          createMutation.mutate(data);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}


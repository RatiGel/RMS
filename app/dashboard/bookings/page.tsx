"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { mockBookings } from "@/lib/mock/bookings";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { BookingFormDialog } from "@/components/bookings/booking-form-dialog";
import { Booking, BookingStatus } from "@/types";
import { formatDate } from "@/utils/format";
import { useCurrency } from "@/contexts/currency-context";
import { mockAssets } from "@/lib/mock/assets";
import { mockCustomers } from "@/lib/mock/customers";
import { useLanguage } from "@/contexts/language-context";

export default function BookingsPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [bookings, setBookings] = useState(mockBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

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

      <BookingFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assets={mockAssets}
        customers={mockCustomers}
        onSave={(data) => {
          const newBooking: Booking = {
            ...data,
            id: `bkg-${Date.now()}`,
            createdAt: new Date().toISOString().split("T")[0],
          } as Booking;
          setBookings((prev) => [newBooking, ...prev]);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}

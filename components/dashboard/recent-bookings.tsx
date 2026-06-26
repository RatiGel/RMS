"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Booking } from "@/types";
import { BookingStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/utils/format";
import { useCurrency } from "@/contexts/currency-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { CalendarDays, ArrowRight } from "lucide-react";

interface RecentBookingsProps {
  bookings: Booking[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CalendarDays className="h-[18px] w-[18px]" />
          </div>
          <CardTitle className="text-base font-semibold">{t.dashboard.recentBookings}</CardTitle>
        </div>
        <Link href="/dashboard/bookings">
          <Button variant="ghost" size="sm" className="text-xs gap-1 group">
            {t.dashboard.viewAll}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 py-12 text-center">
            <p className="text-sm font-medium">{t.dashboard.recentBookings}</p>
            <Link href="/dashboard/bookings">
              <Button variant="outline" size="sm" className="mt-2 text-xs">{t.dashboard.viewAll}</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.asset}</TableHead>
                  <TableHead>{t.table.customer}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t.table.start}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t.table.end}</TableHead>
                  <TableHead>{t.table.amount}</TableHead>
                  <TableHead>{t.table.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg brand-gradient text-[10px] font-bold text-white">
                          {b.assetName.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">{b.assetName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{b.customerName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(b.startDate)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(b.endDate)}</TableCell>
                    <TableCell className="font-medium tabular-nums">{formatCurrency(b.totalAmount)}</TableCell>
                    <TableCell><BookingStatusBadge status={b.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

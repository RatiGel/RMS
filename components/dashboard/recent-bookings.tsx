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

interface RecentBookingsProps {
  bookings: Booking[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">{t.dashboard.recentBookings}</CardTitle>
        <Link href="/dashboard/bookings">
          <Button variant="ghost" size="sm" className="text-xs">{t.dashboard.viewAll}</Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.table.asset}</TableHead>
              <TableHead>{t.table.customer}</TableHead>
              <TableHead>{t.table.start}</TableHead>
              <TableHead>{t.table.end}</TableHead>
              <TableHead>{t.table.amount}</TableHead>
              <TableHead>{t.table.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.assetName}</TableCell>
                <TableCell className="text-muted-foreground">{b.customerName}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(b.startDate)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(b.endDate)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(b.totalAmount)}</TableCell>
                <TableCell><BookingStatusBadge status={b.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

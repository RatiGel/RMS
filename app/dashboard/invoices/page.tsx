"use client";

import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceStatusBadge } from "@/components/shared/status-badge";
import { InvoiceDetailDialog } from "@/components/invoices/invoice-detail-dialog";
import { Invoice, InvoiceStatus } from "@/types";
import { formatDate } from "@/utils/format";
import { useCurrency } from "@/contexts/currency-context";
import { useLanguage } from "@/contexts/language-context";

export default function InvoicesPage() {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/invoices").then((r) => r.json()),
  });

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.assetName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totals = {
    total: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
    outstanding: invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + (i.total - i.paidAmount), 0),
  };

  const subtitle = t.invoices.subtitle
    .replace("{total}", formatCurrency(totals.total))
    .replace("{paid}", formatCurrency(totals.paid))
    .replace("{outstanding}", formatCurrency(totals.outstanding));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.invoices.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t.invoices.searchPlaceholder} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t.common.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.invoices.allStatuses}</SelectItem>
            <SelectItem value="unpaid">{t.status.invoice.unpaid}</SelectItem>
            <SelectItem value="partial">{t.status.invoice.partial}</SelectItem>
            <SelectItem value="paid">{t.status.invoice.paid}</SelectItem>
            <SelectItem value="overdue">{t.status.invoice.overdue}</SelectItem>
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
                  <TableHead>{t.table.invoiceNo}</TableHead>
                  <TableHead>{t.table.customer}</TableHead>
                  <TableHead>{t.table.asset}</TableHead>
                  <TableHead>{t.table.total}</TableHead>
                  <TableHead>{t.table.paid}</TableHead>
                  <TableHead>{t.table.balance}</TableHead>
                  <TableHead>{t.table.dueDate}</TableHead>
                  <TableHead>{t.table.status}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-12">{t.invoices.noInvoices}</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium font-mono text-sm">{inv.invoiceNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.assetName}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(inv.total)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(inv.paidAmount)}</TableCell>
                      <TableCell className={inv.total - inv.paidAmount > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                        {formatCurrency(inv.total - inv.paidAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell><InvoiceStatusBadge status={inv.status} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedInvoice(inv)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}

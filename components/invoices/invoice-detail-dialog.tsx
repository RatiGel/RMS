"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/types";
import { InvoiceStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/utils/format";
import { useCurrency } from "@/contexts/currency-context";
import { useSession } from "@/contexts/session-context";
import { Building2, Download } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { printInvoice } from "@/utils/print-invoice";

interface InvoiceDetailDialogProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceDetailDialog({ invoice, onClose }: InvoiceDetailDialogProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const session = useSession();
  if (!invoice) return null;

  const handleDownloadPDF = () => {
    printInvoice(invoice, session?.orgName ?? "—", formatCurrency, formatDate);
  };

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{invoice.invoiceNumber}</DialogTitle>
            <div className="flex items-center gap-2">
              <InvoiceStatusBadge status={invoice.status} />
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <Building2 className="h-4 w-4" /> AcmeCorp Rentals
              </div>
              <p className="text-muted-foreground">123 Rental Ave, Chicago IL 60601</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-semibold">{invoice.customerName}</p>
              <p className="text-muted-foreground">{t.invoices.issued} {formatDate(invoice.createdAt)}</p>
              <p className="text-muted-foreground">{t.invoices.due} {formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <Separator />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.table.description}</TableHead>
                <TableHead className="text-right">{t.table.qty}</TableHead>
                <TableHead className="text-right">{t.table.unitPrice}</TableHead>
                <TableHead className="text-right">{t.table.total}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator />

          <div className="flex justify-end">
            <div className="space-y-2 text-sm min-w-48">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.invoices.subtotal}</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t.invoices.discount}</span>
                  <span>− {formatCurrency(invoice.discount)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.invoices.tax}</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>{t.invoices.total}</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>{t.invoices.paidAmount}</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>{t.invoices.balanceDue}</span>
                <span className={invoice.total - invoice.paidAmount > 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(invoice.total - invoice.paidAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Booking } from "@/types";
import { useCurrency } from "@/contexts/currency-context";
import { useLanguage } from "@/contexts/language-context";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: Booking[];
  onSave: (data: object) => void;
  isPending: boolean;
}

const emptyItem = (): LineItem => ({ description: "", quantity: 1, unitPrice: 0 });

export function CreateInvoiceDialog({ open, onOpenChange, bookings, onSave, isPending }: CreateInvoiceDialogProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();

  const [bookingId, setBookingId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([emptyItem()]);

  const selectedBooking = bookings.find((b) => b.id === bookingId);

  useEffect(() => {
    if (!selectedBooking) return;
    setLineItems([
      {
        description: `Rental: ${selectedBooking.assetName}`,
        quantity: 1,
        unitPrice: selectedBooking.totalAmount,
      },
    ]);
    if (selectedBooking.depositAmount > 0) {
      setLineItems((prev) => [
        ...prev,
        { description: "Security Deposit", quantity: 1, unitPrice: selectedBooking.depositAmount },
      ]);
    }
  }, [bookingId]);

  const updateItem = (i: number, field: keyof LineItem, value: string | number) =>
    setLineItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  const removeItem = (i: number) =>
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));

  const subtotal = lineItems.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  const total = subtotal - discount + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !dueDate || lineItems.some((i) => !i.description)) return;
    onSave({
      bookingId,
      customerId: selectedBooking?.customerId,
      lineItems: lineItems.map((i) => ({ ...i, total: i.quantity * i.unitPrice })),
      subtotal,
      tax,
      discount,
      total,
      dueDate,
      status: "unpaid",
    });
  };

  const handleClose = () => {
    setBookingId("");
    setDueDate("");
    setTax(0);
    setDiscount(0);
    setLineItems([emptyItem()]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.invoices.newInvoice}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>{t.bookings.title} *</Label>
              <Select value={bookingId} onValueChange={(v) => setBookingId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder={t.invoices.selectBooking} />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {bookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.assetName} — {b.customerName} ({b.startDate} → {b.endDate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">{t.table.dueDate} *</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.invoices.lineItems}</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setLineItems((p) => [...p, emptyItem()])}>
                <Plus className="h-3.5 w-3.5 mr-1" /> {t.invoices.addLineItem}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_60px_100px_32px] gap-2 text-xs text-muted-foreground px-1">
                <span>{t.table.description}</span>
                <span className="text-center">{t.table.qty}</span>
                <span className="text-right">{t.table.unitPrice}</span>
                <span />
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_60px_100px_32px] gap-2 items-center">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    placeholder={t.table.description}
                    required
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                    className="text-center"
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                    className="text-right"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(i)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <div className="space-y-2 min-w-56">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-center text-sm">
                <span className="text-muted-foreground">{t.invoices.discountAmount}</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="h-7 text-right text-sm"
                />
                <span className="text-muted-foreground">{t.invoices.taxAmount}</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="h-7 text-right text-sm"
                />
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base pt-1">
                <span>{t.invoices.total}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>{t.common.cancel}</Button>
            <Button type="submit" disabled={isPending || !bookingId || !dueDate}>
              {t.invoices.createInvoice}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

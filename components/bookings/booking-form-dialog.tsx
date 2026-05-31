"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset, Booking, BookingStatus, Customer } from "@/types";
import { daysBetween } from "@/utils/format";
import { useLanguage } from "@/contexts/language-context";
import { useCurrency } from "@/contexts/currency-context";

interface BookingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: Asset[];
  customers: Customer[];
  onSave: (data: Partial<Booking>) => void;
}

const emptyForm = { assetId: "", customerId: "", startDate: "", endDate: "", status: "confirmed" as BookingStatus, notes: "" };

export function BookingFormDialog({ open, onOpenChange, assets, customers, onSave }: BookingFormDialogProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  const [form, setForm] = useState(emptyForm);

  const selectedAsset = assets.find((a) => a.id === form.assetId);
  const days = form.startDate && form.endDate ? daysBetween(form.startDate, form.endDate) : 0;
  const totalAmount = selectedAsset ? days * selectedAsset.dailyRate : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const asset = assets.find((a) => a.id === form.assetId);
    const customer = customers.find((c) => c.id === form.customerId);
    onSave({
      assetId: form.assetId,
      assetName: asset?.name || "",
      customerId: form.customerId,
      customerName: customer?.name || "",
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      totalAmount,
      depositAmount: asset?.depositAmount || 0,
      notes: form.notes || undefined,
    });
    setForm(emptyForm);
  };

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.bookings.newBooking}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>{t.table.asset} *</Label>
              <Select value={form.assetId || null} onValueChange={(v) => setForm((p) => ({ ...p, assetId: v ?? "" }))} required>
                <SelectTrigger><SelectValue placeholder={t.bookings.selectAsset} /></SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {assets.filter((a) => a.status === "available").map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} — {formatCurrency(a.dailyRate)}/day</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>{t.table.customer} *</Label>
              <Select value={form.customerId || null} onValueChange={(v) => setForm((p) => ({ ...p, customerId: v ?? "" }))} required>
                <SelectTrigger><SelectValue placeholder={t.bookings.selectCustomer} /></SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startDate">{t.table.startDate} *</Label>
              <Input id="startDate" type="date" value={form.startDate} onChange={set("startDate")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">{t.table.endDate} *</Label>
              <Input id="endDate" type="date" value={form.endDate} onChange={set("endDate")} required min={form.startDate} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.common.status}</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as BookingStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="draft">{t.status.booking.draft}</SelectItem>
                  <SelectItem value="confirmed">{t.status.booking.confirmed}</SelectItem>
                  <SelectItem value="active">{t.status.booking.active}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {days > 0 && selectedAsset && (
              <div className="space-y-1 pt-1">
                <p className="text-xs text-muted-foreground">{t.bookings.estimatedTotal}</p>
                <p className="text-lg font-bold">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-muted-foreground">
                  {t.bookings.daysRate.replace("{days}", days.toString()).replace("{rate}", formatCurrency(selectedAsset.dailyRate))}
                </p>
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">{t.bookings.notes}</Label>
              <Textarea id="notes" value={form.notes} onChange={set("notes")} rows={2} placeholder={t.bookings.notesPlaceholder} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel}</Button>
            <Button type="submit">{t.bookings.createBooking}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer } from "@/types";
import { useLanguage } from "@/contexts/language-context";

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSave: (data: Partial<Customer>) => void;
}

const emptyForm = { name: "", email: "", phone: "", address: "", idType: "national_id" as Customer["idType"], idNumber: "" };

export function CustomerFormDialog({ open, onOpenChange, customer, onSave }: CustomerFormDialogProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (customer) {
      setForm({ name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, idType: customer.idType, idNumber: customer.idNumber });
    } else {
      setForm(emptyForm);
    }
  }, [customer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? t.customers.editCustomer : t.customers.addCustomer}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="custName">{t.customers.fullName} *</Label>
              <Input id="custName" value={form.name} onChange={set("name")} required placeholder="e.g. BuildCorp Ltd" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.customers.email} *</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} required placeholder="contact@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t.customers.phone} *</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} required placeholder="+1 555-0000" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="address">{t.customers.address}</Label>
              <Input id="address" value={form.address} onChange={set("address")} placeholder="Street, City, State ZIP" />
            </div>
            <div className="space-y-1.5">
              <Label>{t.customers.idType}</Label>
              <Select value={form.idType} onValueChange={(v) => setForm((p) => ({ ...p, idType: v as Customer["idType"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">{t.customers.nationalId}</SelectItem>
                  <SelectItem value="passport">{t.customers.passport}</SelectItem>
                  <SelectItem value="drivers_license">{t.customers.driversLicense}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="idNumber">{t.customers.idNumber}</Label>
              <Input id="idNumber" value={form.idNumber} onChange={set("idNumber")} placeholder="ID-2024-001" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel}</Button>
            <Button type="submit">{customer ? t.common.saveChanges : t.customers.addCustomer}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

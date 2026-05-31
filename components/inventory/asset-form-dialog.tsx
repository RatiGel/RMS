"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset, AssetStatus, Category } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { useCurrency } from "@/contexts/currency-context";

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  categories: Category[];
  onSave: (data: Partial<Asset>) => void;
}

const emptyForm = { name: "", categoryId: "", dailyRate: "", depositAmount: "", status: "available" as AssetStatus, description: "", serialNumber: "", imageUrl: "" };

export function AssetFormDialog({ open, onOpenChange, asset, categories, onSave }: AssetFormDialogProps) {
  const { t } = useLanguage();
  const { currencySymbol } = useCurrency();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name,
        categoryId: asset.categoryId,
        dailyRate: asset.dailyRate.toString(),
        depositAmount: asset.depositAmount.toString(),
        status: asset.status,
        description: asset.description,
        serialNumber: asset.serialNumber || "",
        imageUrl: asset.imageUrl || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [asset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = categories.find((c) => c.id === form.categoryId);
    onSave({
      name: form.name,
      categoryId: form.categoryId,
      categoryName: category?.name || "",
      dailyRate: parseFloat(form.dailyRate) || 0,
      depositAmount: parseFloat(form.depositAmount) || 0,
      status: form.status,
      description: form.description,
      serialNumber: form.serialNumber || undefined,
      imageUrl: form.imageUrl || undefined,
    });
  };

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{asset ? t.inventory.editAsset : t.inventory.addAsset}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">{t.inventory.assetName} *</Label>
              <Input id="name" value={form.name} onChange={set("name")} required placeholder="e.g. CAT 320 Excavator" />
            </div>
            <div className="space-y-1.5">
              <Label>{t.inventory.category} *</Label>
              <Select value={form.categoryId || null} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v ?? "" }))} required>
                <SelectTrigger><SelectValue placeholder={t.inventory.selectCategory} /></SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.common.status}</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as AssetStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="available">{t.status.asset.available}</SelectItem>
                  <SelectItem value="rented">{t.status.asset.rented}</SelectItem>
                  <SelectItem value="maintenance">{t.status.asset.maintenance}</SelectItem>
                  <SelectItem value="retired">{t.status.asset.retired}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dailyRate">{t.inventory.dailyRate} ({currencySymbol}) *</Label>
              <Input id="dailyRate" type="number" min="0" step="0.01" value={form.dailyRate} onChange={set("dailyRate")} required placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="depositAmount">{t.inventory.deposit} ({currencySymbol})</Label>
              <Input id="depositAmount" type="number" min="0" step="0.01" value={form.depositAmount} onChange={set("depositAmount")} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="serialNumber">{t.inventory.serialNumber}</Label>
              <Input id="serialNumber" value={form.serialNumber} onChange={set("serialNumber")} placeholder={t.common.optional} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">{t.inventory.imageUrl}</Label>
              <Input id="imageUrl" value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">{t.inventory.description}</Label>
              <Textarea id="description" value={form.description} onChange={set("description")} rows={3} placeholder={t.inventory.descriptionPlaceholder} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel}</Button>
            <Button type="submit">{asset ? t.common.saveChanges : t.inventory.addAsset}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

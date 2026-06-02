"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Asset, AssetStatus, Category } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { useCurrency } from "@/contexts/currency-context";
import { toast } from "sonner";
import { ImagePlus, X, Loader2 } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File exceeds 2 MB limit");
      e.target.value = "";
      return;
    }
    const data = new FormData();
    data.append("file", file);
    setUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setForm((prev) => ({ ...prev, imageUrl: json.url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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
              <Label>{t.inventory.imageUrl}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {form.imageUrl ? (
                <div className="relative w-full h-32 rounded-md overflow-hidden border border-border group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Asset preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-32 rounded-md border border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-xs">Upload image (max 2 MB)</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">{t.inventory.description}</Label>
              <Textarea id="description" value={form.description} onChange={set("description")} rows={3} placeholder={t.inventory.descriptionPlaceholder} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t.common.cancel}</Button>
            <Button type="submit" disabled={uploading}>{asset ? t.common.saveChanges : t.inventory.addAsset}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

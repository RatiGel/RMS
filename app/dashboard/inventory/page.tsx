"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetCard } from "@/components/inventory/asset-card";
import { AssetFormDialog } from "@/components/inventory/asset-form-dialog";
import { Asset, AssetStatus, Category } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { useIsStaff } from "@/contexts/session-context";

export default function InventoryPage() {
  const { t } = useLanguage();
  const isStaff = useIsStaff();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const { data: assets = [], isLoading: loadingAssets } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: () => fetch("/api/assets").then((r) => r.json()),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Asset>) =>
      fetch("/api/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset created"); },
    onError: () => toast.error("Failed to create asset"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Asset> & { id: string }) =>
      fetch(`/api/assets/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset updated"); },
    onError: () => toast.error("Failed to update asset"),
  });

  const filtered = assets.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || a.categoryId === categoryFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const counts = {
    total: assets.length,
    available: assets.filter((a) => a.status === "available").length,
    rented: assets.filter((a) => a.status === "rented").length,
    maintenance: assets.filter((a) => a.status === "maintenance").length,
  };

  const subtitle = t.inventory.subtitle
    .replace("{total}", counts.total.toString())
    .replace("{available}", counts.available.toString())
    .replace("{rented}", counts.rented.toString())
    .replace("{maintenance}", counts.maintenance.toString());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.inventory.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        </div>
        {!isStaff && (
          <Button onClick={() => { setEditingAsset(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> {t.inventory.addAsset}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t.inventory.searchPlaceholder} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
          <SelectTrigger className="w-44">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={t.inventory.category} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.inventory.allCategories}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AssetStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t.common.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.inventory.allStatuses}</SelectItem>
            <SelectItem value="available">{t.status.asset.available}</SelectItem>
            <SelectItem value="rented">{t.status.asset.rented}</SelectItem>
            <SelectItem value="maintenance">{t.status.asset.maintenance}</SelectItem>
            <SelectItem value="retired">{t.status.asset.retired}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loadingAssets ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {!isStaff && (
            <button
              onClick={() => { setEditingAsset(null); setDialogOpen(true); }}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 p-10 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary hover:bg-primary/5 min-h-[180px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-current">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">{t.inventory.addAsset}</span>
            </button>
          )}

          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onEdit={() => { setEditingAsset(asset); setDialogOpen(true); }}
            />
          ))}
        </div>
      )}

      {!loadingAssets && filtered.length === 0 && (
        <p className="text-center text-muted-foreground text-sm -mt-2">{t.inventory.noAssets}</p>
      )}

      <AssetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        asset={editingAsset}
        categories={categories}
        onSave={(data) => {
          if (editingAsset) {
            updateMutation.mutate({ id: editingAsset.id, ...data });
          } else {
            createMutation.mutate(data);
          }
          setDialogOpen(false);
        }}
      />
    </div>
  );
}

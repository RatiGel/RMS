"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Asset } from "@/types";
import { AssetStatusBadge } from "@/components/shared/status-badge";
import { useCurrency } from "@/contexts/currency-context";
import { Edit, Package } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface AssetCardProps {
  asset: Asset;
  onEdit: () => void;
}

export function AssetCard({ asset, onEdit }: AssetCardProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  return (
    <Card className="flex flex-col">
      <CardContent className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <AssetStatusBadge status={asset.status} />
        </div>
        <h3 className="font-semibold text-sm leading-tight mb-1">{asset.name}</h3>
        <p className="text-xs text-muted-foreground mb-3">{asset.categoryName}</p>
        {asset.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{asset.description}</p>
        )}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">{t.inventory.dailyRate}</p>
            <p className="font-semibold text-sm">{formatCurrency(asset.dailyRate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t.inventory.deposit}</p>
            <p className="font-semibold text-sm">{formatCurrency(asset.depositAmount)}</p>
          </div>
        </div>
        {asset.serialNumber && (
          <p className="text-xs text-muted-foreground mt-3">{t.inventory.serialNo} {asset.serialNumber}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
          <Edit className="h-3 w-3 mr-2" /> {t.inventory.edit}
        </Button>
      </CardFooter>
    </Card>
  );
}

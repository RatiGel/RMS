"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useSubscription } from "@/contexts/subscription-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: "trial" | "starter" | "pro";
}

export function UpgradeDialog({ open, onOpenChange, currentPlan }: UpgradeDialogProps) {
  const { t } = useLanguage();
  const { upgrade } = useSubscription();
  const s = t.subscription;
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      key: "trial" as const,
      name: s.trial,
      price: null,
      priceDesc: s.trialPriceDesc,
      features: [s.unlimitedAssets, s.noTeamAccess, s.noInvoicesAccess],
      isMostPopular: false,
    },
    {
      key: "starter" as const,
      name: s.starter,
      price: 10,
      priceDesc: s.perMonth,
      features: [s.assetLimit.replace("{n}", "20"), s.noTeamAccess, s.noInvoicesAccess],
      isMostPopular: false,
    },
    {
      key: "pro" as const,
      name: s.pro,
      price: 30,
      priceDesc: s.perMonth,
      features: [s.unlimitedAssets, s.teamAccess, s.invoicingPayments],
      isMostPopular: true,
    },
  ];

  async function handleUpgrade(plan: "starter" | "pro") {
    setLoading(plan);
    try {
      await upgrade(plan);
      toast.success(s.planUpdated);
      onOpenChange(false);
    } catch {
      toast.error("Failed to update plan");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{s.billing}</DialogTitle>
          <DialogDescription>{s.billingDesc}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            const isProCard = plan.key === "pro";

            return (
              <div
                key={plan.key}
                className={`relative rounded-xl border p-5 flex flex-col gap-4 transition-all ${
                  isProCard
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                }`}
              >
                {plan.isMostPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-0.5 rounded-full border border-primary-foreground/20 whitespace-nowrap">
                    {s.mostPopular}
                  </span>
                )}

                <div>
                  <div className={`text-sm font-medium mb-1 ${isProCard ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {plan.name}
                  </div>
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">₾{plan.price}</span>
                      <span className={`text-xs ${isProCard ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {plan.priceDesc}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold">Free</div>
                      <div className={`text-xs mt-0.5 ${isProCard ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{plan.priceDesc}</div>
                    </div>
                  )}
                </div>

                <ul className="flex-1 space-y-2">
                  {plan.features.map((feat) => {
                    const isLocked = feat === s.noTeamAccess || feat === s.noInvoicesAccess;
                    return (
                      <li key={feat} className={`flex items-center gap-2 text-sm ${isLocked ? "opacity-50" : ""}`}>
                        {isLocked
                          ? <X className="h-4 w-4 shrink-0 text-red-400" />
                          : <Check className={`h-4 w-4 shrink-0 ${isProCard ? "text-primary-foreground" : "text-primary"}`} />
                        }
                        <span>{feat}</span>
                      </li>
                    );
                  })}
                </ul>

                {plan.key !== "trial" ? (
                  <Button
                    disabled={isCurrent || loading === plan.key}
                    onClick={() => handleUpgrade(plan.key as "starter" | "pro")}
                    variant={isProCard ? "secondary" : "default"}
                    size="sm"
                    className="w-full cursor-pointer"
                  >
                    {isCurrent ? s.currentPlan : loading === plan.key ? "..." : s.choosePlan}
                  </Button>
                ) : (
                  <Button
                    disabled
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {isCurrent ? s.currentPlan : s.trial}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

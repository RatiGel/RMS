"use client";

import { useState } from "react";
import { X, AlertTriangle, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useSubscription } from "@/contexts/subscription-context";
import { UpgradeDialog } from "@/components/subscription/upgrade-dialog";

export function TrialBanner() {
  const { t } = useLanguage();
  const { plan, trialDaysLeft, trialExpired, isLoading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const s = t.subscription;

  if (isLoading || plan !== "trial" || dismissed) return null;

  const isExpired = trialExpired;

  return (
    <>
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium ${
          isExpired
            ? "bg-red-500 text-white"
            : "bg-amber-400 text-amber-950"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isExpired ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <Clock className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">
            {isExpired
              ? s.trialExpired
              : s.trialBannerDays.replace("{n}", String(trialDaysLeft))}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setUpgradeOpen(true)}
            className={`text-xs font-semibold underline underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity`}
          >
            {s.upgradeNow}
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label={s.dismiss}
            className="p-1 rounded hover:opacity-70 transition-opacity cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlan="trial"
      />
    </>
  );
}

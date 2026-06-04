"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bot, Brain, TrendingUp, Camera, Globe, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const FEATURE_META: Record<string, { label: string; description: string; icon: React.ElementType; color: string }> = {
  telegram_bot: { label: "Telegram Bot", description: "Send booking notifications and updates via Telegram messenger", icon: Bot, color: "bg-blue-500" },
  ai_assistant: { label: "AI Assistant", description: "Smart suggestions, anomaly detection, and automated business insights", icon: Brain, color: "bg-purple-500" },
  dynamic_pricing: { label: "Dynamic Pricing", description: "AI-driven pricing adjustments based on demand and seasonality", icon: TrendingUp, color: "bg-emerald-500" },
  damage_detection: { label: "Damage Detection", description: "AI-powered asset damage detection from uploaded photos", icon: Camera, color: "bg-amber-500" },
};

type Flag = { featureName: string; enabledGlobally: boolean; tenantOverrides: Record<string, boolean> };

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function FeaturesPage() {
  const qc = useQueryClient();
  const [overrideInputs, setOverrideInputs] = useState<Record<string, string>>({});
  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});

  const { data: flags, isLoading } = useQuery<Flag[]>({
    queryKey: ["sa-features"],
    queryFn: () => fetch("/api/super-admin/features").then((r) => r.json()),
  });

  const patchMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch("/api/super-admin/features", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sa-features"] }),
  });

  const toggleGlobal = (featureName: string, current: boolean) => {
    patchMut.mutate({ featureName, enabledGlobally: !current });
    toast.success(`${featureName.replace("_", " ")} ${!current ? "enabled" : "disabled"} globally`);
  };

  const setOverride = (featureName: string, tenantId: string, enabled: boolean | null) => {
    if (!tenantId.trim()) { toast.error("Enter a tenant ID"); return; }
    patchMut.mutate({ featureName, tenantId, tenantEnabled: enabled });
    setOverrideInputs((s) => ({ ...s, [featureName]: "" }));
    toast.success("Override updated");
  };

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Control platform feature availability globally and per tenant</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {flags?.map((flag) => {
          const meta = FEATURE_META[flag.featureName] ?? { label: flag.featureName, description: "", icon: Globe, color: "bg-primary" };
          const Icon = meta.icon;
          const overrideEntries = Object.entries(flag.tenantOverrides ?? {});
          const showOverrides = expandedOverrides[flag.featureName];

          return (
            <Card key={flag.featureName} className={flag.enabledGlobally ? "border-primary/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color} text-white flex-shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{meta.label}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{meta.description}</p>
                    </div>
                  </div>
                  <Toggle enabled={flag.enabledGlobally} onChange={() => toggleGlobal(flag.featureName, flag.enabledGlobally)} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={flag.enabledGlobally ? "default" : "secondary"} className="text-xs">
                    {flag.enabledGlobally ? "Enabled globally" : "Disabled globally"}
                  </Badge>
                  {overrideEntries.length > 0 && (
                    <Badge variant="outline" className="text-xs">{overrideEntries.length} override{overrideEntries.length !== 1 ? "s" : ""}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Add override */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Tenant override</Label>
                  <div className="flex gap-1.5">
                    <Input className="h-8 text-xs font-mono flex-1" placeholder="Tenant ObjectId"
                      value={overrideInputs[flag.featureName] ?? ""}
                      onChange={(e) => setOverrideInputs((s) => ({ ...s, [flag.featureName]: e.target.value }))} />
                    <Button size="sm" className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => setOverride(flag.featureName, overrideInputs[flag.featureName] ?? "", true)}>On</Button>
                    <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => setOverride(flag.featureName, overrideInputs[flag.featureName] ?? "", false)}>Off</Button>
                  </div>
                </div>

                {/* Show existing overrides */}
                {overrideEntries.length > 0 && (
                  <div>
                    <button onClick={() => setExpandedOverrides((s) => ({ ...s, [flag.featureName]: !s[flag.featureName] }))}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {showOverrides ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {overrideEntries.length} tenant override{overrideEntries.length !== 1 ? "s" : ""}
                    </button>
                    {showOverrides && (
                      <div className="mt-2 space-y-1 rounded-lg border p-2">
                        {overrideEntries.map(([tid, enabled]) => (
                          <div key={tid} className="flex items-center justify-between text-xs py-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-muted-foreground">{tid.slice(-10)}</span>
                              <Badge variant={enabled ? "default" : "secondary"} className="text-[10px] py-0">{enabled ? "on" : "off"}</Badge>
                            </div>
                            <button onClick={() => setOverride(flag.featureName, tid, null)} className="text-destructive hover:text-destructive/80 p-0.5">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Globe, DollarSign, Wrench, Building2, X, Plus, AlertTriangle, Save } from "lucide-react";

type Settings = { languages: string[]; currencies: string[]; maintenanceMode: boolean; maintenanceMessage: string; maintenanceScheduledAt: string | null; platformName: string; logoUrl: string | null };

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{label}</span>
      <button onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<Settings>({
    queryKey: ["sa-settings"],
    queryFn: () => fetch("/api/super-admin/settings").then((r) => r.json()),
  });

  const [form, setForm] = useState<Settings | null>(null);
  const [newLang, setNewLang] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => { if (data) { setForm(data); setIsDirty(false); } }, [data]);

  const patch = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setForm((f) => f ? { ...f, [k]: v } : f);
    setIsDirty(true);
  };

  const saveMut = useMutation({
    mutationFn: (body: Partial<Settings>) =>
      fetch("/api/super-admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.error) { toast.error(d.error); return; }
      qc.invalidateQueries({ queryKey: ["sa-settings"] });
      setIsDirty(false);
      toast.success("Settings saved");
    },
  });

  if (isLoading || !form) return (
    <div className="space-y-4"><Skeleton className="h-8 w-48" />{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Global configuration for the Qiravo platform</p>
        </div>
        <Button onClick={() => saveMut.mutate(form!)} disabled={saveMut.isPending || !isDirty} className="gap-2 h-9">
          <Save className="h-4 w-4" /> {saveMut.isPending ? "Saving…" : isDirty ? "Save changes" : "Saved"}
        </Button>
      </div>

      {form.maintenanceMode && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-5 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Maintenance mode is active</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Tenants are currently seeing the maintenance page.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Platform Identity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Platform Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Platform name</Label>
              <Input value={form.platformName} onChange={(e) => patch("platformName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Logo URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input value={form.logoUrl ?? ""} onChange={(e) => patch("logoUrl", e.target.value || null)} placeholder="https://…" />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className={form.maintenanceMode ? "border-amber-300 dark:border-amber-700" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-500" /> Maintenance Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Toggle enabled={form.maintenanceMode} onChange={(v) => patch("maintenanceMode", v)} label="Enable maintenance mode" />
            <div className="space-y-1.5">
              <Label>Message shown to tenants</Label>
              <Textarea value={form.maintenanceMessage} onChange={(e) => patch("maintenanceMessage", e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Scheduled start <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input type="datetime-local" value={form.maintenanceScheduledAt ? form.maintenanceScheduledAt.slice(0, 16) : ""}
                onChange={(e) => patch("maintenanceScheduledAt", e.target.value || null)} />
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-blue-500" /> Supported Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
              {form.languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="gap-1.5 pr-1 text-sm">
                  <span className="uppercase font-semibold">{lang}</span>
                  <button onClick={() => { patch("languages", form.languages.filter((l) => l !== lang)); }}
                    className="flex items-center justify-center h-4 w-4 rounded-full hover:bg-muted-foreground/20 transition-colors">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newLang} onChange={(e) => setNewLang(e.target.value.toLowerCase().slice(0, 5))} placeholder="e.g. fr" className="w-24 h-8 text-sm" />
              <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => {
                if (newLang && !form.languages.includes(newLang)) { patch("languages", [...form.languages, newLang]); setNewLang(""); }
              }}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Currencies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-500" /> Supported Currencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
              {form.currencies.map((cur) => (
                <Badge key={cur} variant="secondary" className="gap-1.5 pr-1 text-sm">
                  <span className="font-semibold">{cur}</span>
                  <button onClick={() => { patch("currencies", form.currencies.filter((c) => c !== cur)); }}
                    className="flex items-center justify-center h-4 w-4 rounded-full hover:bg-muted-foreground/20 transition-colors">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newCurrency} onChange={(e) => setNewCurrency(e.target.value.toUpperCase().slice(0, 5))} placeholder="e.g. EUR" className="w-24 h-8 text-sm" />
              <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => {
                if (newCurrency && !form.currencies.includes(newCurrency)) { patch("currencies", [...form.currencies, newCurrency]); setNewCurrency(""); }
              }}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

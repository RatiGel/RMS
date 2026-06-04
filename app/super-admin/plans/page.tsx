"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Building2, Users, Package, CalendarDays, Pencil, Crown, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { PlanBadge } from "@/components/super-admin/status-badges";

type Plan = { id: string; name: string; price: number; maxAssets: number | null; maxBookingsPerMonth: number | null; userSeats: number | null; trialDays?: number; features: string[]; tenantCount: number; };

const PLAN_ICONS: Record<string, React.ElementType> = { trial: CalendarDays, starter: Package, pro: Crown };

export default function PlansPage() {
  const qc = useQueryClient();
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState<Partial<Plan>>({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTenantId, setAssignTenantId] = useState("");
  const [assignPlan, setAssignPlan] = useState("starter");
  const [extendOpen, setExtendOpen] = useState(false);
  const [extendTenantId, setExtendTenantId] = useState("");
  const [extendDays, setExtendDays] = useState("14");
  const [billingExemptOpen, setBillingExemptOpen] = useState(false);
  const [billingTenantId, setBillingTenantId] = useState("");
  const [showBillingExempt, setShowBillingExempt] = useState(false);

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ["sa-plans"],
    queryFn: () => fetch("/api/super-admin/plans").then((r) => r.json()),
  });

  const patchPlanMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch("/api/super-admin/plans", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.error) { toast.error(d.error); return; }
      qc.invalidateQueries({ queryKey: ["sa-plans"] });
    },
  });

  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
    setEditForm({ name: plan.name, price: plan.price, maxAssets: plan.maxAssets, maxBookingsPerMonth: plan.maxBookingsPerMonth, userSeats: plan.userSeats });
  };

  const saveEdit = () => {
    if (!editPlan) return;
    patchPlanMut.mutate({ planId: editPlan.id, updates: editForm }, {
      onSuccess: (d) => { if (!d.error) { setEditPlan(null); toast.success("Plan updated"); } },
    });
  };

  const assignMut = useMutation({
    mutationFn: (body: { tenantId: string; plan: string }) =>
      fetch("/api/super-admin/plans", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (d) => { if (d.error) { toast.error(d.error); return; } setAssignOpen(false); toast.success("Plan assigned"); },
  });

  const extendMut = useMutation({
    mutationFn: (body: { tenantId: string; trialExtendDays: number }) =>
      fetch(`/api/super-admin/tenants/${body.tenantId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "extend_trial", trialExtendDays: body.trialExtendDays }) }).then((r) => r.json()),
    onSuccess: (d) => { if (d.error) { toast.error(d.error); return; } setExtendOpen(false); toast.success("Trial extended"); },
  });

  const billingMut = useMutation({
    mutationFn: (body: { tenantId: string; billingExempt: boolean }) =>
      fetch(`/api/super-admin/tenants/${body.tenantId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "billing_exempt", billingExempt: body.billingExempt }) }).then((r) => r.json()),
    onSuccess: (d) => { if (d.error) { toast.error(d.error); return; } setBillingExemptOpen(false); toast.success("Billing exempt status updated"); },
  });

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage pricing tiers and tenant assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExtendOpen(true)}>Extend Trial</Button>
          <Button variant="outline" size="sm" onClick={() => setBillingExemptOpen(true)}>Billing Exempt</Button>
          <Button size="sm" onClick={() => setAssignOpen(true)}>Assign Plan</Button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-3 gap-4">
        {plans?.map((plan) => {
          const Icon = PLAN_ICONS[plan.id] ?? Package;
          return (
            <Card key={plan.id} className={`relative overflow-hidden ${plan.id === "pro" ? "border-primary/30 shadow-md" : ""}`}>
              {plan.id === "pro" && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-md">POPULAR</div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(plan)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <CardTitle className="capitalize text-xl">{plan.name}</CardTitle>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground text-sm mb-1">/mo</span>}
                  {plan.price === 0 && <span className="text-muted-foreground text-sm mb-1">free</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <PlanBadge plan={plan.id} />
                  <span className="text-xs text-muted-foreground">{plan.tenantCount} tenant{plan.tenantCount !== 1 ? "s" : ""}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground">Assets</p>
                    <p className="font-semibold">{plan.maxAssets ?? "∞"}</p>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground">Bookings/mo</p>
                    <p className="font-semibold">{plan.maxBookingsPerMonth ?? "∞"}</p>
                  </div>
                  <div className="rounded-md bg-muted px-3 py-2">
                    <p className="text-xs text-muted-foreground">Seats</p>
                    <p className="font-semibold">{plan.userSeats ?? "∞"}</p>
                  </div>
                  {plan.trialDays && (
                    <div className="rounded-md bg-muted px-3 py-2">
                      <p className="text-xs text-muted-foreground">Trial days</p>
                      <p className="font-semibold">{plan.trialDays}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Included features</p>
                  <div className="space-y-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="capitalize">{f.replace("_", " ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Billing Exempt section */}
      <div>
        <button onClick={() => setShowBillingExempt(!showBillingExempt)} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          {showBillingExempt ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Billing Exempt Management
        </button>
        {showBillingExempt && (
          <Card className="mt-3">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-3">Mark specific tenants as billing exempt — they keep their plan without paying.</p>
              <div className="flex gap-2 max-w-md">
                <Input placeholder="Tenant ID (ObjectId)" value={billingTenantId} onChange={(e) => setBillingTenantId(e.target.value)} className="font-mono text-sm" />
                <Button size="sm" variant="outline" onClick={() => billingMut.mutate({ tenantId: billingTenantId, billingExempt: true })} disabled={!billingTenantId}>Exempt</Button>
                <Button size="sm" variant="outline" onClick={() => billingMut.mutate({ tenantId: billingTenantId, billingExempt: false })} disabled={!billingTenantId}>Remove</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Plan dialog */}
      <Dialog open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit {editPlan?.name} Plan</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {([["name", "Plan name", "text"], ["price", "Price ($/mo)", "number"]] as const).map(([field, label, type]) => (
              <div key={field} className="space-y-1.5">
                <Label>{label}</Label>
                <Input type={type} value={String(editForm[field] ?? "")}
                  onChange={(e) => setEditForm((f) => ({ ...f, [field]: type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value }))} />
              </div>
            ))}
            {([["maxAssets", "Max assets (blank = unlimited)"], ["maxBookingsPerMonth", "Max bookings/month (blank = unlimited)"], ["userSeats", "User seats (blank = unlimited)"]] as const).map(([field, label]) => (
              <div key={field} className="space-y-1.5">
                <Label>{label}</Label>
                <Input type="number" min="0" placeholder="∞ unlimited"
                  value={editForm[field] === null || editForm[field] === undefined ? "" : String(editForm[field])}
                  onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value === "" ? null : Number(e.target.value) }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={patchPlanMut.isPending}>{patchPlanMut.isPending ? "Saving…" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign plan dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Plan to Tenant</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Tenant ID</Label><Input className="font-mono" value={assignTenantId} onChange={(e) => setAssignTenantId(e.target.value)} placeholder="MongoDB ObjectId" /></div>
            <div className="space-y-1.5">
              <Label>Plan</Label>
              <Select value={assignPlan} onValueChange={(v) => setAssignPlan(v ?? "starter")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="trial">Trial</SelectItem><SelectItem value="starter">Starter</SelectItem><SelectItem value="pro">Pro</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={() => assignMut.mutate({ tenantId: assignTenantId, plan: assignPlan })} disabled={!assignTenantId || assignMut.isPending}>
              {assignMut.isPending ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend trial dialog */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Extend Trial Period</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Tenant ID</Label><Input className="font-mono" value={extendTenantId} onChange={(e) => setExtendTenantId(e.target.value)} placeholder="MongoDB ObjectId" /></div>
            <div className="space-y-1.5"><Label>Extend by (days)</Label><Input type="number" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} min="1" max="365" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendOpen(false)}>Cancel</Button>
            <Button onClick={() => extendMut.mutate({ tenantId: extendTenantId, trialExtendDays: parseInt(extendDays) })} disabled={!extendTenantId || extendMut.isPending}>
              {extendMut.isPending ? "Extending…" : "Extend trial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

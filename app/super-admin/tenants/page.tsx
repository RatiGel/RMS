"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { Search, Plus, Eye, LogIn, Ban, RefreshCw, Trash2, Package, CalendarDays, DollarSign, Users, Building2 } from "lucide-react";
import { PlanBadge, StatusBadge } from "@/components/super-admin/status-badges";

type Tenant = {
  id: string; name: string; plan: string; status: string; country: string | null;
  billingExempt: boolean; assetCount: number; bookingCount: number; memberCount: number;
  ownerEmail: string | null; lastLoginAt: string | null; createdAt: string;
};

type TenantDetail = {
  id: string; name: string; plan: string; status: string; billingExempt: boolean;
  totalRevenue: number; trialExtendedTo: string | null; suspendedAt: string | null;
  createdAt: string; users: { id: string; name: string; email: string; role: string }[];
  assets: { id: string; name: string; status: string; dailyRate: number }[];
  recentBookings: { id: string; status: string; totalAmount: number; startDate: string; endDate: string }[];
  recentInvoices: { id: string; invoiceNumber: string; status: string; total: number; paidAmount: number }[];
};

export default function TenantsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("");
  const [joinedFrom, setJoinedFrom] = useState("");
  const [joinedTo, setJoinedTo] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "bookings" | "invoices">("overview");
  const [confirmDelete, setConfirmDelete] = useState<Tenant | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", ownerName: "", ownerEmail: "", ownerPassword: "", plan: "trial" });
  const [showFilters, setShowFilters] = useState(false);

  const params = new URLSearchParams({
    page: String(page), limit: "20",
    ...(search && { search }),
    ...(planFilter !== "all" && { plan: planFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(countryFilter && { country: countryFilter }),
    ...(joinedFrom && { joinedFrom }),
    ...(joinedTo && { joinedTo }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["sa-tenants", page, search, planFilter, statusFilter, countryFilter, joinedFrom, joinedTo],
    queryFn: () => fetch(`/api/super-admin/tenants?${params}`).then((r) => r.json()),
  });

  const { data: detail, isLoading: detailLoading } = useQuery<TenantDetail>({
    queryKey: ["sa-tenant-detail", detailId],
    queryFn: () => fetch(`/api/super-admin/tenants/${detailId}`).then((r) => r.json()),
    enabled: !!detailId,
  });

  const patchMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      fetch(`/api/super-admin/tenants/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sa-tenants"] }); qc.invalidateQueries({ queryKey: ["sa-tenant-detail", detailId] }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/super-admin/tenants/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.error) { toast.error(d.error); return; }
      qc.invalidateQueries({ queryKey: ["sa-tenants"] });
      setConfirmDelete(null);
      toast.success("Tenant deleted");
    },
  });

  const createMut = useMutation({
    mutationFn: (body: typeof createForm) => fetch("/api/super-admin/tenants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.error) { toast.error(d.error); return; }
      qc.invalidateQueries({ queryKey: ["sa-tenants"] });
      setCreateOpen(false);
      setCreateForm({ name: "", ownerName: "", ownerEmail: "", ownerPassword: "", plan: "trial" });
      toast.success("Tenant created successfully");
    },
  });

  const impersonateMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/super-admin/tenants/${id}/impersonate`, { method: "POST" }).then((r) => r.json()),
    onSuccess: (d) => { if (d.redirect) window.location.href = d.redirect; },
    onError: () => toast.error("Impersonation failed"),
  });

  const tenants: Tenant[] = data?.tenants ?? [];

  const clearFilters = () => { setSearch(""); setPlanFilter("all"); setStatusFilter("all"); setCountryFilter(""); setJoinedFrom(""); setJoinedTo(""); setPage(1); };
  const hasFilters = search || planFilter !== "all" || statusFilter !== "all" || countryFilter || joinedFrom || joinedTo;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenants</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data ? `${data.total} organization${data.total !== 1 ? "s" : ""}` : "Loading…"}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 h-9">
          <Plus className="h-4 w-4" /> New Tenant
        </Button>
      </div>

      {/* Search + filter bar */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or owner email…" className="pl-9 h-9" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v ?? "all"); setPage(1); }}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All plans</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1); }}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9" onClick={() => setShowFilters(!showFilters)}>
              More filters {hasFilters && <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-primary inline-block" />}
            </Button>
            {hasFilters && <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={clearFilters}>Clear</Button>}
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-1 border-t">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Country</Label>
                <Input placeholder="e.g. Georgia" className="h-8 w-36 text-sm" value={countryFilter}
                  onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Joined from</Label>
                <Input type="date" className="h-8 w-36 text-sm" value={joinedFrom}
                  onChange={(e) => { setJoinedFrom(e.target.value); setPage(1); }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Joined to</Label>
                <Input type="date" className="h-8 w-36 text-sm" value={joinedTo}
                  onChange={(e) => { setJoinedTo(e.target.value); setPage(1); }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-11" />)}</div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-medium">No tenants found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Assets</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((t) => (
                  <TableRow key={t.id} className="group">
                    <TableCell className="pl-5">
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        {t.ownerEmail && <p className="text-xs text-muted-foreground">{t.ownerEmail}</p>}
                        {t.country && <p className="text-xs text-muted-foreground">{t.country}</p>}
                        {t.billingExempt && <Badge variant="outline" className="text-[10px] py-0 mt-0.5 text-amber-600 border-amber-200">billing exempt</Badge>}
                      </div>
                    </TableCell>
                    <TableCell><PlanBadge plan={t.plan} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{t.assetCount}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{t.bookingCount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {t.lastLoginAt ? formatDistanceToNow(new Date(t.lastLoginAt), { addSuffix: true }) : <span className="text-amber-600">Never</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(t.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDetailId(t.id); setActiveTab("overview"); }} title="View details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => impersonateMut.mutate(t.id)} title="Impersonate">
                          <LogIn className="h-3.5 w-3.5" />
                        </Button>
                        {t.status === "active" ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" title="Suspend"
                            onClick={() => { patchMut.mutate({ id: t.id, body: { action: "suspend" } }); toast.success(`${t.name} suspended`); }}>
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Reactivate"
                            onClick={() => { patchMut.mutate({ id: t.id, body: { action: "reactivate" } }); toast.success(`${t.name} reactivated`); }}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete"
                          onClick={() => { setConfirmDelete(t); setDeleteText(""); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.total > 20 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Previous</Button>
            <Button variant="outline" size="sm" disabled={page * 20 >= data.total} onClick={() => setPage((p) => p + 1)}>Next →</Button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <SheetContent className="w-[520px] sm:max-w-[520px] flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              {detail?.name ?? "Loading…"}
              {detail && <PlanBadge plan={detail.plan} />}
              {detail && <StatusBadge status={detail.status} />}
            </SheetTitle>
          </SheetHeader>

          {/* Tabs */}
          <div className="flex border-b">
            {(["overview", "assets", "bookings", "invoices"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {detailLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : detail ? (
              <>
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Total Revenue", value: `$${(detail.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign },
                        { label: "Team Members", value: String(detail.users?.length ?? 0), icon: Users },
                        { label: "Assets", value: String(detail.assets?.length ?? 0), icon: Package },
                        { label: "Recent Bookings", value: String(detail.recentBookings?.length ?? 0), icon: CalendarDays },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-lg bg-muted p-3 flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="font-semibold">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="default" className="h-8 gap-1.5" onClick={() => impersonateMut.mutate(detailId!)}>
                          <LogIn className="h-3.5 w-3.5" /> Impersonate
                        </Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => { patchMut.mutate({ id: detailId!, body: { action: "change_plan", plan: "pro" } }); toast.success("Plan changed to Pro"); }}>Upgrade to Pro</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => { patchMut.mutate({ id: detailId!, body: { action: "extend_trial", trialExtendDays: 14 } }); toast.success("Trial extended 14 days"); }}>+14d Trial</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => { patchMut.mutate({ id: detailId!, body: { action: "billing_exempt", billingExempt: !detail.billingExempt } }); toast.success("Updated"); }}>
                          {detail.billingExempt ? "Remove" : "Set"} Billing Exempt
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Team</p>
                      <div className="divide-y rounded-lg border overflow-hidden">
                        {detail.users?.map((u) => (
                          <div key={u.id} className="flex items-center justify-between px-3 py-2 text-sm bg-card">
                            <div>
                              <span className="font-medium">{u.name}</span>
                              <span className="text-muted-foreground ml-2 text-xs">{u.email}</span>
                            </div>
                            <span className="text-xs capitalize text-muted-foreground">{u.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "assets" && (
                  <div className="divide-y rounded-lg border overflow-hidden">
                    {detail.assets?.length === 0 ? <p className="text-sm text-muted-foreground p-4">No assets</p> : null}
                    {detail.assets?.map((a) => (
                      <div key={a.id} className="flex items-center justify-between px-3 py-2.5 text-sm bg-card">
                        <span className="font-medium">{a.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">${a.dailyRate}/day</span>
                          <Badge variant="outline" className="text-xs capitalize">{a.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "bookings" && (
                  <div className="divide-y rounded-lg border overflow-hidden">
                    {detail.recentBookings?.length === 0 ? <p className="text-sm text-muted-foreground p-4">No bookings</p> : null}
                    {detail.recentBookings?.map((b) => (
                      <div key={b.id} className="flex items-center justify-between px-3 py-2.5 text-sm bg-card">
                        <div>
                          <p className="font-medium">${b.totalAmount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(b.startDate), "MMM d")} – {format(new Date(b.endDate), "MMM d, yyyy")}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{b.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "invoices" && (
                  <div className="divide-y rounded-lg border overflow-hidden">
                    {detail.recentInvoices?.length === 0 ? <p className="text-sm text-muted-foreground p-4">No invoices</p> : null}
                    {detail.recentInvoices?.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between px-3 py-2.5 text-sm bg-card">
                        <div>
                          <p className="font-medium font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</p>
                          <p className="font-semibold">${inv.total.toLocaleString()}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{inv.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive flex items-center gap-2"><Trash2 className="h-4 w-4" /> Delete Tenant</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              This permanently deletes <strong>{confirmDelete?.name}</strong> and ALL their data — users, assets, bookings, invoices, payments. Cannot be undone.
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Type <strong>{confirmDelete?.name}</strong> to confirm</Label>
              <Input value={deleteText} onChange={(e) => setDeleteText(e.target.value)} placeholder={confirmDelete?.name} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteText !== confirmDelete?.name || deleteMut.isPending}
              onClick={() => confirmDelete && deleteMut.mutate(confirmDelete.id)}>
              {deleteMut.isPending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create tenant */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create Tenant</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {([["name", "Organization name", "text"], ["ownerName", "Owner name", "text"], ["ownerEmail", "Owner email", "email"], ["ownerPassword", "Password", "password"]] as const).map(([field, label, type]) => (
              <div key={field} className="space-y-1.5">
                <Label className="text-sm">{label}</Label>
                <Input type={type} value={createForm[field]} onChange={(e) => setCreateForm((f) => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-sm">Plan</Label>
              <Select value={createForm.plan} onValueChange={(v) => setCreateForm((f) => ({ ...f, plan: v ?? "trial" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(createForm)} disabled={createMut.isPending || !createForm.name || !createForm.ownerEmail}>
              {createMut.isPending ? "Creating…" : "Create tenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

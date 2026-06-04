"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Megaphone, Globe, CreditCard, Building2 } from "lucide-react";
import { format } from "date-fns";

type Ann = { id: string; title: string; body: string; target: string; planTarget: string | null; tenantId: string | null; startsAt: string; endsAt: string; active: boolean; createdAt: string };

const empty = { title: "", body: "", target: "all", planTarget: "", tenantId: "", startsAt: "", endsAt: "" };

const TARGET_ICONS = { all: Globe, plan: CreditCard, tenant: Building2 };

export default function AnnouncementsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Ann | null>(null);
  const [form, setForm] = useState(empty);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: list, isLoading } = useQuery<Ann[]>({
    queryKey: ["sa-announcements"],
    queryFn: () => fetch("/api/super-admin/announcements").then((r) => r.json()),
  });

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (a: Ann) => {
    setEditing(a);
    setForm({ title: a.title, body: a.body, target: a.target, planTarget: a.planTarget ?? "", tenantId: a.tenantId ?? "", startsAt: a.startsAt.slice(0, 10), endsAt: a.endsAt.slice(0, 10) });
    setOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: (body: typeof form) => editing
      ? fetch(`/api/super-admin/announcements/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json())
      : fetch("/api/super-admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (d) => { if (d.error) { toast.error(d.error); return; } qc.invalidateQueries({ queryKey: ["sa-announcements"] }); setOpen(false); toast.success(editing ? "Updated" : "Created"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/super-admin/announcements/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sa-announcements"] }); setConfirmDelete(null); toast.success("Deleted"); },
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const active = list?.filter((a) => a.active) ?? [];
  const past = list?.filter((a) => !a.active) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage dashboard banners for tenant organizations</p>
        </div>
        <Button onClick={openCreate} className="gap-2 h-9"><Plus className="h-4 w-4" /> Create Banner</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : list?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-xl text-muted-foreground">
          <Megaphone className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-medium">No announcements yet</p>
          <p className="text-sm mt-1">Create a banner to notify your tenants</p>
          <Button onClick={openCreate} variant="outline" size="sm" className="mt-4 gap-2"><Plus className="h-3.5 w-3.5" /> Create first banner</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active ({active.length})</h2>
              <Card className="border-emerald-200 dark:border-emerald-800/50">
                <CardContent className="p-0">
                  <Table>
                    <TableBody>
                      {active.map((a) => <AnnouncementRow key={a.id} a={a} onEdit={openEdit} onDelete={setConfirmDelete} />)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Inactive ({past.length})</h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableBody>
                      {past.map((a) => <AnnouncementRow key={a.id} a={a} onEdit={openEdit} onDelete={setConfirmDelete} />)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Announcement" : "Create Announcement"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={set("title")} placeholder="e.g. Scheduled maintenance this Sunday" /></div>
            <div className="space-y-1.5"><Label>Message</Label><Textarea value={form.body} onChange={set("body")} rows={3} placeholder="Explain what tenants need to know…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={form.target} onValueChange={(v) => setForm((f) => ({ ...f, target: v ?? "all" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tenants</SelectItem>
                    <SelectItem value="plan">By plan</SelectItem>
                    <SelectItem value="tenant">Specific tenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.target === "plan" && (
                <div className="space-y-1.5">
                  <Label>Plan</Label>
                  <Select value={form.planTarget} onValueChange={(v) => setForm((f) => ({ ...f, planTarget: v ?? "" }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.target === "tenant" && (
                <div className="space-y-1.5"><Label>Tenant ID</Label><Input value={form.tenantId} onChange={set("tenantId")} placeholder="ObjectId" className="font-mono text-sm" /></div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Start date</Label><Input type="date" value={form.startsAt} onChange={set("startsAt")} /></div>
              <div className="space-y-1.5"><Label>End date</Label><Input type="date" value={form.endsAt} onChange={set("endsAt")} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending || !form.title || !form.body || !form.startsAt || !form.endsAt}>
              {saveMut.isPending ? "Saving…" : editing ? "Update" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Announcement</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">This announcement will be removed immediately and will no longer show to tenants.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete && deleteMut.mutate(confirmDelete)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnnouncementRow({ a, onEdit, onDelete }: { a: Ann; onEdit: (a: Ann) => void; onDelete: (id: string) => void }) {
  const TargetIcon = TARGET_ICONS[a.target as keyof typeof TARGET_ICONS] ?? Globe;
  const targetLabel = a.target === "plan" ? `Plan: ${a.planTarget}` : a.target === "tenant" ? "Specific tenant" : "All tenants";
  return (
    <TableRow className="group">
      <TableCell className="pl-5 w-8">
        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${a.active ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
      </TableCell>
      <TableCell className="py-3">
        <p className="font-medium text-sm">{a.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{a.body}</p>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TargetIcon className="h-3.5 w-3.5" />
          <span>{targetLabel}</span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {format(new Date(a.startsAt), "MMM d")} – {format(new Date(a.endsAt), "MMM d, yyyy")}
      </TableCell>
      <TableCell className="pr-5">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

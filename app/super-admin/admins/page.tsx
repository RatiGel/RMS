"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Plus, Trash2, ShieldCheck, Shield, CheckCircle2, XCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { RoleBadge } from "@/components/super-admin/status-badges";

type Admin = { id: string; name: string; email: string; superAdminRole: string; mfaEnabled: boolean; lastLoginAt: string | null; createdAt: string };

function initials(name: string) { return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2); }

export default function AdminsPage() {
  const qc = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<Admin | null>(null);
  const [revokeText, setRevokeText] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", superAdminRole: "support" });

  const { data: admins, isLoading } = useQuery<Admin[]>({
    queryKey: ["sa-admins"],
    queryFn: () => fetch("/api/super-admin/admins").then((r) => r.json()),
  });

  const inviteMut = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/super-admin/admins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.error) { toast.error(d.error); return; }
      qc.invalidateQueries({ queryKey: ["sa-admins"] });
      setInviteOpen(false);
      setForm({ name: "", email: "", password: "", superAdminRole: "support" });
      toast.success("Admin account created");
    },
  });

  const revokeMut = useMutation({
    mutationFn: (id: string) => fetch(`/api/super-admin/admins/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: (d) => {
      if (d.error) { toast.error(d.error); return; }
      qc.invalidateQueries({ queryKey: ["sa-admins"] });
      setConfirmRevoke(null);
      toast.success("Access revoked");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage super admin access and permissions</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="gap-2 h-9"><Plus className="h-4 w-4" /> Add Admin</Button>
      </div>

      {/* Role legend */}
      <div className="flex gap-6 rounded-xl border bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold">Owner</span>
            <span className="text-muted-foreground ml-1.5">— full access to all super admin functions</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted-foreground/20">
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <span className="font-semibold">Support</span>
            <span className="text-muted-foreground ml-1.5">— view and impersonate only; cannot delete, change plans, or edit settings</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins?.map((admin) => (
                  <TableRow key={admin.id} className="group">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={`text-xs font-semibold ${admin.superAdminRole === "owner" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {initials(admin.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{admin.name}</p>
                          <p className="text-xs text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><RoleBadge role={admin.superAdminRole} /></TableCell>
                    <TableCell>
                      {admin.mfaEnabled ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                          <XCircle className="h-3.5 w-3.5" /> Not set
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {admin.lastLoginAt ? formatDistanceToNow(new Date(admin.lastLoginAt), { addSuffix: true }) : <span className="text-amber-600">Never</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(admin.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => { setConfirmRevoke(admin); setRevokeText(""); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {admins?.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No admin accounts found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Admin Account</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {([["name", "Full name", "text"], ["email", "Email", "email"], ["password", "Password", "password"]] as const).map(([field, label, type]) => (
              <div key={field} className="space-y-1.5">
                <Label>{label}</Label>
                <Input type={type} value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.superAdminRole} onValueChange={(v) => setForm((f) => ({ ...f, superAdminRole: v ?? "support" }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner — full access</SelectItem>
                  <SelectItem value="support">Support — view & impersonate only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={() => inviteMut.mutate(form)} disabled={inviteMut.isPending || !form.name || !form.email || !form.password}>
              {inviteMut.isPending ? "Creating…" : "Create account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm */}
      <Dialog open={!!confirmRevoke} onOpenChange={(o) => !o && setConfirmRevoke(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Revoke Admin Access</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              This permanently removes <strong>{confirmRevoke?.name}</strong>'s super admin access. They will be immediately logged out.
            </div>
            <div className="space-y-1.5">
              <Label>Type <strong>{confirmRevoke?.name}</strong> to confirm</Label>
              <Input value={revokeText} onChange={(e) => setRevokeText(e.target.value)} placeholder={confirmRevoke?.name} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRevoke(null)}>Cancel</Button>
            <Button variant="destructive" disabled={revokeText !== confirmRevoke?.name || revokeMut.isPending}
              onClick={() => confirmRevoke && revokeMut.mutate(confirmRevoke.id)}>
              {revokeMut.isPending ? "Revoking…" : "Revoke access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/contexts/session-context";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CategoryFormDialog } from "@/components/inventory/category-form-dialog";
import { Category } from "@/types";

type MeData = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  orgName: string;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "staff";
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  staff: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfilePage() {
  const session = useSession();
  const { t } = useLanguage();
  const p = t.profile;
  const queryClient = useQueryClient();
  const canManage = session?.role === "owner" || session?.role === "admin";

  const [name, setName] = useState(session?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState(session?.orgName ?? "");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: meData, isLoading: meLoading } = useQuery<MeData>({
    queryKey: ["me"],
    queryFn: () => fetch("/api/me").then((r) => r.json()),
  });

  useEffect(() => {
    if (meData) {
      setName(meData.name ?? "");
      setAvatarUrl(meData.avatarUrl ?? "");
      setEmail(meData.email ?? "");
    }
  }, [meData]);

  const { data: members = [] } = useQuery<TeamMember[]>({
    queryKey: ["team"],
    queryFn: () => fetch("/api/team").then((r) => r.json()),
    enabled: canManage,
  });

  const profileMutation = useMutation({
    mutationFn: () =>
      fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "profile", name, avatarUrl }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.error) { toast.error(data.error); return; }
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(p.profileUpdated);
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const passwordMutation = useMutation({
    mutationFn: () => {
      if (newPw !== confirmPw) return Promise.reject(new Error(p.passwordMismatch));
      return fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", currentPassword: currentPw, newPassword: newPw }),
      }).then((r) => r.json());
    },
    onSuccess: (data) => {
      if (data.error) { toast.error(data.error); return; }
      toast.success(p.passwordUpdated);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to update password"),
  });

  const orgMutation = useMutation({
    mutationFn: () =>
      fetch("/api/org", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.error) { toast.error(data.error); return; }
      toast.success(p.orgUpdated);
    },
    onError: () => toast.error("Failed to update organization"),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
    enabled: canManage,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category added"); },
    onError: () => toast.error("Failed to add category"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; description: string }) =>
      fetch(`/api/categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category updated"); },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/categories/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category deleted"); },
    onError: () => toast.error("Failed to delete category"),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      fetch(`/api/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/team/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Member removed");
    },
    onError: () => toast.error("Failed to remove member"),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{p.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {p.yourRole}:{" "}
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[session?.role ?? "staff"]}`}>
            {session?.role}
          </span>
        </p>
      </div>

      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle>{p.personalInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 flex-shrink-0">
              <AvatarImage src={avatarUrl || undefined} alt={name} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {initials(name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <Label>{p.avatarUrl}</Label>
              <Input
                placeholder={p.avatarUrlPlaceholder}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{p.name}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{p.email}</Label>
            <Input value={email} disabled className="text-muted-foreground" />
          </div>
          <Button
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending || !name.trim()}
          >
            {profileMutation.isPending ? "Saving…" : p.saveProfile}
          </Button>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>{p.changePassword}</CardTitle>
          <CardDescription>{p.passwordDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{p.currentPassword}</Label>
            <Input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{p.newPassword}</Label>
            <Input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{p.confirmPassword}</Label>
            <Input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button
            onClick={() => passwordMutation.mutate()}
            disabled={passwordMutation.isPending || !currentPw || !newPw || !confirmPw}
          >
            {passwordMutation.isPending ? "Updating…" : p.updatePassword}
          </Button>
        </CardContent>
      </Card>

      {/* Org settings — admin/owner only */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>{p.orgSettings}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>{p.orgName}</Label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <Button
              onClick={() => orgMutation.mutate()}
              disabled={orgMutation.isPending || !orgName.trim()}
            >
              {orgMutation.isPending ? "Saving…" : p.saveOrg}
            </Button>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Equipment Categories</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Categories used when adding assets to inventory
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setEditingCategory(null); setCategoryDialogOpen(true); }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {categories.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No categories yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-1 rounded-lg border bg-muted/40 px-2.5 py-1 text-sm">
                      <span>{cat.name}</span>
                      {cat.assetCount > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">({cat.assetCount})</span>
                      )}
                      <button
                        onClick={() => { setEditingCategory(cat); setCategoryDialogOpen(true); }}
                        className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteCategoryMutation.mutate(cat.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team access — admin/owner only */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>{p.teamAccess}</CardTitle>
            <CardDescription>{p.teamAccessDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => {
              const isSelf = session?.userId === member.id;
              const isOwner = member.role === "owner";
              return (
                <div key={member.id} className="flex items-center gap-3 py-1">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {initials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.name}
                      {isSelf && (
                        <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  {!isSelf && !isOwner ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(role) => role && roleMutation.mutate({ id: member.id, role })}
                        disabled={roleMutation.isPending}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => removeMutation.mutate(member.id)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${ROLE_COLORS[member.role]}`}
                    >
                      {member.role}
                    </span>
                  )}
                </div>
              );
            })}
            <Separator className="mt-2" />
            <Link
              href="/dashboard/team"
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              {p.manageTeam}
            </Link>
          </CardContent>
        </Card>
      )}
      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSave={(data) => {
          if (editingCategory) {
            updateCategoryMutation.mutate({ id: editingCategory.id, ...data });
          } else {
            createCategoryMutation.mutate(data);
          }
          setCategoryDialogOpen(false);
        }}
      />
    </div>
  );
}

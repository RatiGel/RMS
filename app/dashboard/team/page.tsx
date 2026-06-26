"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, RefreshCw, Trash2, Shield, UserCheck, UserCog, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/session-context";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "staff";
  createdAt: string;
};

type InviteData = { inviteCode: string };

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Shield className="h-3 w-3" />,
  admin: <UserCog className="h-3 w-3" />,
  staff: <UserCheck className="h-3 w-3" />,
};

export default function TeamPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const canManage = session?.role === "owner" || session?.role === "admin";

  const { data: members = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ["team"],
    queryFn: () => fetch("/api/team").then((r) => r.json()),
  });

  const { data: inviteData } = useQuery<InviteData>({
    queryKey: ["invite"],
    queryFn: () => fetch("/api/invite").then((r) => r.json()),
    enabled: canManage,
  });

  const updateRoleMutation = useMutation({
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

  const regenerateMutation = useMutation({
    mutationFn: () =>
      fetch("/api/invite", { method: "POST" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invite"] });
      toast.success("Invite code regenerated");
    },
    onError: () => toast.error("Failed to regenerate code"),
  });

  const [copied, setCopied] = useState(false);
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/join`;

  function copyCode() {
    if (!inviteData?.inviteCode) return;
    navigator.clipboard.writeText(inviteData.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 rms-stagger">
      <PageHeader
        icon={UsersRound}
        title="Team"
        subtitle={`${members.length} member${members.length !== 1 ? "s" : ""} in your organization`}
      />

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite link</CardTitle>
            <CardDescription>
              Share this code at <span className="font-mono text-xs">{joinUrl}</span> to invite new members. They join as Staff.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inviteData ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-4 py-2 font-mono text-sm tracking-widest">
                  {inviteData.inviteCode}
                </code>
                <Button variant="outline" size="icon" onClick={copyCode} title="Copy code">
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">{copied ? "Copied!" : "Copy"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => regenerateMutation.mutate()}
                  disabled={regenerateMutation.isPending}
                  title="Regenerate code"
                >
                  <RefreshCw className={`h-4 w-4 ${regenerateMutation.isPending ? "animate-spin" : ""}`} />
                </Button>
              </div>
            ) : (
              <Skeleton className="h-10 w-full" />
            )}
            {copied && <p className="text-xs text-muted-foreground">Copied to clipboard!</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {members.map((member) => {
                const isSelf = member.id === session?.userId;
                const isOwner = member.role === "owner";
                // Owner can manage admins + staff; admin can manage staff only.
                const canManageThis =
                  canManage && !isSelf && !isOwner &&
                  (member.role !== "admin" || session?.role === "owner");
                return (
                  <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                      {member.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.name}
                        {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    {canManageThis ? (
                      <Select
                        value={member.role}
                        onValueChange={(v) => {
                          if (v) updateRoleMutation.mutate({ id: member.id, role: v });
                        }}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground w-28 justify-center">
                        {ROLE_ICONS[member.role]}
                        {ROLE_LABELS[member.role]}
                      </div>
                    )}
                    {canManageThis && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeMutation.mutate(member.id)}
                        disabled={removeMutation.isPending}
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

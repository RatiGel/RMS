"use client";

import { useCallback, useEffect, useState } from "react";
import { adminLogout } from "@/app/actions/admin-auth";
import {
  Building2, Users, LayoutDashboard, ChevronDown, ChevronRight,
  Trash2, Ban, CheckCircle2, LogOut, Loader2, RefreshCw, ShieldAlert,
} from "lucide-react";

interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: string;
  blacklisted: boolean;
  createdAt: string;
  avatarUrl?: string;
}

interface Org {
  id: string;
  name: string;
  plan: string;
  trialStartDate: string;
  createdAt: string;
  userCount: number;
  assetCount: number;
  bookingCount: number;
  users: OrgUser[];
}

const PLAN_COLOR: Record<string, string> = {
  trial: "bg-zinc-700 text-zinc-300",
  starter: "bg-blue-900/60 text-blue-300",
  pro: "bg-indigo-900/60 text-indigo-300",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set()); // tracks in-flight actions

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orgs");
      if (!res.ok) throw new Error("Failed");
      setOrgs(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const mark = (key: string) => setPending((p) => new Set(p).add(key));
  const unmark = (key: string) => setPending((p) => { const n = new Set(p); n.delete(key); return n; });

  const deleteOrg = async (org: Org) => {
    if (!confirm(`Delete org "${org.name}" and ALL its data? This cannot be undone.`)) return;
    mark(`org-${org.id}`);
    try {
      await fetch(`/api/admin/orgs/${org.id}`, { method: "DELETE" });
      setOrgs((prev) => prev.filter((o) => o.id !== org.id));
    } finally {
      unmark(`org-${org.id}`);
    }
  };

  const deleteUser = async (user: OrgUser, orgId: string) => {
    if (!confirm(`Delete user "${user.name}" (${user.email})? This cannot be undone.`)) return;
    mark(`user-${user.id}`);
    try {
      await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === orgId ? { ...o, users: o.users.filter((u) => u.id !== user.id), userCount: o.userCount - 1 } : o
        )
      );
    } finally {
      unmark(`user-${user.id}`);
    }
  };

  const toggleBlacklist = async (user: OrgUser, orgId: string) => {
    const action = user.blacklisted ? "unblacklist" : "blacklist";
    if (!confirm(`${action === "blacklist" ? "Blacklist" : "Unblacklist"} user "${user.name}"?`)) return;
    mark(`bl-${user.id}`);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blacklisted: !user.blacklisted }),
      });
      const json = await res.json();
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === orgId
            ? { ...o, users: o.users.map((u) => u.id === user.id ? { ...u, blacklisted: json.blacklisted } : u) }
            : o
        )
      );
    } finally {
      unmark(`bl-${user.id}`);
    }
  };

  const totalUsers = orgs.reduce((s, o) => s + o.userCount, 0);
  const paidOrgs = orgs.filter((o) => o.plan !== "trial").length;

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-red-500" />
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-zinc-500">RMS — Site Owner Console</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Building2, label: "Organizations", value: orgs.length },
          { icon: Users, label: "Total Users", value: totalUsers },
          { icon: LayoutDashboard, label: "Paid Plans", value: paidOrgs },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-3">
            <Icon className="h-5 w-5 text-zinc-500 shrink-0" />
            <div>
              <p className="text-xl font-bold">{loading ? "—" : value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orgs list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : orgs.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">No organizations found.</p>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => {
            const isExpanded = expanded.has(org.id);
            const orgPending = pending.has(`org-${org.id}`);
            return (
              <div key={org.id} className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
                {/* Org row */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => toggle(org.id)}
                    className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{org.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLOR[org.plan] ?? PLAN_COLOR.trial}`}>
                        {org.plan}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Created {formatDate(org.createdAt)} · {org.userCount} users · {org.assetCount} assets · {org.bookingCount} bookings
                    </p>
                  </div>
                  <button
                    onClick={() => deleteOrg(org)}
                    disabled={orgPending}
                    title="Delete organization"
                    className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {orgPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>

                {/* Users table */}
                {isExpanded && (
                  <div className="border-t border-zinc-800">
                    {org.users.length === 0 ? (
                      <p className="text-xs text-zinc-500 px-4 py-3">No users.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-zinc-500 border-b border-zinc-800">
                            <th className="text-left px-4 py-2 font-medium">Name</th>
                            <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Email</th>
                            <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Role</th>
                            <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Joined</th>
                            <th className="text-left px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {org.users.map((user) => {
                            const blPending = pending.has(`bl-${user.id}`);
                            const delPending = pending.has(`user-${user.id}`);
                            return (
                              <tr key={user.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30">
                                <td className="px-4 py-2.5">
                                  <span className="font-medium">{user.name}</span>
                                </td>
                                <td className="px-4 py-2.5 text-zinc-400 hidden sm:table-cell">{user.email}</td>
                                <td className="px-4 py-2.5 text-zinc-400 hidden md:table-cell capitalize">{user.role}</td>
                                <td className="px-4 py-2.5 text-zinc-400 hidden md:table-cell">{formatDate(user.createdAt)}</td>
                                <td className="px-4 py-2.5">
                                  {user.blacklisted ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-400 font-medium">
                                      Blacklisted
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-medium">
                                      Active
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2 justify-end">
                                    <button
                                      onClick={() => toggleBlacklist(user, org.id)}
                                      disabled={blPending}
                                      title={user.blacklisted ? "Unblacklist" : "Blacklist"}
                                      className="text-zinc-600 hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-40"
                                    >
                                      {blPending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : user.blacklisted ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      ) : (
                                        <Ban className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => deleteUser(user, org.id)}
                                      disabled={delPending}
                                      title="Delete user"
                                      className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40"
                                    >
                                      {delPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

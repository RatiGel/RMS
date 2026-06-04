"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Download, Filter, ClipboardList } from "lucide-react";

type Log = { id: string; adminName: string; action: string; targetType: string; targetName: string | null; metadata: Record<string, unknown> | null; createdAt: string };

const ACTION_STYLES: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; label?: string }> = {
  delete_tenant: { variant: "destructive" },
  suspend_tenant: { variant: "destructive" },
  revoke_admin: { variant: "destructive" },
  reactivate_tenant: { variant: "default" },
  invite_admin: { variant: "default" },
  create_tenant: { variant: "default" },
  impersonation_start: { variant: "secondary" },
  impersonation_end: { variant: "secondary" },
  change_plan: { variant: "outline" },
  extend_trial: { variant: "outline" },
  feature_global_toggle: { variant: "outline" },
  update_settings: { variant: "outline" },
  update_plan_config: { variant: "outline" },
};

function ActionBadge({ action }: { action: string }) {
  const style = ACTION_STYLES[action] ?? { variant: "outline" as const };
  const label = action.replace(/_/g, " ");
  return <Badge variant={style.variant} className="text-xs font-mono capitalize">{label}</Badge>;
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const params = new URLSearchParams({
    page: String(page), limit: "50",
    ...(actionFilter && { action: actionFilter }),
    ...(from && { from }), ...(to && { to }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["sa-audit-logs", page, actionFilter, from, to],
    queryFn: () => fetch(`/api/super-admin/audit-logs?${params}`).then((r) => r.json()),
  });

  const exportCsv = () => {
    const exportParams = new URLSearchParams({ export: "true", ...Object.fromEntries(params) });
    window.location.href = `/api/super-admin/audit-logs?${exportParams}`;
  };

  const logs: Log[] = data?.logs ?? [];
  const hasFilters = actionFilter || from || to;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Complete trail of all super admin actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-3.5 w-3.5" /> Filters
            {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs">Action contains</Label>
              <Input value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} placeholder="e.g. delete" className="h-8 w-44 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">From date</Label>
              <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="h-8 w-36 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To date</Label>
              <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="h-8 w-36 text-sm" />
            </div>
            {hasFilters && <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={() => { setActionFilter(""); setFrom(""); setTo(""); setPage(1); }}>Clear</Button>}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border rounded-xl">
          <ClipboardList className="h-10 w-10 mb-3 opacity-20" />
          <p className="font-medium">No audit logs found</p>
          <p className="text-sm mt-1">Actions will appear here as they happen</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="pr-5">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="pl-5 text-xs text-muted-foreground whitespace-nowrap font-mono">
                      {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{log.adminName}</TableCell>
                    <TableCell><ActionBadge action={log.action} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.targetName ?? "—"}</TableCell>
                    <TableCell className="pr-5 max-w-[200px] truncate text-xs text-muted-foreground font-mono">
                      {log.metadata ? JSON.stringify(log.metadata) : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data?.total > 50 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {Math.ceil(data.total / 50)} ({data.total} total)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Previous</Button>
            <Button variant="outline" size="sm" disabled={page * 50 >= data.total} onClick={() => setPage((p) => p + 1)}>Next →</Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { verifySuperAdmin } from "@/app/lib/super-admin-dal";

export async function GET(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const adminId = searchParams.get("adminId") ?? "";
  const action = searchParams.get("action") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const exportCsv = searchParams.get("export") === "true";

  const query: Record<string, unknown> = {};
  if (adminId) query.adminId = adminId;
  if (action) query.action = { $regex: action, $options: "i" };
  if (from || to) {
    query.createdAt = {};
    if (from) (query.createdAt as Record<string, Date>).$gte = new Date(from);
    if (to) (query.createdAt as Record<string, Date>).$lte = new Date(to + "T23:59:59Z");
  }

  if (exportCsv) {
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(10000).lean();
    const header = "Timestamp,Admin,Action,Target Type,Target,Details";
    const rows = logs.map((l) =>
      [
        new Date(l.createdAt).toISOString(),
        `"${l.adminName}"`,
        l.action,
        l.targetType,
        `"${l.targetName ?? ""}"`,
        `"${JSON.stringify(l.metadata ?? {}).replace(/"/g, '""')}"`,
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit-logs-${Date.now()}.csv"`,
      },
    });
  }

  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(query),
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: String(l._id),
      adminId: String(l.adminId),
      adminName: l.adminName,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId ?? null,
      targetName: l.targetName ?? null,
      metadata: l.metadata ?? null,
      createdAt: l.createdAt,
    })),
    total,
    page,
    limit,
  });
}

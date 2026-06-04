import "server-only";
import { getSession, SessionPayload } from "@/app/lib/session";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { Types } from "mongoose";

export async function verifySuperAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== "super_admin") return null;
  return session;
}

export async function logAudit(
  session: SessionPayload,
  action: string,
  targetType: "tenant" | "admin" | "plan" | "feature" | "announcement" | "settings" | "impersonation",
  targetId?: string,
  targetName?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await connectDB();
    await AuditLog.create({
      adminId: new Types.ObjectId(session.userId),
      adminName: session.name,
      action,
      targetType,
      targetId,
      targetName,
      metadata,
    });
  } catch { /* non-critical */ }
}

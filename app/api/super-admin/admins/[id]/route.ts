import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";

type RouteCtx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  if (id === session.userId) {
    return NextResponse.json({ error: "Cannot revoke your own access" }, { status: 400 });
  }

  await connectDB();
  const adminUser = await User.findById(session.userId).lean();
  if ((adminUser as { superAdminRole?: string })?.superAdminRole === "support") {
    return NextResponse.json({ error: "Support role cannot revoke admin access" }, { status: 403 });
  }

  const target = await User.findOneAndDelete({ _id: id, role: "super_admin" });
  if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  await logAudit(session, "revoke_admin", "admin", id, target.name, { email: target.email });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const body = await req.json();
  const { superAdminRole, disableMfa } = body;

  const updates: Record<string, unknown> = {};
  if (superAdminRole) updates.superAdminRole = superAdminRole;
  if (disableMfa) updates.mfaSecret = undefined;

  const target = await User.findOneAndUpdate({ _id: id, role: "super_admin" }, updates, { new: true });
  if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

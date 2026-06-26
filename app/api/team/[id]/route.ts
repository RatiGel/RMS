import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { getSession } from "@/app/lib/session";

type Ctx = { params: Promise<{ id: string }> };

function canManageTeam(role: string) {
  return role === "owner" || role === "admin";
}

/** Team management requires the Pro plan (matches GET /api/team). */
async function requirePro(orgId: string) {
  const org = (await Organization.findById(orgId).select("plan").lean()) as { plan?: string } | null;
  return ["pro"].includes(org?.plan ?? "trial");
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageTeam(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const { role } = await req.json();

  // Only admin/staff are assignable here. Ownership is never transferred via this route.
  if (!["admin", "staff"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Can't change your own role.
  if (id === session.userId) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
  }

  await connectDB();

  if (!(await requirePro(session.orgId))) {
    return NextResponse.json({ error: "Team management requires Pro plan", code: "PLAN_GATE" }, { status: 403 });
  }

  // Load target within the same org for tenant isolation.
  const target = await User.findOne({ _id: id, orgId: session.orgId }).select("role");
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // The owner can never be modified through team management.
  if (target.role === "owner") {
    return NextResponse.json({ error: "The owner cannot be modified" }, { status: 403 });
  }

  // Only the owner may change an admin's role; admins manage staff only.
  if (target.role === "admin" && session.role !== "owner") {
    return NextResponse.json({ error: "Only the owner can change an admin's role" }, { status: 403 });
  }

  target.role = role;
  await target.save();

  return NextResponse.json({
    id: String(target._id),
    role: target.role,
  });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageTeam(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  if (id === session.userId) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  await connectDB();

  if (!(await requirePro(session.orgId))) {
    return NextResponse.json({ error: "Team management requires Pro plan", code: "PLAN_GATE" }, { status: 403 });
  }

  const target = await User.findOne({ _id: id, orgId: session.orgId }).select("role");
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // The owner can never be removed.
  if (target.role === "owner") {
    return NextResponse.json({ error: "The owner cannot be removed" }, { status: 403 });
  }

  // Only the owner may remove an admin; admins remove staff only.
  if (target.role === "admin" && session.role !== "owner") {
    return NextResponse.json({ error: "Only the owner can remove an admin" }, { status: 403 });
  }

  await User.deleteOne({ _id: id, orgId: session.orgId });

  return NextResponse.json({ success: true });
}
